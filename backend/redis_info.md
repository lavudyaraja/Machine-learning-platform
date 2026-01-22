# Redis Access Guide

## ❌ Don't Access Redis via Browser
Redis is NOT a web server. Accessing `localhost:6379` in a browser will trigger security warnings.

## ✅ Correct Ways to Access Redis

### 1. Redis CLI (Command Line)
If Redis CLI is installed:
```bash
redis-cli
```

Then use commands:
- `PING` - Test connection
- `KEYS *` - List all keys
- `GET key_name` - Get a value
- `FLUSHALL` - Clear all data (use carefully!)

### 2. Redis GUI Tools (Optional)
If you want a visual interface, install:
- **RedisInsight** (Official Redis GUI)
- **Redis Desktop Manager**
- **Another Redis Desktop Manager**

### 3. Python Script (For Testing)
```python
import redis
from config import Config

r = redis.Redis(
    host=Config.REDIS_HOST,
    port=Config.REDIS_PORT,
    db=Config.REDIS_DB
)

# Test connection
print(r.ping())  # Should return True

# List keys
keys = r.keys('*')
print(f"Keys: {keys}")
```

## ✅ Your Setup is Correct
- Redis server is running ✅
- Backend can connect ✅
- No browser access needed ✅

Just start FastAPI and Celery worker - they will automatically use Redis!

