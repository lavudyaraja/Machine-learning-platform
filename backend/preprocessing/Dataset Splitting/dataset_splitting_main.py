"""
Dataset Splitting Main Module

This module serves as the main entry point for all dataset splitting operations.
It imports and exposes all splitting methods.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import sys
import io

# Add current directory to path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import individual method modules
from random_split import apply_random_split
from stratified_split import apply_stratified_split
from time_series_split import apply_time_series_split
from group_split import apply_group_split


def process_dataset_splitting(
    dataset_path: str,
    method: str,
    test_size: float = 0.2,
    validation_size: Optional[float] = None,
    random_state: int = 42,
    shuffle: bool = True,
    stratify_column: Optional[str] = None,
    time_column: Optional[str] = None,
    group_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process dataset splitting operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method: Splitting method - 'random', 'stratified', 'time_series', 'group'
        test_size: Proportion of dataset for test split (0.0 to 1.0)
        validation_size: Optional proportion for validation split
        random_state: Random state for reproducibility
        shuffle: Whether to shuffle data before splitting
        stratify_column: Column name for stratified splitting (required for 'stratified')
        time_column: Column name for time-based sorting (optional for 'time_series')
        group_column: Column name for group-based splitting (required for 'group')
        **kwargs: Additional method-specific parameters
        
    Returns:
        Dictionary with processed splits (CSV content) and metadata
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # Validate sizes
    total_size = test_size + (validation_size or 0)
    if total_size >= 1.0 or total_size <= 0:
        raise ValueError(f"Invalid split sizes: test_size={test_size}, validation_size={validation_size}. Total must be between 0 and 1.")
    
    # Apply splitting based on method
    if method == "random":
        result = apply_random_split(
            df,
            test_size=test_size,
            validation_size=validation_size,
            random_state=random_state,
            shuffle=shuffle,
            **kwargs
        )
    elif method == "stratified":
        if not stratify_column:
            raise ValueError("stratify_column is required for stratified splitting")
        result = apply_stratified_split(
            df,
            stratify_column=stratify_column,
            test_size=test_size,
            validation_size=validation_size,
            random_state=random_state,
            shuffle=shuffle,
            **kwargs
        )
    elif method == "time_series":
        result = apply_time_series_split(
            df,
            time_column=time_column,
            test_size=test_size,
            validation_size=validation_size,
            **kwargs
        )
    elif method == "group":
        if not group_column:
            raise ValueError("group_column is required for group splitting")
        result = apply_group_split(
            df,
            group_column=group_column,
            test_size=test_size,
            validation_size=validation_size,
            random_state=random_state,
            shuffle=shuffle,
            **kwargs
        )
    else:
        raise ValueError(f"Unknown splitting method: {method}")
    
    train_df = result["train_df"]
    test_df = result["test_df"]
    validation_df = result.get("validation_df", pd.DataFrame())
    
    # Convert DataFrames to CSV strings
    train_csv = train_df.to_csv(index=False)
    test_csv = test_df.to_csv(index=False)
    validation_csv = validation_df.to_csv(index=False) if not validation_df.empty else ""
    
    # Prepare response
    response = {
        "success": True,
        "splits": {
            "train": {
                "csv_content": train_csv,
                "rows": len(train_df),
                "columns": len(train_df.columns)
            },
            "test": {
                "csv_content": test_csv,
                "rows": len(test_df),
                "columns": len(test_df.columns)
            }
        },
        "original_rows": original_rows,
        "original_columns": original_cols,
        "method": result.get("method", method)
    }
    
    # Add validation split if present
    if not validation_df.empty:
        response["splits"]["validation"] = {
            "csv_content": validation_csv,
            "rows": len(validation_df),
            "columns": len(validation_df.columns)
        }
    
    return response


# Export all functions for direct access if needed
__all__ = [
    # Individual methods
    "apply_random_split",
    "apply_stratified_split",
    "apply_time_series_split",
    "apply_group_split",
    # Main function
    "process_dataset_splitting"
]
