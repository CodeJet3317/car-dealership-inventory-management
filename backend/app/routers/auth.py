"""
Authentication router module for user registration, login, JWT token issuance, and credential management.

Handles password hashing with bcrypt, JWT bearer token verification, and administrative
credential updates.
"""

import os
import uuid
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.database import get_db_connection

# Router instance for authentication endpoints
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Bearer token security scheme dependency handler
security = HTTPBearer()

# Password hashing context using bcrypt scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration secrets and cryptographic algorithm
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key")
ALGORITHM = "HS256"

# Pydantic Request Models for Payload Validation
class UserCreate(BaseModel):
    """Schema for new user registration requests."""
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Schema for user login requests."""
    email: EmailStr
    password: str

class ResetCredentialsRequest(BaseModel):
    """Schema for admin credential reset requests."""
    new_email: EmailStr
    new_password: str

def get_current_user_email(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    FastAPI dependency to extract and validate the JWT access token from the Authorization header.
    
    Returns:
        str: Email address (subject claim) of the authenticated user.
        
    Raises:
        HTTPException (401): If token is invalid, expired, or subject claim is missing.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate):
    """
    Registers a new standard user account with email and password.
    Hashes the password with bcrypt before storing it in the MySQL database.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Check for existing user account with the same email
            cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Generate UUID primary key and hash password
            user_id = str(uuid.uuid4())
            hashed_password = pwd_context.hash(user.password)
            
            # Insert user with default 'USER' role
            sql = "INSERT INTO users (id, email, password, role, must_reset) VALUES (%s, %s, %s, 'USER', FALSE)"
            cursor.execute(sql, (user_id, user.email, hashed_password))
            connection.commit()
            
        return {"id": user_id, "email": user.email, "role": "USER"}
    finally:
        connection.close()

@router.post("/login")
def login_user(user: UserLogin):
    """
    Authenticates user credentials and issues a signed JWT Bearer access token.
    Returns user details and a boolean `must_reset` flag indicating if admin credentials need updating.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Retrieve user record by email
            cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
            db_user = cursor.fetchone()
            
            # Verify user exists and password hash matches input
            if not db_user or not pwd_context.verify(user.password, db_user["password"]):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # Encode JWT token with subject (email) and user role
            token_payload = {"sub": db_user["email"], "role": db_user["role"]}
            access_token = jwt.encode(token_payload, JWT_SECRET, algorithm=ALGORITHM)
            
            # Flag default admin setup requiring credential reset
            is_default_admin = (db_user["role"] == "ADMIN" and pwd_context.verify("admin", db_user["password"]))
            must_reset = bool(db_user.get("must_reset", False)) or is_default_admin
            
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": db_user["role"],
            "email": db_user["email"],
            "must_reset": must_reset
        }
    finally:
        connection.close()

@router.put("/reset-credentials")
def reset_credentials(data: ResetCredentialsRequest, current_email: str = Depends(get_current_user_email)):
    """
    Resets admin credentials (email and/or password) and issues a refreshed JWT access token.
    Updates existing order records if the email address changed.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Verify caller account exists
            cursor.execute("SELECT * FROM users WHERE email = %s", (current_email,))
            db_user = cursor.fetchone()
            if not db_user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Admin role check
            if db_user.get("role") != "ADMIN":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admin users are permitted to reset credentials"
                )
            
            # Check availability of new email if email address is being modified
            if data.new_email != current_email:
                cursor.execute("SELECT id FROM users WHERE email = %s", (data.new_email,))
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="New email is already in use")

            # Hash new password and clear the must_reset flag
            hashed_password = pwd_context.hash(data.new_password)
            
            cursor.execute(
                "UPDATE users SET email = %s, password = %s, must_reset = %s WHERE email = %s",
                (data.new_email, hashed_password, False, current_email)
            )
            
            # Update user_email reference in order history table if email changed
            if data.new_email != current_email:
                cursor.execute(
                    "UPDATE orders SET user_email = %s WHERE user_email = %s",
                    (data.new_email, current_email)
                )

            connection.commit()

            # Issue newly updated access token
            new_payload = {"sub": data.new_email, "role": db_user["role"]}
            new_access_token = jwt.encode(new_payload, JWT_SECRET, algorithm=ALGORITHM)

        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "role": db_user["role"],
            "email": data.new_email,
            "must_reset": False,
            "message": "Credentials updated successfully"
        }
    finally:
        connection.close()