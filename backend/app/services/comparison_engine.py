"""
VeriSync AI — Cross-Document Comparison Engine

Compares extracted clause values across pairs of documents using
deterministic, rule-specific logic.  No LLM involved.

Algorithm
---------
For each domain rule with comparison_type != 'presence':
  1. Find the best-matching clause block in each document that is expected
     to contain the clause (offer_letter × contract being the primary pair).
  2. Normalise the extracted values (currency → float, duration → days).
  3. Compare using the rule's comparison_type and tolerance.
  4. If outcome is 'mismatch' → produce InconsistencyFinding.
  5. If outcome is 'insufficient_evidence' → produce InconsistencyFinding
     of type 'insufficient_evidence' for human review.
  6. If 'match' → skip.

Document-pair selection
-----------------------
When N > 2 documents are uploaded, comparisons are made exhaustively
across all (i, j) pairs of applicable documents. This prevents missed
discrepancies when three or more related documents disagree.
"""

from __future__ import annotations

import hashlib
import itertools
import logging
from typing import List, Optional, Tuple

from app.schemas.ingestion import DocumentMetadata
from app.schemas.verification import (
    FindingStatus,
    FindingType,
    InconsistencyCategory,
    InconsistencyFinding,
    InconsistencySeverity,
    SourceCitation,
)
from app.services.clause_searcher import (
    ClauseMatch,
    make_paragraph_ref,
    make_section_label,
    search_clause,
)
from app.services.domain_rules import DomainRule, EMPLOYMENT_HR_RULES
from app.services.field_normalizer import (
    compare_duration,
    compare_numeric,
    compare_presence,
    normalize_currency,
    normalize_duration_to_days,
    format_currency_label,
)

logger = logging.getLogger("verisync.comparison")


def compare_documents(
    documents: List[DocumentMetadata],
    rules: List[DomainRule] = EMPLOYMENT_HR_RULES,
) -> List[InconsistencyFinding]:
    """
    Run all rules across all applicable document pairs.

    Returns
    -------
    List of InconsistencyFinding — one per (rule, doc_pair) combination
    where a mismatch or uncertainty is detected.
    """
    findings: List[InconsistencyFinding] = []

    for rule in rules:
        # Only compare documents where the rule is applicable
        applicable = [
            doc for doc in documents
            if doc.doc_type.value in rule.expected_in and doc.evidence_blocks
        ]

        if len(applicable) < 2:
            # Need at least two applicable documents to compare
            continue

        # Exhaustive pairwise comparison
        for doc_a, doc_b in itertools.combinations(applicable, 2):
            finding = _compare_pair(rule, doc_a, doc_b)
            if finding is not None:
                # Deduplicate: skip if this exact rule × filename pair already found
                if not _is_duplicate(finding, findings):
                    findings.append(finding)

    return findings


# ---------------------------------------------------------------------------
# Internal: single rule × document pair comparison
# ---------------------------------------------------------------------------

def _compare_pair(
    rule: DomainRule,
    doc_a: DocumentMetadata,
    doc_b: DocumentMetadata,
) -> Optional[InconsistencyFinding]:
    """
    Compare a single rule across one document pair.
    Returns an InconsistencyFinding or None if values match.
    """
    match_a = search_clause(doc_a, rule.clause_patterns)
    match_b = search_clause(doc_b, rule.clause_patterns)

    # Both documents missing the clause → completeness checker handles this
    if match_a is None and match_b is None:
        return None

    # One document has the clause, the other doesn't
    if match_a is None or match_b is None:
        # Only raise as a comparison finding if the missing-doc type is expected
        present_match = match_a or match_b
        present_doc = doc_a if match_a else doc_b
        absent_doc = doc_b if match_a else doc_a
        if absent_doc.doc_type.value not in rule.expected_in:
            return None
        return _build_asymmetric_finding(rule, present_doc, present_match, absent_doc)

    # Both documents have the clause — compare the values
    outcome = _compare_by_type(rule, match_a, match_b)

    if outcome == "match":
        return None

    finding_type = (
        FindingType.insufficient_evidence
        if outcome == "insufficient_evidence"
        else FindingType.value_mismatch
    )

    return _build_finding(rule, doc_a, match_a, doc_b, match_b, finding_type)


def _compare_by_type(
    rule: DomainRule,
    match_a: ClauseMatch,
    match_b: ClauseMatch,
) -> str:
    """Dispatch to the correct comparison function based on rule.comparison_type."""
    ct = rule.comparison_type

    if ct == "numeric":
        val_a = normalize_currency(match_a.matched_text)
        if val_a is None:
            val_a = normalize_currency(match_a.context)
        val_b = normalize_currency(match_b.matched_text)
        if val_b is None:
            val_b = normalize_currency(match_b.context)
        return compare_numeric(val_a, val_b, rule.tolerance)

    if ct == "duration":
        days_a = normalize_duration_to_days(match_a.matched_text)
        if days_a is None:
            days_a = normalize_duration_to_days(match_a.context)
        days_b = normalize_duration_to_days(match_b.matched_text)
        if days_b is None:
            days_b = normalize_duration_to_days(match_b.context)
        if days_a is None or days_b is None:
            return "insufficient_evidence"
        diff = abs(days_a - days_b)
        allowed = rule.tolerance * max(days_a, days_b)
        if diff <= allowed:
            return "match"
        return "mismatch"

    if ct == "presence":
        return compare_presence(match_a.context, match_b.context)

    # Unknown type → flag for review
    return "insufficient_evidence"


# ---------------------------------------------------------------------------
# Finding builders
# ---------------------------------------------------------------------------

def _build_finding(
    rule: DomainRule,
    doc_a: DocumentMetadata,
    match_a: ClauseMatch,
    doc_b: DocumentMetadata,
    match_b: ClauseMatch,
    finding_type: FindingType,
) -> InconsistencyFinding:
    finding_id = _stable_id(rule.rule_id, doc_a.document_id, doc_b.document_id)

    try:
        severity = InconsistencySeverity(rule.severity_if_mismatch)
    except ValueError:
        severity = InconsistencySeverity.medium

    try:
        category = InconsistencyCategory(rule.category)
    except ValueError:
        category = InconsistencyCategory.general

    explanation = _build_explanation(rule, match_a, match_b, finding_type)

    return InconsistencyFinding(
        id=finding_id,
        rule_id=rule.rule_id,
        finding_type=finding_type,
        title=_build_title(rule, finding_type),
        severity=severity,
        category=category,
        explanation=explanation,
        sourceA=_build_citation(doc_a, match_a, rule.name),
        sourceB=_build_citation(doc_b, match_b, rule.name),
        recommendedAction=rule.recommended_action,
        status=FindingStatus.flagged,
    )


def _build_asymmetric_finding(
    rule: DomainRule,
    present_doc: DocumentMetadata,
    present_match: ClauseMatch,
    absent_doc: DocumentMetadata,
) -> InconsistencyFinding:
    """Build a finding where one document has the clause and the other doesn't."""
    finding_id = _stable_id(rule.rule_id, present_doc.document_id, absent_doc.document_id)

    try:
        severity = InconsistencySeverity(rule.severity_if_mismatch)
    except ValueError:
        severity = InconsistencySeverity.medium

    try:
        category = InconsistencyCategory(rule.category)
    except ValueError:
        category = InconsistencyCategory.general

    absent_section = f"Clause not found in {absent_doc.original_filename}"

    return InconsistencyFinding(
        id=finding_id,
        rule_id=rule.rule_id,
        finding_type=FindingType.missing_clause,
        title=f"{rule.name} — Present in One Document Only",
        severity=severity,
        category=category,
        explanation=(
            f"The '{rule.name}' clause was detected in "
            f"'{present_doc.original_filename}' but could not be located in "
            f"'{absent_doc.original_filename}'. This asymmetry may indicate "
            "a drafting omission or a different document version. "
            "Human review is required before a determination can be made."
        ),
        sourceA=_build_citation(present_doc, present_match, rule.name),
        sourceB=SourceCitation(
            document_id=absent_doc.document_id,
            documentName=absent_doc.original_filename,
            section=absent_section,
            page=1,
            extractedValue="[Clause not detected in this document]",
        ),
        recommendedAction=rule.recommended_action,
        status=FindingStatus.flagged,
    )


def _build_citation(
    doc: DocumentMetadata,
    match: ClauseMatch,
    rule_name: str,
) -> SourceCitation:
    return SourceCitation(
        document_id=doc.document_id,
        documentName=doc.original_filename,
        section=make_section_label(match, rule_name),
        page=match.page if match.page is not None else 1,
        paragraph_ref=make_paragraph_ref(match),
        extractedValue=match.context[:300],
    )


def _build_title(rule: DomainRule, finding_type: FindingType) -> str:
    suffix = {
        FindingType.value_mismatch: "Discrepancy",
        FindingType.insufficient_evidence: "— Value Unclear",
        FindingType.missing_clause: "— Absent from One Document",
        FindingType.cross_reference: "— Cross-Reference Issue",
    }.get(finding_type, "Finding")
    return f"{rule.name} {suffix}"


def _build_explanation(
    rule: DomainRule,
    match_a: ClauseMatch,
    match_b: ClauseMatch,
    finding_type: FindingType,
) -> str:
    if finding_type == FindingType.insufficient_evidence:
        return (
            f"The '{rule.name}' clause was found in both documents, but the "
            "extracted values could not be parsed into comparable figures. "
            "The clause text may use non-standard phrasing or be embedded in "
            "a table. Human review of the original documents is required."
        )

    # Value mismatch — try to produce a specific explanation
    ct = rule.comparison_type
    if ct == "numeric":
        val_a = normalize_currency(match_a.matched_text) or normalize_currency(match_a.context)
        val_b = normalize_currency(match_b.matched_text) or normalize_currency(match_b.context)
        if val_a and val_b:
            return (
                f"Document A specifies a {rule.name.lower()} of "
                f"₹{val_a:,.0f}, while Document B specifies ₹{val_b:,.0f}. "
                "This is a direct numeric discrepancy that requires "
                "reconciliation before any formal employment agreement is signed."
            )

    if ct == "duration":
        days_a = normalize_duration_to_days(match_a.matched_text) or normalize_duration_to_days(match_a.context)
        days_b = normalize_duration_to_days(match_b.matched_text) or normalize_duration_to_days(match_b.context)
        if days_a and days_b:
            return (
                f"Document A specifies a {rule.name.lower()} of {days_a} days "
                f"({days_a // 30} month{'s' if days_a // 30 != 1 else ''}), "
                f"while Document B specifies {days_b} days "
                f"({days_b // 30} month{'s' if days_b // 30 != 1 else ''}). "
                "This duration mismatch may affect the enforceability of the clause."
            )

    return (
        f"A discrepancy was detected in the '{rule.name}' clause between the two "
        "documents. The extracted excerpts show differing values. "
        "Human review is required before a determination can be made."
    )


def _stable_id(rule_id: str, doc_id_a: str, doc_id_b: str) -> str:
    """
    Produce a stable, deterministic finding ID from the rule and document pair.
    Sorting the IDs ensures (A, B) and (B, A) produce the same ID.
    """
    pair = "-".join(sorted([doc_id_a, doc_id_b]))
    digest = hashlib.sha1(f"{rule_id}-{pair}".encode()).hexdigest()[:8]
    return f"finding-{rule_id.lower()}-{digest}"


def _is_duplicate(
    candidate: InconsistencyFinding,
    existing: List[InconsistencyFinding],
) -> bool:
    return any(f.id == candidate.id for f in existing)
