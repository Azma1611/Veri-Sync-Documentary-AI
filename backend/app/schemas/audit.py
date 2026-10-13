"""
VeriSync AI — Reviewer Decision, Audit Trail & Report Export Schemas

Pydantic models for:
- Human review actions (Confirm Inconsistency, Acceptable Variation, Flag for Legal)
- Append-only audit decision trail with reviewer ID and UTC timestamp
- Historical verification records and query filters
- Markdown & JSON report export formats
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.verification import VerificationResult


# ---------------------------------------------------------------------------
# Review Action Enumerations & Models
# ---------------------------------------------------------------------------

class ReviewActionEnum(str, Enum):
    verified_inconsistency = "Verified Inconsistency"
    acceptable_variation = "Acceptable Variation"
    flagged_for_legal_review = "Flagged for Legal Review"


class ReviewDecisionRequest(BaseModel):
    """Payload submitted by a human reviewer for a specific finding."""
    status: str = Field(
        ...,
        description=(
            "Review action status. Must be one of: 'Verified Inconsistency', "
            "'Acceptable Variation', 'Flagged for Legal Review'"
        ),
    )
    notes: Optional[str] = Field(
        default="",
        description="Optional justification, audit note, or remediation instruction",
    )
    reviewer_id: Optional[str] = Field(
        default="usr-auditor-1",
        description="Identifier of the authorized human auditor",
    )


class ReviewDecisionRecord(BaseModel):
    """An immutable, append-only record of a human reviewer decision."""
    decision_id: str = Field(description="Unique UUID for this audit entry")
    finding_id: str = Field(description="Target finding identifier")
    status: str = Field(description="Status assigned by reviewer")
    notes: str = Field(default="")
    reviewer_id: str = Field(description="Auditor ID who made the determination")
    recorded_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )
    previous_status: Optional[str] = Field(
        default=None,
        description="Prior review status before this decision was recorded",
    )


class ReviewDecisionResponse(BaseModel):
    """Response returned upon recording a review action."""
    success: bool = True
    findingId: str
    decisionId: str
    status: str
    reviewerId: str
    recordedAt: str
    notes: str
    previousStatus: Optional[str] = None


class AuditTrailResponse(BaseModel):
    """Full append-only audit trail for a finding."""
    findingId: str
    totalDecisions: int
    currentStatus: str
    auditTrail: List[ReviewDecisionRecord]


# ---------------------------------------------------------------------------
# History Schemas (mirrors frontend HistoryItem exactly)
# ---------------------------------------------------------------------------

class HistoryItemResponse(BaseModel):
    """
    Audit log record shaped to match the frontend HistoryItem interface exactly:
    id, documentName, analysisType, date, status, summary, metricBadge, findingsCount, domain.
    """
    id: str = Field(description="History record identifier, e.g. HIST-20261014-001")
    documentName: str = Field(description="Primary document names examined")
    analysisType: str = Field(
        default="Employment Document Verification",
        description="'Employment Document Verification' or 'Resume & Career Fit'",
    )
    date: str = Field(description="Formatted date string, e.g. 'Oct 14, 2026'")
    status: str = Field(
        description="'Inconsistencies Found' | 'Verified' | 'Pending Review' | 'Completed'",
    )
    summary: str = Field(description="Executive summary of the run")
    metricBadge: str = Field(description="e.g. '2 Inconsistencies' or 'Verified Clean'")
    findingsCount: Optional[int] = Field(default=0)
    score: Optional[int] = Field(default=None)
    domain: str = Field(default="Employment & HR")
    severity: Optional[str] = Field(default=None)
    is_demo_data: bool = Field(
        default=False,
        description="True if record is pre-seeded demonstration data, False for live verification runs",
    )
    created_at_iso: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class HistoryDetailResponse(BaseModel):
    """Detailed history item including the full original VerificationResult."""
    item: HistoryItemResponse
    full_result: Optional[VerificationResult] = None
    audit_decisions: Dict[str, List[ReviewDecisionRecord]] = Field(default_factory=dict)


class HistoryListApiResponse(BaseModel):
    """Envelope matching frontend ApiResponse<HistoryItem[]>."""
    data: List[HistoryItemResponse]
    totalCount: int
    isSimulated: bool = False
    backendConnected: bool = True
    message: Optional[str] = None


# ---------------------------------------------------------------------------
# Report Export Schemas
# ---------------------------------------------------------------------------

class ReportExportRequest(BaseModel):
    """Payload to export a verification result."""
    result: VerificationResult
    format: str = Field(default="markdown", description="'markdown' or 'json'")
    include_audit_trail: bool = Field(default=True)


class ReportExportResponse(BaseModel):
    """Exported report payload."""
    format: str
    filename: str
    content: str  # Markdown string or serialized JSON string
    disclaimer: str = (
        "This evidence-linked summary documents potential inconsistencies for internal "
        "auditor reconciliation. Always obtain formal confirmation before taking contractual action."
    )
