# Model Training Guide

## 🚀 Quick Start - Model Training

### Step 1: Start All Services

**Terminal 1 - Redis Server:**
```bash
# Already running from D:\Redis-x64-5.0.14.1\redis-server.exe
# ✅ Redis is running on port 6379
```

**Terminal 2 - FastAPI Server:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3 - Celery Worker:**
```bash
cd backend
# Make sure you're in the backend directory and virtual environment is activated
celery -A tasks worker --loglevel=info

# If the above doesn't work, try:
# celery -A celery_app worker --loglevel=info
```

**Terminal 4 - Next.js Frontend (Optional):**
```bash
npm run dev
```

---

## 📋 Method 1: Train Model via API (Python Script)

### Option A: Using Test Script

```bash
cd backend
python test_upload.py
```

**Input prompts:**
1. Enter CSV file path (e.g., `../data/datasets/1767367119314-y5iz7k-iris.csv`)
2. Enter target column name (e.g., `species`)
3. Enter task type: `classification` or `regression`

### Option B: Using Python Requests

```python
import requests
import json

FASTAPI_URL = "http://localhost:8000"

# Step 1: Upload CSV file
with open("path/to/your/file.csv", "rb") as f:
    files = {"file": ("dataset.csv", f, "text/csv")}
    upload_response = requests.post(
        f"{FASTAPI_URL}/upload",
        files=files
    )
    upload_data = upload_response.json()
    file_path = upload_data["file_path"]

# Step 2: Start training
train_request = {
    "dataset_path": file_path,
    "model_config": {
        "model_type": "random_forest",
        "n_estimators": 100,
        "max_depth": 10
    },
    "target_column": "species",  # Your target column name
    "task_type": "classification"  # or "regression"
}

response = requests.post(
    f"{FASTAPI_URL}/train",
    json=train_request
)

result = response.json()
print(f"Job ID: {result['job_id']}")
print(f"Status: {result['status']}")
print(f"WebSocket: ws://localhost:8000/ws/{result['job_id']}")
```

---

## 📋 Method 2: Train Model via cURL

### Step 1: Upload CSV File
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@path/to/your/file.csv"
```

**Response:**
```json
{
  "file_path": "uploads/1767809328599_dataset.csv",
  "filename": "1767809328599_dataset.csv",
  "size": 12345,
  "message": "File uploaded successfully"
}
```

### Step 2: Start Training Job
```bash
curl -X POST "http://localhost:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_path": "uploads/1767809328599_dataset.csv",
    "model_config": {
      "model_type": "random_forest",
      "n_estimators": 100,
      "max_depth": 10
    },
    "target_column": "species",
    "task_type": "classification"
  }'
```

**Response:**
```json
{
  "job_id": "job_1767809328599",
  "status": "queued",
  "message": "Training job created successfully",
  "task_id": "8bf98867-b6ac-411e-b4b4-00fad57435fb",
  "created_at": "2026-01-07T23:38:48.601413"
}
```

### Step 3: Check Job Status
```bash
curl "http://localhost:8000/jobs/job_1767809328599"
```

---

## 📋 Method 3: Train Model via UI

1. **Start Next.js Frontend:**
   ```bash
   npm run dev
   ```

2. **Open Browser:**
   - Go to `http://localhost:3000`
   - Navigate to Model Training page

3. **Select:**
   - Dataset
   - Target column
   - Model type (Random Forest, XGBoost, LightGBM, CatBoost)
   - Task type (Classification/Regression)

4. **Click "Train Model"**
   - Job ID will be created
   - WebSocket connects automatically
   - Real-time progress updates in UI

---

## 🔄 Real-time Updates via WebSocket

### Connect to WebSocket:
```javascript
const ws = new WebSocket("ws://localhost:8000/ws/job_1767809328599");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Update:", data);
  
  // Progress update
  if (data.type === "progress") {
    console.log(`Progress: ${data.progress}%`);
    console.log(`Epoch: ${data.epoch}/${data.total_epochs}`);
    console.log(`Metrics:`, data.metrics);
  }
  
  // Completion
  if (data.type === "complete") {
    console.log("Training completed!");
    console.log("Results:", data.results);
  }
  
  // Error
  if (data.type === "error") {
    console.error("Error:", data.error);
  }
};
```

---

## 📊 Example Training Flow

### 1. Upload Dataset
```bash
POST /upload
→ Returns: file_path
```

### 2. Create Training Job
```bash
POST /train
Body: {
  "dataset_path": "uploads/xxx.csv",
  "model_config": {
    "model_type": "random_forest",
    "n_estimators": 100
  },
  "target_column": "target",
  "task_type": "classification"
}
→ Returns: job_id
```

### 3. Connect WebSocket
```bash
WS /ws/{job_id}
→ Receives real-time updates
```

### 4. Monitor Progress
- Progress: 0% → 100%
- Epochs: 1/10, 2/10, ...
- Metrics: accuracy, loss, etc.

### 5. Get Results
- Model saved to: `models/{job_id}_model.pkl`
- Results include: accuracy, metrics, model path

---

## 🎯 Supported Models

### Classification:
- `random_forest` - Random Forest Classifier
- `xgboost` - XGBoost Classifier
- `lightgbm` - LightGBM Classifier
- `catboost` - CatBoost Classifier

### Regression:
- `random_forest` - Random Forest Regressor
- `xgboost` - XGBoost Regressor
- `lightgbm` - LightGBM Regressor
- `catboost` - CatBoost Regressor

---

## ⚙️ Model Configuration

```json
{
  "model_type": "random_forest",
  "n_estimators": 100,      // Number of trees
  "max_depth": 10,          // Max tree depth (null = unlimited)
  "min_samples_split": 2,   // Min samples to split
  "min_samples_leaf": 1     // Min samples in leaf
}
```

---

## 📁 File Locations

- **Uploaded datasets:** `backend/uploads/`
- **Trained models:** `backend/models/`
- **Job status:** Redis (expires in 1 hour)

---

## 🔍 Troubleshooting

### Error: "Job not found"
- Job expired (1 hour TTL)
- Check Redis is running
- Verify job_id is correct

### Error: "Connection refused"
- Check Redis is running: `redis-cli ping`
- Check FastAPI is running: `curl http://localhost:8000/health`
- Check Celery worker is running

### Training stuck at "queued"
- Check Celery worker is running
- Check worker logs for errors
- Verify dataset file exists

---

## ✅ Quick Test

```bash
# 1. Check services
curl http://localhost:8000/health

# 2. Upload test file
curl -X POST "http://localhost:8000/upload" -F "file=@test.csv"

# 3. Start training
curl -X POST "http://localhost:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_path": "uploads/xxx.csv",
    "model_config": {"model_type": "random_forest"},
    "target_column": "target",
    "task_type": "classification"
  }'
```

---

## 🎉 Success!

After training completes:
- ✅ Model saved to `models/{job_id}_model.pkl`
- ✅ Results available via WebSocket
- ✅ Metrics: accuracy, classification_report, etc.
- ✅ Model ready for deployment!

