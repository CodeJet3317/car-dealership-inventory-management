import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={"email": "dealer_test@example.com", "password": "securepassword123"}
    )
    # Expected to fail (Red) because the route does not exist yet.
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "dealer_test@example.com"

def test_login_user():
    response = client.post(
        "/api/auth/login",
        json={"email": "dealer_test@example.com", "password": "securepassword123"}
    )
    # Expected to fail (Red) until login is implemented.
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"