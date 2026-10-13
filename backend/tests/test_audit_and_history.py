"""
VeriSync AI — Review Decisions, Audit Trail & History Test Suite

Tests covering:
1. Append-only audit trail and human reviewer determinations.
2. Valid vs invalid review action validation.
3. Decision history preservation (never silently overwriting older determinations).
4. Multi-parameter history search & filtering (date, domain, severity, review status).
5. Explicit labeling of demonstration records (is_demo_data=True).
6. Automatic persistence of live verification runs (is_demo_data=False).
7. Report exporter (JSON and Markdown with complete verbatim evidence citations).
8. End-to-end API endpoints for review decisions, audit logs, and export.
"""

from __future__ import annotations

import io
import json
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.audit import (
    ReportExportRequest,
    ReviewActionEnum,
    ReviewDecisionRequest,
)
from app.schemas.verification import (
    FindingStatus,
    FindingType,
    InconsistencyCategory,
    InconsistencyFinding,
    InconsistencySeverity,
    MissingFieldFinding,
    MissingFieldSeverity,
    SourceCitation,
    VerificationResult,
    VerificationStatus,
)
from app.services.audit_store import audit_store
from app.services.history_store import history_store
from app.services.report_exporter import generate_json_report, generate_markdown_report

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test Fixtures & Helpers
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def reset_stores():
    """Reset audit and history stores before each test."""
    audit_store.clear()
    history_store.clear()
    yield


def sample_verification_result() -> VerificationResult:
    return VerificationResult(
        domain="Employment & HR",
        totalDocuments=2,
        status=VerificationStatus.inconsistencies_detected,
        documentsReviewed=["Offer_Letter_2024.pdf", "Employment_Contract_v2.pdf"],
        summaryNote="Discrepancies identified between compensation terms and notice tenure.",
        reviewedAt="Oct 14, 2026",
        findings=[
            InconsistencyFinding(
                id="finding-comp-001",
                rule_id="COMP-001",
                finding_type=FindingType.value_mismatch,
                title="Monthly Base Compensation Discrepancy",
                severity=InconsistencySeverity.high,
                category=InconsistencyCategory.compensation,
                explanation="The offer letter specifies ₹30,000 / month, while the contract specifies ₹25,000 / month.",
                sourceA=SourceCitation(
                    document_id="doc-offer-1",
                    documentName="Offer_Letter_2024.pdf",
                    section="Clause 3.1: Compensation Structure",
                    page=2,
                    extractedValue="Gross Remuneration: ₹30,000 / month",
                ),
                sourceB=SourceCitation(
                    document_id="doc-contract-1",
                    documentName="Employment_Contract_v2.pdf",
                    section="Annexure A: Salary Breakdown",
                    page=5,
                    extractedValue="Basic & Allowances Total: ₹25,000 / month",
                ),
                recommendedAction="Request an addendum or confirmation letter from payroll before formal onboarding closure.",
                status=FindingStatus.flagged,
            )
        ],
        missingFields=[
            MissingFieldFinding(
                id="missing-ip-001",
                rule_id="IP-001",
                fieldName="Annexure B: Intellectual Property & Inventions Assignment",
                expectedIn="Employment_Contract_v2.pdf",
                severity=MissingFieldSeverity.critical,
                detail="Section 12 references Annexure B for proprietary invention assignments, but the attachment is missing.",
            )
        ],
    )


# ---------------------------------------------------------------------------
# Section 1: Review Action Validation & Append-Only Audit Trail
# ---------------------------------------------------------------------------

class TestReviewDecisionsAndAuditTrail:

    def test_valid_review_actions_accepted(self):
        actions = [
            ReviewActionEnum.verified_inconsistency.value,
            ReviewActionEnum.acceptable_variation.value,
            ReviewActionEnum.flagged_for_legal_review.value,
        ]
        for act in actions:
            rec = audit_store.record_decision(
                finding_id="f-test-1",
                status=act,
                notes="Auditor reviewed clause with HR.",
                reviewer_id="auditor-jane",
            )
            assert rec.status == act
            assert rec.reviewer_id == "auditor-jane"
            assert rec.recorded_at is not None

    def test_invalid_review_action_rejected(self):
        with pytest.raises(ValueError) as exc:
            audit_store.record_decision(
                finding_id="f-test-1",
                status="Invalid Action Not Allowed",
                reviewer_id="auditor-jane",
            )
        assert "Invalid review action" in str(exc.value)

    def test_append_only_preserves_previous_decisions(self):
        finding_id = "finding-comp-001"

        # Action 1: Flagged for Legal
        rec1 = audit_store.record_decision(
            finding_id=finding_id,
            status="Flagged for Legal Review",
            notes="Requires legal assessment on clause 3.",
            reviewer_id="auditor-1",
        )
        assert rec1.previous_status == "flagged"

        # Action 2: Confirm Inconsistency
        rec2 = audit_store.record_decision(
            finding_id=finding_id,
            status="Verified Inconsistency",
            notes="Confirmed discrepancy with HR director.",
            reviewer_id="auditor-2",
        )
        assert rec2.previous_status == "Flagged for Legal Review"

        # Action 3: Acceptable Variation (override with justification)
        rec3 = audit_store.record_decision(
            finding_id=finding_id,
            status="Acceptable Variation",
            notes="Amendment addendum signed and filed.",
            reviewer_id="senior-counsel-1",
        )
        assert rec3.previous_status == "Verified Inconsistency"

        # Audit trail must contain all 3 decisions in chronological order
        trail = audit_store.get_audit_trail(finding_id)
        assert len(trail) == 3
        assert trail[0].status == "Flagged for Legal Review"
        assert trail[1].status == "Verified Inconsistency"
        assert trail[2].status == "Acceptable Variation"

        # Latest status reflects the most recent decision
        latest = audit_store.get_latest_decision(finding_id)
        assert latest is not None
        assert latest.status == "Acceptable Variation"
        assert latest.reviewer_id == "senior-counsel-1"

    def test_review_endpoint_persists_decision(self):
        payload = {
            "status": "Verified Inconsistency",
            "notes": "Salary mismatch confirmed against offer letter.",
            "reviewer_id": "auditor-alex",
        }
        resp = client.post("/api/v1/documents/findings/finding-comp-001/review", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["findingId"] == "finding-comp-001"
        assert data["status"] == "Verified Inconsistency"
        assert data["reviewerId"] == "auditor-alex"

        # Query audit trail endpoint
        trail_resp = client.get("/api/v1/documents/findings/finding-comp-001/audit-trail")
        assert trail_resp.status_code == 200
        trail_data = trail_resp.json()
        assert trail_data["totalDecisions"] == 1
        assert trail_data["currentStatus"] == "Verified Inconsistency"

    def test_review_endpoint_rejects_invalid_action(self):
        payload = {
            "status": "Fraud Confirmed",  # Unauthorized action
            "notes": "Invalid note",
        }
        resp = client.post("/api/v1/documents/findings/finding-comp-001/review", json=payload)
        assert resp.status_code == 422
        assert "Invalid review action" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# Section 2: Verification History & Multi-Parameter Filtering
# ---------------------------------------------------------------------------

class TestVerificationHistoryAndFiltering:

    def test_demo_records_clearly_labeled(self):
        all_records = history_store.filter_history()
        assert len(all_records) >= 4
        # Demo records must have is_demo_data=True
        demo_items = [r for r in all_records if r.is_demo_data]
        assert len(demo_items) == 4
        for d in demo_items:
            assert "[Demo Record]" in d.summary
            assert d.id.startswith("DEMO-")

    def test_live_verification_run_saved_as_non_demo(self):
        res = sample_verification_result()
        item = history_store.record_verification(res)
        assert item.is_demo_data is False
        assert not item.id.startswith("DEMO-")
        assert item.id.startswith("HIST-")

        # Exclude demo records
        live_only = history_store.filter_history(include_demo=False)
        assert len(live_only) == 1
        assert live_only[0].id == item.id

    def test_filter_by_workflow_type(self):
        res = sample_verification_result()
        history_store.record_verification(res)

        verification_runs = history_store.filter_history(analysis_type="verification")
        for r in verification_runs:
            assert "Verification" in r.analysisType

        resume_runs = history_store.filter_history(analysis_type="resume")
        for r in resume_runs:
            assert "Resume" in r.analysisType

    def test_filter_by_status(self):
        inconsistencies_items = history_store.filter_history(status="Inconsistencies Found")
        for item in inconsistencies_items:
            assert item.status == "Inconsistencies Found"

        verified_items = history_store.filter_history(status="Verified")
        for item in verified_items:
            assert item.status == "Verified"

    def test_filter_by_severity(self):
        high_sev = history_store.filter_history(severity="high")
        for item in high_sev:
            assert item.severity == "high"

        low_sev = history_store.filter_history(severity="low")
        for item in low_sev:
            assert item.severity == "low"

    def test_filter_by_date_range(self):
        # 2026-10-12 was in demo items
        items = history_store.filter_history(from_date="2026-10-12", to_date="2026-10-13")
        assert len(items) > 0
        for item in items:
            assert "2026-10-12" <= item.created_at_iso[:10] <= "2026-10-13"

    def test_filter_by_search_query(self):
        items = history_store.filter_history(search="Alex_Morgan")
        assert len(items) == 1
        assert "Alex_Morgan" in items[0].documentName

    def test_history_api_endpoint(self):
        resp = client.get("/api/v1/history?status=Inconsistencies+Found")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert data["backendConnected"] is True
        for item in data["data"]:
            assert item["status"] == "Inconsistencies Found"


# ---------------------------------------------------------------------------
# Section 3: Report Exporter (Markdown & JSON)
# ---------------------------------------------------------------------------

class TestReportExporter:

    def test_json_report_matches_frontend_schema(self):
        res = sample_verification_result()
        # Add an audit decision
        audit_store.record_decision(
            finding_id="finding-comp-001",
            status="Verified Inconsistency",
            notes="Payroll discrepancy confirmed.",
            reviewer_id="auditor-101",
        )
        decisions = audit_store.get_all_decisions()

        json_dict = generate_json_report(res, decisions)
        assert json_dict["domain"] == "Employment & HR"
        assert json_dict["totalDocuments"] == 2
        assert len(json_dict["findings"]) == 1
        finding = json_dict["findings"][0]
        assert finding["title"] == "Monthly Base Compensation Discrepancy"
        # Verify evidence citations preserved
        assert finding["sourceA"]["documentName"] == "Offer_Letter_2024.pdf"
        assert finding["sourceA"]["page"] == 2
        assert "₹30,000" in finding["sourceA"]["extractedValue"]
        assert finding["sourceB"]["documentName"] == "Employment_Contract_v2.pdf"
        assert finding["sourceB"]["page"] == 5
        assert "₹25,000" in finding["sourceB"]["extractedValue"]
        # Verify audit trail attached
        assert "auditTrail" in finding
        assert finding["latestReviewStatus"] == "Verified Inconsistency"

    def test_markdown_report_contains_evidence_and_audit_trail(self):
        res = sample_verification_result()
        audit_store.record_decision(
            finding_id="finding-comp-001",
            status="Verified Inconsistency",
            notes="Confirmed discrepancy with HR director.",
            reviewer_id="auditor-sarah",
        )
        decisions = audit_store.get_all_decisions()

        md = generate_markdown_report(res, decisions)
        # Check header
        assert "# VeriSync AI — Verification Audit Summary" in md
        assert "**Domain:** Employment & HR" in md
        assert "**Reviewed At:** Oct 14, 2026" in md
        # Check documents inspected
        assert "- Offer_Letter_2024.pdf" in md
        assert "- Employment_Contract_v2.pdf" in md
        # Check executive summary & disclaimer
        assert "Discrepancies identified between compensation terms" in md
        assert "Findings represent potential discrepancies" in md
        # Check findings matrix
        assert "### 1. Monthly Base Compensation Discrepancy" in md
        assert "**Human Auditor Decision:** Verified Inconsistency" in md
        assert "`auditor-sarah`" in md
        assert "Confirmed discrepancy with HR director." in md
        # Check verbatim evidence quotes & page numbers
        assert "Page 2" in md
        assert 'Gross Remuneration: ₹30,000 / month' in md
        assert "Page 5" in md
        assert 'Basic & Allowances Total: ₹25,000 / month' in md
        # Check missing fields
        assert "Annexure B: Intellectual Property & Inventions Assignment" in md

    def test_export_api_endpoint_markdown_and_json(self):
        res = sample_verification_result()

        # Export as Markdown
        req_md = ReportExportRequest(result=res, format="markdown")
        resp_md = client.post("/api/v1/reports/export", json=req_md.model_dump())
        assert resp_md.status_code == 200
        data_md = resp_md.json()
        assert data_md["format"] == "markdown"
        assert data_md["filename"].endswith(".md")
        assert "# VeriSync AI" in data_md["content"]

        # Export as JSON
        req_json = ReportExportRequest(result=res, format="json")
        resp_json = client.post("/api/v1/reports/export", json=req_json.model_dump())
        assert resp_json.status_code == 200
        data_json = resp_json.json()
        assert data_json["format"] == "json"
        assert data_json["filename"].endswith(".json")
        parsed = json.loads(data_json["content"])
        assert parsed["domain"] == "Employment & HR"
