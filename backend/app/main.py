"""
Car Dealership Inventory Management System - FastAPI REST API
--------------------------------------------------------------
Implements REST API endpoints for vehicle management using Raw SQL queries:
- POST /api/vehicles: Register a new vehicle to inventory
- GET  /api/vehicles: Retrieve all vehicles in inventory
- POST /api/vehicles/{vehicle_id}/purchase: Process a vehicle purchase transaction
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from .database import get_db_connection

# Initialize FastAPI application instance
app = FastAPI(
    title="Car Dealership Inventory System (Raw SQL)",
    description="API for managing vehicle inventory using parameterized Raw SQL queries",
    version="1.0.0"
)


# Pydantic schema model for vehicle creation payload validation
class VehicleCreate(BaseModel):
    make: str = Field(..., example="Toyota", description="Manufacturer / Brand of the vehicle")
    model: str = Field(..., example="Camry", description="Model name of the vehicle")
    category: str = Field(..., example="Sedan", description="Vehicle classification category")
    price: float = Field(..., gt=0, example=25000.0, description="Retail price (must be greater than 0)")
    quantity: int = Field(..., ge=0, example=10, description="Stock quantity (must be non-negative)")


@app.post("/api/vehicles", status_code=status.HTTP_201_CREATED)
def add_vehicle(vehicle: VehicleCreate):
    """
    Creates a new vehicle entry in the inventory database.

    - Uses parameterized SQL query (%s placeholders) to prevent SQL Injection.
    - Generates a unique UUID() for the vehicle primary key.
    - Commits transaction on success, rollbacks on error.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Raw SQL INSERT query using parameterized values for security
            sql = """
                INSERT INTO vehicles (id, make, model, category, price, quantity) 
                VALUES (UUID(), %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                vehicle.make, 
                vehicle.model, 
                vehicle.category, 
                vehicle.price, 
                vehicle.quantity
            ))
            # Commit the transaction to store the new vehicle record
            connection.commit()
            
        return {"message": "Vehicle added successfully"}
    
    except Exception as e:
        # Rollback transaction in case of database errors
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to insert vehicle: {str(e)}"
        )
    
    finally:
        # Guarantee connection resource cleanup
        connection.close()


@app.get("/api/vehicles")
def get_all_vehicles():
    """
    Retrieves all vehicle entries currently stored in the inventory.

    Returns:
        List of dictionaries containing vehicle record details.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Direct raw SQL SELECT query to retrieve all inventory rows
            cursor.execute("SELECT id, make, model, category, price, quantity FROM vehicles")
            vehicles = cursor.fetchall()
            
        return vehicles
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inventory: {str(e)}"
        )
    
    finally:
        # Guarantee connection resource cleanup
        connection.close()


@app.post("/api/vehicles/{vehicle_id}/purchase")
def purchase_vehicle(vehicle_id: str):
    """
    Executes a purchase transaction for a specified vehicle by ID.

    - Decrements stock quantity by 1 if quantity > 0.
    - Raises HTTP 400 Bad Request if vehicle doesn't exist or is out of stock.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Raw SQL UPDATE query with concurrency guard clause (quantity > 0)
            sql = "UPDATE vehicles SET quantity = quantity - 1 WHERE id = %s AND quantity > 0"
            rows_affected = cursor.execute(sql, (vehicle_id,))
            connection.commit()
            
            # If no rows were updated, vehicle is either missing or out of stock
            if rows_affected == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Vehicle not found or out of stock"
                )
                
        return {"message": "Vehicle purchased successfully"}
    
    except HTTPException:
        # Re-raise explicit HTTP exceptions (e.g. 400 Out of Stock)
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Purchase transaction failed: {str(e)}"
        )
    
    finally:
        # Guarantee connection resource cleanup
        connection.close()