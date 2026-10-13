"""
VeriSync AI — Clause Searcher

Regex-based clause detection and evidence extraction.

For each domain rule the searcher:
1. Applies the rule's clause_patterns (OR-joined, case-insensitive) against
   the document's extracted evidence blocks.
2. Returns a ClauseMatch containing the matching text, its source location
   (page for PDF, paragraph_index for DOCX), and the surrounding context.
3. Returns None if no block matches any pattern.

Design notes
------------
- The searcher operates on PageEvidence blocks (not raw full_text) so it
  inherits the per-page / per-paragraph location data from the extractor.
- Pattern matching uses re.search so the pattern can match anywhere in the
  block, not just at the start.
- When multiple blocks match, the highest-confidence block (longest match)
  is selected.
- Context is truncated to 300 chars around the match for the extractedValue.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

from app.schemas.ingestion import DocumentMetadata, PageEvidence


@dataclass
class ClauseMatch:
    """Result of a successful clause search."""
    matched_text: str           # The text that matched the pattern
    context: str                # ~300-char window around the match
    page: Optional[int]         # 1-indexed (PDF), None for DOCX
    paragraph_index: Optional[int]  # 0-indexed (DOCX), None for PDF
    section_heading: Optional[str]
    block_index: int            # Index of the evidence block in the document


def search_clause(
    doc: DocumentMetadata,
    patterns: List[str],
) -> Optional[ClauseMatch]:
    """
    Search a document's evidence blocks for any of the given patterns.

    Parameters
    ----------
    doc      : DocumentMetadata with evidence_blocks populated.
    patterns : List of regex pattern strings (case-insensitive).

    Returns
    -------
    ClauseMatch if any evidence block matches any pattern; None otherwise.
    """
    if not doc.evidence_blocks:
        return None

    compiled = _compile_patterns(patterns)
    best: Optional[ClauseMatch] = None
    best_match_len = 0

    for block_idx, block in enumerate(doc.evidence_blocks):
        text = block.text or ""
        for pattern in compiled:
            m = pattern.search(text)
            if m:
                matched_text = m.group(0)
                context = _extract_context(text, m.start(), m.end())
                match_len = len(matched_text)
                if match_len > best_match_len:
                    best_match_len = match_len
                    best = ClauseMatch(
                        matched_text=matched_text,
                        context=context,
                        page=block.page,
                        paragraph_index=block.paragraph_index,
                        section_heading=block.section_heading,
                        block_index=block_idx,
                    )

    return best


def search_clause_all(
    doc: DocumentMetadata,
    patterns: List[str],
) -> List[ClauseMatch]:
    """
    Return ALL matching blocks (not just the best).
    Used when we need to detect multiple clause occurrences.
    """
    if not doc.evidence_blocks:
        return []

    compiled = _compile_patterns(patterns)
    results: List[ClauseMatch] = []
    seen_blocks: set[int] = set()

    for block_idx, block in enumerate(doc.evidence_blocks):
        if block_idx in seen_blocks:
            continue
        text = block.text or ""
        for pattern in compiled:
            m = pattern.search(text)
            if m:
                context = _extract_context(text, m.start(), m.end())
                results.append(ClauseMatch(
                    matched_text=m.group(0),
                    context=context,
                    page=block.page,
                    paragraph_index=block.paragraph_index,
                    section_heading=block.section_heading,
                    block_index=block_idx,
                ))
                seen_blocks.add(block_idx)
                break  # one match per block

    return results


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _compile_patterns(patterns: List[str]) -> List[re.Pattern]:
    return [re.compile(p, re.IGNORECASE | re.DOTALL) for p in patterns]


def _extract_context(text: str, start: int, end: int, window: int = 150) -> str:
    """
    Extract up to `window` characters before and after the match.
    Result is truncated to 300 chars total for UI display.
    """
    ctx_start = max(0, start - window)
    ctx_end = min(len(text), end + window)
    raw = text[ctx_start:ctx_end].strip()
    # Normalise whitespace
    raw = " ".join(raw.split())
    return raw[:300]


def make_section_label(match: ClauseMatch, rule_name: str) -> str:
    """
    Build a human-readable section label for the SourceCitation.section field.
    Uses the block's section_heading if present, otherwise falls back to
    rule name + page/paragraph reference.
    """
    if match.section_heading:
        return match.section_heading[:120]
    if match.page is not None:
        return f"{rule_name} (Page {match.page})"
    if match.paragraph_index is not None:
        return f"{rule_name} (Para {match.paragraph_index + 1})"
    return rule_name


def make_paragraph_ref(match: ClauseMatch) -> Optional[str]:
    """Return 'Para N' reference for DOCX evidence blocks."""
    if match.paragraph_index is not None:
        return f"Para {match.paragraph_index + 1}"
    return None
