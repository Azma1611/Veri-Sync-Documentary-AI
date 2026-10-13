"""
VeriSync AI — OpenAI Compatible Provider Implementation

Implements BaseLLMProvider using standard HTTP POST /chat/completions.
Compatible with:
- OpenAI (GPT-4o, GPT-4o-mini, etc.)
- Groq (Llama-3, Mixtral)
- Ollama / vLLM / LocalAI (self-hosted open models)
- Azure OpenAI / DeepSeek / OpenRouter

Features:
- Validates strictly against Pydantic models.
- Configurable timeout and bounded retries with exponential backoff.
- Zero key leakage in logs or exceptions.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional, Type, TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import settings
from app.services.ai.base_provider import (
    AIAuthenticationError,
    AIProviderError,
    AISchemaValidationError,
    AITimeoutError,
    BaseLLMProvider,
)

logger = logging.getLogger("verisync.ai.openai")
T = TypeVar("T", bound=BaseModel)


class OpenAICompatibleProvider(BaseLLMProvider):
    """Client for OpenAI-compatible REST API endpoints."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        max_retries: Optional[int] = None,
        temperature: Optional[float] = None,
    ):
        self.api_key = api_key or settings.LLM_API_KEY
        self.base_url = (base_url or settings.LLM_API_BASE).rstrip("/")
        self.model = model or settings.LLM_MODEL
        self.timeout_seconds = timeout_seconds or settings.LLM_TIMEOUT_SECONDS
        self.max_retries = max_retries if max_retries is not None else settings.LLM_MAX_RETRIES
        self.temperature = temperature if temperature is not None else settings.LLM_TEMPERATURE

    def is_available(self) -> bool:
        """Available if an API key is provided, or if using a local host (Ollama/LocalAI)."""
        if self.api_key and len(self.api_key.strip()) > 0:
            return True
        # Local endpoints like Ollama don't require an API key
        if "localhost" in self.base_url or "127.0.0.1" in self.base_url:
            return True
        return False

    async def complete_structured(
        self,
        prompt: str,
        system_prompt: str,
        response_model: Type[T],
    ) -> T:
        if not self.is_available():
            raise AIAuthenticationError(
                "LLM provider is not configured. Missing LLM_API_KEY environment variable."
            )

        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        # Instruct model on schema requirements
        schema_json = json.dumps(response_model.model_json_schema())
        augmented_system_prompt = (
            f"{system_prompt}\n\n"
            f"IMPORTANT: You must output ONLY a valid JSON object matching this schema:\n"
            f"{schema_json}\n"
            f"Do not include markdown code fences or conversational text."
        )

        payload = {
            "model": self.model,
            "temperature": self.temperature,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": augmented_system_prompt},
                {"role": "user", "content": prompt},
            ],
        }

        timeout = httpx.Timeout(
            connect=5.0,
            read=self.timeout_seconds,
            write=5.0,
            pool=5.0,
        )

        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(endpoint, headers=headers, json=payload)

                if response.status_code == 401 or response.status_code == 403:
                    raise AIAuthenticationError(
                        f"Authentication failed with provider ({response.status_code}). Check LLM_API_KEY."
                    )

                if response.status_code == 429 or response.status_code >= 500:
                    # Retryable error
                    if attempt < self.max_retries:
                        backoff = (2 ** attempt) * 0.5
                        logger.warning(
                            "Provider returned HTTP %d, retrying in %.1fs (attempt %d/%d)",
                            response.status_code,
                            backoff,
                            attempt + 1,
                            self.max_retries,
                        )
                        await asyncio.sleep(backoff)
                        continue
                    else:
                        raise AIProviderError(
                            f"Provider error HTTP {response.status_code}: {response.text[:200]}"
                        )

                if response.status_code != 200:
                    raise AIProviderError(
                        f"Provider unexpected HTTP {response.status_code}: {response.text[:200]}"
                    )

                response_data = response.json()
                choices = response_data.get("choices", [])
                if not choices:
                    raise AISchemaValidationError("Provider returned empty choices array.")

                content_raw = choices[0].get("message", {}).get("content", "")
                if not content_raw:
                    raise AISchemaValidationError("Provider message content is empty.")

                # Clean markdown fences if present
                clean_content = content_raw.strip()
                if clean_content.startswith("```json"):
                    clean_content = clean_content[7:]
                if clean_content.startswith("```"):
                    clean_content = clean_content[3:]
                if clean_content.endswith("```"):
                    clean_content = clean_content[:-3]
                clean_content = clean_content.strip()

                try:
                    parsed_json = json.loads(clean_content)
                except json.JSONDecodeError as exc:
                    raise AISchemaValidationError(
                        f"Provider response was not valid JSON: {exc}"
                    ) from exc

                try:
                    validated_output = response_model.model_validate(parsed_json)
                    return validated_output
                except ValidationError as exc:
                    raise AISchemaValidationError(
                        f"Provider response failed Pydantic validation: {exc}"
                    ) from exc

            except httpx.TimeoutException as exc:
                last_error = AITimeoutError(
                    f"Provider request timed out after {self.timeout_seconds}s"
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(0.5)
                    continue
                raise last_error from exc
            except (AIAuthenticationError, AISchemaValidationError):
                # Non-retryable
                raise
            except AIProviderError:
                raise
            except Exception as exc:
                last_error = AIProviderError(f"Unexpected provider network error: {exc}")
                if attempt < self.max_retries:
                    await asyncio.sleep(0.5)
                    continue
                raise last_error from exc

        if last_error:
            raise last_error
        raise AIProviderError("Provider call failed with exhausted retries.")
