"""
VeriSync AI — History & Audit Records Routes

GET /api/v1/history
GET /api/v1/history/{history_id}
GET /api/v1/history/{history_id}/export

Supports multi-dimensional query filtering:
- search query (document name, candidate, summary)
- workflow type ('all', 'verification', 'resume')
- review status ('Inconsistencies Found', 'Verified', 'Completed', 'Pending Review')
- domain ('employment-hr', etc.)
- severity ('high', 'medium', 'low')
- date range (from_date, to_date)
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.audit import (
    HistoryDetailResponse,
    HistoryListApiResponse,
    ReportExportResponse,
)
from app.services.audit_store import audit_store
from app.services.history_store import history_store
from app.services.report_exporter import generate_json_report, generate_markdown_report

logger = logging.getLogger("verisync.history_routes")

router = APIRouter(prefix="/history", tags=["Verification History & Audit Logs"])


@router.get(
    "",
    response_model=HistoryListApiResponse,
    summary="Query verification history and audit archives",
    description=(
        "Retrieves historical verification records with search and multi-parameter filtering. "
        "Historical demo records are explicitly labeled with `is_demo_data=True`."
    ),
)
async def list_history(
    type: Optional[str] = Query(default="all", description="Workflow type: 'all' | 'verification' | 'resume'"),
    status: Optional[str] = Query(default="all", description="Review status filter"),
    search: Optional[str] = Query(default=None, description="Free-text search across documents and summary"),
    domain: Optional[str] = Query(default=None, description="Domain filter, e.g. 'employment-hr'"),
    severity: Optional[str] = Query(default=None, description="Severity filter: 'high' | 'medium' | 'low'"),
    from_date: Optional[str] = Query(default=None, description="Start date (YYYY-MM-DD or ISO string)"),
    to_date: Optional[str] = Query(default=None, description="End date (YYYY-MM-DD or ISO string)"),
    include_demo: bool = Query(default=True, description="Whether to include demonstration archives"),
) -> HistoryListApiResponse:
    records = history_store.filter_history(
        search=search,
        analysis_type=type,
        status=status,
        domain=domain,
        severity=severity,
        from_date=from_date,
        to_date=to_date,
        include_demo=include_demo,
    )

    return HistoryListApiResponse(
        data=records,
        totalCount=len(records),
        isSimulated=False,
        backendConnected=True,
        message=f"Retrieved {len(records)} history records",
    )


@router.get(
    "/{history_id}",
    response_model=HistoryDetailResponse,
    summary="Get detailed history record with full verification result",
)
async def get_history_detail(history_id: str) -> HistoryDetailResponse:
    entry = history_store.get_by_id(history_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History record '{history_id}' not found.",
        )

    item, result = entry
    all_decisions = audit_store.get_all_decisions()
    return HistoryDetailResponse(
        item=item,
        full_result=result,
        audit_decisions=all_decisions,
    )


@router.get(
    "/{history_id}/export",
    response_model=ReportExportResponse,
    summary="Export historical verification report (Markdown or JSON)",
)
async def export_historical_report(
    history_id: str,
    format: str = Query(default="markdown", description="'markdown' or 'json'"),
) -> ReportExportResponse:
    entry = history_store.get_by_id(history_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History record '{history_id}' not found.",
        )

    item, result = entry
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"History record '{history_id}' does not have an attached full verification result (e.g. legacy demo item).",
        )

    all_decisions = audit_store.get_all_decisions()
    clean_fmt = format.lower().strip()

    if clean_fmt == "json":
        json_data = generate_json_report(result, all_decisions)
        return ReportExportResponse(
            format="json",
            filename=f"verisync-audit-{history_id}.json",
            content=json_data if isinstance(json_data, str) else str(json_data),
        )

    md_text = generate_markdown_report(result, all_decisions)
    return ReportExportResponse(
        format="markdown",
        filename=f"verisync-audit-{history_id}.md",
        content=md_text,
    )
