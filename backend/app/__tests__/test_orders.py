import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db_connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = TestClient(app)

@pytest.fixture
def auth_headers():
    """Fixture to register a regular user and return auth headers."""
    email = f"buyer_{uuid.uuid4().hex[:6]}@example.com"
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    
    login_res = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers():
    """Fixture to create an admin and return headers for adding inventory."""
    admin_email = f"admin_ord_{uuid.uuid4().hex[:6]}@example.com"
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

def test_create_order_success(auth_headers, admin_headers):
    # 1. Admin adds a vehicle to inventory with quantity = 5
    vehicle_res = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={
            "make": "Hyundai",
            "model": "Elantra",
            "category": "Sedan",
            "price": 20000.00,
            "quantity": 5
        }
    )
    vehicle_id = vehicle_res.json()["id"]

    # 2. Regular user places an order for 2 vehicles (Expected to fail/404 right now)
    response = client.post(
        "/api/orders",
        headers=auth_headers,
        json={
            "vehicle_id": vehicle_id,
            "quantity": 2
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["vehicle_id"] == vehicle_id
    assert data["quantity"] == 2
    assert data["total_price"] == 40000.00