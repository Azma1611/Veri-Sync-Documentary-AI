"""
VeriSync AI — Mock LLM Provider for Testing and Offline Mode

Provides deterministic, schema-compliant responses without external network
requests. Supports configurable simulation modes for unit testing:
- Timeout simulation
- Authentication error simulation
- Malformed JSON simulation
- Schema validation error simulation
"""

from __future__ import annotations

import asyncio
from typing import Optional, Type, TypeVar
from pydantic import BaseModel

from app.schemas.ai import (
    AIExplanationResponse,
    AISemanticCompareResponse,
    AICandidateFieldExtractionResponse,
    AIClauseMappingResponse,
    CandidateFieldItem,
)
from app.services.ai.base_provider import (
    AIAuthenticationError,
    AIProviderError,
    AISchemaValidationError,
    AITimeoutError,
    BaseLLMProvider,
)

T = TypeVar("T", bound=BaseModel)


class MockLLMProvider(BaseLLMProvider):
    """Deterministic mock provider for unit tests and local evaluation."""

    def __init__(
        self,
        simulate_timeout: bool = False,
        simulate_auth_error: bool = False,
        simulate_malformed: bool = False,
        simulate_schema_error: bool = False,
        delay_seconds: float = 0.0,
    ):
        self.simulate_timeout = simulate_timeout
        self.simulate_auth_error = simulate_auth_error
        self.simulate_malformed = simulate_malformed
        self.simulate_schema_error = simulate_schema_error
        self.delay_seconds = delay_seconds

    def is_available(self) -> bool:
        return not self.simulate_auth_error

    async def complete_structured(
        self,
        prompt: str,
        system_prompt: str,
        response_model: Type[T],
    ) -> T:
        if self.delay_seconds > 0:
            await asyncio.sleep(self.delay_seconds)

        if self.simulate_auth_error:
            raise AIAuthenticationError("Mock provider: simulated authentication failure.")

        if self.simulate_timeout:
            raise AITimeoutError("Mock provider: simulated request timeout.")

        if self.simulate_malformed:
            raise AISchemaValidationError("Mock provider: simulated malformed JSON string.")

        if self.simulate_schema_error:
            raise AISchemaValidationError("Mock provider: simulated schema validation failure.")

        # Dispatch deterministic response based on requested model
        if response_model is AIExplanationResponse:
            return response_model(  # type: ignore
                finding_id="mock-finding",
                summary="Detected compensation or clause variance across reviewed agreements.",
                impact_assessment=(
                    "Disparity between terms may create contractual ambiguity or payroll calculation disputes."
                ),
                suggested_action="Request an addendum signed by both parties to reconcile the specific covenant.",
                confidence=0.92,
            )

        if response_model is AISemanticCompareResponse:
            is_match = "different" not in prompt.lower() and "conflict" not in prompt.lower()
            return response_model(  # type: ignore
                is_semantic_match=is_match,
                similarity_score=0.90 if is_match else 0.45,
                substantive_differences=[] if is_match else ["Scope of liability and notice window duration differ"],
                key_distinctions="Clauses exhibit differing legal obligations upon contract termination." if not is_match else "Substantive covenants align.",
                confidence=0.88,
            )

        if response_model is AICandidateFieldExtractionResponse:
            # Generate candidate fields based on words found in prompt
            fields = []
            if "salary" in prompt.lower() or "30,000" in prompt:
                fields.append(
                    CandidateFieldItem(
                        field_name="Base Salary",
                        raw_value="₹30,000 per month",
                        normalized_value="30000.0",
                        exact_quote="₹30,000 per month" if "₹30,000 per month" in prompt else "30,000",
                        confidence=0.95,
                    )
                )
            if "probation" in prompt.lower() or "3 months" in prompt:
                fields.append(
                    CandidateFieldItem(
                        field_name="Probation Period",
                        raw_value="3 months",
                        normalized_value="90 days",
                        exact_quote="3 months",
                        confidence=0.90,
                    )
                )

            return response_model(  # type: ignore
                document_name="document",
                extracted_fields=fields,
                grounded_count=len(fields),
                unverified_count=0,
            )

        if response_model is AIClauseMappingResponse:
            return response_model(  # type: ignore
                mapped_rule_id="COMP-001",
                category="compensation",
                confidence=0.85,
                rationale="Text references remuneration schedule and recurring gross pay.",
            )

        # Fallback empty construction
        return response_model.model_validate({})
