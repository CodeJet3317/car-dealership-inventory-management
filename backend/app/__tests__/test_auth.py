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

def test_2_login_user():
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": "securepassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"