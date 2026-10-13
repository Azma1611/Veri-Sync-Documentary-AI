"""
VeriSync AI — File Validator

Centralised gating layer run before any extractor is invoked.
Validates MIME type, file extension, and size against configurable limits.

Raises ValueError with a human-readable message for every rejection reason
so the route layer can surface these as 422 Unprocessable Entity responses.
"""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Tuple

logger = logging.getLogger("verisync.validator")

# ---------------------------------------------------------------------------
# Configurable limits (imported from settings in production; hard-coded
# here to keep the validator self-contained and testable in isolation)
# ---------------------------------------------------------------------------

MAX_FILE_SIZE_MB: float = 15.0          # UploadZone in frontend also enforces 15 MB
MAX_FILES_PER_REQUEST: int = 10
MIN_FILE_SIZE_BYTES: int = 64           # Reject trivially-empty files

ACCEPTED_MIME_TYPES: Tuple[str, ...] = (
    "application/pdf",
    # Standard DOCX MIME type
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    # Legacy .doc — not extracted but accepted with a clear error
    "application/msword",
)

ACCEPTED_EXTENSIONS: Tuple[str, ...] = (".pdf", ".docx", ".doc")

# Magic-byte signatures for supported formats
# Used as a secondary check after MIME type to guard against spoofed extensions
_PDF_MAGIC = b"%PDF"
_DOCX_MAGIC = b"PK\x03\x04"  # ZIP local file header (DOCX is a ZIP archive)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

class FileValidationError(ValueError):
    """Raised when a file cannot be accepted for processing."""


def validate_file(
    filename: str,
    content_type: str,
    content: bytes,
    max_size_mb: float = MAX_FILE_SIZE_MB,
) -> None:
    """
    Validate a single uploaded file.  Raises FileValidationError describing
    the exact rejection reason.

    Parameters
    ----------
    filename     : Original filename from the multipart upload.
    content_type : MIME type reported by the HTTP client.
    content      : Full file content as bytes.
    max_size_mb  : Maximum allowed file size in megabytes.
    """
    stem = Path(filename)
    extension = stem.suffix.lower()

    # 1. Extension check
    if extension not in ACCEPTED_EXTENSIONS:
        raise FileValidationError(
            f"Unsupported file extension '{extension}'. "
            f"Accepted extensions: {', '.join(ACCEPTED_EXTENSIONS)}."
        )

    # 2. MIME type check (client-reported; not trusted alone)
    normalised_mime = content_type.split(";")[0].strip().lower()
    if normalised_mime not in ACCEPTED_MIME_TYPES:
        raise FileValidationError(
            f"Unsupported content-type '{content_type}'. "
            f"Accepted types: PDF and DOCX."
        )

    # 3. Minimum size — rejects truly empty or placeholder files
    if len(content) < MIN_FILE_SIZE_BYTES:
        raise FileValidationError(
            f"File '{filename}' is too small ({len(content)} bytes). "
            "The file appears to be empty or corrupt."
        )

    # 4. Maximum size
    max_size_bytes = int(max_size_mb * 1024 * 1024)
    if len(content) > max_size_bytes:
        actual_mb = len(content) / (1024 * 1024)
        raise FileValidationError(
            f"File '{filename}' is {actual_mb:.1f} MB, which exceeds the "
            f"{max_size_mb:.0f} MB limit."
        )

    # 5. Magic-byte verification (guards against spoofed extensions)
    _verify_magic_bytes(filename, extension, content)

    # 6. Legacy .doc — not extractable yet; reject with explanation
    if extension == ".doc" or normalised_mime == "application/msword":
        raise FileValidationError(
            f"Legacy Word 97-2003 format (.doc) is not yet supported. "
            "Please save the document as .docx and re-upload."
        )

    logger.debug(
        "File '%s' passed validation (%d bytes, %s)",
        filename,
        len(content),
        normalised_mime,
    )


def validate_file_count(count: int, max_count: int = MAX_FILES_PER_REQUEST) -> None:
    """Validate the number of files in a single request."""
    if count == 0:
        raise FileValidationError("No files were provided in the request.")
    if count > max_count:
        raise FileValidationError(
            f"Too many files: {count} uploaded, maximum allowed is {max_count}."
        )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _verify_magic_bytes(filename: str, extension: str, content: bytes) -> None:
    """
    Check that the binary content matches the expected file signature.
    This prevents '.pdf' files that actually contain DOCX content (or vice
    versa) from reaching the extractor.
    """
    if extension == ".pdf":
        if not content.startswith(_PDF_MAGIC):
            raise FileValidationError(
                f"File '{filename}' claims to be a PDF but does not contain a "
                "valid PDF header (%PDF…). The file may be corrupt or mislabelled."
            )
    elif extension == ".docx":
        if not content.startswith(_DOCX_MAGIC):
            raise FileValidationError(
                f"File '{filename}' claims to be a DOCX but does not contain a "
                "valid ZIP/DOCX header. The file may be corrupt or mislabelled."
            )
