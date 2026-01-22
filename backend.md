# Backend Setup Guide - Full Stack ML Platform

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    UI (Next.js Frontend)                    │
│  - User clicks "Train Model"                                │
│  - WebSocket connection for real-time updates               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP POST /api/jobs
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Route                              │
│  /api/jobs (POST)                                           │
│  - Receives training request                                │
│  - Forwards to FastAPI backend                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP POST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                     │
│  - POST /train (create training job)                       │
│  - GET /jobs/{job_id} (get job status)                      │
│  - WebSocket /ws/{job_id} (real-time updates)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Create Celery Task
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Redis (Port 6379)                               │
│  - Celery Task Queue (broker)                               │
│  - Task Results (backend)                                    │
│  - Pub/Sub Channels (real-time updates)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Consume Tasks
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Celery Workers                                  │
│  - Execute ML training tasks                                 │
│  - Publish progress to Redis                                  │
│  - Update job status                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Publish Updates
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Redis Pub/Sub                                  │
│  - Channel: job_{job_id}                                     │
│  - Progress, metrics, status updates                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Subscribe & Forward
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI WebSocket                               │
│  - Subscribes to Redis channel                              │
│  - Forwards updates to connected clients                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ WebSocket Messages
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              UI (Real-time Updates)                         │
│  - Receives progress updates                                │
│  - Updates UI (progress bar, metrics)                       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Components:
- **FastAPI**: Python web framework for API endpoints
- **Celery**: Distributed task queue for async processing
- **Redis**: Message broker, result backend, and pub/sub
- **WebSocket**: Real-time bidirectional communication
- **Python ML Libraries**: scikit-learn, pandas, numpy, joblib

### Pre-installed Python Libraries (in Celery Worker):
```
numpy                     # Numerical computations
pandas                    # Data manipulation
scipy                     # Statistical & mathematical functions

scikit-learn              # Encoders, scalers, imputers, PCA
category-encoders         # Target, Binary, CatBoost encodings
feature-engine            # Feature engineering & transformations
imbalanced-learn          # SMOTE & imbalance handling
statsmodels               # Statistical analysis & diagnostics

catboost                  # Native categorical handling
lightgbm                  # Categorical feature support
xgboost                   # Encoded categorical support

kmodes                    # K-Modes / K-Prototypes clustering

```

## Project Structure

```
project-root/
├── frontend/                    # Next.js (existing)
│   └── src/
│       └── app/
│           └── api/
│               └── jobs/
│                   └── route.ts
│
├── backend/                     # FastAPI (new)
│   ├── main.py                 # FastAPI application
│   ├── tasks.py                # Celery tasks
│   ├── websocket.py            # WebSocket handlers
│   ├── config.py               # Configuration
│   ├── models.py               # Data models
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
│
├── docker-compose.yml          # Redis setup
└── backend.md                  # This file
```

## Step 1: Install Dependencies

### 1.1 Install Redis

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

**Option B: Local Installation**
- Windows: Download from https://redis.io/download
- Mac: `brew install redis`
- Linux: `sudo apt-get install redis-server`

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### 1.2 Create Backend Directory

```bash
mkdir backend
cd backend
```

### 1.3 Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 1.4 Install Python Dependencies

Create `requirements.txt`:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
celery==5.3.4
redis==5.0.1
python-dotenv==1.0.0
pydantic==2.5.0
websockets==12.0
scikit-learn==1.3.2
pandas==2.1.4
numpy==1.24.3
joblib==1.3.2
xgboost==2.0.3
lightgbm==4.1.0
catboost==1.2.2
matplotlib==3.8.2
seaborn==0.13.0
```

Install:
```bash
pip install -r requirements.txt
```

## Step 2: Backend Configuration

### 2.1 Create `.env` file

Create `backend/.env`:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# FastAPI Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS (Frontend URL)
CORS_ORIGINS=http://localhost:3000

# Cloud Storage (if using)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=ml-platform-bucket
AWS_REGION=us-east-1
```

### 2.2 Create `config.py`


## Step 3: Create Celery Setup

### 3.1 Create `tasks.py`

# Redis connection for pub/sub

## Step 4: Create FastAPI Application

## Step 7: Running the System

### 7.1 Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or if installed locally
redis-server
```

### 7.2 Start Celery Worker

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
celery -A tasks worker --loglevel=info
```

### 7.3 Start FastAPI Server

```bash
cd backend
source venv/bin/activate
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7.4 Start Next.js Frontend

```bash
cd frontend  # or project root
npm run dev
```

## Step 8: Complete Training Flow

### 8.1 From UI to Model Training

1. **User Action**: User clicks "Train Model" button in UI
2. **Frontend**: Calls `/api/jobs` (Next.js API route)
3. **Next.js API**: Forwards to FastAPI `/train` endpoint
4. **FastAPI**: Creates Celery task, returns `job_id`
5. **Frontend**: Connects WebSocket to `/ws/{job_id}`
6. **Celery Worker**: Picks up task, starts training
7. **Training Loop**: Publishes progress to Redis channel
8. **FastAPI WebSocket**: Subscribes to Redis, forwards to client
9. **Frontend**: Receives updates, updates UI in real-time
10. **Completion**: Model saved, results sent to frontend

### 8.2 Example Request Flow

**1. Create Training Job:**
```http
POST http://localhost:3000/api/jobs
Content-Type: application/json

{
  "datasetId": "123",
  "targetColumn": "price",
  "modelConfig": {
    "selectedModel": "random_forest",
    "nEstimators": 100,
    "maxDepth": 10
  },
  "taskType": "regression"
}
```

**Response:**
```json
{
  "data": {
    "jobId": "job_1234567890",
    "status": "queued",
    "message": "Training job created successfully"
  }
}
```

**2. WebSocket Connection:**
```
ws://localhost:8000/ws/job_1234567890
```

**3. Real-time Updates:**
```json
// Progress update
{
  "type": "progress",
  "progress": 50,
  "epoch": 5,
  "total_epochs": 10,
  "metrics": {
    "accuracy": 0.85
  },
  "message": "Epoch 5/10 - Accuracy: 0.8500"
}

// Completion
{
  "type": "complete",
  "progress": 100,
  "results": {
    "status": "completed",
    "accuracy": 0.87,
    "model_path": "models/job_1234567890_model.pkl"
  },
  "message": "Training completed successfully!"
}
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_WS_URL=ws://localhost:8000
```

### Backend (.env)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
CORS_ORIGINS=http://localhost:3000
```

## Troubleshooting

### Common Issues:

1. **Redis Connection Error**
   - Check Redis is running: `redis-cli ping`
   - Verify port 6379 is not blocked
   - Check firewall settings

2. **Celery Worker Not Starting**
   - Verify Redis connection
   - Check Celery broker URL in config
   - Ensure all dependencies installed

3. **WebSocket Connection Failed**
   - Check FastAPI is running on port 8000
   - Verify CORS settings
   - Check WebSocket URL in frontend

4. **Training Task Not Executing**
   - Verify Celery worker is running
   - Check task is in Redis queue
   - Review Celery worker logs

## Production Considerations

### 1. Security
- Add authentication/authorization
- Use HTTPS/WSS for production
- Validate all inputs
- Sanitize file paths

### 2. Scalability
- Use Redis Cluster for high availability
- Multiple Celery workers
- Load balancer for FastAPI
- Database for job persistence

### 3. Monitoring
- Add logging (structured logs)
- Health check endpoints
- Metrics collection
- Error tracking

### 4. Deployment
- Docker containers for each service
- Docker Compose for local development
- Kubernetes for production
- CI/CD pipeline

## Next Steps

1. ✅ Set up Redis
2. ✅ Create backend structure
3. ✅ Install dependencies
4. ✅ Create FastAPI app
5. ✅ Set up Celery
6. ✅ Implement WebSocket
7. ✅ Update frontend
8. ✅ Test end-to-end flow
9. ✅ Add error handling
10. ✅ Deploy to production

---

**Note**: This is a complete guide. Follow steps sequentially. Each component builds on the previous one. Test each step before moving to the next.

