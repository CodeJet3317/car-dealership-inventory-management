import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import auth, vehicles, orders
from app.database import init_db, seed_default_admin

app = FastAPI(title="Car Dealership Inventory System")

@app.on_event("startup")
def startup_event():
    init_db()
    seed_default_admin()

# Enable CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers (including Authorization)
)

# Include API routers first (API routes take precedence)
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(orders.router)

# Resolve path to frontend build output directory (frontend/dist)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

# Mount compiled static assets if the directory exists
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Catch-all route to serve the React SPA build (index.html) for all non-API paths
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    # Check if a specific file exists in frontend/dist (e.g. favicon, images)
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA client-side routing
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "Welcome to the Car Dealership API. Run 'npm run build' in frontend/ to serve the React SPA."}