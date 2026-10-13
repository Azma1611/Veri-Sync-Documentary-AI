"""
VeriSync AI — Verification Route

POST /api/v1/documents/verify

Accepts multipart/form-data with the same field structure as the
frontend's verifyEmploymentDocuments() function:
  - files[]   : One or more PDF/DOCX files
  - doc_types : Single value or JSON array (one per file)
  - domain    : "employment-hr" (default)

Returns VerificationApiResponse wrapping a full VerificationResult.
The response envelope matches the frontend ApiResponse<VerificationResult>
interface exactly:
  { data: VerificationResult, isSimulated: false, backendConnected: true }
"""

from __future__ import annotations

import json
import logging
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.verification import VerificationApiResponse, VerificationResult
from app.services.verification_engine import run_verification

logger = logging.getLogger("verisync.verify_route")

router = APIRouter(prefix="/documents", tags=["Employment & HR Verification"])


@router.post(
    "/verify",
    response_model=VerificationApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify employment documents for clause consistency",
    description=(
        "Uploads employment documents (PDF or DOCX) and runs deterministic "
        "clause extraction, completeness checking, and cross-document comparison. "
        "\n\n"
        "**Active checks:**\n"
        "- COMP-001: Base Compensation (numeric comparison)\n"
        "- PROB-001: Probation Tenure (duration comparison)\n"
        "- NTCE-001: Notice Period (duration comparison)\n"
        "- IP-001: IP Assignment Annexure (presence check)\n"
        "- RPT-001: Reporting Manager Designation (presence check)\n"
        "\n\n"
        "**Finding types returned:**\n"
        "- `value_mismatch` — both documents have the clause but values differ\n"
        "- `missing_clause` — clause present in one document but absent from the other\n"
        "- `insufficient_evidence` — clause found but value could not be parsed\n"
        "\n\n"
        "All findings are flagged for human review. This endpoint does **not** "
        "determine fraud or authenticity."
    ),
)
async def verify_documents(
    files: List[UploadFile] = File(
        ...,
        description="Two or more employment documents (PDF or DOCX, max 15 MB each)",
    ),
    doc_types: str = Form(
        default="other",
        description=(
            'Document type per file. Single value (e.g. "offer_letter") or '
            'JSON array (e.g. \'["offer_letter","contract"]\'). '
            "Values: offer_letter | contract | job_description | hr_policy | other"
        ),
    ),
    domain: str = Form(
        default="employment-hr",
        description="Target domain. Only employment-hr is active.",
    ),
) -> VerificationApiResponse:

    if not files:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one file must be provided for verification.",
        )

    # Parse doc_types into a list aligned with files
    parsed_types = _parse_doc_types(doc_types, len(files))

    # Build (UploadFile, doc_type_str) pairs
    uploads = list(zip(files, parsed_types))

    # Run the deterministic verification engine
    result: VerificationResult = await run_verification(uploads, domain=domain)

    message = _result_message(result)
    logger.info(
        "Verification complete: %s, %d findings, %d missing",
        result.status.value,
        len(result.findings),
        len(result.missingFields),
    )

    return VerificationApiResponse(
        data=result,
        isSimulated=False,
        backendConnected=True,
        message=message,
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_doc_types(raw: str, count: int) -> List[str]:
    """
    Parse the doc_types form field into a list of strings.
    Handles single values ("offer_letter") and JSON arrays.
    Pads/truncates to match the file count.
    """
    raw = raw.strip()
    try:
        if raw.startswith("["):
            parsed = json.loads(raw)
        else:
            parsed = [raw] * count
    except (json.JSONDecodeError, Exception):
        parsed = ["other"] * count

    # Align length
    while len(parsed) < count:
        parsed.append("other")
    return parsed[:count]


def _result_message(result: VerificationResult) -> str:
    status_map = {
        "inconsistencies_detected": "Potential inconsistencies detected. Human review required.",
        "manual_review_required": "Uncertain findings require human review.",
        "verified_clean": "No discrepancies detected across submitted documents.",
    }
    return status_map.get(result.status.value, "Verification completed.")
