"""
VeriSync AI — Review Decisions & Report Export Routes

POST /api/v1/documents/findings/{finding_id}/review:
  Records an authorized human review decision into an append-only audit trail.

GET /api/v1/documents/findings/{finding_id}/audit-trail:
  Retrieves chronological decision log for a specific finding.

POST /api/v1/reports/export:
  Exports an in-memory VerificationResult into formatted Markdown or JSON.
"""

from __future__ import annotations

import json
import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas.audit import (
    AuditTrailResponse,
    ReportExportRequest,
    ReportExportResponse,
    ReviewDecisionRequest,
    ReviewDecisionResponse,
)
from app.services.audit_store import audit_store
from app.services.report_exporter import generate_json_report, generate_markdown_report

logger = logging.getLogger("verisync.review_routes")

router = APIRouter(tags=["Human Review Decisions & Audit Trail"])


@router.post(
    "/documents/findings/{finding_id}/review",
    response_model=ReviewDecisionResponse,
    summary="Record human review decision for a finding",
    description=(
        "Appends an auditor determination into an append-only audit log. "
        "Authorized actions: 'Verified Inconsistency', 'Acceptable Variation', 'Flagged for Legal Review'. "
        "Never overwrites prior historical decisions."
    ),
)
async def submit_review_decision(
    finding_id: str,
    request: ReviewDecisionRequest,
) -> ReviewDecisionResponse:
    try:
        record = audit_store.record_decision(
            finding_id=finding_id,
            status=request.status,
            notes=request.notes or "",
            reviewer_id=request.reviewer_id or "usr-auditor-1",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return ReviewDecisionResponse(
        success=True,
        findingId=record.finding_id,
        decisionId=record.decision_id,
        status=record.status,
        reviewerId=record.reviewer_id,
        recordedAt=record.recorded_at,
        notes=record.notes,
        previousStatus=record.previous_status,
    )


@router.get(
    "/documents/findings/{finding_id}/audit-trail",
    response_model=AuditTrailResponse,
    summary="Get complete audit trail for a finding",
    description="Returns chronological, append-only history of all reviewer determinations.",
)
async def get_finding_audit_trail(finding_id: str) -> AuditTrailResponse:
    trail = audit_store.get_audit_trail(finding_id)
    current_status = trail[-1].status if trail else "flagged"

    return AuditTrailResponse(
        findingId=finding_id,
        totalDecisions=len(trail),
        currentStatus=current_status,
        auditTrail=trail,
    )


@router.post(
    "/reports/export",
    response_model=ReportExportResponse,
    summary="Export verification audit report (Markdown or JSON)",
    description=(
        "Converts a VerificationResult into an audit-grade Markdown report or "
        "structured JSON document matching ExportReportModal expectations."
    ),
)
async def export_report(request: ReportExportRequest) -> ReportExportResponse:
    audit_decisions = audit_store.get_all_decisions() if request.include_audit_trail else None
    clean_fmt = request.format.lower().strip()

    if clean_fmt == "json":
        data_dict = generate_json_report(request.result, audit_decisions)
        return ReportExportResponse(
            format="json",
            filename=f"verisync-verification-report-{request.result.domain.lower().replace(' ', '-')}.json",
            content=json.dumps(data_dict, indent=2),
        )

    # Markdown format
    md_content = generate_markdown_report(request.result, audit_decisions)
    return ReportExportResponse(
        format="markdown",
        filename=f"verisync-verification-report-{request.result.domain.lower().replace(' ', '-')}.md",
        content=md_content,
    )
