"""
VeriSync AI — Employment & HR Domain Rules

Configurable registry of verification rules for the Employment & HR domain.

Each rule defines:
  - rule_id        : Stable, unique identifier (e.g. "COMP-001").
  - name           : Human-readable label.
  - category       : Maps to InconsistencyCategory enum.
  - clause_patterns: Regex patterns used to search document text for the clause.
  - expected_in    : Which EmploymentDocType values are expected to contain
                     this clause. A clause missing from a doc type that is NOT
                     in expected_in is NOT a finding.
  - severity_if_mismatch : Severity when values differ between documents.
  - severity_if_missing  : Severity when clause is absent from an expected doc.
  - comparison_type: How to compare extracted values:
      'numeric'  → normalize to number, compare with tolerance
      'duration' → normalize to days, compare
      'text'     → case-insensitive substring overlap check
      'presence' → only check that clause exists, no value comparison
  - tolerance      : Allowed numeric tolerance (0.0 = exact match required).

Rules are pure data. No LLM, no network call.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class DomainRule:
    rule_id: str
    name: str
    category: str                 # Maps to InconsistencyCategory value
    clause_patterns: List[str]    # Regex patterns (case-insensitive OR-joined)
    expected_in: List[str]        # EmploymentDocType values
    severity_if_mismatch: str     # InconsistencySeverity value
    severity_if_missing: str      # MissingFieldSeverity value
    comparison_type: str          # 'numeric' | 'duration' | 'text' | 'presence'
    tolerance: float = 0.0        # Fractional tolerance for numeric comparison
    field_name: str = ""          # Human-readable field label for missing-field reports
    recommended_action: str = ""  # Default action suggestion


# ---------------------------------------------------------------------------
# Employment & HR Rule Definitions
# ---------------------------------------------------------------------------
# Rule IDs follow the pattern: CATEGORY_PREFIX-NNN
#
# Categories:
#   COMP  = Compensation
#   PROB  = Probation
#   NTCE  = Notice Period
#   IP    = Intellectual Property / Annexures
#   RPT   = Reporting Structure
# ---------------------------------------------------------------------------

EMPLOYMENT_HR_RULES: List[DomainRule] = [

    # -----------------------------------------------------------------------
    # COMP-001 : Base Compensation
    # Required in offer letters and contracts.
    # A salary difference > 0% is flagged as a HIGH-severity mismatch.
    # -----------------------------------------------------------------------
    DomainRule(
        rule_id="COMP-001",
        name="Base Compensation",
        category="compensation",
        clause_patterns=[
            # salary/compensation/gross keyword + optional currency + number (adjacent on same line)
            r"(?:gross\s+)?(?:salary|compensation|remuneration|ctc|cost\s+to\s+company)"
            r"[\s:]+(?:rs\.?|inr|usd|eur|gbp|[₹$€£])?\s*[\d,]+(?:\.\d+)?",
            # number after compensation/gross keyword on same line (handles "salary is 30000", "Monthly Gross: 25,000")
            r"(?:salary|compensation|remuneration|ctc|gross)[^\n]*[\d,]{4,}",
            # monthly/annual salary/gross N
            r"(?:monthly|annual)\s+(?:salary|compensation|gross)[\s:]*[\d,]+",
            # Rs./INR/currency number per period
            r"(?:rs\.?|inr|usd|[₹$€£])\s*[\d,]+(?:\.\d+)?\s*(?:per|/)\s*(?:month|annum|year)",
        ],
        expected_in=["offer_letter", "contract"],
        severity_if_mismatch="high",
        severity_if_missing="critical",
        comparison_type="numeric",
        tolerance=0.0,   # zero tolerance — any difference is flagged
        field_name="Base Compensation & Pay Frequency",
        recommended_action=(
            "Request a written addendum or clarification letter from the payroll "
            "department confirming the correct gross compensation figure before "
            "completing onboarding."
        ),
    ),

    # -----------------------------------------------------------------------
    # PROB-001 : Probation Tenure
    # Found in offer letters and contracts.  A duration mismatch is MEDIUM.
    # -----------------------------------------------------------------------
    DomainRule(
        rule_id="PROB-001",
        name="Probation Tenure",
        category="probation_period",
        clause_patterns=[
            r"probation(?:ary)?\s+(?:period|tenure|duration)[^\n]*\d+\s*(?:month|week|day|year)s?",
            r"probation[\s:]+\d+\s*(?:month|week|day|year)s?",
            r"\d+[- ]month\s+probation",
            r"probation[^\n]*\d+\s*(?:month|week|day)s?",
        ],
        expected_in=["offer_letter", "contract"],
        severity_if_mismatch="medium",
        severity_if_missing="moderate",
        comparison_type="duration",
        tolerance=0.0,
        field_name="Probation Duration & Review Criteria",
        recommended_action=(
            "Escalate to HR management to align the probation period across both "
            "documents. The shorter period may disadvantage the employer; the longer "
            "may be unenforceable if not disclosed in the offer letter."
        ),
    ),

    # -----------------------------------------------------------------------
    # NTCE-001 : Notice Period
    # Present in offer letters, contracts, and sometimes HR policies.
    # A duration mismatch is HIGH (separation terms are legally binding).
    # -----------------------------------------------------------------------
    DomainRule(
        rule_id="NTCE-001",
        name="Notice Period",
        category="notice_period",
        clause_patterns=[
            r"notice\s+period[^\n]*\d+\s*(?:month|week|day|year)s?",
            r"notice[\s:]+\d+\s*(?:month|week|day|year)s?",
            r"\d+[- ](?:month|week|day)s?\s+notice",
            r"termination\s+notice[^\n]*\d+\s*(?:month|week|day)s?",
            r"notice[^\n]*\d+\s*(?:day|week|month)s?",
        ],
        expected_in=["offer_letter", "contract", "hr_policy"],
        severity_if_mismatch="high",
        severity_if_missing="critical",
        comparison_type="duration",
        tolerance=0.0,
        field_name="Separation & Notice Period Schedule",
        recommended_action=(
            "Obtain a written clarification from the legal or HR team specifying "
            "which document governs the notice obligation. The more onerous "
            "requirement will typically be enforceable."
        ),
    ),

    # -----------------------------------------------------------------------
    # IP-001 : IP Assignment / Inventions Annexure
    # Contracts and offer letters referencing Annexure B / IP clauses must
    # include the annexure. Missing annexure = CRITICAL missing-field finding.
    # -----------------------------------------------------------------------
    DomainRule(
        rule_id="IP-001",
        name="Intellectual Property & Inventions Assignment",
        category="ip_assignment",
        clause_patterns=[
            r"(?:annexure|annex|schedule|exhibit|appendix)\s*[Bb]",
            r"intellectual\s+property\s+(?:assignment|agreement|clause|policy)",
            r"invention(?:s)?\s+(?:assignment|disclosure|agreement)",
            r"proprietary\s+(?:information|invention|rights)\s+agreement",
            r"ip\s+assignment",
        ],
        expected_in=["contract"],
        severity_if_mismatch="high",
        severity_if_missing="critical",
        comparison_type="presence",
        tolerance=0.0,
        field_name="Annexure B: Intellectual Property & Inventions Assignment",
        recommended_action=(
            "Request the complete Annexure B from the employer's legal team. "
            "Do not sign the contract without reviewing and understanding the "
            "full IP assignment scope."
        ),
    ),

    # -----------------------------------------------------------------------
    # RPT-001 : Reporting Manager / Supervisor Designation
    # Offer letters often name a reporting manager; contracts may omit it.
    # Missing from offer letter is MODERATE; mismatch across docs is LOW.
    # -----------------------------------------------------------------------
    DomainRule(
        rule_id="RPT-001",
        name="Reporting Manager Designation",
        category="reporting_structure",
        clause_patterns=[
            r"report(?:ing)?\s+(?:to|manager|director|head|officer|supervisor)",
            r"(?:direct|indirect)\s+report(?:ing)?",
            r"line\s+manager",
            r"designated\s+supervisor",
            r"you\s+will\s+report\s+(?:to|directly)",
        ],
        expected_in=["offer_letter"],
        severity_if_mismatch="low",
        severity_if_missing="moderate",
        comparison_type="presence",
        tolerance=0.0,
        field_name="Reporting Manager Designation",
        recommended_action=(
            "Request the employer to specify the reporting line in writing. "
            "This is important for establishing organisational accountability "
            "and should be confirmed before the start date."
        ),
    ),
]

# ---------------------------------------------------------------------------
# Quick lookup by rule_id
# ---------------------------------------------------------------------------

RULE_BY_ID: dict[str, DomainRule] = {r.rule_id: r for r in EMPLOYMENT_HR_RULES}


def get_rule(rule_id: str) -> DomainRule:
    """Return the rule for a given rule_id, raising KeyError if not found."""
    if rule_id not in RULE_BY_ID:
        raise KeyError(f"No domain rule found for rule_id '{rule_id}'.")
    return RULE_BY_ID[rule_id]
