import json
import logging
import sys
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings backed by environment variables."""
    PROJECT_NAME: str = "VeriSync AI - Document Verification Engine"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Evidence-first, multi-domain document verification and compliance analysis API."
    )
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Active Domain specification
    ACTIVE_DOMAIN: str = "employment-hr"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Logging
    LOG_LEVEL: str = "INFO"

    # AI / LLM Configuration (Provider-independent, optional)
    LLM_ENABLED: bool = False
    LLM_PROVIDER: str = "openai"  # "openai", "mock", "none"
    LLM_API_KEY: Optional[str] = None
    LLM_API_BASE: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TIMEOUT_SECONDS: float = 12.0
    LLM_MAX_RETRIES: int = 2
    LLM_TEMPERATURE: float = 0.0
    LLM_REDACT_PII: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()


def setup_logging() -> logging.Logger:
    """Configures structured application logging without exposing secrets."""
    log_format = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logger = logging.getLogger("verisync")
    logger.setLevel(level)
    return logger


logger = setup_logging()
