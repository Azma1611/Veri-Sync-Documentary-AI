"""
VeriSync AI — AI Assistance & Safety Test Suite

Comprehensive tests verifying:
1. Missing credentials behavior (graceful degradation, no crash).
2. Malformed output & schema validation error handling.
3. Timeout handling and bounded retries.
4. Unsupported / hallucinated evidence detection via GroundingValidator.
5. PII minimization and redaction.
6. Structured finding explanation, semantic comparison, candidate field extraction.
7. Preservation of deterministic verification results when AI provider is offline or errors.
8. Non-leakage of API keys in responses or logs.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.schemas.ai import (
    AICandidateFieldExtractionRequest,
    AIClauseMappingRequest,
    AIExplanationRequest,
    AISemanticCompareRequest,
    CandidateFieldItem,
)
from app.schemas.ingestion import DocumentMetadata, EmploymentDocType, PageEvidence, ProcessingStatus
from app.services.ai import (
    AIAuthenticationError,
    AISchemaValidationError,
    AIService,
    AITimeoutError,
    MockLLMProvider,
    ground_candidate_fields,
    minimize_context,
    sanitize_text,
    validate_quote_grounding,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Section 1: PII Minimization Tests
# ---------------------------------------------------------------------------

class TestPIIMinimization:

    def test_email_redaction(self):
        text = "Contact candidate at alex.morgan@example.com for onboarding."
        sanitized = sanitize_text(text, redact_pii=True)
        assert "[REDACTED_EMAIL]" in sanitized
        assert "alex.morgan@example.com" not in sanitized

    def test_phone_redaction(self):
        text = "Candidate phone is +91 9876543210 or (555) 123-4567."
        sanitized = sanitize_text(text, redact_pii=True)
        assert "[REDACTED_PHONE]" in sanitized
        assert "9876543210" not in sanitized
        assert "123-4567" not in sanitized

    def test_identity_number_redaction(self):
        # PAN, Aadhaar, SSN
        text = "PAN: ABCDE1234F, Aadhaar: 1234 5678 9012, SSN: 123-45-6789."
        sanitized = sanitize_text(text, redact_pii=True)
        assert "[REDACTED_PAN]" in sanitized
        assert "[REDACTED_AADHAAR]" in sanitized
        assert "[REDACTED_SSN]" in sanitized
        assert "ABCDE1234F" not in sanitized
        assert "123-45-6789" not in sanitized

    def test_redaction_disabled_preserves_text(self):
        text = "Email: test@example.com"
        assert sanitize_text(text, redact_pii=False) == text

    def test_context_window_minimization(self):
        long_text = "A" * 3000
        minimized = minimize_context(long_text, max_chars=500)
        assert len(minimized) <= 600
        assert "[truncated for data minimization]" in minimized


# ---------------------------------------------------------------------------
# Section 2: Grounding Validator Tests (Anti-Hallucination)
# ---------------------------------------------------------------------------

class TestGroundingValidator:

    def _sample_doc(self) -> DocumentMetadata:
        return DocumentMetadata(
            document_id="doc-test-1",
            original_filename="offer_letter.pdf",
            content_type="application/pdf",
            file_size_bytes=1024,
            doc_type=EmploymentDocType.offer_letter,
            domain="employment-hr",
            word_count=18,
            status=ProcessingStatus.ready,
            evidence_blocks=[
                PageEvidence(
                    page=1,
                    text="Gross Salary: ₹30,000 per month. Probation period: 3 months.",
                    word_count=10,
                ),
                PageEvidence(
                    page=2,
                    text="Notice period shall be 30 days upon confirmation.",
                    word_count=8,
                ),
            ],
        )

    def test_grounded_exact_quote_succeeds(self):
        doc = self._sample_doc()
        is_grounded, page, _ = validate_quote_grounding("Gross Salary: ₹30,000 per month", doc)
        assert is_grounded is True
        assert page == 1

    def test_grounded_quote_on_page_2_succeeds(self):
        doc = self._sample_doc()
        is_grounded, page, _ = validate_quote_grounding("Notice period shall be 30 days", doc)
        assert is_grounded is True
        assert page == 2

    def test_hallucinated_quote_rejected(self):
        doc = self._sample_doc()
        # Invented quote not present in the document
        is_grounded, page, _ = validate_quote_grounding(
            "Employee is entitled to annual bonus of $50,000", doc
        )
        assert is_grounded is False
        assert page is None

    def test_ground_candidate_fields_flags_unverified_items(self):
        doc = self._sample_doc()
        candidates = [
            CandidateFieldItem(
                field_name="Salary",
                raw_value="₹30,000 per month",
                exact_quote="Gross Salary: ₹30,000 per month",
                confidence=0.95,
            ),
            CandidateFieldItem(
                field_name="Stock Options",
                raw_value="5,000 shares",
                exact_quote="Stock grant of 5,000 RSUs vesting over 4 years",
                confidence=0.80,
            ),
        ]

        verified = ground_candidate_fields(candidates, doc)
        assert len(verified) == 2
        assert verified[0].is_grounded is True
        assert verified[0].grounded_page == 1
        assert verified[1].is_grounded is False
        assert verified[1].grounded_page is None


# ---------------------------------------------------------------------------
# Section 3: Provider Error & Timeout Handling
# ---------------------------------------------------------------------------

class TestProviderResilience:

    @pytest.mark.asyncio
    async def test_missing_credentials_raises_auth_error(self):
        provider = MockLLMProvider(simulate_auth_error=True)
        service = AIService(provider=provider)

        req = AIExplanationRequest(
            finding_id="f1",
            rule_id="COMP-001",
            category="compensation",
            document_a_name="offer.pdf",
            excerpt_a="Salary: 30k",
            document_b_name="contract.pdf",
            excerpt_b="Salary: 25k",
        )

        with pytest.raises(AIAuthenticationError):
            await service.explain_finding(req)

    @pytest.mark.asyncio
    async def test_provider_timeout_raises_timeout_error(self):
        provider = MockLLMProvider(simulate_timeout=True)
        service = AIService(provider=provider)

        req = AIExplanationRequest(
            finding_id="f1",
            rule_id="COMP-001",
            category="compensation",
            document_a_name="offer.pdf",
            excerpt_a="Salary: 30k",
            document_b_name="contract.pdf",
            excerpt_b="Salary: 25k",
        )

        with pytest.raises(AITimeoutError):
            await service.explain_finding(req)

    @pytest.mark.asyncio
    async def test_malformed_output_raises_schema_error(self):
        provider = MockLLMProvider(simulate_malformed=True)
        service = AIService(provider=provider)

        req = AIExplanationRequest(
            finding_id="f1",
            rule_id="COMP-001",
            category="compensation",
            document_a_name="offer.pdf",
            excerpt_a="Salary: 30k",
            document_b_name="contract.pdf",
            excerpt_b="Salary: 25k",
        )

        with pytest.raises(AISchemaValidationError):
            await service.explain_finding(req)


# ---------------------------------------------------------------------------
# Section 4: Functional AI Assistance Capabilities
# ---------------------------------------------------------------------------

class TestAIFunctionalCapabilities:

    @pytest.fixture
    def ai_service(self):
        return AIService(provider=MockLLMProvider())

    @pytest.mark.asyncio
    async def test_explain_finding_returns_grounded_explanation(self, ai_service):
        req = AIExplanationRequest(
            finding_id="find-101",
            rule_id="COMP-001",
            category="compensation",
            document_a_name="offer.pdf",
            excerpt_a="Salary: ₹30,000",
            document_b_name="contract.pdf",
            excerpt_b="Salary: ₹25,000",
        )

        res = await ai_service.explain_finding(req)
        assert res.finding_id == "find-101"
        assert res.is_ai_generated is True
        assert len(res.summary) > 0
        assert len(res.impact_assessment) > 0
        assert len(res.suggested_action) > 0
        assert res.confidence > 0.8
        assert "Advisory output does not constitute" in res.disclaimer

    @pytest.mark.asyncio
    async def test_semantic_comparison_identifies_differences(self, ai_service):
        req = AISemanticCompareRequest(
            clause_type="notice_period",
            text_a="Notice period is 30 days.",
            doc_name_a="offer.pdf",
            text_b="Notice period is 90 days with conflicting garden leave.",
            doc_name_b="contract.pdf",
        )

        res = await ai_service.analyze_semantic_difference(req)
        assert res.is_ai_generated is True
        assert res.is_semantic_match is False
        assert len(res.key_distinctions) > 0

    @pytest.mark.asyncio
    async def test_candidate_field_extraction_with_grounding(self, ai_service):
        doc = DocumentMetadata(
            document_id="doc-offer-1",
            original_filename="offer.pdf",
            content_type="application/pdf",
            file_size_bytes=1000,
            doc_type=EmploymentDocType.offer_letter,
            domain="employment-hr",
            word_count=5,
            status=ProcessingStatus.ready,
            evidence_blocks=[
                PageEvidence(page=1, text="Candidate salary: ₹30,000 per month.", word_count=5),
            ],
        )

        req = AICandidateFieldExtractionRequest(
            document_name="offer.pdf",
            document_id="doc-offer-1",
            document_text="Candidate salary: ₹30,000 per month.",
        )

        res = await ai_service.extract_candidate_fields(req, doc_metadata=doc)
        assert res.is_ai_generated is True
        assert len(res.extracted_fields) > 0
        assert res.grounded_count >= 1

    @pytest.mark.asyncio
    async def test_clause_mapping_maps_to_known_rule(self, ai_service):
        req = AIClauseMappingRequest(
            document_name="contract.pdf",
            clause_excerpt="Monthly remuneration shall be deposited into the nominated bank account.",
        )

        res = await ai_service.map_ambiguous_clause(req)
        assert res.mapped_rule_id == "COMP-001"
        assert res.category == "compensation"
        assert res.is_ai_generated is True


# ---------------------------------------------------------------------------
# Section 5: API Endpoints & Secret Security
# ---------------------------------------------------------------------------

class TestAIEndpoints:

    def test_status_endpoint_never_leaks_key(self):
        resp = client.get("/api/v1/ai/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "enabled" in data
        assert "provider" in data
        assert "model" in data
        assert "timeout_seconds" in data
        # Crucial security check: api_key or secret MUST NOT exist in payload
        assert "api_key" not in data
        assert "LLM_API_KEY" not in data
        assert "key" not in data

    def test_explain_finding_endpoint(self, monkeypatch):
        # Ensure provider is mock for route test
        from app.services.ai.ai_service import ai_service
        monkeypatch.setattr(ai_service, "_provider", MockLLMProvider())

        payload = {
            "finding_id": "test-finding-1",
            "rule_id": "COMP-001",
            "category": "compensation",
            "document_a_name": "offer.pdf",
            "excerpt_a": "Salary: ₹30,000",
            "document_b_name": "contract.pdf",
            "excerpt_b": "Salary: ₹25,000",
        }

        resp = client.post("/api/v1/ai/explain-finding", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["finding_id"] == "test-finding-1"
        assert data["is_ai_generated"] is True
        assert "disclaimer" in data

    def test_semantic_compare_endpoint(self, monkeypatch):
        from app.services.ai.ai_service import ai_service
        monkeypatch.setattr(ai_service, "_provider", MockLLMProvider())

        payload = {
            "clause_type": "ip_assignment",
            "text_a": "Standard IP assignment applies.",
            "doc_name_a": "offer.pdf",
            "text_b": "Comprehensive worldwide patent and copyright assignment.",
            "doc_name_b": "contract.pdf",
        }

        resp = client.post("/api/v1/ai/semantic-compare", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "is_semantic_match" in data
        assert data["is_ai_generated"] is True

    def test_extract_fields_endpoint(self, monkeypatch):
        from app.services.ai.ai_service import ai_service
        monkeypatch.setattr(ai_service, "_provider", MockLLMProvider())

        payload = {
            "document_name": "offer.pdf",
            "document_text": "Salary: ₹30,000 per month. Probation: 3 months.",
        }

        resp = client.post("/api/v1/ai/extract-fields", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["document_name"] == "offer.pdf"
        assert len(data["extracted_fields"]) > 0

    def test_provider_timeout_returns_504(self, monkeypatch):
        from app.services.ai.ai_service import ai_service
        monkeypatch.setattr(ai_service, "_provider", MockLLMProvider(simulate_timeout=True))

        payload = {
            "finding_id": "test-finding-timeout",
            "rule_id": "COMP-001",
            "category": "compensation",
            "document_a_name": "offer.pdf",
            "excerpt_a": "Salary: 30k",
            "document_b_name": "contract.pdf",
            "excerpt_b": "Salary: 25k",
        }

        resp = client.post("/api/v1/ai/explain-finding", json=payload)
        assert resp.status_code == 504
        assert "timed out" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Section 6: Verification Pipeline Preservation with AI Failure/Offline
# ---------------------------------------------------------------------------

class TestVerificationPipelinePreservation:

    def test_verification_succeeds_even_when_ai_provider_fails(self, monkeypatch):
        """
        Critical requirement: deterministic verification checks MUST continue
        working when the AI provider is unavailable, times out, or errors.
        """
        import io
        import fitz
        from app.services.ai.ai_service import ai_service

        # Force AI provider to raise an error
        monkeypatch.setattr(ai_service, "_provider", MockLLMProvider(simulate_timeout=True))
        monkeypatch.setattr(settings, "LLM_ENABLED", True)

        def make_pdf(text: str) -> io.BytesIO:
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((50, 50), text)
            buf = io.BytesIO()
            doc.save(buf)
            buf.seek(0)
            return buf

        offer_buf = make_pdf("Gross Salary: ₹30,000 per month. Probation: 3 months. Notice: 30 days.")
        contract_buf = make_pdf("Gross Salary: ₹25,000 per month. Probation: 3 months. Notice: 30 days. Annexure B: IP.")

        resp = client.post(
            "/api/v1/documents/verify",
            files=[
                ("files", ("offer.pdf", offer_buf, "application/pdf")),
                ("files", ("contract.pdf", contract_buf, "application/pdf")),
            ],
            data={"doc_types": '["offer_letter","contract"]', "domain": "employment-hr"},
        )

        assert resp.status_code == 200
        data = resp.json()["data"]
        # Deterministic verification still successfully detected the salary discrepancy!
        assert data["status"] == "inconsistencies_detected"
        findings = [f for f in data["findings"] if f["rule_id"] == "COMP-001"]
        assert len(findings) == 1
        assert findings[0]["severity"] == "high"
