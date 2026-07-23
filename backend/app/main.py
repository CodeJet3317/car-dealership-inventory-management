"""
Main application entry point for the Car Dealership Inventory FastAPI service.

This module initializes the FastAPI application instance, configures CORS middleware
for frontend communication, registers API routers, and sets up startup database handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, vehicles, orders
from app.database import init_db, seed_default_admin

# Initialize FastAPI application instance with custom title for OpenAPI documentation
app = FastAPI(title="Car Dealership Inventory System")

@app.on_event("startup")
def startup_event():
    """
    Application startup event handler.
    Ensures that database tables are initialized and default admin credentials are seeded.
    """
    init_db()
    seed_default_admin()

# Enable Cross-Origin Resource Sharing (CORS) middleware
# Allows requests from the React frontend running on different origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers (including Authorization Bearer token)
)

# Register modular API routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(orders.router)

@app.get("/")
def root():
    """
    Root endpoint for health check and welcoming API consumers.
    """
    return {"message": "Welcome to the Car Dealership API"}