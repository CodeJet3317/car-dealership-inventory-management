import os
import uuid
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/orders", tags=["Orders"])
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key")
ALGORITHM = "HS256"

class OrderCreate(BaseModel):
    vehicle_id: str
    quantity: int

def get_current_user_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to extract the user email from the JWT token."""
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
def create_order(order: OrderCreate, email: str = Depends(get_current_user_email)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. Check if vehicle exists and get price & stock
            cursor.execute("SELECT id, price, quantity FROM vehicles WHERE id = %s", (order.vehicle_id,))
            vehicle = cursor.fetchone()
            
            if not vehicle:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            
            # Unpack based on dictionary or tuple cursor structure (depending on db setup, let's handle dict/tuple safety or standard dictionary cursor)
            # Assuming dictionary cursor based on previous queries:
            vehicle_id = vehicle["id"] if isinstance(vehicle, dict) else vehicle[0]
            price = vehicle["price"] if isinstance(vehicle, dict) else vehicle[4]
            stock = vehicle["quantity"] if isinstance(vehicle, dict) else vehicle[5]

            if stock < order.quantity:
                raise HTTPException(status_code=400, detail="Insufficient stock available")

            total_price = float(price) * order.quantity
            order_id = str(uuid.uuid4())

            # 2. Create the orders table if it doesn't exist yet, then insert order
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
                (order_id, email, vehicle_id, order.quantity, total_price)
            )

            # 3. Reduce inventory stock
            new_stock = stock - order.quantity
            cursor.execute(
                "UPDATE vehicles SET quantity = %s WHERE id = %s",
                (new_stock, vehicle_id)
            )

            connection.commit()

        return {
            "id": order_id,
            "user_email": email,
            "vehicle_id": vehicle_id,
            "quantity": order.quantity,
            "total_price": total_price
        }
    finally:
        connection.close()