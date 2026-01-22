"""
Yeo-Johnson Power Transformation Module
Applies Yeo-Johnson power transformation to numerical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import PowerTransformer


def apply_yeojohnson_scaling(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Yeo-Johnson power transformation to numerical columns.
    Yeo-Johnson can handle both positive and negative values.
    
    Args:
        df: Input DataFrame
        columns: List of column names to transform
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
        
        scaler = PowerTransformer(method="yeo-johnson", standardize=True)
        processed_df[col] = scaler.fit_transform(processed_df[[col]])
        scaled_columns.append(col)
        scalers[col] = {
            "method": "yeo-johnson",
            "lambdas": scaler.lambdas_.tolist() if hasattr(scaler, 'lambdas_') else []
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "yeojohnson_scaling"
    }
