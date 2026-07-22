from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title="Car Dealership Inventory System")

# Include the modular routers
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Car Dealership API"}