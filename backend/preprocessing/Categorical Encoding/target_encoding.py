"""
Target Encoding Module
Applies target encoding (mean encoding) to categorical columns.
"""

import pandas as pd
from typing import Dict, Any, List


def apply_target_encoding(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply target encoding (mean encoding) to categorical columns.
    
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
        
        # Calculate mean target value for each category
        target_means = processed_df.groupby(col)[target_column].mean().to_dict()
        mappings[col] = target_means
        
        # Apply target encoding
        processed_df[col] = processed_df[col].astype(str).map(target_means)
        
        # Fill NaN with overall mean (for unseen categories)
        overall_mean = processed_df[target_column].mean()
        processed_df[col] = processed_df[col].fillna(overall_mean)
        
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "mappings": mappings,
        "method": "target_encoding"
    }
