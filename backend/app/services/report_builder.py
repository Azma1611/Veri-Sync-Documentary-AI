"""
VeriSync AI — Verification Report Builder

Assembles the final VerificationResult from the outputs of the
completeness checker and the comparison engine.

Responsibilities
----------------
1. Merge InconsistencyFindings and MissingFieldFindings.
2. Assign the overall VerificationStatus:
     - inconsistencies_detected : any high/medium findings present
     - manual_review_required   : only insufficient_evidence or low findings
     - verified_clean           : no findings at all
3. Write a human-readable summaryNote (non-accusatory).
4. Populate documentsReviewed with original filenames.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List

from app.schemas.ingestion import DocumentMetadata
from app.schemas.verification import (
    FindingType,
    InconsistencyFinding,
    InconsistencySeverity,
    MissingFieldFinding,
    MissingFieldSeverity,
    VerificationResult,
    VerificationStatus,
)

logger = logging.getLogger("verisync.report_builder")


def build_report(
    documents: List[DocumentMetadata],
    inconsistency_findings: List[InconsistencyFinding],
    missing_field_findings: List[MissingFieldFinding],
) -> VerificationResult:
    """
    Assemble a VerificationResult from findings produced by the engine.

    Parameters
    ----------
    documents               : All documents submitted in this verification run.
    inconsistency_findings  : From comparison_engine.compare_documents().
    missing_field_findings  : From completeness_checker.check_completeness().

    Returns
    -------
    VerificationResult ready for the API response.
    """
    docs_reviewed = [doc.original_filename for doc in documents]

    status = _derive_status(inconsistency_findings, missing_field_findings)
    summary = _build_summary(
        status, inconsistency_findings, missing_field_findings, documents
    )

    return VerificationResult(
        domain="Employment & HR",
        totalDocuments=len(documents),
        status=status,
        findings=inconsistency_findings,
        missingFields=missing_field_findings,
        summaryNote=summary,
        reviewedAt=datetime.now(timezone.utc).strftime("%b %d, %Y"),
        documentsReviewed=docs_reviewed,
        engine_version="1.0.0",
        is_simulated=False,
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _derive_status(
    inconsistency_findings: List[InconsistencyFinding],
    missing_field_findings: List[MissingFieldFinding],
) -> VerificationStatus:
    """
    Status hierarchy (most severe wins):
      inconsistencies_detected   : high/medium inconsistency finding, or critical missing
      manual_review_required     : insufficient_evidence or moderate/optional missing only
      verified_clean             : zero findings
    """
    if not inconsistency_findings and not missing_field_findings:
        return VerificationStatus.verified_clean

    # Check for definite inconsistencies
    has_high_severity = any(
        f.severity in (InconsistencySeverity.high, InconsistencySeverity.medium)
        and f.finding_type != FindingType.insufficient_evidence
        for f in inconsistency_findings
    )
    has_critical_missing = any(
        f.severity == MissingFieldSeverity.critical
        for f in missing_field_findings
    )

    if has_high_severity or has_critical_missing:
        return VerificationStatus.inconsistencies_detected

    return VerificationStatus.manual_review_required


def _build_summary(
    status: VerificationStatus,
    inconsistency_findings: List[InconsistencyFinding],
    missing_field_findings: List[MissingFieldFinding],
    documents: List[DocumentMetadata],
) -> str:
    """
    Compose a concise, non-accusatory summary note.
    """
    n_docs = len(documents)
    n_findings = len(inconsistency_findings)
    n_missing = len(missing_field_findings)

    doc_names = " and ".join(
        f"'{d.original_filename}'" for d in documents[:3]
    )
    if len(documents) > 3:
        doc_names += f" (and {len(documents) - 3} more)"

    if status == VerificationStatus.verified_clean:
        return (
            f"Cross-referencing of {n_docs} document(s) ({doc_names}) "
            "produced no detectable discrepancies. All specified clause checks "
            "passed. Human review is still recommended before finalising any "
            "employment agreement."
        )

    parts: List[str] = []

    if n_findings:
        high_count = sum(
            1 for f in inconsistency_findings
            if f.severity == InconsistencySeverity.high
            and f.finding_type != FindingType.insufficient_evidence
        )
        insuff_count = sum(
            1 for f in inconsistency_findings
            if f.finding_type == FindingType.insufficient_evidence
        )
        if high_count:
            parts.append(
                f"{high_count} high-priority discrepanc{'y' if high_count == 1 else 'ies'} "
                "detected"
            )
        if insuff_count:
            parts.append(
                f"{insuff_count} clause{'s' if insuff_count > 1 else ''} flagged "
                "for review due to unclear extracted values"
            )

    if n_missing:
        critical_count = sum(
            1 for f in missing_field_findings
            if f.severity == MissingFieldSeverity.critical
        )
        if critical_count:
            parts.append(
                f"{critical_count} critical missing clause"
                f"{'s' if critical_count > 1 else ''}"
            )

    details = "; ".join(parts) if parts else "potential issues identified"

    return (
        f"Analysis of {n_docs} document(s) — {doc_names} — identified "
        f"{details}. All findings are potential inconsistencies requiring "
        "human auditor review. This report does not constitute legal advice "
        "or a determination of fraud."
    )
