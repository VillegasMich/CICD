from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import health
import os

app = FastAPI(title="Bicycle Rental App")

app.include_router(health.router, prefix="/api/v1")

# Serve React frontend in production
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
