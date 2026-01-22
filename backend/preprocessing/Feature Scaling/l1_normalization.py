"""
L1 Normalization Module
Applies L1 normalization (Manhattan norm) to numerical columns.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.preprocessing import Normalizer


def apply_l1_normalization(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply L1 normalization to numerical columns.
    Scales each row so that the sum of absolute values equals 1.
    
    Args:
        df: Input DataFrame
        columns: List of column names to normalize
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    normalized_columns = []
    scalers = {}
    
    # Get all numeric columns for normalization
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
            "method": "l1_normalization"
        }
    
    # Apply L1 normalization row-wise
    normalizer = Normalizer(norm='l1')
    processed_df[numeric_cols] = normalizer.fit_transform(processed_df[numeric_cols])
    
    normalized_columns = numeric_cols
    for col in normalized_columns:
        scalers[col] = {
            "norm": "l1",
            "description": "Sum of absolute values per row = 1"
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": normalized_columns,
        "scalers": scalers,
        "method": "l1_normalization"
    }
