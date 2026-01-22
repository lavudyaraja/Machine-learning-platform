"""
Label Encoding Module
Applies label encoding to categorical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import LabelEncoder


def apply_label_encoding(
    df: pd.DataFrame,
    columns: List[str],
    **kwargs
) -> Dict[str, Any]:
    """
    Apply label encoding to categorical columns.
    
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
        
        # Handle NaN values before encoding
        # Fill NaN with a placeholder that will be encoded separately
        col_data = processed_df[col].copy()
        has_nan = col_data.isna().any()
        
        if has_nan:
            # Replace NaN with a unique placeholder
            col_data = col_data.fillna('__MISSING__')
        
        le = LabelEncoder()
        # Convert to string and encode
        encoded_values = le.fit_transform(col_data.astype(str))
        processed_df[col] = encoded_values
        encoded_columns.append(col)
        
        # Create mapping - convert numpy types to Python native types for JSON serialization
        # le.classes_ is a numpy array, convert to list
        classes_list = [str(cls) for cls in le.classes_]
        encoded_list = le.transform(le.classes_).tolist()  # Convert numpy array to list
        
        # Create mapping dictionary
        col_mapping = {}
        for class_name, encoded_val in zip(classes_list, encoded_list):
            # Skip missing placeholder in display mapping
            if class_name != '__MISSING__':
                col_mapping[str(class_name)] = int(encoded_val)
        
        mappings[col] = col_mapping
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "mappings": mappings,
        "method": "label_encoding"
    }
