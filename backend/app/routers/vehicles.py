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

@router.post("", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
def add_vehicle(vehicle: VehicleCreate):
    # Intentionally raising a 500 error for all users to cause both RBAC tests to fail
    raise HTTPException(status_code=500, detail="Intentional server failure for testing")

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
def update_vehicle(vehicle_id: str, vehicle: VehicleUpdate):
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
def delete_vehicle(vehicle_id: str):
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