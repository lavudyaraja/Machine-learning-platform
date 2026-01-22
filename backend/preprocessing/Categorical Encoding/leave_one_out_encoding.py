"""
Leave-One-Out Encoding Module
Applies leave-one-out encoding to categorical columns.
Target encoding variant that excludes the current row when calculating category means.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List


def apply_leave_one_out_encoding(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply leave-one-out encoding to categorical columns.
    Target encoding variant that excludes the current row when calculating category means.
    This prevents overfitting by excluding the current row's target value.
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        target_column: Name of the target column
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    processed_df = df.copy()
    encoded_columns = []
    mappings = {}
    
    for col in columns:
        if col not in processed_df.columns or col == target_column:
            continue
        
        # Calculate leave-one-out encoding for each row
        # This calculates mean for each row excluding itself from the same category
        loo_values = []
        
        for idx in processed_df.index:
            category = str(processed_df.loc[idx, col])
            
            # Get all rows with same category except current row
            category_mask = (processed_df[col].astype(str) == category) & (processed_df.index != idx)
            other_rows = processed_df[category_mask]
            
            if len(other_rows) > 0:
                # Calculate mean of target for other rows with same category
                loo_val = other_rows[target_column].mean()
            else:
                # If no other rows with same category, use overall mean
                loo_val = processed_df[target_column].mean()
            
            loo_values.append(loo_val)
        
        # Store mapping for reference (using category means for documentation)
        category_means = processed_df.groupby(col)[target_column].mean().to_dict()
        mappings[col] = category_means
        
        # Apply leave-one-out encoding directly (per-row calculation)
        processed_df[col] = loo_values
        
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "mappings": mappings,
        "method": "leave_one_out_encoding"
    }
