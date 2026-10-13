from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings, logger
from app.api.routes import health
from app.api.routes import documents as documents_routes
from app.api.routes import verify as verify_routes
from app.api.routes import ai as ai_routes
from app.api.routes import history as history_routes
from app.api.routes import reviews as reviews_routes
from app.api.routes import resumes as resumes_routes
from app.schemas import ServiceInfoResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler for startup and shutdown logging."""
    logger.info(
        f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]"
    )
    logger.info(f"Active domain configured: {settings.ACTIVE_DOMAIN}")
    logger.info(f"Configured CORS origins: {settings.BACKEND_CORS_ORIGINS}")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) for frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(documents_routes.router, prefix=settings.API_V1_STR)
app.include_router(verify_routes.router, prefix=settings.API_V1_STR)
app.include_router(ai_routes.router, prefix=settings.API_V1_STR)
app.include_router(history_routes.router, prefix=settings.API_V1_STR)
app.include_router(reviews_routes.router, prefix=settings.API_V1_STR)
app.include_router(resumes_routes.router, prefix=settings.API_V1_STR)


@app.get(
    "/",
    response_model=ServiceInfoResponse,
    tags=["Service Information"],
    summary="Root service descriptor",
    description="Returns platform overview, engine version, documentation links, and active domain status.",
)
async def root_service_info() -> ServiceInfoResponse:
    return ServiceInfoResponse(
        name=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        environment=settings.ENVIRONMENT,
        activeDomain=settings.ACTIVE_DOMAIN,
        supportedDomains=[
            {
                "id": "employment-hr",
                "name": "Employment & HR",
                "status": "active",
                "description": "Cross-reference offer letters, contracts, job descriptions, and HR policies.",
            },
            {
                "id": "education",
                "name": "Education",
                "status": "coming_soon",
                "description": "Academic transcripts and credential verification.",
            },
            {
                "id": "government-public",
                "name": "Government & Public Services",
                "status": "coming_soon",
                "description": "Civil registry records, identity documentation, and permits.",
            },
            {
                "id": "banking-finance",
                "name": "Banking & Finance",
                "status": "coming_soon",
                "description": "Loan sanction letters, mortgage deeds, and financial disclosures.",
            },
            {
                "id": "healthcare-admin",
                "name": "Healthcare Administration",
                "status": "coming_soon",
                "description": "Practitioner licensing and privileging verification.",
            },
            {
                "id": "business-legal",
                "name": "Business & Legal Documents",
                "status": "coming_soon",
                "description": "Master services agreements (MSAs) and statements of work (SOWs).",
            },
        ],
        docsUrl="/docs",
        healthUrl=f"{settings.API_V1_STR}/health",
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Safe global exception handler avoiding internal information leakage."""
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the request.",
            "path": request.url.path,
        },
    )
