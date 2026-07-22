"""What it tests: Who is allowed to use the application.

Focus: It doesn't care deeply about whether the car model is a Toyota or a Honda; it only cares about permissions (ensuring regular users get blocked with a 403 Forbidden and admins are allowed through)."""

import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db_connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = TestClient(app)

def test_regular_user_cannot_add_vehicle():
    # 1. Register a normal user
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    
    # 2. Login to get token
    login_res = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Try to add a vehicle (Expected to fail with 403 Forbidden)
    response = client.post(
        "/api/vehicles",
        headers=headers,
        json={
            "make": "Tesla",
            "model": "Model 3",
            "category": "Electric",
            "price": 40000.00,
            "quantity": 2
        }
    )
    assert response.status_code == 403

def test_admin_user_can_add_vehicle():
    # 1. Directly insert an ADMIN user into the database for testing
    admin_email = f"admin_{uuid.uuid4().hex[:6]}@example.com"
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

    # 2. Login as the admin to get token
    login_res = client.post("/api/auth/login", json={"email": admin_email, "password": "adminpassword123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Try to add a vehicle as an admin (Expected to succeed with 201 Created)
    response = client.post(
        "/api/vehicles",
        headers=headers,
        json={
            "make": "Porsche",
            "model": "911",
            "category": "Sports",
            "price": 120000.00,
            "quantity": 1
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["make"] == "Porsche"