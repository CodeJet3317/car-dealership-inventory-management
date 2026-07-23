import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db_connection

client = TestClient(app)
TEST_EMAIL = "dealer_test@example.com"

@pytest.fixture(autouse=True,scope='module')
def cleanup_test_user():

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE email = %s", (TEST_EMAIL,))
            connection.commit()
    finally:
        connection.close()
    
    yield 
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE email = %s", (TEST_EMAIL,))
            connection.commit()
    finally:
        connection.close()

def test_1_register_user():
    response = client.post(
        "/api/auth/register",
        json={"email": TEST_EMAIL, "password": "securepassword123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == TEST_EMAIL

def test_duplicate_registration_conflict():
    response = client.post(
        "/api/auth/register",
        json={"email": TEST_EMAIL, "password": "securepassword123"}
    )
    assert response.status_code in [400, 422]
    data = response.json()
    assert "already registered" in data.get("detail", "").lower()

def test_2_login_user():
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": "securepassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "USER"
    assert "must_reset" in data

def test_3_reset_credentials():
    # 1. Regular user token should be blocked with 403 Forbidden
    login_res = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": "securepassword123"}
    )
    user_token = login_res.json()["access_token"]

    user_reset_res = client.put(
        "/api/auth/reset-credentials",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"new_email": "user_reset@example.com", "new_password": "newpassword123"}
    )
    assert user_reset_res.status_code == 403

    # 2. Admin user token should succeed with 200 OK
    admin_login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@gmail.com", "password": "admin"}
    )
    if admin_login_res.status_code == 200:
        admin_token = admin_login_res.json()["access_token"]
        admin_reset_res = client.put(
            "/api/auth/reset-credentials",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"new_email": "admin@gmail.com", "new_password": "admin"}
        )
        assert admin_reset_res.status_code == 200