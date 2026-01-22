"""
Min-Max Scaling Module
Applies min-max normalization to numerical columns.
"""

import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.preprocessing import MinMaxScaler


def apply_minmax_scaling(
    df: pd.DataFrame,
    columns: List[str],
    feature_range: Tuple[float, float] = (0, 1),
    **kwargs
) -> Dict[str, Any]:
    """
    Apply min-max scaling to numerical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to scale
        feature_range: Desired range of transformed data (min, max)
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
        
        scaler = MinMaxScaler(feature_range=feature_range)
        processed_df[col] = scaler.fit_transform(processed_df[[col]])
        scaled_columns.append(col)
        scalers[col] = {
            "min": float(scaler.data_min_[0]),
            "max": float(scaler.data_max_[0]),
            "scale": float(scaler.scale_[0]),
            "min_shift": float(scaler.min_[0])
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "minmax_scaling"
    }
