"""
VeriSync AI — Base LLM Provider Interface

Defines the provider-independent abstraction for all LLM implementations.
Ensures VeriSync AI can switch between providers (OpenAI, Groq, Ollama, Anthropic, Mock)
without changing business logic or verification pipelines.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


# ---------------------------------------------------------------------------
# Typed Exception Hierarchy
# ---------------------------------------------------------------------------

class AIProviderError(Exception):
    """Base exception for all AI provider failures."""
    pass


class AIAuthenticationError(AIProviderError):
    """Raised when credentials are missing or rejected by the provider."""
    pass


class AITimeoutError(AIProviderError):
    """Raised when the provider request exceeds configured timeout."""
    pass


class AISchemaValidationError(AIProviderError):
    """Raised when the provider output does not conform to the expected Pydantic model."""
    pass


# ---------------------------------------------------------------------------
# Base Provider Abstract Class
# ---------------------------------------------------------------------------

class BaseLLMProvider(ABC):
    """Abstract interface for provider-independent AI completions."""

    @abstractmethod
    def is_available(self) -> bool:
        """Return True if credentials and configuration are ready for requests."""
        pass

    @abstractmethod
    async def complete_structured(
        self,
        prompt: str,
        system_prompt: str,
        response_model: Type[T],
    ) -> T:
        """
        Request a strictly validated structured output from the LLM.

        Parameters
        ----------
        prompt : str
            Untrusted user/document content prompt.
        system_prompt : str
            System instructions enforcing role, constraints, and JSON output schema.
        response_model : Type[T]
            Pydantic model that the response must validate against.

        Returns
        -------
        An instance of response_model.

        Raises
        ------
        AIAuthenticationError
            If API key is missing or invalid.
        AITimeoutError
            If request exceeds configured timeout.
        AISchemaValidationError
            If returned output is unparseable or fails model validation.
        AIProviderError
            For other provider-side communication failures.
        """
        pass
