import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for ML Platform Backend"""
    
    # Redis Configuration
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

    # FastAPI Configuration
    FASTAPI_HOST = os.getenv("FASTAPI_HOST", "0.0.0.0")
    FASTAPI_PORT = int(os.getenv("FASTAPI_PORT", 8000))

    # Celery Configuration
    CELERY_BROKER_URL = os.getenv(
        "CELERY_BROKER_URL", 
        f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
    )
    CELERY_RESULT_BACKEND = os.getenv(
        "CELERY_RESULT_BACKEND", 
        f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
    )

    # CORS Configuration
    CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]
    
    # Database Configuration (Neon PostgreSQL)
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_Ebr9Z2zyRliV@ep-damp-cloud-a1rvdjc4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )
    
    # Database connection pool settings
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 5))
    DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", 10))
    DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", 30))
    DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", 3600))
    
    @classmethod
    def validate(cls):
        """Validate configuration values"""
        errors = []
        
        if not cls.REDIS_HOST:
            errors.append("REDIS_HOST is not set")
        
        if not (1 <= cls.REDIS_PORT <= 65535):
            errors.append(f"Invalid REDIS_PORT: {cls.REDIS_PORT}")
        
        if not (0 <= cls.REDIS_DB <= 15):
            errors.append(f"Invalid REDIS_DB: {cls.REDIS_DB}")
        
        if not (1 <= cls.FASTAPI_PORT <= 65535):
            errors.append(f"Invalid FASTAPI_PORT: {cls.FASTAPI_PORT}")
        
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
        
        return True
