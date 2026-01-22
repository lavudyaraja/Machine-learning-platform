"""
Categorical Encoding Module

This module provides various categorical encoding methods for preprocessing datasets.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import warnings
import importlib.util
import sys
warnings.filterwarnings('ignore')

# Get the directory of this file
_current_dir = Path(__file__).parent

# Import individual encoding methods using importlib to avoid relative import issues
def _load_module(module_name, file_name):
    """Load a module from the same directory"""
    file_path = _current_dir / file_name
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

# Load all encoding method modules
label_encoding_module = _load_module("label_encoding", "label_encoding.py")
one_hot_encoding_module = _load_module("one_hot_encoding", "one_hot_encoding.py")
ordinal_encoding_module = _load_module("ordinal_encoding", "ordinal_encoding.py")
target_encoding_module = _load_module("target_encoding", "target_encoding.py")
binary_encoding_module = _load_module("binary_encoding", "binary_encoding.py")
frequency_encoding_module = _load_module("frequency_encoding", "frequency_encoding.py")
count_encoding_module = _load_module("count_encoding", "count_encoding.py")
hash_encoding_module = _load_module("hash_encoding", "hash_encoding.py")
leave_one_out_encoding_module = _load_module("leave_one_out_encoding", "leave_one_out_encoding.py")
woe_encoding_module = _load_module("woe_encoding", "woe_encoding.py")

# Get the functions from modules
apply_label_encoding = label_encoding_module.apply_label_encoding
apply_one_hot_encoding = one_hot_encoding_module.apply_one_hot_encoding
apply_ordinal_encoding = ordinal_encoding_module.apply_ordinal_encoding
apply_target_encoding = target_encoding_module.apply_target_encoding
apply_binary_encoding = binary_encoding_module.apply_binary_encoding
apply_frequency_encoding = frequency_encoding_module.apply_frequency_encoding
apply_count_encoding = count_encoding_module.apply_count_encoding
apply_hash_encoding = hash_encoding_module.apply_hash_encoding
apply_leave_one_out_encoding = leave_one_out_encoding_module.apply_leave_one_out_encoding
apply_woe_encoding = woe_encoding_module.apply_woe_encoding


def analyze_dataset_types(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze dataset to identify categorical, numerical, and mixed columns.
    
    Returns:
        Dictionary with column type analysis
    """
    categorical_cols = []
    numerical_cols = []
    mixed_cols = []
    
    for col in df.columns:
        col_data = df[col]
        
        # Check if column is numeric
        is_numeric = pd.api.types.is_numeric_dtype(col_data)
        
        if is_numeric:
            # Check if it's actually categorical (low cardinality)
            unique_count = col_data.nunique()
            total_count = col_data.notna().sum()
            if total_count > 0:
                unique_ratio = unique_count / total_count
                # If low cardinality (< 20 unique values and < 10% unique ratio), consider categorical
                if unique_count < 20 and unique_ratio < 0.1:
                    mixed_cols.append({
                        "column": col,
                        "type": "numeric_as_categorical",
                        "unique_count": int(unique_count),
                        "unique_ratio": float(unique_ratio)
                    })
                else:
                    numerical_cols.append(col)
        else:
            # Object/string type - check if it contains numeric values
            numeric_count = pd.to_numeric(col_data, errors='coerce').notna().sum()
            total_count = col_data.notna().sum()
            if total_count > 0:
                numeric_ratio = numeric_count / total_count
                # If mixed (10-90% numeric), mark as mixed
                if 0.1 < numeric_ratio < 0.9:
                    mixed_cols.append({
                        "column": col,
                        "type": "mixed",
                        "numeric_ratio": float(numeric_ratio)
                    })
                else:
                    categorical_cols.append(col)
            else:
                categorical_cols.append(col)
    
    return {
        "categorical_columns": categorical_cols,
        "numerical_columns": numerical_cols,
        "mixed_columns": mixed_cols,
        "dataset_type": "mixed" if (len(categorical_cols) > 0 and len(numerical_cols) > 0) else ("categorical" if len(categorical_cols) > 0 else "numerical")
    }


def process_categorical_encoding(
    dataset_path: str,
    method: str,
    columns: List[str],
    target_column: Optional[str] = None,
    drop_first: bool = False,
    handle_unknown: str = "ignore",
    ordinal_mapping: Optional[Dict[str, Dict[str, int]]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process categorical encoding operations.
    Returns data in memory without saving to disk.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method: Encoding method - 'label', 'onehot', 'ordinal', 'target', 'binary', 'frequency', 'count', 'hash', 'leave_one_out', 'woe'
        columns: List of columns to encode
        target_column: Target column name (required for target encoding)
        drop_first: Whether to drop first category (for one-hot encoding)
        handle_unknown: How to handle unknown categories
        ordinal_mapping: Mapping for ordinal encoding
        **kwargs: Additional method-specific parameters
        
    Returns:
        Dictionary with processed DataFrame data and metadata (no file saved)
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # Analyze dataset types
    dataset_analysis = analyze_dataset_types(df)
    
    # Validate columns
    invalid_columns = [col for col in columns if col not in df.columns]
    if invalid_columns:
        raise ValueError(f"Columns not found in dataset: {invalid_columns}")
    
    # Apply encoding based on method
    method_lower = method.lower()
    if method_lower == "label":
        result = apply_label_encoding(df, columns, **kwargs)
    elif method_lower == "onehot" or method_lower == "one_hot":
        result = apply_one_hot_encoding(
            df, columns, drop_first=drop_first, 
            handle_unknown=handle_unknown, **kwargs
        )
    elif method_lower == "ordinal":
        result = apply_ordinal_encoding(
            df, columns, ordinal_mapping=ordinal_mapping, **kwargs
        )
    elif method_lower == "target":
        if not target_column:
            raise ValueError("target_column is required for target encoding")
        result = apply_target_encoding(df, columns, target_column, **kwargs)
    elif method_lower == "binary":
        result = apply_binary_encoding(df, columns, **kwargs)
    elif method_lower == "frequency":
        result = apply_frequency_encoding(df, columns, **kwargs)
    elif method_lower == "count":
        result = apply_count_encoding(df, columns, **kwargs)
    elif method_lower == "hash":
        n_features = kwargs.get("n_features", 8)
        result = apply_hash_encoding(df, columns, n_features=n_features, **kwargs)
    elif method_lower == "leave_one_out" or method_lower == "leave-one-out":
        if not target_column:
            raise ValueError("target_column is required for leave-one-out encoding")
        result = apply_leave_one_out_encoding(df, columns, target_column, **kwargs)
    elif method_lower == "woe" or method_lower == "weight_of_evidence":
        if not target_column:
            raise ValueError("target_column is required for WoE encoding")
        result = apply_woe_encoding(df, columns, target_column, **kwargs)
    else:
        raise ValueError(f"Unknown encoding method: {method}")
    
    processed_df = result["processed_df"]
    processed_rows, processed_cols = processed_df.shape
    
    # Convert processed_df to CSV string for in-memory transfer
    processed_csv_content = processed_df.to_csv(index=False)
    
    # Prepare response (no disk storage)
    # Convert mappings to JSON-serializable format (handle numpy types)
    mappings = result.get("mappings", {})
    serializable_mappings = {}
    for col, mapping in mappings.items():
        if isinstance(mapping, dict):
            serializable_mappings[col] = {str(k): int(v) if isinstance(v, (np.integer, int)) else float(v) if isinstance(v, (np.floating, float)) else v 
                                         for k, v in mapping.items()}
        else:
            serializable_mappings[col] = mapping
    
    response = {
        "success": True,
        "processed_csv_content": processed_csv_content,  # Return CSV content directly
        "original_rows": int(original_rows),
        "original_columns": int(original_cols),
        "processed_rows": int(processed_rows),
        "processed_columns": int(processed_cols),
        "encoded_columns": result.get("encoded_columns", []),
        "new_columns_created": result.get("new_columns_created", []),
        "method": result.get("method", method),
        "mappings": serializable_mappings,
        "dataset_analysis": dataset_analysis  # Include dataset type analysis
    }
    
    return response

