import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_add_vehicle():
    response = client.post(
        "/api/vehicles",
        json={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan",
            "price": 25000.00,
            "quantity": 5
        }
    )
    # Expected to fail (Red) because the endpoint doesn't exist yet
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["make"] == "Toyota"
    assert data["model"] == "Camry"

def test_get_vehicles():
    response = client.get("/api/vehicles")
    # Expected to fail (Red) until implemented
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)