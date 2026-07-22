from fastapi import FastAPI
from app.routers import auth, vehicles

app = FastAPI(title="Car Dealership Inventory System")

# Include modular routers
app.include_router(auth.router)
app.include_router(vehicles.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Car Dealership API"}