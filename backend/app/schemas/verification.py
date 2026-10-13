"""
VeriSync AI — Verification Schemas

Pydantic models for the verification engine output layer.
These mirror the frontend TypeScript interfaces in types/index.ts exactly:
  - InconsistencyFinding
  - MissingFieldFinding
  - VerificationResult
  - ApiResponse<VerificationResult>

Do NOT alter field names without simultaneously updating the frontend types
and the api-contract.md document.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.ai import AIAssistanceResult


# ---------------------------------------------------------------------------
# Enumerations (kept in sync with frontend types/index.ts)
# ---------------------------------------------------------------------------

class InconsistencySeverity(str, Enum):
    high = "high"      # Direct contractual conflict: financial, tenure, separation
    medium = "medium"  # Variation in evaluation criteria, policy references
    low = "low"        # Administrative or formatting deviations


class FindingStatus(str, Enum):
    flagged = "flagged"                          # Detected, awaiting human review
    verified_inconsistency = "verified_inconsistency"  # Auditor confirmed
    insufficient_evidence = "insufficient_evidence"    # Clause found but value unclear
    acceptable_variation = "acceptable_variation"      # Auditor marked OK


class FindingType(str, Enum):
    value_mismatch = "value_mismatch"       # Both docs have clause, values differ
    missing_clause = "missing_clause"       # Clause absent from an expected document
    insufficient_evidence = "insufficient_evidence"  # Clause present but ambiguous
    cross_reference = "cross_reference"    # Internal reference pointing to missing annex


class MissingFieldSeverity(str, Enum):
    critical = "critical"    # Mandatory legal covenant missing
    moderate = "moderate"    # Organisational metadata missing
    optional = "optional"    # Recommended supplementary document


class VerificationStatus(str, Enum):
    inconsistencies_detected = "inconsistencies_detected"
    verified_clean = "verified_clean"
    manual_review_required = "manual_review_required"


class InconsistencyCategory(str, Enum):
    compensation = "compensation"
    probation_period = "probation_period"
    notice_period = "notice_period"
    roles_responsibilities = "roles_responsibilities"
    benefits = "benefits"
    ip_assignment = "ip_assignment"
    reporting_structure = "reporting_structure"
    general = "general"


# ---------------------------------------------------------------------------
# Source citation — mirrors frontend SourceCitation interface exactly
# ---------------------------------------------------------------------------

class SourceCitation(BaseModel):
    """
    A verbatim excerpt anchored to its source document and location.
    page is 1-indexed for PDFs; paragraph_ref is used for DOCX.
    """
    document_id: str = Field(description="Internal UUID of the source document")
    documentName: str = Field(description="Original filename shown to the user")
    section: str = Field(description="Clause label or inferred section heading")
    page: int = Field(
        default=1,
        description="1-indexed page number (PDF); 1 for DOCX where page is unknown",
    )
    paragraph_ref: Optional[str] = Field(
        default=None,
        description="'Para N' reference for DOCX evidence blocks",
    )
    extractedValue: str = Field(description="Verbatim extracted clause excerpt")


# ---------------------------------------------------------------------------
# Finding models
# ---------------------------------------------------------------------------

class InconsistencyFinding(BaseModel):
    """
    A detected discrepancy between two source documents.
    Mirrors frontend InconsistencyFinding interface.
    """
    id: str = Field(description="Stable finding ID: rule_id + document pair hash")
    rule_id: str = Field(description="Rule that produced this finding (e.g. 'COMP-001')")
    finding_type: FindingType = Field(description="Classification of the finding")
    title: str
    severity: InconsistencySeverity
    category: InconsistencyCategory
    explanation: str = Field(description="Concise, non-accusatory description")
    sourceA: SourceCitation
    sourceB: SourceCitation
    recommendedAction: str
    status: FindingStatus = Field(default=FindingStatus.flagged)


class MissingFieldFinding(BaseModel):
    """
    A required clause that is absent from one or more expected documents.
    Mirrors frontend MissingFieldFinding interface.
    """
    id: str
    rule_id: str = Field(description="Rule that produced this finding")
    fieldName: str
    expectedIn: str = Field(description="Comma-separated list of document names where expected")
    severity: MissingFieldSeverity
    detail: str = Field(description="Why it matters and where to look")


# ---------------------------------------------------------------------------
# Top-level verification result — mirrors frontend VerificationResult exactly
# ---------------------------------------------------------------------------

class VerificationResult(BaseModel):
    """
    Complete output of a single verification run.
    Shaped to match the frontend VerificationResult TypeScript interface.
    """
    domain: str = Field(default="Employment & HR")
    totalDocuments: int
    status: VerificationStatus
    findings: List[InconsistencyFinding] = Field(default_factory=list)
    missingFields: List[MissingFieldFinding] = Field(default_factory=list)
    summaryNote: str
    reviewedAt: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).strftime("%b %d, %Y")
    )
    documentsReviewed: List[str] = Field(default_factory=list)

    # Extra fields surfaced to Swagger but not needed by the frontend
    engine_version: str = Field(default="1.0.0")
    is_simulated: bool = Field(default=False)
    ai_assistance: Optional[AIAssistanceResult] = Field(
        default=None,
        description="Optional AI-assisted insights, finding explanations, and grounding verification stats",
    )


# ---------------------------------------------------------------------------
# API envelope — matches frontend ApiResponse<VerificationResult>
# ---------------------------------------------------------------------------

class VerificationApiResponse(BaseModel):
    """
    Wraps VerificationResult in the ApiResponse envelope the frontend
    expects from verifyEmploymentDocuments().
    """
    data: VerificationResult
    isSimulated: bool = Field(default=False)
    backendConnected: bool = Field(default=True)
    message: Optional[str] = None
