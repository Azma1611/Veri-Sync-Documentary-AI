"""
VeriSync AI — AI Assistance Module
"""

from app.services.ai.ai_service import AIService, ai_service
from app.services.ai.base_provider import (
    AIAuthenticationError,
    AIProviderError,
    AISchemaValidationError,
    AITimeoutError,
    BaseLLMProvider,
)
from app.services.ai.grounding_validator import (
    ground_candidate_fields,
    validate_quote_grounding,
)
from app.services.ai.mock_provider import MockLLMProvider
from app.services.ai.openai_provider import OpenAICompatibleProvider
from app.services.ai.pii_minimizer import minimize_context, sanitize_text

__all__ = [
    "AIService",
    "ai_service",
    "BaseLLMProvider",
    "OpenAICompatibleProvider",
    "MockLLMProvider",
    "AIProviderError",
    "AIAuthenticationError",
    "AITimeoutError",
    "AISchemaValidationError",
    "validate_quote_grounding",
    "ground_candidate_fields",
    "sanitize_text",
    "minimize_context",
]
