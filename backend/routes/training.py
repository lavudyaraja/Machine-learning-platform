"""Training-related endpoints"""
import json
from fastapi import APIRouter, HTTPException
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel

from .dependencies import get_redis_client
from tasks import train_model_task

router = APIRouter()

class TrainRequest(BaseModel):
    dataset_path: str
    model_config: dict
    target_column: str
    task_type: str = "classification"

@router.post("/train")
def train_model(req: TrainRequest):
    """Create a new training job"""
    try:
        client = get_redis_client()
        if client is None:
            raise HTTPException(
                status_code=503,
                detail="Redis is not connected. Please ensure Redis server is running."
            )
        
        if not Path(req.dataset_path).exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {req.dataset_path}")
        
        job_id = f"job_{int(datetime.now().timestamp()*1000)}"
        
        try:
            task = train_model_task.delay(
                req.dataset_path,
                req.model_config,
                req.target_column,
                job_id,
                req.task_type
            )
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to create Celery task: {str(e)}. Ensure Celery worker is running."
            )
        
        try:
            client.set(
                f"job_status:{job_id}",
                json.dumps({
                    "job_id": job_id,
                    "status": "accepted",
                    "task_id": task.id,
                    "created_at": datetime.now().isoformat(),
                    "dataset_path": req.dataset_path,
                    "model_config": req.model_config,
                    "target_column": req.target_column,
                    "task_type": req.task_type
                })
            )
        except Exception as e:
            print(f"Warning: Failed to store job status in Redis: {e}")
        
        return {
            "job_id": job_id,
            "status": "accepted",
            "task_id": task.id,
            "message": "Training job created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/jobs/{job_id}")
def job_status(job_id: str):
    """Get the status of a training job"""
    try:
        client = get_redis_client()
        if client is None:
            raise HTTPException(status_code=503, detail="Redis is not connected")
        
        data = client.get(f"job_status:{job_id}")
        if not data:
            raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
        
        return json.loads(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting job status: {str(e)}")

@router.post("/jobs/{job_id}/pause")
def pause_job(job_id: str):
    """Pause a running training job"""
    try:
        client = get_redis_client()
        if client is None:
            raise HTTPException(status_code=503, detail="Redis is not connected")
        
        data = client.get(f"job_status:{job_id}")
        if not data:
            raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
        
        job_data = json.loads(data)
        current_status = job_data.get("status")
        
        if current_status not in ["running", "paused"]:
            raise HTTPException(status_code=400, detail=f"Cannot pause job. Current status: {current_status}")
        
        client.set(f"job_pause:{job_id}", "true")
        
        job_data["status"] = "paused"
        job_data["message"] = "Training paused by user"
        client.set(f"job_status:{job_id}", json.dumps(job_data))
        
        try:
            client.publish(
                f"job_{job_id}",
                json.dumps({
                    "type": "status",
                    "status": "paused",
                    "message": "Training paused. Click Resume to continue."
                })
            )
        except Exception as e:
            print(f"Error publishing pause update: {e}")
        
        return {"job_id": job_id, "status": "paused", "message": "Job paused successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error pausing job: {str(e)}")

@router.post("/jobs/{job_id}/resume")
def resume_job(job_id: str):
    """Resume a paused training job"""
    try:
        client = get_redis_client()
        if client is None:
            raise HTTPException(status_code=503, detail="Redis is not connected")
        
        data = client.get(f"job_status:{job_id}")
        if not data:
            raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
        
        job_data = json.loads(data)
        current_status = job_data.get("status")
        
        if current_status not in ["paused", "running"]:
            raise HTTPException(status_code=400, detail=f"Cannot resume job. Current status: {current_status}")
        
        client.delete(f"job_pause:{job_id}")
        
        job_data["status"] = "running"
        job_data["message"] = "Training resumed"
        client.set(f"job_status:{job_id}", json.dumps(job_data))
        
        try:
            client.publish(
                f"job_{job_id}",
                json.dumps({
                    "type": "status",
                    "status": "running",
                    "message": "Training resumed"
                })
            )
        except Exception as e:
            print(f"Error publishing resume update: {e}")
        
        return {"job_id": job_id, "status": "running", "message": "Job resumed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resuming job: {str(e)}")

@router.post("/jobs/{job_id}/stop")
def stop_job(job_id: str):
    """Stop/Cancel a training job"""
    try:
        client = get_redis_client()
        if client is None:
            raise HTTPException(status_code=503, detail="Redis is not connected")
        
        data = client.get(f"job_status:{job_id}")
        if not data:
            raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
        
        job_data = json.loads(data)
        task_id = job_data.get("task_id")
        
        if task_id:
            from celery_app import celery_app
            celery_app.control.revoke(task_id, terminate=True)
        
        job_data["status"] = "cancelled"
        job_data["message"] = "Training cancelled by user"
        client.set(f"job_status:{job_id}", json.dumps(job_data))
        
        client.delete(f"job_pause:{job_id}")
        
        return {"job_id": job_id, "status": "cancelled", "message": "Job stopped successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error stopping job: {str(e)}")
