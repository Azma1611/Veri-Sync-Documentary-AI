from fastapi import APIRouter
from app.core.config import settings, logger
from app.schemas import HealthResponse

router = APIRouter(tags=["Health & Diagnostics"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check probe",
    description="Returns the operational status, version, and active domain for VeriSync AI.",
)
async def check_health() -> HealthResponse:
    logger.debug("Health check probe called")
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        activeDomain=settings.ACTIVE_DOMAIN,
        aiEngineReady=True,
    )
