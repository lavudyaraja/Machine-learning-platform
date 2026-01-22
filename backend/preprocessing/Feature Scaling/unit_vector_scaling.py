"""
Unit Vector Scaling Module
Applies unit vector scaling (normalize to unit length) to numerical columns.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.preprocessing import Normalizer


def apply_unit_vector_scaling(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply unit vector scaling to numerical columns.
    Scales each row to have unit length (same as L2 normalization).
    
    Args:
        df: Input DataFrame
        columns: List of column names to scale
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    scaled_columns = []
    scalers = {}
    
    # Get all numeric columns for scaling
    numeric_cols = []
    for col in columns:
        if col not in processed_df.columns:
            continue
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        if not processed_df[col].isna().all():
            numeric_cols.append(col)
    
    if len(numeric_cols) == 0:
        return {
            "processed_df": processed_df,
            "scaled_columns": [],
            "scalers": {},
            "method": "unit_vector_scaling"
        }
    
    # Apply unit vector scaling (L2 norm) row-wise
    normalizer = Normalizer(norm='l2')
    processed_df[numeric_cols] = normalizer.fit_transform(processed_df[numeric_cols])
    
    scaled_columns = numeric_cols
    for col in scaled_columns:
        scalers[col] = {
            "norm": "l2",
            "description": "Unit vector (length = 1)"
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "unit_vector_scaling"
    }
