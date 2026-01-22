"""
Box-Cox Power Transformation Module
Applies Box-Cox power transformation to numerical columns.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.preprocessing import PowerTransformer
import warnings
warnings.filterwarnings('ignore')


def apply_box_cox_scaling(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Box-Cox power transformation to numerical columns.
    Box-Cox requires all values to be positive.
    
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
        
        # Box-Cox requires positive values
        if (processed_df[col] <= 0).any():
            # Skip columns with non-positive values
            continue
        
        try:
            scaler = PowerTransformer(method="box-cox", standardize=True)
            processed_df[col] = scaler.fit_transform(processed_df[[col]])
            scaled_columns.append(col)
            scalers[col] = {
                "method": "box-cox",
                "lambda": float(scaler.lambdas_[0]) if hasattr(scaler, 'lambdas_') and len(scaler.lambdas_) > 0 else None
            }
        except Exception as e:
            # If Box-Cox fails, skip this column
            continue
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "box_cox_scaling"
    }
