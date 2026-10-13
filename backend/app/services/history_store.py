"""
VeriSync AI — Persisted Verification History Store

Stores completed verification records with multi-dimensional filtering:
- Date range (from_date, to_date)
- Domain ('employment-hr', etc.)
- Finding severity ('high', 'medium', 'low')
- Review status ('Inconsistencies Found', 'Verified', 'Completed', 'Pending Review')
- Search query across document name, summary, and domain

Explicit labeling:
- Demo records are strictly marked with is_demo_data=True.
- Live verification runs are marked with is_demo_data=False.
"""

from __future__ import annotations

import logging
import threading
from datetime import datetime, timezone
from typing import Dict, List, Optional
import uuid

from app.schemas.audit import HistoryDetailResponse, HistoryItemResponse
from app.schemas.verification import InconsistencySeverity, VerificationResult, VerificationStatus

logger = logging.getLogger("verisync.history_store")


class HistoryStore:
    """Thread-safe storage and query service for verification audit history."""

    def __init__(self):
        self._lock = threading.Lock()
        # id -> (HistoryItemResponse, Optional[VerificationResult])
        self._records: Dict[str, tuple[HistoryItemResponse, Optional[VerificationResult]]] = {}
        self._seed_demo_records()

    def _seed_demo_records(self) -> None:
        """
        Pre-seeds demo historical records as defined in the frontend mock data,
        explicitly labelled as demonstration data to avoid misleading metrics.
        """
        demo_items = [
            HistoryItemResponse(
                id="DEMO-HIST-101",
                documentName="Offer_Letter_Signed_2024.pdf & Employment_Contract_Standard_v2.pdf",
                analysisType="Employment Document Verification",
                date="Oct 12, 2026",
                status="Inconsistencies Found",
                summary="[Demo Record] Salary discrepancy (₹30,000 vs ₹25,000) and probation period conflict identified.",
                metricBadge="3 Inconsistencies",
                findingsCount=3,
                domain="Employment & HR",
                severity="high",
                is_demo_data=True,
                created_at_iso="2026-10-12T14:30:00Z",
            ),
            HistoryItemResponse(
                id="DEMO-HIST-102",
                documentName="Senior_FullStack_Engineer_Offer.docx & Policy_Handbook.docx",
                analysisType="Employment Document Verification",
                date="Oct 11, 2026",
                status="Verified",
                summary="[Demo Record] Complete clause reconciliation confirmed across employment contract and separation annexures.",
                metricBadge="Verified Clean",
                findingsCount=0,
                domain="Employment & HR",
                severity="low",
                is_demo_data=True,
                created_at_iso="2026-10-11T11:15:00Z",
            ),
            HistoryItemResponse(
                id="DEMO-HIST-103",
                documentName="Engineering_Director_Package.pdf",
                analysisType="Employment Document Verification",
                date="Oct 09, 2026",
                status="Pending Review",
                summary="[Demo Record] Missing Annexure B IP assignment addendum requires human auditor confirmation.",
                metricBadge="1 Missing Field",
                findingsCount=1,
                domain="Employment & HR",
                severity="high",
                is_demo_data=True,
                created_at_iso="2026-10-09T09:45:00Z",
            ),
            HistoryItemResponse(
                id="DEMO-HIST-104",
                documentName="Alex_Morgan_Senior_Engineer_Resume.pdf",
                analysisType="Resume & Career Fit",
                date="Oct 13, 2026",
                status="Completed",
                summary="[Demo Record] High role alignment (86% match) for Senior Full Stack Engineer role.",
                metricBadge="86% Match",
                findingsCount=0,
                score=86,
                domain="Software Engineering",
                is_demo_data=True,
                created_at_iso="2026-10-13T16:20:00Z",
            ),
        ]

        for item in demo_items:
            self._records[item.id] = (item, None)

    def record_verification(
        self,
        result: VerificationResult,
    ) -> HistoryItemResponse:
        """
        Record a live verification run into the audit history.
        Always marked with is_demo_data=False.
        """
        with self._lock:
            history_id = f"HIST-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            doc_names = " & ".join(result.documentsReviewed) if result.documentsReviewed else "Submitted Documents"

            # Compute highest severity
            highest_sev = "low"
            if any(f.severity == InconsistencySeverity.high for f in result.findings):
                highest_sev = "high"
            elif any(f.severity == InconsistencySeverity.medium for f in result.findings):
                highest_sev = "medium"

            # Map status
            status_map = {
                VerificationStatus.inconsistencies_detected: "Inconsistencies Found",
                VerificationStatus.verified_clean: "Verified",
                VerificationStatus.manual_review_required: "Pending Review",
            }
            display_status = status_map.get(result.status, "Completed")

            # Metric badge
            if result.findings:
                metric_badge = f"{len(result.findings)} Inconsistenc{'ies' if len(result.findings) != 1 else 'y'}"
            elif result.missingFields:
                metric_badge = f"{len(result.missingFields)} Missing Clause{'s' if len(result.missingFields) != 1 else ''}"
            else:
                metric_badge = "Verified Clean"

            item = HistoryItemResponse(
                id=history_id,
                documentName=doc_names,
                analysisType="Employment Document Verification",
                date=datetime.now(timezone.utc).strftime("%b %d, %Y"),
                status=display_status,
                summary=result.summaryNote,
                metricBadge=metric_badge,
                findingsCount=len(result.findings) + len(result.missingFields),
                domain=result.domain,
                severity=highest_sev,
                is_demo_data=False,
                created_at_iso=datetime.now(timezone.utc).isoformat(),
            )

            self._records[history_id] = (item, result)
            logger.info("Recorded verification run '%s' with %d findings", history_id, len(result.findings))
            return item

    def record_resume_analysis(
        self,
        analysis,  # ResumeAnalysisResponse — imported lazily to avoid circular dep
    ) -> HistoryItemResponse:
        """
        Record a completed resume analysis run into audit history.
        Always marked with is_demo_data=False.
        """
        with self._lock:
            history_id = f"HIST-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            score = getattr(analysis, "overall_fit_score", 0)
            candidate_name = getattr(analysis, "candidate_name", "Candidate")
            file_name = getattr(analysis, "file_name", "resume")
            exp_level = getattr(analysis, "experience_level", "")

            score_label = (
                "Strong Match" if score >= 75
                else "Moderate Match" if score >= 50
                else "Partial Match"
            )

            item = HistoryItemResponse(
                id=history_id,
                documentName=file_name,
                analysisType="Resume & Career Fit",
                date=datetime.now(timezone.utc).strftime("%b %d, %Y"),
                status="Completed",
                summary=f"{candidate_name} ({exp_level}) — {score_label} ({score}% fit score).",
                metricBadge=f"{score}% Match",
                findingsCount=0,
                score=score,
                domain="Employment & HR",
                severity="low",
                is_demo_data=False,
                created_at_iso=datetime.now(timezone.utc).isoformat(),
            )

            self._records[history_id] = (item, None)
            logger.info(
                "Recorded resume analysis '%s' score=%d file='%s'",
                history_id, score, file_name,
            )
            return item

    def get_by_id(self, history_id: str) -> Optional[tuple[HistoryItemResponse, Optional[VerificationResult]]]:
        """Fetch history item and original result by ID."""
        with self._lock:
            return self._records.get(history_id)

    def filter_history(
        self,
        search: Optional[str] = None,
        analysis_type: Optional[str] = None,
        status: Optional[str] = None,
        domain: Optional[str] = None,
        severity: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        include_demo: bool = True,
    ) -> List[HistoryItemResponse]:
        """
        Query records matching all provided filters.
        """
        with self._lock:
            records = [item for item, _ in self._records.values()]

        # Filter by demo status
        if not include_demo:
            records = [r for r in records if not r.is_demo_data]

        # Filter by analysis type ('all', 'resume', 'verification')
        if analysis_type and analysis_type != "all":
            if analysis_type.lower() == "resume":
                records = [r for r in records if "Resume" in r.analysisType]
            elif analysis_type.lower() == "verification":
                records = [r for r in records if "Verification" in r.analysisType]

        # Filter by review status ('all', 'Inconsistencies Found', etc.)
        if status and status != "all":
            clean_status = status.strip().lower()
            records = [r for r in records if r.status.lower() == clean_status]

        # Filter by domain
        if domain and domain != "all":
            clean_domain = domain.strip().lower().replace("-", " ")
            records = [r for r in records if clean_domain in r.domain.lower().replace("-", " ")]

        # Filter by severity
        if severity and severity != "all":
            clean_sev = severity.strip().lower()
            records = [r for r in records if (r.severity or "").lower() == clean_sev]

        # Filter by date range (ISO or YYYY-MM-DD prefix)
        if from_date:
            from_iso = from_date.strip()
            records = [r for r in records if r.created_at_iso >= from_iso]
        if to_date:
            to_iso = to_date.strip() + "T23:59:59Z" if "T" not in to_date else to_date.strip()
            records = [r for r in records if r.created_at_iso <= to_iso]

        # Filter by search query
        if search and search.strip():
            q = search.strip().lower()
            records = [
                r for r in records
                if q in r.documentName.lower()
                or q in r.summary.lower()
                or q in r.domain.lower()
                or q in r.status.lower()
            ]

        # Sort newest first
        records.sort(key=lambda r: r.created_at_iso, reverse=True)
        return records

    def clear(self) -> None:
        """Clear store and re-seed demo data."""
        with self._lock:
            self._records.clear()
            self._seed_demo_records()


history_store = HistoryStore()
