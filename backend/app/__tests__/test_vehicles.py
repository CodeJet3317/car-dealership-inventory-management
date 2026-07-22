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

def test_update_vehicle():
    # First, create a vehicle to update
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Honda",
            "model": "Civic",
            "category": "Sedan",
            "price": 22000.00,
            "quantity": 3
        }
    )
    vehicle_id = create_res.json()["id"]

    # Test the update endpoint (Expected to fail/404 right now)
    response = client.put(
        f"/api/vehicles/{vehicle_id}",
        json={
            "make": "Honda",
            "model": "Civic Updated",
            "category": "Sedan",
            "price": 23000.00,
            "quantity": 4
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "Civic Updated"
    assert data["price"] == 23000.00

def test_delete_vehicle():
    # First, create a vehicle to delete
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Ford",
            "model": "Mustang",
            "category": "Coupe",
            "price": 35000.00,
            "quantity": 2
        }
    )
    vehicle_id = create_res.json()["id"]

    # Test the delete endpoint (Expected to fail/404 right now)
    response = client.delete(f"/api/vehicles/{vehicle_id}")
    assert response.status_code == 200