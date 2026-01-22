"""
Hash Encoding Module
Applies hash encoding to categorical columns.
Uses hashing to map categories to fixed-size feature vectors.
"""

import pandas as pd
import numpy as np
import hashlib
from typing import Dict, Any, List


def apply_hash_encoding(
    df: pd.DataFrame,
    columns: List[str],
    n_features: int = 8,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply hash encoding to categorical columns.
    Uses hashing to map categories to fixed-size feature vectors.
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        n_features: Number of hash features to create (default: 8)
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    encoded_columns = []
    new_columns_created = []
    
    def hash_to_features(value: str, n_features: int) -> List[int]:
        """Convert a string value to a list of hash features"""
        # Create hash from value
        hash_obj = hashlib.md5(str(value).encode())
        hash_int = int(hash_obj.hexdigest(), 16)
        
        # Convert to binary and take n_features bits
        features = []
        for i in range(n_features):
            bit = (hash_int >> i) & 1
            features.append(bit)
        
        return features
    
    for col in columns:
        if col not in processed_df.columns:
            continue
        
        # Create hash feature columns
        hash_cols = [f"{col}_hash_{i}" for i in range(n_features)]
        new_columns_created.extend(hash_cols)
        
        # Apply hash encoding
        hash_data = processed_df[col].astype(str).apply(
            lambda x: hash_to_features(x, n_features)
        ).tolist()
        
        hash_df = pd.DataFrame(hash_data, columns=hash_cols, index=processed_df.index)
        processed_df = pd.concat([processed_df, hash_df], axis=1)
        
        # Drop original column
        processed_df = processed_df.drop(columns=[col])
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "new_columns_created": new_columns_created,
        "method": "hash_encoding"
    }
