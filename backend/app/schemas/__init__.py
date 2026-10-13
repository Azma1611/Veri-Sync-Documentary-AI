from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health probe response schema."""
    status: str = Field(default="healthy", description="Service health state")
    version: str = Field(description="Engine version")
    environment: str = Field(description="Active runtime environment")
    activeDomain: str = Field(default="employment-hr", description="Active operational domain")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp"
    )
    aiEngineReady: bool = Field(default=True, description="AI engine readiness state")


class ServiceInfoResponse(BaseModel):
    """Root service information response schema."""
    name: str = Field(description="Service project name")
    version: str = Field(description="Engine version")
    description: str = Field(description="Platform summary")
    environment: str = Field(description="Current runtime environment")
    activeDomain: str = Field(default="employment-hr", description="Currently active operational domain")
    supportedDomains: List[dict] = Field(description="Platform domains metadata")
    docsUrl: str = Field(default="/docs", description="Interactive Swagger documentation endpoint")
    healthUrl: str = Field(default="/api/v1/health", description="Health diagnostic endpoint")


from app.schemas.ai import (
    AIAssistanceResult,
    AICandidateFieldExtractionRequest,
    AICandidateFieldExtractionResponse,
    AIClauseMappingRequest,
    AIClauseMappingResponse,
    AIExplanationRequest,
    AIExplanationResponse,
    AISemanticCompareRequest,
    AISemanticCompareResponse,
    AIStatusResponse,
    CandidateFieldItem,
)

from app.schemas.audit import (
    AuditTrailResponse,
    HistoryDetailResponse,
    HistoryItemResponse,
    HistoryListApiResponse,
    ReportExportRequest,
    ReportExportResponse,
    ReviewActionEnum,
    ReviewDecisionRecord,
    ReviewDecisionRequest,
    ReviewDecisionResponse,
)
