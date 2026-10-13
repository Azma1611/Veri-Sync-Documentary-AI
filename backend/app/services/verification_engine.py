"""
VeriSync AI — Verification Engine (Orchestrator)

Top-level entry point for a single verification run.
Coordinates: extraction → completeness → comparison → report assembly.

Usage
-----
    from app.services.verification_engine import run_verification

    result = await run_verification(files_with_types, domain="employment-hr")

The function accepts raw UploadFile objects so it can be called directly
from the route handler without pre-ingesting the documents.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import List, Tuple

from fastapi import UploadFile

from app.schemas.ingestion import DocumentMetadata, ProcessingStatus
from app.schemas.verification import VerificationResult
from app.services.clause_searcher import search_clause
from app.services.comparison_engine import compare_documents
from app.services.completeness_checker import check_completeness
from app.services.docx_extractor import ExtractionError as DocxError
from app.services.docx_extractor import extract_docx
from app.services.domain_rules import EMPLOYMENT_HR_RULES
from app.services.document_store import document_store
from app.services.file_validator import (
    FileValidationError,
    validate_file,
    validate_file_count,
)
from app.services.pdf_extractor import ExtractionError as PdfError
from app.services.pdf_extractor import extract_pdf
from app.services.report_builder import build_report

logger = logging.getLogger("verisync.engine")


async def run_verification(
    uploads: List[Tuple[UploadFile, str]],   # (upload_file, doc_type_str)
    domain: str = "employment-hr",
) -> VerificationResult:
    """
    Execute the full deterministic verification pipeline.

    Parameters
    ----------
    uploads : List of (UploadFile, doc_type_str) pairs.
              doc_type_str must be a valid EmploymentDocType value.
    domain  : Domain identifier (currently only 'employment-hr' is active).

    Returns
    -------
    VerificationResult — never raises; extraction failures are recorded in
    the document metadata and excluded from comparison.

    Pipeline
    --------
    1. Validate + extract each file (re-uses Step 4 services).
    2. Register extracted documents in the in-memory store.
    3. Run completeness checker over extracted documents.
    4. Run cross-document comparison engine.
    5. Build and return the VerificationResult.
    """
    # ------------------------------------------------------------------
    # Step 1: Validate and extract each uploaded file
    # ------------------------------------------------------------------
    extracted_docs: List[DocumentMetadata] = []
    failed_docs: List[str] = []

    for upload_file, doc_type_str in uploads:
        filename = upload_file.filename or "document"
        content_type = upload_file.content_type or "application/octet-stream"
        content = await upload_file.read()

        # Register a pending record
        doc = document_store.new_pending(
            original_filename=filename,
            content_type=content_type,
            doc_type=doc_type_str,
            domain=domain,
            file_size_bytes=len(content),
        )

        # Validate
        try:
            validate_file(filename, content_type, content)
        except FileValidationError as exc:
            document_store.mark_failed(doc.document_id, error_message=str(exc))
            failed_docs.append(filename)
            logger.warning("Validation failed for '%s': %s", filename, exc)
            continue

        # Extract
        try:
            ext = Path(filename).suffix.lower()
            if ext == ".pdf":
                full_text, page_count, evidence_blocks = extract_pdf(content, filename)
                document_store.mark_ready(
                    doc.document_id,
                    full_text=full_text,
                    evidence_blocks=evidence_blocks,
                    page_count=page_count,
                )
            elif ext == ".docx":
                full_text, para_count, evidence_blocks = extract_docx(content, filename)
                document_store.mark_ready(
                    doc.document_id,
                    full_text=full_text,
                    evidence_blocks=evidence_blocks,
                    paragraph_count=para_count,
                )
            else:
                raise FileValidationError(f"No extractor for '{filename}'.")

            ready_doc = document_store.get(doc.document_id)
            if ready_doc and ready_doc.status == ProcessingStatus.ready:
                extracted_docs.append(ready_doc)

        except (PdfError, DocxError, FileValidationError, Exception) as exc:
            error_msg = str(exc)
            document_store.mark_failed(doc.document_id, error_message=error_msg)
            failed_docs.append(filename)
            logger.error("Extraction failed for '%s': %s", filename, error_msg)

    if not extracted_docs:
        # All files failed extraction — return a minimal report
        logger.warning(
            "Verification: all %d file(s) failed extraction. Failed: %s",
            len(uploads),
            failed_docs,
        )
        from app.schemas.verification import (
            MissingFieldFinding,
            MissingFieldSeverity,
            VerificationStatus,
        )
        return VerificationResult(
            domain="Employment & HR",
            totalDocuments=len(uploads),
            status=VerificationStatus.manual_review_required,
            findings=[],
            missingFields=[
                MissingFieldFinding(
                    id="extract-fail-all",
                    rule_id="SYSTEM",
                    fieldName="Document Extraction",
                    expectedIn=", ".join(failed_docs),
                    severity=MissingFieldSeverity.critical,
                    detail=(
                        "None of the uploaded documents could be parsed. "
                        "Possible causes: image-only PDFs, encrypted files, or "
                        "corrupt archives. Please re-upload readable document files."
                    ),
                )
            ],
            summaryNote=(
                "Document extraction failed for all uploaded files. "
                "No verification could be performed."
            ),
            documentsReviewed=failed_docs,
            is_simulated=False,
        )

    logger.info(
        "Verification: %d document(s) extracted successfully, %d failed",
        len(extracted_docs),
        len(failed_docs),
    )

    # ------------------------------------------------------------------
    # Step 2: Completeness check
    # ------------------------------------------------------------------
    missing_findings = check_completeness(extracted_docs, EMPLOYMENT_HR_RULES)

    # ------------------------------------------------------------------
    # Step 3: Cross-document comparison
    # ------------------------------------------------------------------
    inconsistency_findings = compare_documents(extracted_docs, EMPLOYMENT_HR_RULES)

    # ------------------------------------------------------------------
    # Step 4: Assemble report
    # ------------------------------------------------------------------
    report = build_report(
        documents=extracted_docs,
        inconsistency_findings=inconsistency_findings,
        missing_field_findings=missing_findings,
    )

    # ------------------------------------------------------------------
    # Step 5: Optional AI enrichment (safe fallback if unavailable)
    # ------------------------------------------------------------------
    from app.services.ai import ai_service
    try:
        report = await ai_service.enrich_verification_result(report, extracted_docs)
    except Exception as exc:
        logger.warning("Verification: AI enrichment encountered error (skipped): %s", exc)

    # ------------------------------------------------------------------
    # Step 6: Persist verification run to audit history store
    # ------------------------------------------------------------------
    from app.services.history_store import history_store
    try:
        history_store.record_verification(report)
    except Exception as exc:
        logger.warning("Verification: History persistence encountered error (skipped): %s", exc)

    return report
