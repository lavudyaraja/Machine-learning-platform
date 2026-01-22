"""
Data Cleaning Main Module

This module serves as the main entry point for all data cleaning operations.
It imports and exposes all categorical, numerical, and common data cleaning methods.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
from pathlib import Path

# Import categorical methods
import sys
from pathlib import Path

# Add current directory to path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from categorical.categorical_methods import (
    handle_missing_values_categorical,
    standardize_text,
    trim_whitespace,
    handle_class_imbalance,
    fix_consistency
)

# Import numerical methods
from numerical.numerical_methods import (
    handle_missing_values_numerical,
    apply_log_transformation,
    handle_outliers,
    fix_skewness,
    remove_collinearity,
    smooth_noisy_data
)

# Import common methods
from common.common_methods import (
    apply_mode_imputation,
    apply_forward_fill,
    apply_backward_fill,
    drop_rows_with_missing,
    drop_columns_with_missing,
    remove_duplicates,
    correct_data_types,
    drop_null_columns
)


def process_data_cleaning(
    dataset_path: str,
    method_type: str,
    method: str,
    columns: Optional[List[str]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process data cleaning operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method_type: Type of method - 'categorical', 'numerical', or 'common'
        method: Specific method name
        columns: List of columns to process
        **kwargs: Additional method-specific parameters
        
    Returns:
        Dictionary with processed DataFrame path and metadata
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # Normalize column names - strip whitespace and handle case
    df.columns = df.columns.str.strip()
    
    # Normalize requested columns to match dataset columns
    normalized_columns = None
    if columns:
        # Create a mapping of normalized column names to actual column names
        column_map = {col.strip().lower(): col for col in df.columns}
        normalized_columns = []
        for col in columns:
            col_normalized = col.strip().lower()
            if col_normalized in column_map:
                normalized_columns.append(column_map[col_normalized])
            elif col.strip() in df.columns:
                normalized_columns.append(col.strip())
            else:
                print(f"[Data Cleaning] Warning: Column '{col}' not found in dataset. Available columns: {list(df.columns)}")
        
        if not normalized_columns:
            print(f"[Data Cleaning] Warning: No valid columns found. Processing all columns.")
            normalized_columns = None
    
    result = None
    processed_df = df.copy()
    
    try:
        if method_type == "categorical":
            if method == "handle_missing_values":
                strategy = kwargs.get("strategy", "most_frequent")
                constant_value = kwargs.get("constant_value")
                result = handle_missing_values_categorical(
                    processed_df, strategy, normalized_columns, constant_value
                )
            elif method == "standardize_text":
                text_method = kwargs.get("text_method", "lowercase")
                remove_special_chars = kwargs.get("remove_special_chars", False)
                result = standardize_text(
                    processed_df, text_method, normalized_columns, remove_special_chars
                )
            elif method == "trim_whitespace":
                trim_method = kwargs.get("trim_method", "trim")
                result = trim_whitespace(processed_df, trim_method, normalized_columns)
            elif method == "handle_class_imbalance":
                imbalance_method = kwargs.get("imbalance_method", "smote")
                target_column = kwargs.get("target_column")
                if not target_column:
                    raise ValueError("target_column is required for class imbalance handling")
                # Normalize target column name
                if target_column.strip().lower() in {col.lower(): col for col in processed_df.columns}:
                    target_col_map = {col.lower(): col for col in processed_df.columns}
                    target_column = target_col_map[target_column.strip().lower()]
                result = handle_class_imbalance(
                    processed_df, imbalance_method, target_column
                )
            elif method == "fix_consistency":
                result = fix_consistency(processed_df, normalized_columns)
            else:
                raise ValueError(f"Unknown categorical method: {method}")
        
        elif method_type == "numerical":
            if method == "handle_missing_values":
                strategy = kwargs.get("strategy", "mean")
                constant_value = kwargs.get("constant_value")
                result = handle_missing_values_numerical(
                    processed_df, strategy, normalized_columns, constant_value
                )
            elif method == "apply_log_transformation":
                log_method = kwargs.get("log_method", "log")
                result = apply_log_transformation(processed_df, log_method, normalized_columns)
            elif method == "handle_outliers":
                outlier_method = kwargs.get("outlier_method", "iqr")
                result = handle_outliers(processed_df, outlier_method, normalized_columns)
            elif method == "fix_skewness":
                skewness_method = kwargs.get("skewness_method", "log")
                result = fix_skewness(processed_df, skewness_method, normalized_columns)
            elif method == "remove_collinearity":
                threshold = kwargs.get("threshold", 0.95)
                result = remove_collinearity(processed_df, threshold, normalized_columns)
            elif method == "smooth_noisy_data":
                smooth_method = kwargs.get("smooth_method", "moving_average")
                window_size = kwargs.get("window_size", 3)
                result = smooth_noisy_data(processed_df, smooth_method, normalized_columns, window_size)
            else:
                raise ValueError(f"Unknown numerical method: {method}")
        
        elif method_type == "common":
            if method == "apply_mode_imputation":
                result = apply_mode_imputation(processed_df, normalized_columns)
            elif method == "apply_forward_fill":
                result = apply_forward_fill(processed_df, normalized_columns)
            elif method == "apply_backward_fill":
                result = apply_backward_fill(processed_df, normalized_columns)
            elif method == "drop_rows_with_missing":
                result = drop_rows_with_missing(processed_df, normalized_columns)
            elif method == "drop_columns_with_missing":
                threshold = kwargs.get("threshold", 0.9)
                result = drop_columns_with_missing(processed_df, threshold, normalized_columns)
            elif method == "remove_duplicates":
                subset = kwargs.get("subset")
                # Normalize subset columns if provided
                if subset:
                    subset_map = {col.strip().lower(): col for col in processed_df.columns}
                    normalized_subset = []
                    for col in subset:
                        col_normalized = col.strip().lower()
                        if col_normalized in subset_map:
                            normalized_subset.append(subset_map[col_normalized])
                        elif col.strip() in processed_df.columns:
                            normalized_subset.append(col.strip())
                    subset = normalized_subset if normalized_subset else None
                result = remove_duplicates(processed_df, subset)
            elif method == "correct_data_types":
                result = correct_data_types(processed_df, normalized_columns)
            elif method == "drop_null_columns":
                threshold = kwargs.get("threshold", 0.9)
                result = drop_null_columns(processed_df, threshold)
            else:
                raise ValueError(f"Unknown common method: {method}")
        else:
            raise ValueError(f"Unknown method type: {method_type}")
        
        if result is None or "processed_df" not in result:
            raise ValueError("Processing failed: No result returned")
        
        processed_df = result["processed_df"]
        processed_rows, processed_cols = processed_df.shape
        
        # Save processed dataset - handle sequential cleaning properly
        # If the path already contains "_cleaned", replace it, otherwise append
        if "_cleaned" in dataset_path:
            # Remove existing _cleaned suffix and add new one
            base_path = dataset_path.replace("_cleaned.csv", "").replace(".csv", "")
            output_path = f"{base_path}_cleaned.csv"
        else:
            # First time cleaning - append _cleaned
            output_path = dataset_path.replace(".csv", "_cleaned.csv")
            if output_path == dataset_path:
                output_path = f"{dataset_path}_cleaned.csv"
        
        # Ensure directory exists
        output_path_obj = Path(output_path)
        output_path_obj.parent.mkdir(parents=True, exist_ok=True)
        
        processed_df.to_csv(output_path, index=False)
        print(f"[Data Cleaning] Saved processed file to: {output_path}")
        
        # Prepare preview data with NaN handling for JSON serialization
        preview_data = processed_df.head(50)
        preview_columns = preview_data.columns.tolist()  # Return all columns, not just first 10
        preview_rows_list = []
        
        for _, row in preview_data.iterrows():
            row_list = []
            for col in preview_columns:
                val = row[col]
                # Handle NaN and None values for JSON compliance
                if pd.isna(val):
                    row_list.append(None)
                elif isinstance(val, (np.integer, np.int64)):
                    row_list.append(int(val))
                elif isinstance(val, (np.floating, np.float64)):
                    # Check for inf and -inf as well
                    if np.isinf(val):
                        row_list.append(None)
                    else:
                        row_list.append(float(val))
                else:
                    row_list.append(val)
            preview_rows_list.append(row_list)
        
        # Prepare response
        response = {
            "success": True,
            "processed_path": output_path,
            "original_rows": int(original_rows),
            "original_cols": int(original_cols),
            "processed_rows": int(processed_rows),
            "processed_cols": int(processed_cols),
            "preview": {
                "columns": preview_columns,
                "rows": preview_rows_list
            }
        }
        
        # Add method-specific metadata (clean NaN values from metadata too)
        if "metadata" in result:
            metadata = result["metadata"]
            # Recursively clean NaN values from metadata
            def clean_metadata(obj):
                if isinstance(obj, dict):
                    return {k: clean_metadata(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [clean_metadata(item) for item in obj]
                elif pd.isna(obj):
                    return None
                elif isinstance(obj, (np.integer, np.int64)):
                    return int(obj)
                elif isinstance(obj, (np.floating, np.float64)):
                    if np.isinf(obj):
                        return None
                    return float(obj)
                else:
                    return obj
            
            response["metadata"] = clean_metadata(metadata)
        
        # Add method-specific metadata
        if "columns_processed" in result:
            response["columns_processed"] = result["columns_processed"]
        if "rows_affected" in result:
            response["rows_affected"] = int(result.get("rows_affected", 0))
        if "missing_handled" in result:
            response["missing_handled"] = int(result.get("missing_handled", 0))
        if "duplicates_removed" in result:
            response["duplicates_removed"] = int(result.get("duplicates_removed", 0))
        if "rows_dropped" in result:
            response["rows_dropped"] = int(result.get("rows_dropped", 0))
        if "columns_removed" in result:
            response["columns_removed"] = result.get("columns_removed", [])
        
        print(f"[Data Cleaning] Response prepared: {len(response)} keys, processed_path={response.get('processed_path')}")
        
        return response
        
    except Exception as e:
        import traceback
        print(f"Error in data cleaning: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise


# Export all functions for direct access if needed
__all__ = [
    # Categorical
    "handle_missing_values_categorical",
    "standardize_text",
    "trim_whitespace",
    "handle_class_imbalance",
    "fix_consistency",
    # Numerical
    "handle_missing_values_numerical",
    "apply_log_transformation",
    "handle_outliers",
    "fix_skewness",
    "remove_collinearity",
    "smooth_noisy_data",
    # Common
    "apply_mode_imputation",
    "apply_forward_fill",
    "apply_backward_fill",
    "drop_rows_with_missing",
    "drop_columns_with_missing",
    "remove_duplicates",
    "correct_data_types",
    "drop_null_columns",
    # Main function
    "process_data_cleaning"
]

