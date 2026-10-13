"""
VeriSync AI — Document Ingestion Routes

Endpoints
---------
POST /api/v1/documents/ingest
    Upload one or more PDF / DOCX files.
    Returns per-file metadata with processing status.
    Files that fail validation or extraction are returned with status=failed
    rather than raising a 500; callers can inspect the error_message field.

GET  /api/v1/documents/{document_id}
    Retrieve metadata for a previously ingested document.
    Note: extracted text and evidence blocks are NOT returned here to keep
    the response lean — they are intended for the verification pipeline only.

GET  /api/v1/documents
    List all documents currently in the in-memory store.

DELETE /api/v1/documents/{document_id}
    Remove a document from the store.

⚠️  Storage note: all documents are held in the in-memory DocumentStore.
    Data is lost on server restart.  See app/services/document_store.py.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Annotated, List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse

from app.schemas.ingestion import (
    DocumentDomain,
    DocumentIngestResponse,
    DocumentListResponse,
    DocumentMetadata,
    EmploymentDocType,
    IngestionLimits,
    ProcessingStatus,
)
from app.services.document_store import document_store
from app.services.docx_extractor import ExtractionError as DocxExtractionError
from app.services.docx_extractor import extract_docx
from app.services.file_validator import (
    FileValidationError,
    MAX_FILE_SIZE_MB,
    MAX_FILES_PER_REQUEST,
    ACCEPTED_MIME_TYPES,
    validate_file,
    validate_file_count,
)
from app.services.pdf_extractor import ExtractionError as PdfExtractionError
from app.services.pdf_extractor import extract_pdf

logger = logging.getLogger("verisync.documents_route")

router = APIRouter(prefix="/documents", tags=["Document Ingestion"])


# ---------------------------------------------------------------------------
# Helper: dispatch extraction based on file extension
# ---------------------------------------------------------------------------

def _extract_content(
    content: bytes,
    filename: str,
    content_type: str,
) -> tuple[str, Optional[int], Optional[int], list[dict]]:
    """
    Route file bytes to the correct extractor.

    Returns (full_text, page_count, paragraph_count, evidence_blocks).
    page_count is None for DOCX; paragraph_count is None for PDF.
    """
    extension = Path(filename).suffix.lower()

    if extension == ".pdf":
        full_text, page_count, evidence_blocks = extract_pdf(content, filename)
        return full_text, page_count, None, evidence_blocks

    if extension == ".docx":
        full_text, paragraph_count, evidence_blocks = extract_docx(content, filename)
        return full_text, None, paragraph_count, evidence_blocks

    # Should never reach here — validator already rejected unknown extensions
    raise FileValidationError(f"No extractor available for '{filename}'.")


# ---------------------------------------------------------------------------
# POST /documents/ingest
# ---------------------------------------------------------------------------

@router.post(
    "/ingest",
    response_model=DocumentIngestResponse,
    status_code=status.HTTP_200_OK,
    summary="Ingest one or more employment documents",
    description=(
        "Upload PDF or DOCX files for ingestion. "
        "Each file is validated, then text is extracted and stored in the "
        "temporary in-memory repository. "
        "Files that fail validation or extraction are returned with "
        "``status=failed`` rather than raising HTTP 500. "
        "\n\n"
        "⚠️ **Storage**: in-memory only. Data is lost on server restart."
    ),
)
async def ingest_documents(
    files: List[UploadFile] = File(
        ...,
        description="One or more PDF or DOCX files (max 15 MB each)",
    ),
    doc_types: str = Form(
        default="other",
        description=(
            'Document type for each file. Either a single value applied to all '
            '(e.g. "offer_letter") or a JSON array in the same order as files '
            '(e.g. \'["offer_letter","contract"]\'). '
            'Valid values: offer_letter, contract, job_description, hr_policy, other.'
        ),
    ),
    domain: str = Form(
        default="employment-hr",
        description="Target domain. Currently only employment-hr is active.",
    ),
) -> DocumentIngestResponse:
    # --- Validate file count ---
    try:
        validate_file_count(len(files))
    except FileValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    # --- Parse doc_types ---
    import json as _json

    parsed_doc_types: list[str] = []
    try:
        if doc_types.strip().startswith("["):
            parsed_doc_types = _json.loads(doc_types)
        else:
            # Single value → replicate for all files
            parsed_doc_types = [doc_types.strip()] * len(files)
    except Exception:
        parsed_doc_types = ["other"] * len(files)

    # Pad / truncate to match file count
    while len(parsed_doc_types) < len(files):
        parsed_doc_types.append("other")
    parsed_doc_types = parsed_doc_types[: len(files)]

    # --- Validate domain ---
    try:
        resolved_domain = DocumentDomain(domain)
    except ValueError:
        resolved_domain = DocumentDomain.employment_hr

    # --- Process each file ---
    results: list[DocumentMetadata] = []
    succeeded = 0
    failed = 0

    for idx, upload_file in enumerate(files):
        raw_doc_type = parsed_doc_types[idx]
        try:
            doc_type_enum = EmploymentDocType(raw_doc_type)
        except ValueError:
            doc_type_enum = EmploymentDocType.other

        filename = upload_file.filename or f"document_{idx + 1}"
        content_type = upload_file.content_type or "application/octet-stream"

        # Read file content
        content = await upload_file.read()

        # 1. Register a PENDING record immediately
        doc = document_store.new_pending(
            original_filename=filename,
            content_type=content_type,
            doc_type=doc_type_enum.value,
            domain=resolved_domain.value,
            file_size_bytes=len(content),
        )

        # 2. Validate
        try:
            validate_file(filename, content_type, content)
        except FileValidationError as exc:
            document_store.mark_failed(doc.document_id, error_message=str(exc))
            results.append(document_store.get(doc.document_id))  # type: ignore[arg-type]
            failed += 1
            logger.warning("Validation failed for '%s': %s", filename, exc)
            continue

        # 3. Extract
        try:
            full_text, page_count, paragraph_count, evidence_blocks = _extract_content(
                content, filename, content_type
            )
            document_store.mark_ready(
                doc.document_id,
                full_text=full_text,
                evidence_blocks=evidence_blocks,
                page_count=page_count,
                paragraph_count=paragraph_count,
            )
            results.append(document_store.get(doc.document_id))  # type: ignore[arg-type]
            succeeded += 1
            logger.info(
                "Ingested '%s' → document_id=%s", filename, doc.document_id
            )
        except (PdfExtractionError, DocxExtractionError, Exception) as exc:
            error_msg = str(exc)
            document_store.mark_failed(doc.document_id, error_message=error_msg)
            results.append(document_store.get(doc.document_id))  # type: ignore[arg-type]
            failed += 1
            logger.error("Extraction failed for '%s': %s", filename, error_msg)

    return DocumentIngestResponse(
        documents=results,
        total_uploaded=len(files),
        total_succeeded=succeeded,
        total_failed=failed,
    )


# ---------------------------------------------------------------------------
# GET /documents/{document_id}
# ---------------------------------------------------------------------------

@router.get(
    "/{document_id}",
    response_model=DocumentListResponse,
    summary="Retrieve document metadata by ID",
    description=(
        "Returns metadata for a previously ingested document. "
        "Extracted text and evidence blocks are excluded from this response "
        "(they are consumed internally by the verification pipeline)."
    ),
)
async def get_document(document_id: str) -> DocumentListResponse:
    doc = document_store.get(document_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found. "
                   "The server may have restarted since ingestion.",
        )
    return DocumentListResponse(document=doc)


# ---------------------------------------------------------------------------
# GET /documents
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[DocumentMetadata],
    summary="List all ingested documents",
    description=(
        "Returns all documents currently held in the in-memory store, "
        "most recently ingested first. "
        "⚠️ Data is ephemeral and lost on server restart."
    ),
)
async def list_documents(
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by processing status: pending, processing, ready, failed",
    ),
) -> list[DocumentMetadata]:
    docs = document_store.list_all()
    if status_filter:
        docs = [d for d in docs if d.status.value == status_filter]
    return docs


# ---------------------------------------------------------------------------
# DELETE /documents/{document_id}
# ---------------------------------------------------------------------------

@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a document from the store",
)
async def delete_document(document_id: str) -> None:
    doc = document_store.get(document_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )
    # Manual removal (store doesn't have a delete method — add it)
    with document_store._lock:
        del document_store._store[document_id]
    logger.info("Deleted document '%s'", document_id)


# ---------------------------------------------------------------------------
# GET /documents/limits  — surfaced to Swagger for easy inspection
# ---------------------------------------------------------------------------

@router.get(
    "/limits/config",
    response_model=IngestionLimits,
    summary="Ingestion limits and storage configuration",
    description="Returns the active file-size limits, accepted MIME types, and storage backend details.",
)
async def ingestion_limits() -> IngestionLimits:
    return IngestionLimits(
        max_file_size_mb=MAX_FILE_SIZE_MB,
        max_files_per_request=MAX_FILES_PER_REQUEST,
        accepted_mime_types=list(ACCEPTED_MIME_TYPES),
    )
