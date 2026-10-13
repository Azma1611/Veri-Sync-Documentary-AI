"""
VeriSync AI — Report Export Service (Markdown & JSON)

Generates audit-ready reports matching the exact schema expected by the
frontend ExportReportModal and compliance auditors:
- Complete evidence citations (document name, section, page, exact quote).
- Append-only human review determinations and timestamps.
- Mandatory legal disclaimers.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from app.schemas.audit import ReviewDecisionRecord
from app.schemas.verification import VerificationResult


def generate_json_report(
    result: VerificationResult,
    audit_decisions: Optional[Dict[str, List[ReviewDecisionRecord]]] = None,
) -> Dict[str, Any]:
    """
    Format a complete, serialized VerificationResult report dictionary with
    human review audit trails attached to each finding.
    """
    data = result.model_dump(by_alias=True)

    # Attach audit trail to findings if present
    if audit_decisions:
        for finding in data.get("findings", []):
            finding_id = finding.get("id")
            if finding_id and finding_id in audit_decisions:
                finding["auditTrail"] = [
                    d.model_dump() for d in audit_decisions[finding_id]
                ]
                finding["latestReviewStatus"] = audit_decisions[finding_id][-1].status

    return data


def generate_markdown_report(
    result: VerificationResult,
    audit_decisions: Optional[Dict[str, List[ReviewDecisionRecord]]] = None,
) -> str:
    """
    Generate an audit-grade Markdown report matching the format expected by
    ExportReportModal with complete verbatim citations and review logs.
    """
    doc_list = "\n".join(f"- {d}" for d in result.documentsReviewed) if result.documentsReviewed else "- [None listed]"

    findings_sections: List[str] = []
    for idx, f in enumerate(result.findings):
        # Check if audit decisions exist for this finding
        decision_lines = []
        if audit_decisions and f.id in audit_decisions and audit_decisions[f.id]:
            trail = audit_decisions[f.id]
            latest = trail[-1]
            decision_lines.append(f"- **Human Auditor Decision:** {latest.status}")
            decision_lines.append(f"- **Reviewer ID:** `{latest.reviewer_id}`")
            decision_lines.append(f"- **Decision Recorded:** {latest.recorded_at}")
            if latest.notes:
                decision_lines.append(f"- **Auditor Notes:** *\"{latest.notes}\"*")
            if len(trail) > 1:
                decision_lines.append(f"- **Audit Trail Log:** {len(trail)} total determination(s) recorded")
        else:
            decision_lines.append(f"- **Review Status:** {f.status.value}")

        dec_block = "\n".join(decision_lines)

        section = f"""### {idx + 1}. {f.title}
- **Category:** {f.category.value}
- **Severity:** {f.severity.value.upper()}
{dec_block}
- **Document A ({f.sourceA.documentName}, {f.sourceA.section}, Page {f.sourceA.page}):**
  > "{f.sourceA.extractedValue}"
- **Document B ({f.sourceB.documentName}, {f.sourceB.section}, Page {f.sourceB.page}):**
  > "{f.sourceB.extractedValue}"
- **Recommended Auditor Action:** {f.recommendedAction}
"""
        findings_sections.append(section.strip())

    findings_text = "\n\n".join(findings_sections) if findings_sections else "*No inconsistency findings detected.*"

    missing_sections: List[str] = []
    for m in result.missingFields:
        missing_sections.append(
            f"- **{m.fieldName}** ({m.severity.value.upper()}): Expected in {m.expectedIn}. Detail: {m.detail}"
        )
    missing_text = "\n".join(missing_sections) if missing_sections else "*All expected mandatory clauses verified present.*"

    md = f"""# VeriSync AI — Verification Audit Summary
**Domain:** {result.domain}
**Reviewed At:** {result.reviewedAt}
**Status:** Potential Inconsistencies Requiring Review
**Documents Inspected:**
{doc_list}

---

## Executive Summary
{result.summaryNote}

> **Disclaimer:** Findings represent potential discrepancies between supplied document clauses requiring human reviewer confirmation. This audit does NOT assert fraudulent intent or authenticate legal instruments.

---

## Findings Matrix ({len(result.findings)} Items Flagged)

{findings_text}

---

## Completeness & Missing Fields ({len(result.missingFields)} Items)
{missing_text}

---
*Report generated via VeriSync AI Multi-Domain Document Verification Platform*
"""
    return md
