"""
Model Selection Main Module

This module serves as the main entry point for all model selection operations.
It imports and exposes all model implementations.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import sys
import pickle
import os

# Add current directory to path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import individual model modules
from knn import apply_knn
from random_forest import apply_random_forest
from svm import apply_svm


def process_model_selection(
    dataset_path: str,
    model_type: str,
    target_column: str,
    task_type: str = "classification",
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process model selection operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        model_type: Model type - 'knn', 'random_forest', 'svm'
        target_column: Target column name
        task_type: 'classification' or 'regression'
        **kwargs: Model-specific parameters
        
    Returns:
        Dictionary with model results and metrics
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # Validate target column
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    # Apply model based on type
    if model_type == "knn":
        result = apply_knn(
            df,
            target_column=target_column,
            task_type=task_type,
            **kwargs
        )
    elif model_type == "random_forest":
        result = apply_random_forest(
            df,
            target_column=target_column,
            task_type=task_type,
            **kwargs
        )
    elif model_type == "svm":
        result = apply_svm(
            df,
            target_column=target_column,
            task_type=task_type,
            **kwargs
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Save model to file (optional)
    models_dir = Path(__file__).parent.parent.parent / "models"
    models_dir.mkdir(exist_ok=True)
    
    model_filename = f"{model_type}_{int(pd.Timestamp.now().timestamp())}.pkl"
    model_path = models_dir / model_filename
    
    # Save model and related objects
    model_data = {
        "model": result["model"],
        "model_type": result["model_type"],
        "task_type": result["task_type"],
        "target_encoder": result.get("target_encoder"),
        "label_encoders": result.get("label_encoders"),
        "scaler": result.get("scaler"),
        "target_column": target_column,
        "feature_columns": df.drop(columns=[target_column]).columns.tolist()
    }
    
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    # Prepare response
    response = {
        "success": True,
        "model_type": result["model_type"],
        "task_type": result["task_type"],
        "metrics": result["metrics"],
        "model_path": str(model_path),
        "original_rows": original_rows,
        "original_columns": original_cols,
        "predictions": result["predictions"][:100] if len(result["predictions"]) > 100 else result["predictions"]  # Limit predictions in response
    }
    
    return response


# Export all functions for direct access if needed
__all__ = [
    # Individual models
    "apply_knn",
    "apply_random_forest",
    "apply_svm",
    # Main function
    "process_model_selection"
]
