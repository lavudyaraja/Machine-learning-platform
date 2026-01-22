"""Health check and root endpoints"""
from fastapi import APIRouter
from datetime import datetime
from config import Config
from database import check_db_connection
from .dependencies import get_redis_client

router = APIRouter()

@router.get("/")
def root():
    return {"status": "running"}

@router.get("/health")
def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Check Redis with retry
    client = get_redis_client()
    if client is None:
        health_status["status"] = "unhealthy"
        health_status["services"]["redis"] = {
            "status": "disconnected",
            "error": "Redis client not initialized",
            "host": Config.REDIS_HOST,
            "port": Config.REDIS_PORT
        }
    else:
        try:
            client.ping()
            health_status["services"]["redis"] = {
                "status": "connected",
                "host": Config.REDIS_HOST,
                "port": Config.REDIS_PORT
            }
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["services"]["redis"] = {
                "status": "disconnected",
                "error": str(e),
                "host": Config.REDIS_HOST,
                "port": Config.REDIS_PORT
            }
    
    # Check Celery
    try:
        from celery_app import celery_app
        broker_url = Config.CELERY_BROKER_URL.split("@")[-1] if "@" in Config.CELERY_BROKER_URL else "configured"
        health_status["services"]["celery"] = {
            "status": "available",
            "broker": broker_url
        }
    except Exception as e:
        health_status["services"]["celery"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check Database
    if check_db_connection():
        health_status["services"]["database"] = {
            "status": "connected",
            "type": "Neon PostgreSQL"
        }
    else:
        health_status["status"] = "unhealthy"
        health_status["services"]["database"] = {
            "status": "disconnected",
            "error": "Database connection failed"
        }
    
    return health_status
