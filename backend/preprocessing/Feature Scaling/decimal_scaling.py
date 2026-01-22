"""
Decimal Scaling Module
Applies decimal scaling to numerical columns.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List


def apply_decimal_scaling(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply decimal scaling to numerical columns.
    Divides each value by 10^j where j is the smallest integer such that max(|value|/10^j) < 1.
    
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
        
        # Find the maximum absolute value
        max_abs = processed_df[col].abs().max()
        
        if max_abs == 0:
            # All values are zero, skip scaling
            continue
        
        # Calculate j: smallest integer such that max(|value|/10^j) < 1
        j = np.ceil(np.log10(max_abs))
        
        # Apply decimal scaling
        processed_df[col] = processed_df[col] / (10 ** j)
        
        scaled_columns.append(col)
        scalers[col] = {
            "j": float(j),
            "divisor": float(10 ** j),
            "max_abs_original": float(max_abs)
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "decimal_scaling"
    }
