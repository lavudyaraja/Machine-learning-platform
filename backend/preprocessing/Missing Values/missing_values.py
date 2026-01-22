"""
Missing Values Handling Module
Handles missing values in datasets using various imputation and deletion methods.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional, Union, Tuple
import json


def handle_missing_values(
    dataset_path: str,
    method: str,
    columns: Optional[List[str]] = None,
    constant_value: Optional[Union[str, int, float]] = None,
    threshold: float = 0.5
) -> Dict[str, Any]:
    """
    Handle missing values in a dataset using the specified method.
    
    Args:
        dataset_path: Path to the CSV dataset file
        method: Method to handle missing values (mean, median, mode, constant, 
                drop_rows, drop_columns, std, variance, q1, q2, q3)
        columns: List of column names to process (empty list means all columns)
        constant_value: Constant value for constant imputation
        threshold: Threshold for drop_columns (percentage of missing values)
    
    Returns:
        Dictionary containing processed dataset information
    """
    
    # Read dataset - preserve all string values including those with spaces
    try:
        # Read CSV - keep_default_na=False to preserve empty strings, but we'll handle NaN separately
        # This ensures values like "B96 B98" are preserved and not converted to NaN
        df = pd.read_csv(dataset_path, keep_default_na=False, na_values=['', 'nan', 'NaN', 'NULL', 'null', 'None'])
        # Convert empty strings back to NaN only for proper missing value detection
        # But preserve actual string values with spaces
        for col in df.columns:
            if df[col].dtype == 'object':
                # Only convert truly empty strings to NaN, preserve strings with content
                df[col] = df[col].replace('', np.nan)
    except Exception as e:
        raise ValueError(f"Error reading dataset: {str(e)}")
    
    original_rows = len(df)
    original_cols = len(df.columns)
    
    # Store original missing counts
    missing_counts_before = {}
    for col in df.columns:
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            missing_counts_before[col] = int(missing_count)
    
    # Normalize column names - strip whitespace
    df.columns = df.columns.str.strip()
    
    # Determine columns to process
    if columns is None or len(columns) == 0:
        columns_to_process = list(df.columns)
    else:
        # Normalize requested columns and filter to only existing columns
        column_map = {col.strip().lower(): col for col in df.columns}
        columns_to_process = []
        seen_columns = set()  # Track processed columns to avoid duplicates
        
        for col in columns:
            col_normalized = col.strip().lower()
            actual_col = None
            
            if col_normalized in column_map:
                actual_col = column_map[col_normalized]
            elif col.strip() in df.columns:
                actual_col = col.strip()
            
            if actual_col and actual_col not in seen_columns:
                columns_to_process.append(actual_col)
                seen_columns.add(actual_col)
            elif actual_col is None:
                print(f"[Missing Values] Warning: Column '{col}' not found in dataset")
    
    if len(columns_to_process) == 0:
        raise ValueError("No valid columns to process")
    
    print(f"[Missing Values] Processing {len(columns_to_process)} unique columns: {columns_to_process}")
    
    # Separate columns by type
    numeric_columns = [col for col in columns_to_process if pd.api.types.is_numeric_dtype(df[col])]
    categorical_columns = [col for col in columns_to_process if not pd.api.types.is_numeric_dtype(df[col])]
    
    print(f"[Missing Values] Processing {len(columns_to_process)} columns: {len(numeric_columns)} numeric, {len(categorical_columns)} categorical")
    
    # Calculate statistics before processing
    statistics = calculate_statistics(df, columns_to_process)
    
    # Initialize columns_processed
    columns_processed = columns_to_process
    
    # Apply missing value handling method
    if method == "drop_rows":
        df_processed = drop_rows_with_missing(df, columns_to_process)
        missing_handled = original_rows - len(df_processed)
        
    elif method == "drop_columns":
        df_processed, dropped_cols = drop_columns_with_missing(df, columns_to_process, threshold)
        missing_handled = sum(missing_counts_before.get(col, 0) for col in dropped_cols)
        columns_processed = [col for col in columns_to_process if col not in dropped_cols]
        
    elif method == "constant":
        if constant_value is None:
            raise ValueError("Constant value is required for constant imputation")
        # Create a deep copy to ensure original is not modified
        df_processed = df.copy(deep=True)
        # Process only specified columns
        df_processed = impute_constant(df_processed, columns_to_process, constant_value)
        missing_handled = sum(df[col].isnull().sum() for col in columns_to_process)
        
        # Verify that columns not in columns_to_process remain unchanged
        for col in df.columns:
            if col not in columns_to_process:
                if not df[col].equals(df_processed[col]):
                    print(f"[Missing Values] ERROR: Column '{col}' was modified but should not be processed!")
                    # Restore original column
                    df_processed[col] = df[col].copy()
        
    elif method in ["mean", "median", "mode", "std", "variance", "q1", "q2", "q3"]:
        df_processed = impute_statistical(df, columns_to_process, method)
        missing_handled = sum(df[col].isnull().sum() for col in columns_to_process)
        
    else:
        raise ValueError(f"Unknown method: {method}")
    
    # Recalculate statistics after processing
    statistics = calculate_statistics(df_processed, columns_processed if method == "drop_columns" else columns_to_process)
    
    # Save processed dataset
    dataset_path_obj = Path(dataset_path)
    
    if "_processed" in dataset_path_obj.stem or "_cleaned" in dataset_path_obj.stem:
        base_name = dataset_path_obj.stem.split('_processed')[0].split('_cleaned')[0]
        output_path = dataset_path_obj.parent / f"{base_name}_processed.csv"
    else:
        output_path = dataset_path_obj.parent / f"{dataset_path_obj.stem}_processed.csv"
    
    # Ensure directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Don't drop duplicates - missing value handling should preserve all rows
    # Only drop duplicates if method is drop_rows (already handled in that function)
    # Removing drop_duplicates() to preserve all original data
    
    # Save the processed dataset - preserve all values including strings with spaces
    # Use pandas default quoting which preserves string values
    df_processed.to_csv(str(output_path), index=False)
    
    # Convert to absolute path
    output_path_absolute = output_path.resolve()
    print(f"[Missing Values] Saved processed file to: {output_path_absolute}")
    
    # Verify data integrity - ensure all original non-missing values are preserved
    print(f"[Missing Values] Data integrity check:")
    print(f"  - Original rows: {original_rows}, Processed rows: {len(df_processed)}")
    if original_rows != len(df_processed) and method != "drop_rows":
        print(f"  - Warning: Row count changed from {original_rows} to {len(df_processed)}")
    
    # Check that columns not being processed are unchanged
    unprocessed_cols = [col for col in df.columns if col not in columns_to_process]
    if unprocessed_cols:
        for col in unprocessed_cols[:5]:  # Check first 5 unprocessed columns
            if not df[col].equals(df_processed[col]):
                print(f"  - Warning: Unprocessed column '{col}' was modified!")
    
    # Prepare preview (first 100 rows)
    preview_rows = min(100, len(df_processed))
    preview_data = df_processed.head(preview_rows)
    
    # Convert preview to list format - preserve all string values including spaces
    preview_columns = list(preview_data.columns)
    preview_rows_list = []
    for _, row in preview_data.iterrows():
        row_list = []
        for col in preview_columns:
            val = row[col]
            # Handle NaN and None values
            if pd.isna(val):
                row_list.append(None)
            elif isinstance(val, (np.integer, np.floating)):
                row_list.append(float(val))
            else:
                # Preserve string values as-is, including those with spaces like "B96 B98"
                row_list.append(str(val) if val is not None else None)
        preview_rows_list.append(row_list)
    
    return {
        "processed_path": str(output_path_absolute),
        "processed_rows": len(df_processed),
        "processed_cols": len(df_processed.columns),
        "original_rows": original_rows,
        "original_cols": original_cols,
        "missing_handled": int(missing_handled),
        "columns_processed": columns_processed,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "preview": {
            "columns": preview_columns,
            "rows": preview_rows_list
        },
        "statistics": statistics,
        "missing_counts_before": missing_counts_before
    }


def calculate_statistics(df: pd.DataFrame, columns: List[str]) -> Dict[str, Dict[str, Any]]:
    """Calculate statistical measures for columns."""
    stats = {}
    
    for col in columns:
        if col not in df.columns:
            continue
            
        col_data = df[col]
        
        # Check if column is numeric
        if pd.api.types.is_numeric_dtype(col_data):
            # Remove NaN values for calculations
            clean_data = col_data.dropna()
            
            col_stats = {
                "mean": float(clean_data.mean()) if len(clean_data) > 0 else None,
                "median": float(clean_data.median()) if len(clean_data) > 0 else None,
                "std": float(clean_data.std()) if len(clean_data) > 0 else None,
                "variance": float(clean_data.var()) if len(clean_data) > 0 else None,
            }
            
            # Calculate quartiles
            try:
                if len(clean_data) > 0:
                    q1 = clean_data.quantile(0.25)
                    q2 = clean_data.quantile(0.50)
                    q3 = clean_data.quantile(0.75)
                    col_stats["q1"] = float(q1) if not pd.isna(q1) else None
                    col_stats["q2"] = float(q2) if not pd.isna(q2) else None
                    col_stats["q3"] = float(q3) if not pd.isna(q3) else None
                else:
                    col_stats["q1"] = None
                    col_stats["q2"] = None
                    col_stats["q3"] = None
            except:
                col_stats["q1"] = None
                col_stats["q2"] = None
                col_stats["q3"] = None
            
            # Calculate mode
            try:
                mode_values = clean_data.mode()
                if len(mode_values) > 0:
                    mode_val = mode_values.iloc[0]
                    col_stats["mode"] = float(mode_val) if not pd.isna(mode_val) else None
                else:
                    col_stats["mode"] = None
            except:
                col_stats["mode"] = None
                
        else:
            # For non-numeric columns, only calculate mode
            try:
                clean_data = col_data.dropna()
                mode_values = clean_data.mode()
                if len(mode_values) > 0:
                    mode_val = mode_values.iloc[0]
                    col_stats = {
                        "mode": str(mode_val) if mode_val is not None else None,
                        "mean": None,
                        "median": None,
                        "std": None,
                        "variance": None,
                        "q1": None,
                        "q2": None,
                        "q3": None
                    }
                else:
                    col_stats = {
                        "mode": None,
                        "mean": None,
                        "median": None,
                        "std": None,
                        "variance": None,
                        "q1": None,
                        "q2": None,
                        "q3": None
                    }
            except:
                col_stats = {
                    "mode": None,
                    "mean": None,
                    "median": None,
                    "std": None,
                    "variance": None,
                    "q1": None,
                    "q2": None,
                    "q3": None
                }
        
        stats[col] = col_stats
    
    return stats


def drop_rows_with_missing(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Drop rows that have missing values in specified columns."""
    return df.dropna(subset=columns)


def drop_columns_with_missing(
    df: pd.DataFrame, 
    columns: List[str], 
    threshold: float = 0.5
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Drop columns that have missing values above the threshold.
    
    Args:
        df: DataFrame to process
        columns: Columns to check
        threshold: Percentage threshold (0.0 to 1.0)
    
    Returns:
        Tuple of (processed DataFrame, list of dropped column names)
    """
    dropped_cols = []
    
    for col in columns:
        if col in df.columns:
            missing_percentage = df[col].isnull().sum() / len(df)
            if missing_percentage > threshold:
                dropped_cols.append(col)
    
    df_processed = df.drop(columns=dropped_cols)
    return df_processed, dropped_cols


def impute_constant(
    df: pd.DataFrame, 
    columns: List[str], 
    constant_value: Union[str, int, float]
) -> pd.DataFrame:
    """Impute missing values with a constant value."""
    df_processed = df.copy()
    
    for col in columns:
        if col in df_processed.columns:
            # Only fill missing values in this column, don't modify existing values
            mask = df_processed[col].isnull()
            df_processed.loc[mask, col] = constant_value
    
    return df_processed


def impute_statistical(
    df: pd.DataFrame, 
    columns: List[str], 
    method: str
) -> pd.DataFrame:
    """
    Impute missing values using statistical methods.
    
    Methods: mean, median, mode, std, variance, q1, q2, q3
    """
    df_processed = df.copy()
    
    for col in columns:
        if col not in df_processed.columns:
            continue
        
        # Get column data - use original column to avoid issues with already processed data
        col_data = df_processed[col].copy()
        
        # Check if column is numeric
        is_numeric = pd.api.types.is_numeric_dtype(col_data)
        
        # Get mask of missing values BEFORE any processing
        missing_mask = col_data.isnull()
        
        # Skip if no missing values in this column
        if not missing_mask.any():
            continue
        
        # For numerical methods, only process numeric columns
        if method in ["mean", "median", "std", "variance", "q1", "q2", "q3"]:
            if is_numeric:
                fill_value = None
                
                if method == "mean":
                    fill_value = col_data.mean()
                    if pd.isna(fill_value):
                        fill_value = 0
                    
                elif method == "median":
                    fill_value = col_data.median()
                    if pd.isna(fill_value):
                        fill_value = col_data.mean()
                        if pd.isna(fill_value):
                            fill_value = 0
                    
                elif method == "std":
                    fill_value = col_data.std()
                    if pd.isna(fill_value) or fill_value == 0:
                        fill_value = col_data.mean()
                        if pd.isna(fill_value):
                            fill_value = 0
                    
                elif method == "variance":
                    fill_value = col_data.var()
                    if pd.isna(fill_value) or fill_value == 0:
                        fill_value = col_data.mean()
                        if pd.isna(fill_value):
                            fill_value = 0
                    
                elif method == "q1":
                    fill_value = col_data.quantile(0.25)
                    if pd.isna(fill_value):
                        fill_value = col_data.median()
                        if pd.isna(fill_value):
                            fill_value = col_data.mean()
                            if pd.isna(fill_value):
                                fill_value = 0
                    
                elif method == "q2":
                    fill_value = col_data.quantile(0.50)
                    if pd.isna(fill_value):
                        fill_value = col_data.mean()
                        if pd.isna(fill_value):
                            fill_value = 0
                    
                elif method == "q3":
                    fill_value = col_data.quantile(0.75)
                    if pd.isna(fill_value):
                        fill_value = col_data.median()
                        if pd.isna(fill_value):
                            fill_value = col_data.mean()
                            if pd.isna(fill_value):
                                fill_value = 0
                
                # Only fill missing values, don't modify existing values
                # Re-check missing mask right before filling to ensure we have the latest state
                if fill_value is not None:
                    # Get fresh missing mask from current dataframe state
                    current_missing = df_processed[col].isnull()
                    if current_missing.sum() > 0:
                        # Store original non-missing values to verify preservation
                        original_non_missing = df_processed.loc[~current_missing, col].copy()
                        # Fill only missing values
                        df_processed.loc[current_missing, col] = fill_value
                        # Verify original values are still intact
                        if not original_non_missing.equals(df_processed.loc[~current_missing, col]):
                            print(f"[Missing Values] Warning: Original values in '{col}' may have been modified!")
                        print(f"[Missing Values] Filled {current_missing.sum()} missing values in '{col}' with {fill_value}")
            else:
                # For non-numeric columns, use mode as fallback
                print(f"[Missing Values] Column '{col}' is non-numeric, using mode for method '{method}'")
                # Get mode from non-missing values only
                non_missing_data = col_data.dropna()
                if len(non_missing_data) > 0:
                    mode_values = non_missing_data.mode()
                    if len(mode_values) > 0:
                        fill_value = mode_values.iloc[0]
                        # Only fill actual missing values
                        actual_missing = df_processed[col].isnull()
                        if actual_missing.sum() > 0:
                            df_processed.loc[actual_missing, col] = fill_value
                            print(f"[Missing Values] Filled {actual_missing.sum()} missing values in '{col}' with mode: {fill_value}")
        
        # Mode works for both numeric and categorical
        elif method == "mode":
            # Get mode from non-missing values only
            non_missing_data = col_data.dropna()
            if len(non_missing_data) > 0:
                mode_values = non_missing_data.mode()
                if len(mode_values) > 0:
                    fill_value = mode_values.iloc[0]
                    # Only fill actual missing values
                    actual_missing = df_processed[col].isnull()
                    if actual_missing.sum() > 0:
                        df_processed.loc[actual_missing, col] = fill_value
                        print(f"[Missing Values] Filled {actual_missing.sum()} missing values in '{col}' with mode: {fill_value}")
                else:
                    # If no mode available, use first non-null value
                    fill_value = non_missing_data.iloc[0]
                    actual_missing = df_processed[col].isnull()
                    if actual_missing.sum() > 0:
                        df_processed.loc[actual_missing, col] = fill_value
                        print(f"[Missing Values] Filled {actual_missing.sum()} missing values in '{col}' with first value: {fill_value}")
            else:
                # All values are null
                actual_missing = df_processed[col].isnull()
                if actual_missing.sum() > 0:
                    if is_numeric:
                        df_processed.loc[actual_missing, col] = 0
                    else:
                        df_processed.loc[actual_missing, col] = "Unknown"
                    print(f"[Missing Values] Filled {actual_missing.sum()} missing values in '{col}' with default value")
    
    return df_processed