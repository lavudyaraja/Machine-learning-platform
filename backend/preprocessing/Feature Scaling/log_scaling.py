"""
Log Scaling Module
Applies logarithmic transformation to numerical columns.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List


def apply_log_scaling(
    df: pd.DataFrame,
    columns: List[str],
    base: float = np.e,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply logarithmic transformation to numerical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to transform
        base: Base of logarithm (default: e for natural log)
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
        
        # Log scaling requires positive values
        if (processed_df[col] <= 0).any():
            # Add a small constant to make all values positive
            min_val = processed_df[col].min()
            if min_val <= 0:
                shift = abs(min_val) + 1
                processed_df[col] = processed_df[col] + shift
                scalers[col] = {
                    "base": base,
                    "shift": float(shift),
                    "note": "Added shift to handle non-positive values"
                }
            else:
                scalers[col] = {
                    "base": base,
                    "shift": 0
                }
        else:
            scalers[col] = {
                "base": base,
                "shift": 0
            }
        
        # Apply logarithmic transformation
        if base == np.e:
            processed_df[col] = np.log(processed_df[col])
        elif base == 2:
            processed_df[col] = np.log2(processed_df[col])
        elif base == 10:
            processed_df[col] = np.log10(processed_df[col])
        else:
            processed_df[col] = np.log(processed_df[col]) / np.log(base)
        
        scaled_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "log_scaling"
    }
