"""Shared dependencies and constants for routes"""
from pathlib import Path
import redis
from redis.exceptions import ConnectionError as RedisConnectionError
from config import Config

# Redis client with connection error handling
redis_client = None

def get_redis_client():
    """Get or create Redis client with connection retry"""
    global redis_client
    
    if redis_client is not None:
        try:
            # Test connection
            redis_client.ping()
            return redis_client
        except (RedisConnectionError, Exception) as e:
            print(f"⚠️  Warning: Redis connection lost, reconnecting: {e}")
            redis_client = None
    
    # Create new connection
    try:
        redis_client = redis.Redis(
            host=Config.REDIS_HOST,
            port=Config.REDIS_PORT,
            db=Config.REDIS_DB,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        redis_client.ping()
        return redis_client
    except RedisConnectionError as e:
        print(f"⚠️  Warning: Redis connection failed: {e}")
        print(f"   Make sure Redis is running on {Config.REDIS_HOST}:{Config.REDIS_PORT}")
        redis_client = None
        return None
    except Exception as e:
        print(f"⚠️  Warning: Redis initialization error: {e}")
        redis_client = None
        return None

# Initialize Redis client on module import
try:
    redis_client = get_redis_client()
except Exception as e:
    print(f"⚠️  Warning: Redis not available at startup: {e}")

# Directory constants
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)
