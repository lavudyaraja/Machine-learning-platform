"""
Robust Scaling Module
Applies robust scaling using median and IQR to numerical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import RobustScaler


def apply_robust_scaling(
    df: pd.DataFrame,
    columns: List[str],
    with_centering: bool = True,
    with_scaling: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply robust scaling (using median and IQR) to numerical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to scale
        with_centering: Whether to center the data using median
        with_scaling: Whether to scale using IQR
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
        
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        
        if processed_df[col].isna().all():
            continue
        
        scaler = RobustScaler(with_centering=with_centering, with_scaling=with_scaling)
        processed_df[col] = scaler.fit_transform(processed_df[[col]])
        scaled_columns.append(col)
        scalers[col] = {
            "center": float(scaler.center_[0]) if with_centering else 0,
            "scale": float(scaler.scale_[0]) if with_scaling else 1
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "robust_scaling"
    }
