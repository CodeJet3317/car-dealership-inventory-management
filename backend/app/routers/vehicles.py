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

class PurchaseCreate(BaseModel):
    quantity: int

class RestockCreate(BaseModel):
    quantity: int

def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
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

def get_current_user_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

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
                vehicle_id, vehicle.make, vehicle.model, 
                vehicle.category, vehicle.price, vehicle.quantity
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

@router.get("/search")
def search_vehicles(
    make: str = None,
    model: str = None,
    category: str = None,
    min_price: float = None,
    max_price: float = None
):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            query = "SELECT * FROM vehicles WHERE 1=1"
            params = []

            if make:
                query += " AND make LIKE %s"
                params.append(f"%{make}%")
            if model:
                query += " AND model LIKE %s"
                params.append(f"%{model}%")
            if category:
                query += " AND category LIKE %s"
                params.append(f"%{category}%")
            if min_price is not None:
                query += " AND price >= %s"
                params.append(min_price)
            if max_price is not None:
                query += " AND price <= %s"
                params.append(max_price)

            cursor.execute(query, tuple(params))
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
                vehicle.make, vehicle.model, vehicle.category, 
                vehicle.price, vehicle.quantity, vehicle_id
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

@router.post("/{vehicle_id}/purchase", status_code=status.HTTP_201_CREATED)
def purchase_vehicle(vehicle_id: str, purchase: PurchaseCreate, email: str = Depends(get_current_user_email)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, price, quantity FROM vehicles WHERE id = %s", (vehicle_id,))
            vehicle = cursor.fetchone()
            
            if not vehicle:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            vid = vehicle["id"] if isinstance(vehicle, dict) else vehicle[0]
            price = vehicle["price"] if isinstance(vehicle, dict) else vehicle[4]
            stock = vehicle["quantity"] if isinstance(vehicle, dict) else vehicle[5]

            if stock < purchase.quantity:
                raise HTTPException(status_code=400, detail="Insufficient stock available")

            total_price = float(price) * purchase.quantity
            order_id = str(uuid.uuid4())

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id VARCHAR(36) PRIMARY KEY,
                    user_email VARCHAR(255) NOT NULL,
                    vehicle_id VARCHAR(36) NOT NULL,
                    quantity INT NOT NULL,
                    total_price DECIMAL(10, 2) NOT NULL
                )
            """)

            cursor.execute(
                """
                INSERT INTO orders (id, user_email, vehicle_id, quantity, total_price) 
                VALUES (%s, %s, %s, %s, %s)
                """,
                (order_id, email, vid, purchase.quantity, total_price)
            )

            new_stock = stock - purchase.quantity
            cursor.execute(
                "UPDATE vehicles SET quantity = %s WHERE id = %s",
                (new_stock, vid)
            )

            connection.commit()

        return {
            "id": order_id,
            "user_email": email,
            "vehicle_id": vid,
            "quantity": purchase.quantity,
            "total_price": total_price
        }
    finally:
        connection.close()

@router.post("/{vehicle_id}/restock")
def restock_vehicle(vehicle_id: str, restock: RestockCreate, admin_user: dict = Depends(get_current_admin_user)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, quantity FROM vehicles WHERE id = %s", (vehicle_id,))
            vehicle = cursor.fetchone()
            
            if not vehicle:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            vid = vehicle["id"] if isinstance(vehicle, dict) else vehicle[0]
            current_stock = vehicle["quantity"] if isinstance(vehicle, dict) else vehicle[5]
            
            new_stock = current_stock + restock.quantity
            cursor.execute(
                "UPDATE vehicles SET quantity = %s WHERE id = %s",
                (new_stock, vid)
            )
            connection.commit()
            
        return {
            "id": vid,
            "message": "Vehicle restocked successfully",
            "new_quantity": new_stock
        }
    finally:
        connection.close()