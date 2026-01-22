"""
MaxAbs Scaling Module
Applies max-absolute scaling to numerical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import MaxAbsScaler


def apply_maxabs_scaling(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply max-abs scaling to numerical columns.
    
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
    
    for col in columns:
        if col not in processed_df.columns:
            continue
        
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        
        if processed_df[col].isna().all():
            continue
        
        scaler = MaxAbsScaler()
        processed_df[col] = scaler.fit_transform(processed_df[[col]])
        scaled_columns.append(col)
        scalers[col] = {
            "max_abs": float(scaler.max_abs_[0])
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "maxabs_scaling"
    }
