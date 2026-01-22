"""Simplified main.py - imports all routes from routes package"""
import asyncio
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import Config
from database import check_db_connection
from routes.dependencies import get_redis_client, UPLOAD_DIR, MODELS_DIR
from routes.utils import create_error_response

# Import all route modules
from routes import health, datasets, preprocessing, training, model_selection, websocket

app = FastAPI(title="ML Platform Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add explicit OPTIONS handler for CORS preflight
@app.options("/{path:path}")
async def options_handler(path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return JSONResponse(
        status_code=200,
        content={"message": "OK"}
    )

# Exception handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Ensure HTTPException always returns proper JSON with all error fields"""
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(exc.detail)
    )

# Global exception handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions and return proper JSON error response"""
    import traceback
    error_trace = traceback.format_exc()
    
    # Log full error in development/server logs
    print(f"Unhandled exception: {str(exc)}")
    print(f"Traceback: {error_trace}")
    
    # In production, don't expose internal details
    is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
    error_message = "Internal server error" if is_production else f"Internal server error: {str(exc)}"
    
    return JSONResponse(
        status_code=500,
        content=create_error_response(error_message)
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Verify connections on startup"""
    print("Starting ML Platform Backend...")
    
    # Check Redis with retry
    max_retries = 3
    for attempt in range(max_retries):
        client = get_redis_client()
        if client is not None:
            try:
                client.ping()
                print(f"Redis connected: {Config.REDIS_HOST}:{Config.REDIS_PORT}")
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"Redis connection attempt {attempt + 1} failed, retrying...")
                    await asyncio.sleep(2)
                else:
                    print(f"Redis connection failed after {max_retries} attempts: {e}")
        else:
            if attempt < max_retries - 1:
                print(f"Redis not available, retrying in 2 seconds... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(2)
            else:
                print("Warning: Redis client not initialized after retries")
    
    # Check database connection
    if check_db_connection():
        print("Database (Neon PostgreSQL) connected")
    else:
        print("Warning: Database connection failed")
    
    # Check directories
    print(f"Upload directory: {UPLOAD_DIR.absolute()}")
    print(f"Models directory: {MODELS_DIR.absolute()}")
    print("Backend ready!")

# Include routers
app.include_router(health.router)
app.include_router(datasets.router)
app.include_router(preprocessing.router)
app.include_router(training.router)
app.include_router(model_selection.router)
app.add_websocket_route("/ws/{job_id}", websocket.websocket_endpoint)

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    print(f"Server will run on http://{Config.FASTAPI_HOST}:{Config.FASTAPI_PORT}")
    print(f"API docs available at http://{Config.FASTAPI_HOST}:{Config.FASTAPI_PORT}/docs")
    uvicorn.run(
        "main:app",
        host=Config.FASTAPI_HOST,
        port=Config.FASTAPI_PORT,
        reload=True
    )
