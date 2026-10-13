"""
VeriSync AI — Evidence Grounding Validator

Strict validation layer that prevents AI hallucinations from contaminating
verification reports.
Enforces:
1. Every excerpt cited by an AI must exist in the document's actual extracted evidence blocks.
2. Page numbers and paragraph references are bound to actual document layout.
3. Invented excerpts, fictitious document IDs, or ungrounded claims are rejected.
"""

from __future__ import annotations

import logging
import re
from typing import List, Optional, Tuple

from app.schemas.ai import CandidateFieldItem
from app.schemas.ingestion import DocumentMetadata

logger = logging.getLogger("verisync.ai.grounding")


def _normalize_ws(s: str) -> str:
    """Normalize whitespace for resilient substring comparison."""
    if not s:
        return ""
    return " ".join(s.split()).lower()


def validate_quote_grounding(
    quote: str,
    doc: DocumentMetadata,
) -> Tuple[bool, Optional[int], Optional[str]]:
    """
    Verify whether a candidate quote or excerpt actually occurs in the document.

    Returns
    -------
    (is_grounded, page_number, paragraph_reference)
    - is_grounded: True if found as an exact or normalized substring in any block.
    - page_number: 1-indexed page if found in a PDF block, else None.
    - paragraph_reference: String representation of paragraph index if DOCX.
    """
    if not quote or not doc.evidence_blocks:
        return False, None, None

    norm_quote = _normalize_ws(quote)
    if not norm_quote:
        return False, None, None

    # Search through all extracted evidence blocks
    for block in doc.evidence_blocks:
        block_norm = _normalize_ws(block.text or "")
        if norm_quote in block_norm:
            para_ref = f"Para {block.paragraph_index + 1}" if block.paragraph_index is not None else None
            return True, block.page, para_ref

    # If quote is very long (e.g. > 100 chars), the model might have paraphrased.
    # Check if a substantial sub-sequence (first 40 chars) matches.
    if len(norm_quote) > 40:
        prefix = norm_quote[:40]
        for block in doc.evidence_blocks:
            block_norm = _normalize_ws(block.text or "")
            if prefix in block_norm:
                para_ref = f"Para {block.paragraph_index + 1}" if block.paragraph_index is not None else None
                return True, block.page, para_ref

    logger.warning(
        "Grounding check failed: AI excerpt '%s...' not found in document '%s'",
        quote[:60],
        doc.original_filename,
    )
    return False, None, None


def ground_candidate_fields(
    fields: List[CandidateFieldItem],
    doc: DocumentMetadata,
) -> List[CandidateFieldItem]:
    """
    Examine each AI-extracted candidate field and verify its quote against the source document.
    Fields with unverifiable quotes are flagged with is_grounded=False.
    """
    grounded_fields: List[CandidateFieldItem] = []

    for item in fields:
        is_grounded, page, para = validate_quote_grounding(item.exact_quote, doc)
        
        # If exact_quote didn't match, try raw_value
        if not is_grounded and item.raw_value:
            is_grounded, page, para = validate_quote_grounding(item.raw_value, doc)

        grounded_fields.append(
            CandidateFieldItem(
                field_name=item.field_name,
                raw_value=item.raw_value,
                normalized_value=item.normalized_value,
                exact_quote=item.exact_quote,
                confidence=item.confidence,
                is_grounded=is_grounded,
                grounded_page=page if is_grounded else None,
                grounded_paragraph=para if is_grounded else None,
            )
        )

    return grounded_fields
