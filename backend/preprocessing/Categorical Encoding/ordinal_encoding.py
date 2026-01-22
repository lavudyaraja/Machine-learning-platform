"""
Ordinal Encoding Module
Applies ordinal encoding to categorical columns.
"""

import pandas as pd
from typing import Dict, Any, List, Optional


def apply_ordinal_encoding(
    df: pd.DataFrame,
    columns: List[str],
    ordinal_mapping: Optional[Dict[str, Dict[str, int]]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply ordinal encoding to categorical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        ordinal_mapping: Optional mapping of categories to integers
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
        
        if ordinal_mapping and col in ordinal_mapping:
            # Use provided mapping
            mapping = ordinal_mapping[col]
            processed_df[col] = processed_df[col].astype(str).map(mapping)
            mappings[col] = mapping
        else:
            # Auto-generate mapping based on sorted unique values
            unique_values = sorted(processed_df[col].astype(str).unique())
            mapping = {val: idx for idx, val in enumerate(unique_values)}
            processed_df[col] = processed_df[col].astype(str).map(mapping)
            mappings[col] = mapping
        
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "mappings": mappings,
        "method": "ordinal_encoding"
    }
