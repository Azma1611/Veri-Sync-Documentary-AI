"""
VeriSync AI — AI Assistance Routes

Endpoints for provider-independent AI assistance:
- GET /api/v1/ai/status: Service readiness and active model (no secret leakage)
- POST /api/v1/ai/explain-finding: Grounded advisory explanation for findings
- POST /api/v1/ai/semantic-compare: Nuanced semantic comparison between clauses
- POST /api/v1/ai/extract-fields: Candidate field extraction with grounding checks
- POST /api/v1/ai/map-clause: Map ambiguous phrasing to domain rules
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.ai import (
    AICandidateFieldExtractionRequest,
    AICandidateFieldExtractionResponse,
    AIClauseMappingRequest,
    AIClauseMappingResponse,
    AIExplanationRequest,
    AIExplanationResponse,
    AISemanticCompareRequest,
    AISemanticCompareResponse,
    AIStatusResponse,
)
from app.services.ai import (
    AIAuthenticationError,
    AIProviderError,
    AISchemaValidationError,
    AITimeoutError,
    ai_service,
)
from app.services.document_store import document_store

logger = logging.getLogger("verisync.ai_routes")

router = APIRouter(prefix="/ai", tags=["AI Assistance"])


@router.get(
    "/status",
    response_model=AIStatusResponse,
    summary="AI service readiness probe",
    description="Returns current provider configuration and availability without exposing credentials.",
)
async def get_ai_status() -> AIStatusResponse:
    return ai_service.get_status()


@router.post(
    "/explain-finding",
    response_model=AIExplanationResponse,
    summary="Explain an existing verification finding",
    description=(
        "Produces a grounded, human-readable advisory explanation for an inconsistency finding. "
        "Advisory only; does not determine legality or fraud."
    ),
)
async def explain_finding(request: AIExplanationRequest) -> AIExplanationResponse:
    if not ai_service.provider.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Set LLM_API_KEY in the backend environment.",
        )

    try:
        return await ai_service.explain_finding(request)
    except AIAuthenticationError as exc:
        logger.error("AI auth error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider authentication rejected.",
        ) from exc
    except AITimeoutError as exc:
        logger.warning("AI timeout: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI provider request timed out.",
        ) from exc
    except AISchemaValidationError as exc:
        logger.error("AI validation error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI output failed schema validation: {exc}",
        ) from exc
    except AIProviderError as exc:
        logger.error("AI provider error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {exc}",
        ) from exc


@router.post(
    "/semantic-compare",
    response_model=AISemanticCompareResponse,
    summary="Compare two clauses for semantic equivalence",
    description="Evaluates substantive contractual differences that deterministic comparisons cannot detect.",
)
async def semantic_compare(request: AISemanticCompareRequest) -> AISemanticCompareResponse:
    if not ai_service.provider.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Set LLM_API_KEY in the backend environment.",
        )

    try:
        return await ai_service.analyze_semantic_difference(request)
    except AIAuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI authentication failure.") from exc
    except AITimeoutError as exc:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="AI provider timed out.") from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.post(
    "/extract-fields",
    response_model=AICandidateFieldExtractionResponse,
    summary="Extract candidate fields with source grounding",
    description=(
        "Extracts candidate structured fields from document text and validates all quotes "
        "against source document evidence blocks to prevent hallucinated excerpts."
    ),
)
async def extract_candidate_fields(
    request: AICandidateFieldExtractionRequest,
) -> AICandidateFieldExtractionResponse:
    if not ai_service.provider.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Set LLM_API_KEY in the backend environment.",
        )

    doc_meta = None
    if request.document_id:
        doc_meta = document_store.get(request.document_id)

    try:
        return await ai_service.extract_candidate_fields(request, doc_metadata=doc_meta)
    except AIAuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI authentication failure.") from exc
    except AITimeoutError as exc:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="AI provider timed out.") from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.post(
    "/map-clause",
    response_model=AIClauseMappingResponse,
    summary="Map ambiguous clause to domain rule catalog",
    description="Identifies the category and rule for non-standard clause drafting.",
)
async def map_clause(request: AIClauseMappingRequest) -> AIClauseMappingResponse:
    if not ai_service.provider.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Set LLM_API_KEY in the backend environment.",
        )

    try:
        return await ai_service.map_ambiguous_clause(request)
    except AIProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
