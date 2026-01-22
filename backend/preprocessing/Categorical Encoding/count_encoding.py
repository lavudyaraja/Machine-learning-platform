"""
Count Encoding Module
Applies count encoding to categorical columns.
Replaces categories with their total occurrence counts.
"""

import pandas as pd
from typing import Dict, Any, List


def apply_count_encoding(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply count encoding to categorical columns.
    Replaces categories with their total occurrence counts.
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    encoded_columns = []
    mappings = {}
    
    for col in columns:
        if col not in processed_df.columns:
            continue
        
        # Calculate count for each category
        count_map = processed_df[col].astype(str).value_counts().to_dict()
        mappings[col] = count_map
        
        # Apply count encoding
        processed_df[col] = processed_df[col].astype(str).map(count_map)
        
        # Fill NaN with 0 (for unseen categories)
        processed_df[col] = processed_df[col].fillna(0)
        
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "mappings": mappings,
        "method": "count_encoding"
    }
