"""
VeriSync AI — In-Memory Document Store

Temporary repository for ingested document metadata and extracted text.

⚠️  IMPORTANT: This is LOCAL DEVELOPMENT STORAGE ONLY.
    - Documents are stored in process memory (a Python dict).
    - All data is lost when the server restarts.
    - Files are NOT written to disk and are NOT accessible via static URLs.
    - This is NOT suitable for production use.
    - A production implementation must replace this with a database
      (e.g. PostgreSQL) and object storage (e.g. S3 / GCS).

This module provides a single DocumentStore instance (singleton) that the
route handlers interact with.  Keeping storage here — rather than in the
route module — makes it easy to inject a different store in tests.
"""

from __future__ import annotations

import logging
import threading
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from app.schemas.ingestion import DocumentMetadata, PageEvidence, ProcessingStatus

logger = logging.getLogger("verisync.document_store")


class DocumentStore:
    """
    Thread-safe in-memory document repository.

    Keys   : document_id (UUID string)
    Values : DocumentMetadata with full_text and evidence_blocks populated
    """

    def __init__(self) -> None:
        self._store: Dict[str, DocumentMetadata] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Write operations
    # ------------------------------------------------------------------

    def save(self, doc: DocumentMetadata) -> DocumentMetadata:
        """Persist a DocumentMetadata record (creates or overwrites)."""
        with self._lock:
            self._store[doc.document_id] = doc
        logger.debug("Stored document '%s' (%s)", doc.document_id, doc.original_filename)
        return doc

    def new_pending(
        self,
        *,
        original_filename: str,
        content_type: str,
        doc_type: str,
        domain: str,
        file_size_bytes: int,
    ) -> DocumentMetadata:
        """
        Create a DocumentMetadata record in PENDING state and store it.
        Returns the record so the caller can update it after extraction.
        """
        doc_id = str(uuid.uuid4())
        doc = DocumentMetadata(
            document_id=doc_id,
            original_filename=original_filename,
            content_type=content_type,
            doc_type=doc_type,
            domain=domain,
            file_size_bytes=file_size_bytes,
            word_count=0,
            status=ProcessingStatus.pending,
        )
        return self.save(doc)

    def mark_ready(
        self,
        document_id: str,
        *,
        full_text: str,
        evidence_blocks: List[dict],
        page_count: Optional[int] = None,
        paragraph_count: Optional[int] = None,
    ) -> DocumentMetadata:
        """Transition a document from PENDING → READY with extracted content."""
        with self._lock:
            doc = self._store[document_id]
            doc.status = ProcessingStatus.ready
            doc.full_text = full_text
            doc.evidence_blocks = [PageEvidence(**b) for b in evidence_blocks]
            doc.page_count = page_count
            doc.paragraph_count = paragraph_count
            doc.word_count = len(full_text.split())
        return doc

    def mark_failed(self, document_id: str, *, error_message: str) -> DocumentMetadata:
        """Transition a document to FAILED state with an error message."""
        with self._lock:
            doc = self._store[document_id]
            doc.status = ProcessingStatus.failed
            doc.error_message = error_message
        return doc

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------

    def get(self, document_id: str) -> Optional[DocumentMetadata]:
        """Return the document or None if not found."""
        with self._lock:
            return self._store.get(document_id)

    def list_all(self) -> List[DocumentMetadata]:
        """Return all stored documents (newest first by ingestion timestamp)."""
        with self._lock:
            return sorted(
                self._store.values(),
                key=lambda d: d.ingested_at,
                reverse=True,
            )

    def count(self) -> int:
        with self._lock:
            return len(self._store)

    def clear(self) -> None:
        """Wipe all stored documents.  Intended for tests only."""
        with self._lock:
            self._store.clear()


# ---------------------------------------------------------------------------
# Module-level singleton — import this in route handlers
# ---------------------------------------------------------------------------

document_store = DocumentStore()
