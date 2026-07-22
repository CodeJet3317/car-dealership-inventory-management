import os
import uuid
import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key")
ALGORITHM = "HS256"

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            user_id = str(uuid.uuid4())
            hashed_password = pwd_context.hash(user.password)
            
            sql = "INSERT INTO users (id, email, password, role) VALUES (%s, %s, %s, 'USER')"
            cursor.execute(sql, (user_id, user.email, hashed_password))
            connection.commit()
            
        return {"id": user_id, "email": user.email, "role": "USER"}
    finally:
        connection.close()

@router.post("/login")
def login_user(user: UserLogin):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
            db_user = cursor.fetchone()
            
            if not db_user or not pwd_context.verify(user.password, db_user["password"]):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            token_payload = {"sub": db_user["email"], "role": db_user["role"]}
            access_token = jwt.encode(token_payload, JWT_SECRET, algorithm=ALGORITHM)
            
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        connection.close()