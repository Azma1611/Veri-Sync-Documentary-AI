"""
VeriSync AI — Completeness Checker

Determines whether each required clause (per domain rules) is present in
each document that is expected to contain it.

Key principle: a clause missing from document type X is ONLY flagged if X
is listed in the rule's expected_in list. For example, an IP assignment
clause missing from an offer_letter is NOT a finding because IP-001 is
only expected in contracts.

Returns a list of MissingFieldFinding (which flows into VerificationResult).
"""

from __future__ import annotations

import logging
from typing import List

from app.schemas.ingestion import DocumentMetadata
from app.schemas.verification import MissingFieldFinding, MissingFieldSeverity
from app.services.clause_searcher import search_clause
from app.services.domain_rules import DomainRule, EMPLOYMENT_HR_RULES

logger = logging.getLogger("verisync.completeness")


def check_completeness(
    documents: List[DocumentMetadata],
    rules: List[DomainRule] = EMPLOYMENT_HR_RULES,
) -> List[MissingFieldFinding]:
    """
    For each rule × expected_in document type: verify the clause is present.

    Parameters
    ----------
    documents : All successfully extracted documents in the batch.
    rules     : Domain rules to evaluate (default: all Employment & HR rules).

    Returns
    -------
    List of MissingFieldFinding — one per (rule, document) combination where
    the clause is absent.
    """
    findings: List[MissingFieldFinding] = []
    finding_counter: int = 0

    for rule in rules:
        # Filter documents that are expected to contain this clause
        applicable_docs = [
            doc for doc in documents if doc.doc_type.value in rule.expected_in
        ]

        if not applicable_docs:
            # No applicable documents uploaded — skip (not a finding)
            continue

        for doc in applicable_docs:
            match = search_clause(doc, rule.clause_patterns)
            if match is None:
                finding_counter += 1
                finding_id = f"missing-{rule.rule_id}-{finding_counter}"

                try:
                    severity = MissingFieldSeverity(rule.severity_if_missing)
                except ValueError:
                    severity = MissingFieldSeverity.moderate

                findings.append(MissingFieldFinding(
                    id=finding_id,
                    rule_id=rule.rule_id,
                    fieldName=rule.field_name or rule.name,
                    expectedIn=doc.original_filename,
                    severity=severity,
                    detail=_build_detail(rule, doc),
                ))

                logger.info(
                    "Completeness: rule %s clause '%s' not found in '%s' (%s)",
                    rule.rule_id,
                    rule.name,
                    doc.original_filename,
                    doc.doc_type.value,
                )

    return findings


def _build_detail(rule: DomainRule, doc: DocumentMetadata) -> str:
    """Compose a non-accusatory detail message for a missing-field finding."""
    doc_type_label = _doc_type_label(doc.doc_type.value)
    return (
        f"The '{rule.name}' clause was not detected in '{doc.original_filename}' "
        f"({doc_type_label}). This clause is expected in Employment & HR "
        f"{doc_type_label} documents. "
        f"Suggested action: {rule.recommended_action}"
    )


def _doc_type_label(doc_type: str) -> str:
    labels = {
        "offer_letter": "Offer Letter",
        "contract": "Employment Contract",
        "job_description": "Job Description",
        "hr_policy": "HR Policy",
        "other": "Document",
    }
    return labels.get(doc_type, doc_type.replace("_", " ").title())
