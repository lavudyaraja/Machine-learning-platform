"""
Binary Encoding Module
Applies binary encoding to categorical columns.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List


def apply_binary_encoding(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply binary encoding to categorical columns.
    Binary encoding is useful for high cardinality categorical variables.
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    encoded_columns = []
    new_columns_created = []
    
    for col in columns:
        if col not in processed_df.columns:
            continue
        
        # Get unique values and create binary representation
        unique_values = sorted(processed_df[col].astype(str).unique())
        n_categories = len(unique_values)
        n_bits = int(np.ceil(np.log2(n_categories))) if n_categories > 1 else 1
        
        # Create binary mapping
        binary_mapping = {}
        for idx, val in enumerate(unique_values):
            binary_repr = format(idx, f'0{n_bits}b')
            binary_mapping[val] = [int(bit) for bit in binary_repr]
        
        # Create new binary columns
        binary_cols = [f"{col}_bin_{i}" for i in range(n_bits)]
        new_columns_created.extend(binary_cols)
        
        # Apply binary encoding
        binary_data = processed_df[col].astype(str).map(binary_mapping).tolist()
        binary_df = pd.DataFrame(binary_data, columns=binary_cols, index=processed_df.index)
        processed_df = pd.concat([processed_df, binary_df], axis=1)
        
        # Drop original column
        processed_df = processed_df.drop(columns=[col])
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "new_columns_created": new_columns_created,
        "method": "binary_encoding"
    }
