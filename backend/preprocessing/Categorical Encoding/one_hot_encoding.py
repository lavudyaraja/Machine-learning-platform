"""
One-Hot Encoding Module
Applies one-hot encoding to categorical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import OneHotEncoder


def apply_one_hot_encoding(
    df: pd.DataFrame,
    columns: List[str],
    drop_first: bool = False,
    handle_unknown: str = "ignore",
    **kwargs
) -> Dict[str, Any]:
    """
    Apply one-hot encoding to categorical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        drop_first: Whether to drop the first category
        handle_unknown: How to handle unknown categories ('ignore' or 'error')
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
        
        # Get unique values
        unique_values = processed_df[col].astype(str).unique()
        categories = [unique_values] if handle_unknown == "error" else "auto"
        
        # Apply one-hot encoding
        ohe = OneHotEncoder(
            drop='first' if drop_first else None,
            sparse_output=False,
            handle_unknown=handle_unknown
        )
        
        encoded_data = ohe.fit_transform(processed_df[[col]])
        
        # Create new column names
        feature_names = ohe.get_feature_names_out([col])
        new_columns_created.extend(feature_names.tolist())
        
        # Add encoded columns to dataframe
        encoded_df = pd.DataFrame(encoded_data, columns=feature_names, index=processed_df.index)
        processed_df = pd.concat([processed_df, encoded_df], axis=1)
        
        # Drop original column
        processed_df = processed_df.drop(columns=[col])
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "new_columns_created": new_columns_created,
        "method": "one_hot_encoding"
    }
