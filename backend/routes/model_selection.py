"""Model selection endpoint"""
from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Optional
from pydantic import BaseModel

from .preprocessing_imports import process_model_selection

from .utils import resolve_dataset_path_from_id

router = APIRouter()

class ModelSelectionRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    model_type: str
    target_column: str
    task_type: str = "classification"
    n_neighbors: Optional[int] = None
    n_estimators: Optional[int] = None
    max_depth: Optional[int] = None
    C: Optional[float] = None
    kernel: Optional[str] = None

@router.post("/model-selection")
def model_selection(req: ModelSelectionRequest):
    """Process model selection and training"""
    try:
        # Resolve dataset path from ID or path
        # This will automatically restore the file from DB if it was deleted
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        valid_models = ["knn", "random_forest", "svm"]
        if req.model_type not in valid_models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model type: {req.model_type}. Valid models are: {', '.join(valid_models)}"
            )
        
        if req.task_type not in ["classification", "regression"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid task type: {req.task_type}. Must be 'classification' or 'regression'"
            )
        
        kwargs = {}
        if req.model_type == "knn" and req.n_neighbors:
            kwargs["n_neighbors"] = req.n_neighbors
        elif req.model_type == "random_forest":
            if req.n_estimators:
                kwargs["n_estimators"] = req.n_estimators
            if req.max_depth:
                kwargs["max_depth"] = req.max_depth
        elif req.model_type == "svm":
            if req.C:
                kwargs["C"] = req.C
            if req.kernel:
                kwargs["kernel"] = req.kernel
        
        result = process_model_selection(
            dataset_path=str(dataset_path),
            model_type=req.model_type,
            target_column=req.target_column,
            task_type=req.task_type,
            **kwargs
        )
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing model selection: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing model selection: {str(e)}")
