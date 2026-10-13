import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    """Test root service descriptor endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == settings.PROJECT_NAME
    assert data["version"] == settings.VERSION
    assert data["activeDomain"] == "employment-hr"
    assert data["docsUrl"] == "/docs"
    assert data["healthUrl"] == "/api/v1/health"
    assert isinstance(data["supportedDomains"], list)
    
    # Check that employment-hr is the active domain
    employment_domain = next(
        (d for d in data["supportedDomains"] if d["id"] == "employment-hr"), None
    )
    assert employment_domain is not None
    assert employment_domain["status"] == "active"

    # Check that other domains are coming_soon
    for domain in data["supportedDomains"]:
        if domain["id"] != "employment-hr":
            assert domain["status"] == "coming_soon"


def test_health_endpoint():
    """Test /api/v1/health diagnostic endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == settings.VERSION
    assert data["environment"] == settings.ENVIRONMENT
    assert data["activeDomain"] == "employment-hr"
    assert data["aiEngineReady"] is True
    assert "timestamp" in data


def test_cors_headers_for_frontend():
    """Test that CORS headers allow the frontend dev server origin."""
    response = client.get(
        "/api/v1/health",
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_docs_and_openapi_endpoints():
    """Test that Swagger UI and OpenAPI schemas are accessible."""
    docs_resp = client.get("/docs")
    assert docs_resp.status_code == 200

    openapi_resp = client.get("/api/v1/openapi.json")
    assert openapi_resp.status_code == 200
    schema = openapi_resp.json()
    assert "paths" in schema
    assert "/api/v1/health" in schema["paths"]


def test_not_found_endpoint():
    """Test handling of nonexistent routes."""
    response = client.get("/api/v1/nonexistent-route-xyz")
    assert response.status_code == 404
