"""
VeriSync AI — PDF Extractor (PyMuPDF)

Extracts full text and page-level evidence blocks from PDF documents.

Design decisions
----------------
* Each page is extracted independently so every evidence block carries an
  accurate 1-indexed page number — a hard requirement from the frontend's
  SourceCitation schema.
* Sections are inferred heuristically from large / bold text runs at the
  start of a page.  This is intentionally simple; it is not the LLM layer.
* Encrypted documents raise ExtractionError with a clear error state.
* Empty / whitespace-only output raises ExtractionError so the caller can
  record a 'failed' processing status rather than returning a blank document.
"""

from __future__ import annotations

import io
import logging
from typing import List, Tuple

logger = logging.getLogger("verisync.pdf_extractor")

try:
    import fitz  # PyMuPDF
    _PYMUPDF_AVAILABLE = True
except ImportError:  # pragma: no cover
    _PYMUPDF_AVAILABLE = False


class ExtractionError(Exception):
    """Raised for any non-recoverable extraction failure."""


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def extract_pdf(
    content: bytes,
    filename: str = "document.pdf",
) -> Tuple[str, int, List[dict]]:
    """
    Extract text and page-level evidence from a PDF binary.

    Returns
    -------
    full_text     : Concatenated plain text from all pages.
    page_count    : Total number of pages.
    evidence_blocks : List of dicts compatible with PageEvidence schema:
                    { text, page, paragraph_index, section_heading, char_offset }

    Raises
    ------
    ExtractionError : For encrypted files, zero text output, or parse errors.
    ImportError     : If PyMuPDF is not installed (should not happen in prod).
    """
    if not _PYMUPDF_AVAILABLE:
        raise ImportError(
            "PyMuPDF (fitz) is not installed. "
            "Add 'pymupdf' to requirements.txt and reinstall."
        )

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise ExtractionError(
            f"Could not open '{filename}' as a PDF. "
            f"The file may be corrupt or not a valid PDF. Detail: {exc}"
        ) from exc

    # Encrypted / password-protected documents
    if doc.is_encrypted:
        doc.close()
        raise ExtractionError(
            f"'{filename}' is password-protected. "
            "Please provide a decrypted version for analysis."
        )

    page_count = len(doc)
    if page_count == 0:
        doc.close()
        raise ExtractionError(
            f"'{filename}' contains no pages."
        )

    full_text_parts: List[str] = []
    evidence_blocks: List[dict] = []
    char_cursor = 0

    for page_num, page in enumerate(doc, start=1):
        page_text = page.get_text("text")  # plain text, preserves layout spacing

        if not page_text.strip():
            logger.debug("Page %d of '%s' is blank or image-only", page_num, filename)
            continue

        # Build evidence blocks: split page text into non-empty paragraphs
        paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]

        # Infer a section heading: first non-trivially-short paragraph
        section_heading = _infer_section_heading(paragraphs)

        for para in paragraphs:
            truncated = para[:2000]  # cap at 2 000 chars per block
            evidence_blocks.append(
                {
                    "text": truncated,
                    "page": page_num,
                    "paragraph_index": None,
                    "section_heading": section_heading,
                    "char_offset": char_cursor,
                }
            )
            char_cursor += len(para) + 2  # +2 for the double newline separator

        full_text_parts.append(page_text)

    doc.close()

    full_text = "\n\n".join(full_text_parts)

    if not full_text.strip():
        raise ExtractionError(
            f"'{filename}' produced no extractable text. "
            "The document may consist entirely of scanned images without OCR text."
        )

    logger.info(
        "PDF '%s': %d pages, %d evidence blocks, %d chars",
        filename,
        page_count,
        len(evidence_blocks),
        len(full_text),
    )

    return full_text, page_count, evidence_blocks


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _infer_section_heading(paragraphs: List[str]) -> str | None:
    """
    Pick the most likely section heading from the first few paragraphs.
    Heuristic: first paragraph shorter than 120 chars that doesn't look like
    a footer (all digits, URLs, etc.).
    """
    for para in paragraphs[:3]:
        cleaned = para.strip()
        if 4 <= len(cleaned) <= 120 and not cleaned.replace(" ", "").isdigit():
            return cleaned
    return None
