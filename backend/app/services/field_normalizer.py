"""
VeriSync AI — Field Normalizer

Deterministic normalization of extracted clause values.
No LLM, no API calls. Pure string-to-number transformations.

Functions
---------
normalize_currency(text) → Optional[float]
    Converts "₹30,000", "Rs. 25000", "$5,000", "30000 per month" → float.
    Returns None when no numeric value can be extracted.

normalize_duration_to_days(text) → Optional[int]
    Converts "3 months", "90 days", "2 weeks", "1 year" → integer days.
    Returns None when no duration can be extracted.

compare_numeric(a, b, tolerance) → str
    Returns 'match', 'mismatch', or 'insufficient_evidence'.

compare_duration(a, b, tolerance) → str
    Same as compare_numeric but after duration normalization.

compare_presence(text_a, text_b) → str
    Returns 'match' if both texts are non-empty, else 'mismatch'.
"""

from __future__ import annotations

import re
from typing import Optional


# ---------------------------------------------------------------------------
# Currency normalization
# ---------------------------------------------------------------------------

_CURRENCY_PATTERN = re.compile(
    r"(?:rs\.?|inr|₹|usd|\$|eur|€|gbp|£)\s*([\d,]+(?:\.\d+)?)"
    r"|"
    r"([\d,]+(?:\.\d+)?)\s*(?:rs\.?|inr|₹|usd|\$|eur|€|gbp|£)",
    re.IGNORECASE,
)

_BARE_NUMBER_PATTERN = re.compile(
    r"\b([\d,]{4,}(?:\.\d+)?)\b"  # 4+ digit number to avoid matching "3 months"
)


def normalize_currency(text: str) -> Optional[float]:
    """
    Extract a numeric salary / compensation figure from free text.

    Strategy:
    1. Look for a currency symbol adjacent to a number.
    2. Fall back to any 4+ digit bare number.
    3. Return None if nothing matches.

    Only the FIRST match is returned — the assumption is the clause value
    is the first numeric figure in the extracted excerpt.
    """
    text = text.replace("\n", " ").strip()

    m = _CURRENCY_PATTERN.search(text)
    if m:
        raw = m.group(1) or m.group(2)
        return _parse_float(raw)

    # Fallback: look for bare large numbers (salary figures)
    m = _BARE_NUMBER_PATTERN.search(text)
    if m:
        return _parse_float(m.group(1))

    return None


def _parse_float(raw: str) -> Optional[float]:
    """Strip commas and parse to float, returning None on failure."""
    try:
        return float(raw.replace(",", ""))
    except (ValueError, AttributeError):
        return None


# ---------------------------------------------------------------------------
# Duration normalization
# ---------------------------------------------------------------------------

_DURATION_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*(month|week|day|year|fortnight)s?",
    re.IGNORECASE,
)

_DURATION_TO_DAYS: dict[str, float] = {
    "year": 365.0,
    "month": 30.0,
    "fortnight": 14.0,
    "week": 7.0,
    "day": 1.0,
}


def normalize_duration_to_days(text: str) -> Optional[int]:
    """
    Convert a textual duration to an integer number of days.

    Examples
    --------
    "3 months"   → 90
    "90 days"    → 90
    "2 weeks"    → 14
    "1 year"     → 365
    "6-month"    → 180
    """
    text = text.replace("-", " ").replace("\n", " ").strip()
    m = _DURATION_PATTERN.search(text)
    if m:
        quantity = float(m.group(1))
        unit = m.group(2).lower()
        multiplier = _DURATION_TO_DAYS.get(unit, 1.0)
        return round(quantity * multiplier)
    return None


# ---------------------------------------------------------------------------
# Comparison functions
# ---------------------------------------------------------------------------

def compare_numeric(
    value_a: Optional[float],
    value_b: Optional[float],
    tolerance: float = 0.0,
) -> str:
    """
    Compare two numeric values.

    Returns
    -------
    'match'                : Values are within tolerance.
    'mismatch'             : Values differ beyond tolerance.
    'insufficient_evidence': One or both values could not be parsed.
    """
    if value_a is None or value_b is None:
        return "insufficient_evidence"
    if value_a == 0 and value_b == 0:
        return "match"
    # Relative difference
    base = max(abs(value_a), abs(value_b))
    diff = abs(value_a - value_b) / base if base > 0 else 0.0
    return "match" if diff <= tolerance else "mismatch"


def compare_duration(
    text_a: str,
    text_b: str,
    tolerance: float = 0.0,
) -> str:
    """
    Normalize both texts to days and compare.
    """
    days_a = normalize_duration_to_days(text_a)
    days_b = normalize_duration_to_days(text_b)
    return compare_numeric(
        float(days_a) if days_a is not None else None,
        float(days_b) if days_b is not None else None,
        tolerance,
    )


def compare_presence(text_a: str, text_b: str) -> str:
    """
    Returns 'match' when both texts contain extractable content.
    Used for clauses where only existence matters, not value.
    """
    if text_a.strip() and text_b.strip():
        return "match"
    return "mismatch"


def format_currency_label(value: Optional[float], raw_text: str) -> str:
    """
    Return a human-readable currency label.
    Uses the raw text excerpt as fallback when parsing fails.
    """
    if value is not None:
        if value >= 100_000:
            return f"₹{value:,.0f} p.a."
        return f"₹{value:,.0f}/month"
    # strip to first 100 chars of raw
    return raw_text[:100].strip()
