"""
VeriSync AI — Document Ingestion Schemas

Pydantic models for the document ingestion layer.
These mirror the frontend SourceCitation, InconsistencyFinding,
and VerificationResult TypeScript interfaces exactly.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared enumerations (kept in sync with frontend types/index.ts)
# ---------------------------------------------------------------------------

class EmploymentDocType(str, Enum):
    offer_letter = "offer_letter"
    contract = "contract"
    job_description = "job_description"
    hr_policy = "hr_policy"
    other = "other"


class DocumentDomain(str, Enum):
    employment_hr = "employment-hr"
    legal_contracts = "legal-contracts"
    procurement_finance = "procurement-finance"


class ProcessingStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    ready = "ready"
    failed = "failed"


# ---------------------------------------------------------------------------
# Page-level evidence: one extracted block anchored to a source location
# ---------------------------------------------------------------------------

class PageEvidence(BaseModel):
    """
    A single extracted text block with its source location.

    For PDFs  : page is 1-indexed; paragraph_index is None.
    For DOCX  : page is None (DOCX has no reliable page numbers at parse
                time); paragraph_index is 0-indexed within the document.
    """
    text: str = Field(description="Verbatim extracted text (truncated to 2 000 chars)")
    page: Optional[int] = Field(default=None, description="1-indexed page number (PDF only)")
    paragraph_index: Optional[int] = Field(
        default=None,
        description="0-indexed paragraph position within the DOCX body",
    )
    section_heading: Optional[str] = Field(
        default=None,
        description="Nearest preceding heading (DOCX) or inferred section label (PDF)",
    )
    char_offset: Optional[int] = Field(
        default=None,
        description="Character offset of text start within the raw extracted corpus",
    )


# ---------------------------------------------------------------------------
# Per-document ingestion metadata
# ---------------------------------------------------------------------------

class DocumentMetadata(BaseModel):
    """Full metadata record for a successfully ingested document."""
    document_id: str = Field(description="Server-assigned UUID")
    original_filename: str
    content_type: str = Field(description="MIME type: application/pdf or application/vnd.openxmlformats…")
    doc_type: EmploymentDocType
    domain: DocumentDomain
    file_size_bytes: int
    page_count: Optional[int] = Field(default=None, description="Number of PDF pages; None for DOCX")
    paragraph_count: Optional[int] = Field(default=None, description="Number of paragraphs extracted; DOCX")
    word_count: int = Field(description="Approximate word count of extracted text")
    status: ProcessingStatus
    ingested_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    error_message: Optional[str] = Field(default=None)

    # Extracted content (not returned to the UI but stored in the in-memory store)
    # Excluded from the default serialisation to keep the API response lean.
    full_text: Optional[str] = Field(default=None, exclude=True)
    evidence_blocks: Optional[List[PageEvidence]] = Field(default=None, exclude=True)


# ---------------------------------------------------------------------------
# API Request / Response schemas
# ---------------------------------------------------------------------------

class DocumentIngestResponse(BaseModel):
    """
    Response from POST /api/v1/documents/ingest
    Returns metadata for every uploaded file in the same order as the
    multipart form array. Failures are represented in-line.
    """
    documents: List[DocumentMetadata]
    total_uploaded: int
    total_succeeded: int
    total_failed: int
    session_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Groups this batch of documents; used to retrieve them later",
    )


class DocumentListResponse(BaseModel):
    """Response from GET /api/v1/documents/{document_id}"""
    document: DocumentMetadata


# ---------------------------------------------------------------------------
# Error response (complements FastAPI's built-in HTTPException)
# ---------------------------------------------------------------------------

class IngestionError(BaseModel):
    error: str
    detail: str
    filename: Optional[str] = None


# ---------------------------------------------------------------------------
# Ingestion config snapshot (returned alongside every ingestion response)
# ---------------------------------------------------------------------------

class IngestionLimits(BaseModel):
    max_file_size_mb: float
    max_files_per_request: int
    accepted_mime_types: List[str]
    storage_backend: str = "in_memory_ephemeral"
    storage_note: str = (
        "Files are held in process memory for the lifetime of this server "
        "process. They are NOT persisted to disk and are NOT suitable for "
        "production use. Restart the server to clear all stored documents."
    )
