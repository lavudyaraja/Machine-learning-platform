"""
Standard Scaling Module
Applies z-score normalization (standardization) to numerical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import StandardScaler


def apply_standard_scaling(
    df: pd.DataFrame,
    columns: List[str],
    with_mean: bool = True,
    with_std: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply standard scaling (z-score normalization) to numerical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to scale
        with_mean: Whether to center the data
        with_std: Whether to scale to unit variance
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    scaled_columns = []
    scalers = {}
    
    for col in columns:
        if col not in processed_df.columns:
            continue
        
        # Convert to numeric, coercing errors to NaN
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        
        # Skip if column has no valid numeric values
        if processed_df[col].isna().all():
            continue
        
        scaler = StandardScaler(with_mean=with_mean, with_std=with_std)
        processed_df[col] = scaler.fit_transform(processed_df[[col]])
        scaled_columns.append(col)
        scalers[col] = {
            "mean": float(scaler.mean_[0]) if with_mean else 0,
            "std": float(scaler.scale_[0]) if with_std else 1
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "standard_scaling"
    }
