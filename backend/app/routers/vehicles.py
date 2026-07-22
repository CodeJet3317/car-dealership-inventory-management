import os
import uuid
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key")
ALGORITHM = "HS256"

class VehicleCreate(BaseModel):
    make: str
    model: str
    category: str
    price: float
    quantity: int

class VehicleUpdate(BaseModel):
    make: str
    model: str
    category: str
    price: float
    quantity: int

def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify token and ensure the user has ADMIN role."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        
        if not email or role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Admin privileges required"
            )
        return {"email": email, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Could not validate credentials"
        )

@router.post("", status_code=status.HTTP_201_CREATED)
def add_vehicle(vehicle: VehicleCreate, admin_user: dict = Depends(get_current_admin_user)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            vehicle_id = str(uuid.uuid4())
            sql = """
                INSERT INTO vehicles (id, make, model, category, price, quantity) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                vehicle_id,
                vehicle.make, 
                vehicle.model, 
                vehicle.category, 
                vehicle.price, 
                vehicle.quantity
            ))
            connection.commit()
            
        return {
            "id": vehicle_id,
            "make": vehicle.make,
            "model": vehicle.model,
            "category": vehicle.category,
            "price": vehicle.price,
            "quantity": vehicle.quantity
        }
    finally:
        connection.close()

@router.get("")
def get_all_vehicles():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vehicles")
            vehicles = cursor.fetchall()
        return vehicles
    finally:
        connection.close()

@router.put("/{vehicle_id}")
def update_vehicle(vehicle_id: str, vehicle: VehicleUpdate, admin_user: dict = Depends(get_current_admin_user)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM vehicles WHERE id = %s", (vehicle_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            sql = """
                UPDATE vehicles 
                SET make = %s, model = %s, category = %s, price = %s, quantity = %s
                WHERE id = %s
            """
            cursor.execute(sql, (
                vehicle.make,
                vehicle.model,
                vehicle.category,
                vehicle.price,
                vehicle.quantity,
                vehicle_id
            ))
            connection.commit()
            
        return {
            "id": vehicle_id,
            "make": vehicle.make,
            "model": vehicle.model,
            "category": vehicle.category,
            "price": vehicle.price,
            "quantity": vehicle.quantity
        }
    finally:
        connection.close()

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: str, admin_user: dict = Depends(get_current_admin_user)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM vehicles WHERE id = %s", (vehicle_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            cursor.execute("DELETE FROM vehicles WHERE id = %s", (vehicle_id,))
            connection.commit()
            
        return {"message": "Vehicle deleted successfully"}
    finally:
        connection.close()