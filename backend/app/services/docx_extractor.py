"""
VeriSync AI — DOCX Extractor (python-docx)

Extracts full text and paragraph-level evidence from DOCX documents.

Design decisions
----------------
* DOCX files do not expose reliable page numbers at parse time — the page
  layout is computed by the word processor at render time and is not stored
  in the XML.  Therefore evidence blocks carry paragraph_index instead of
  page, and section_heading is derived from Word paragraph styles
  (Heading 1 / Heading 2).
* Empty paragraphs are skipped but counted in the index so paragraph_index
  values remain stable and can be used as stable references.
* Password-protected DOCX files raise ExtractionError.
* Malformed ZIP/DOCX archives raise ExtractionError.
"""

from __future__ import annotations

import io
import logging
from typing import List, Tuple

logger = logging.getLogger("verisync.docx_extractor")

try:
    from docx import Document as DocxDocument
    from docx.oxml.ns import qn
    _DOCX_AVAILABLE = True
except ImportError:  # pragma: no cover
    _DOCX_AVAILABLE = False


class ExtractionError(Exception):
    """Raised for any non-recoverable extraction failure."""


# Style names considered to be section headings
_HEADING_STYLES = {
    "heading 1", "heading 2", "heading 3",
    "title", "subtitle",
}


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def extract_docx(
    content: bytes,
    filename: str = "document.docx",
) -> Tuple[str, int, List[dict]]:
    """
    Extract text and paragraph-level evidence from a DOCX binary.

    Returns
    -------
    full_text        : Concatenated plain text from all paragraphs.
    paragraph_count  : Total number of non-empty paragraphs.
    evidence_blocks  : List of dicts compatible with PageEvidence schema:
                     { text, page, paragraph_index, section_heading, char_offset }
                     page is always None for DOCX.

    Raises
    ------
    ExtractionError  : For encrypted, corrupt, or empty documents.
    ImportError      : If python-docx is not installed.
    """
    if not _DOCX_AVAILABLE:
        raise ImportError(
            "python-docx is not installed. "
            "Add 'python-docx' to requirements.txt and reinstall."
        )

    try:
        doc = DocxDocument(io.BytesIO(content))
    except Exception as exc:
        # python-docx raises various exceptions for bad ZIP / XML
        exc_str = str(exc).lower()
        if "password" in exc_str or "encrypted" in exc_str:
            raise ExtractionError(
                f"'{filename}' is password-protected. "
                "Please provide an unprotected version for analysis."
            ) from exc
        raise ExtractionError(
            f"Could not open '{filename}' as a DOCX file. "
            f"The file may be corrupt or not a valid Word document. Detail: {exc}"
        ) from exc

    paragraphs = doc.paragraphs
    if not paragraphs:
        raise ExtractionError(f"'{filename}' contains no paragraphs.")

    full_text_parts: List[str] = []
    evidence_blocks: List[dict] = []
    char_cursor = 0
    current_heading: str | None = None
    non_empty_count = 0

    for para_idx, para in enumerate(paragraphs):
        text = para.text.strip()

        # Track the current section heading from Word styles
        style_name = para.style.name.lower() if para.style and para.style.name else ""
        if style_name in _HEADING_STYLES and text:
            current_heading = text

        if not text:
            continue  # skip empty paragraphs but preserve index continuity

        truncated = text[:2000]
        evidence_blocks.append(
            {
                "text": truncated,
                "page": None,
                "paragraph_index": para_idx,
                "section_heading": current_heading,
                "char_offset": char_cursor,
            }
        )
        full_text_parts.append(text)
        char_cursor += len(text) + 1
        non_empty_count += 1

    full_text = "\n".join(full_text_parts)

    if not full_text.strip():
        raise ExtractionError(
            f"'{filename}' produced no extractable text. "
            "The document may be empty or contain only embedded images."
        )

    logger.info(
        "DOCX '%s': %d non-empty paragraphs, %d evidence blocks, %d chars",
        filename,
        non_empty_count,
        len(evidence_blocks),
        len(full_text),
    )

    return full_text, non_empty_count, evidence_blocks
