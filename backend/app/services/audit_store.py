"""
VeriSync AI — Review Decisions & Append-Only Audit Trail Store

Manages human auditor determinations on inconsistency findings:
- Enforces authorized action validation.
- Preserves all historical decisions in an append-only log.
- Tracks reviewer ID, ISO 8601 UTC timestamp, and previous status state.
"""

from __future__ import annotations

import logging
import threading
import uuid
from typing import Dict, List, Optional

from app.schemas.audit import ReviewActionEnum, ReviewDecisionRecord

logger = logging.getLogger("verisync.audit_store")

ALLOWED_REVIEW_ACTIONS = {
    ReviewActionEnum.verified_inconsistency.value,
    ReviewActionEnum.acceptable_variation.value,
    ReviewActionEnum.flagged_for_legal_review.value,
}


class AuditStore:
    """Thread-safe append-only audit trail store for human review decisions."""

    def __init__(self):
        self._lock = threading.Lock()
        # finding_id -> ordered list of ReviewDecisionRecord
        self._trail: Dict[str, List[ReviewDecisionRecord]] = {}

    def validate_action(self, status: str) -> str:
        """Validate that the requested status is an authorized review action."""
        if not status or status.strip() not in ALLOWED_REVIEW_ACTIONS:
            allowed_fmt = ", ".join(f"'{a}'" for a in sorted(ALLOWED_REVIEW_ACTIONS))
            raise ValueError(
                f"Invalid review action '{status}'. Authorized actions: {allowed_fmt}."
            )
        return status.strip()

    def record_decision(
        self,
        finding_id: str,
        status: str,
        notes: str = "",
        reviewer_id: str = "usr-auditor-1",
    ) -> ReviewDecisionRecord:
        """
        Record a human review decision into the append-only audit log.
        Preserves all previous decisions rather than overwriting.
        """
        valid_status = self.validate_action(status)
        clean_reviewer = (reviewer_id or "usr-auditor-1").strip()

        with self._lock:
            existing = self._trail.setdefault(finding_id, [])
            previous_status = existing[-1].status if existing else "flagged"

            record = ReviewDecisionRecord(
                decision_id=f"dec-{uuid.uuid4().hex[:10]}",
                finding_id=finding_id,
                status=valid_status,
                notes=notes.strip() if notes else "",
                reviewer_id=clean_reviewer,
                previous_status=previous_status,
            )

            existing.append(record)
            logger.info(
                "Audit decision recorded for finding '%s': status='%s', reviewer='%s' (decision #%d)",
                finding_id,
                valid_status,
                clean_reviewer,
                len(existing),
            )
            return record

    def get_audit_trail(self, finding_id: str) -> List[ReviewDecisionRecord]:
        """Return the immutable chronologically ordered audit log for a finding."""
        with self._lock:
            return list(self._trail.get(finding_id, []))

    def get_latest_decision(self, finding_id: str) -> Optional[ReviewDecisionRecord]:
        """Return the most recent decision for a finding, or None if unreviewed."""
        with self._lock:
            trail = self._trail.get(finding_id, [])
            return trail[-1] if trail else None

    def get_all_decisions(self) -> Dict[str, List[ReviewDecisionRecord]]:
        """Return snapshot of all finding audit trails."""
        with self._lock:
            return {fid: list(records) for fid, records in self._trail.items()}

    def clear(self) -> None:
        """Clear store (primarily for unit tests)."""
        with self._lock:
            self._trail.clear()


audit_store = AuditStore()
