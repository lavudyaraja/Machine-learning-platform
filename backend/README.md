# ML Platform Backend

FastAPI + Celery + Redis + WebSocket + Neon PostgreSQL backend for ML model training.

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# FastAPI Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Neon PostgreSQL Database Configuration
DATABASE_URL=postgresql://your-connection-string-here

# Database Connection Pool Settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

The `.env` file is already created with the Neon database connection string.

### 3. Initialize Database

```bash
# Initialize database tables (run once)
python init_database.py

# Or test database connection only
python database.py
```

The `init_database.py` script will:
- Check database connection
- Create all required tables (datasets, training_jobs, preprocessing_steps)

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or if installed locally
redis-server
```

### 5. Start Celery Worker

```bash
# Option 1: Using tasks module (recommended)
celery -A tasks worker --loglevel=info

# Option 2: Using celery_app module (alternative)
celery -A celery_app worker --loglevel=info
```

### 6. Start FastAPI Server

```bash
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `POST /train` - Create training job
- `GET /jobs/{job_id}` - Get job status
- `WebSocket /ws/{job_id}` - Real-time updates

## Database

The project uses **Neon PostgreSQL** for persistent data storage. The database connection is configured in the `.env` file.

### Database Models

Example models are provided in `models.py`:
- `Dataset` - Store dataset metadata
- `TrainingJob` - Store training job information
- `PreprocessingStep` - Store preprocessing step information

### Using the Database

```python
from database import get_db, get_db_context
from models import Dataset
from fastapi import Depends
from sqlalchemy.orm import Session

# In FastAPI routes (recommended)
@app.get("/datasets")
def get_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).all()

# Using context manager
with get_db_context() as db:
    dataset = Dataset(name="My Dataset", filename="data.csv")
    db.add(dataset)
    # db.commit() is called automatically
```

### Database Connection Check

The database connection is automatically checked on startup and in the `/health` endpoint.

## Environment Variables

See `.env` file for configuration. The database connection string is already configured for Neon PostgreSQL.

