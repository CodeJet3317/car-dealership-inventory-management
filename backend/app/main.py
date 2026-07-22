from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, vehicles, orders

app = FastAPI(title="Car Dealership Inventory System")

# Enable CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers (including Authorization)
)

# Include modular routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Car Dealership API"}