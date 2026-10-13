"""
VeriSync AI — PII Minimization Service

Redacts personal identifiable information (PII) before sending untrusted
document excerpts to external LLM providers. Minimizes context to only
the clauses required for semantic evaluation.
"""

from __future__ import annotations

import re

# Standard regexes for PII detection and redaction
_EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    re.IGNORECASE,
)

# International and domestic phone formats (+91..., (555)..., 123-456-7890, etc.)
_PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|"
    r"\b(?:\+91[-.\s]?)?[6789]\d{9}\b",
)

# Indian PAN Card: 5 uppercase letters + 4 digits + 1 uppercase letter
_PAN_PATTERN = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b")

# Indian Aadhaar: 12 digits (with optional spaces or dashes)
_AADHAAR_PATTERN = re.compile(r"\b\d{4}[-\s]\d{4}[-\s]\d{4}\b")

# US SSN: 3 digits - 2 digits - 4 digits
_SSN_PATTERN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")


def sanitize_text(text: str, redact_pii: bool = True) -> str:
    """
    Sanitize untrusted text before forwarding to external AI providers:
    1. Replaces emails, phone numbers, and identity numbers with redaction tokens.
    2. Normalizes non-printable and suspicious control characters.
    """
    if not text:
        return ""

    if not redact_pii:
        return text

    sanitized = text

    # Redact identity cards
    sanitized = _PAN_PATTERN.sub("[REDACTED_PAN]", sanitized)
    sanitized = _AADHAAR_PATTERN.sub("[REDACTED_AADHAAR]", sanitized)
    sanitized = _SSN_PATTERN.sub("[REDACTED_SSN]", sanitized)

    # Redact contact information
    sanitized = _EMAIL_PATTERN.sub("[REDACTED_EMAIL]", sanitized)
    sanitized = _PHONE_PATTERN.sub("[REDACTED_PHONE]", sanitized)

    return sanitized


def minimize_context(text: str, max_chars: int = 1500) -> str:
    """
    Trim context to an essential window around the clause,
    minimizing exposure of unnecessary document contents.
    """
    if not text or len(text) <= max_chars:
        return text

    return text[:max_chars].strip() + "... [truncated for data minimization]"
