from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "learnlite-ai",
        "version": "0.1.0",
    }


def test_openapi_documentation():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "LearnLite AI Service" in response.json()["info"]["title"]
