import uuid
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

class VehicleCreate(BaseModel):
    make: str
    model: str
    category: str
    price: float
    quantity: int

@router.post("", status_code=status.HTTP_201_CREATED)
def add_vehicle(vehicle: VehicleCreate):
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