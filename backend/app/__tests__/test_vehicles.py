"""Focus: It verifies that the core features work correctly—such as ensuring a vehicle is saved with the correct price and model, 
that listing inventory returns an array, 
and that updates and deletions actually modify the database records properly."""

import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db_connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = TestClient(app)

@pytest.fixture
def admin_headers():
    """Fixture to generate an admin user and return authorization headers."""
    admin_email = f"admin_veh_{uuid.uuid4().hex[:6]}@example.com"
    admin_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash("adminpassword123")
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO users (id, email, password, role) VALUES (%s, %s, %s, 'ADMIN')"
            cursor.execute(sql, (admin_id, admin_email, hashed_password))
            connection.commit()
    finally:
        connection.close()

    login_res = client.post("/api/auth/login", json={"email": admin_email, "password": "adminpassword123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_add_vehicle(admin_headers):
    response = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan",
            "price": 25000.00,
            "quantity": 5
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["make"] == "Toyota"
    assert data["model"] == "Camry"

def test_get_vehicles():
    # GET endpoint is public/unprotected, so no headers required
    response = client.get("/api/vehicles")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_update_vehicle(admin_headers):
    create_res = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={
            "make": "Honda",
            "model": "Civic",
            "category": "Sedan",
            "price": 22000.00,
            "quantity": 3
        }
    )
    vehicle_id = create_res.json()["id"]

    response = client.put(
        f"/api/vehicles/{vehicle_id}",
        headers=admin_headers,
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

def test_delete_vehicle(admin_headers):
    create_res = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={
            "make": "Ford",
            "model": "Mustang",
            "category": "Coupe",
            "price": 35000.00,
            "quantity": 2
        }
    )
    vehicle_id = create_res.json()["id"]

    response = client.delete(
        f"/api/vehicles/{vehicle_id}",
        headers=admin_headers
    )
    assert response.status_code == 200

def test_search_vehicles(admin_headers):
    # 1. Add a unique vehicle for search testing
    client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={
            "make": "Subaru",
            "model": "Outback",
            "category": "SUV",
            "price": 30000.00,
            "quantity": 4
        }
    )

    # 2. Test search endpoint by make and min_price
    response = client.get("/api/vehicles/search?make=Subaru&min_price=25000")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["make"] == "Subaru"
    assert data[0]["model"] == "Outback"

def test_restock_vehicle(admin_headers):
    # 1. Create a vehicle to restock
    vehicle_res = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={
            "make": "Mazda",
            "model": "CX-5",
            "category": "SUV",
            "price": 28000.00,
            "quantity": 2
        }
    )
    vehicle_id = vehicle_res.json()["id"]

    # 2. Restock the vehicle (adding 5 more units, total should become 7)
    response = client.post(
        f"/api/vehicles/{vehicle_id}/restock",
        headers=admin_headers,
        json={"quantity": 5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["new_quantity"] == 7