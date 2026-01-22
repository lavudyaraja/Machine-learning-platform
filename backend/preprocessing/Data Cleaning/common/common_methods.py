"""
Common Data Cleaning Methods Implementation

This module contains implementations for common data cleaning methods
applicable to both numerical and categorical data.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union


def apply_mode_imputation(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Fill missing values with the most frequent value (mode).
    
    Args:
        df: Input DataFrame
        columns: List of columns to process
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    columns_processed = []
    missing_handled = 0
    metadata = {}
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        target_columns = df.columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        missing_count = processed_df[col].isnull().sum()
        if missing_count == 0:
            continue
        
        mode_values = processed_df[col].mode()
        mode_value = mode_values[0] if len(mode_values) > 0 else None
        
        if mode_value is not None:
            processed_df[col].fillna(mode_value, inplace=True)
            columns_processed.append(col)
            missing_handled += missing_count
            metadata[col] = {
                "mode": str(mode_value),
                "frequency": int((processed_df[col] == mode_value).sum()),
                "missing_count": int(missing_count)
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "missing_handled": missing_handled,
        "metadata": metadata
    }


def apply_forward_fill(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Fill missing values by carrying forward the previous non-null value.
    
    Args:
        df: Input DataFrame
        columns: List of columns to process
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    columns_processed = []
    missing_handled = 0
    metadata = {}
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        target_columns = df.columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        missing_count = processed_df[col].isnull().sum()
        if missing_count > 0:
            # Use ffill() instead of deprecated fillna(method='ffill')
            processed_df[col] = processed_df[col].ffill()
            filled_count = processed_df[col].isnull().sum()
            actual_filled = missing_count - filled_count
            
            if actual_filled > 0:
                columns_processed.append(col)
                missing_handled += actual_filled
                metadata[col] = {
                    "filled_count": int(actual_filled)
                }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "missing_handled": missing_handled,
        "metadata": metadata
    }


def apply_backward_fill(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Fill missing values by carrying backward the next non-null value.
    
    Args:
        df: Input DataFrame
        columns: List of columns to process
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    columns_processed = []
    missing_handled = 0
    metadata = {}
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        target_columns = df.columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        missing_count = processed_df[col].isnull().sum()
        if missing_count > 0:
            # Use bfill() instead of deprecated fillna(method='bfill')
            processed_df[col] = processed_df[col].bfill()
            filled_count = processed_df[col].isnull().sum()
            actual_filled = missing_count - filled_count
            
            if actual_filled > 0:
                columns_processed.append(col)
                missing_handled += actual_filled
                metadata[col] = {
                    "filled_count": int(actual_filled)
                }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "missing_handled": missing_handled,
        "metadata": metadata
    }


def drop_rows_with_missing(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Remove rows that contain missing values.
    
    Args:
        df: Input DataFrame
        columns: List of columns to check (None = all columns)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    original_rows = len(processed_df)
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
        if not target_columns:
            return {
                "processed_df": processed_df,
                "rows_dropped": 0,
                "metadata": {"warning": "No valid columns found"}
            }
        processed_df = processed_df.dropna(subset=target_columns)
    else:
        processed_df = processed_df.dropna()
    
    rows_dropped = original_rows - len(processed_df)
    
    return {
        "processed_df": processed_df,
        "rows_dropped": rows_dropped,
        "metadata": {
            "original_rows": original_rows,
            "remaining_rows": len(processed_df)
        }
    }


def drop_columns_with_missing(
    df: pd.DataFrame,
    threshold: float = 0.9,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Remove columns that have too many missing values.
    
    Args:
        df: Input DataFrame
        threshold: Missing value threshold (default 0.9 = 90%)
        columns: List of columns to check (None = all columns)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        target_columns = df.columns.tolist()
    
    columns_to_remove = []
    total_rows = len(processed_df)
    
    if total_rows == 0:
        return {
            "processed_df": processed_df,
            "columns_removed": [],
            "metadata": {"warning": "No rows to analyze"}
        }
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        missing_count = processed_df[col].isnull().sum()
        missing_percentage = missing_count / total_rows if total_rows > 0 else 0
        
        if missing_percentage > threshold:
            columns_to_remove.append(col)
    
    if columns_to_remove:
        processed_df = processed_df.drop(columns=columns_to_remove)
    
    return {
        "processed_df": processed_df,
        "columns_removed": columns_to_remove,
        "metadata": {
            "threshold": threshold,
            "total_rows": total_rows
        }
    }


def remove_duplicates(
    df: pd.DataFrame,
    subset: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Remove duplicate rows from the dataset.
    
    Args:
        df: Input DataFrame
        subset: List of columns to consider for duplicates (None = all columns)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    original_rows = len(processed_df)
    
    processed_df = processed_df.drop_duplicates(subset=subset, keep='first')
    
    duplicates_removed = original_rows - len(processed_df)
    
    return {
        "processed_df": processed_df,
        "duplicates_removed": duplicates_removed,
        "metadata": {
            "original_rows": original_rows,
            "unique_rows": len(processed_df)
        }
    }


def correct_data_types(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Automatically detect and correct data types.
    
    Args:
        df: Input DataFrame
        columns: List of columns to process (None = all columns)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    columns_processed = []
    rows_affected = 0
    metadata = {}
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        target_columns = df.columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        # Sample first 100 rows to detect type
        sample_size = min(100, len(processed_df))
        samples = processed_df[col].head(sample_size).dropna()
        
        if len(samples) == 0:
            continue
        
        # Check if all samples are numeric
        all_numeric = True
        for val in samples:
            try:
                float(val)
            except (ValueError, TypeError):
                all_numeric = False
                break
        
        if all_numeric:
            # Try to convert to numeric
            converted = pd.to_numeric(processed_df[col], errors='coerce')
            if not converted.equals(processed_df[col]):
                processed_df[col] = converted
                converted_count = (~pd.isna(converted)).sum()
                columns_processed.append(col)
                rows_affected += converted_count
                metadata[col] = {
                    "detected_type": "number",
                    "converted_count": int(converted_count)
                }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }


def drop_null_columns(
    df: pd.DataFrame,
    threshold: float = 0.9
) -> Dict[str, Any]:
    """
    Remove columns with high percentage of null values.
    
    Args:
        df: Input DataFrame
        threshold: Null value threshold (default 0.9 = 90%)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    total_rows = len(processed_df)
    
    if total_rows == 0:
        return {
            "processed_df": processed_df,
            "columns_removed": [],
            "metadata": {"warning": "No rows to analyze"}
        }
    
    columns_to_remove = []
    
    for col in processed_df.columns:
        null_count = processed_df[col].isnull().sum()
        null_percentage = null_count / total_rows if total_rows > 0 else 0
        
        if null_percentage > threshold:
            columns_to_remove.append(col)
    
    if columns_to_remove:
        processed_df = processed_df.drop(columns=columns_to_remove)
    
    return {
        "processed_df": processed_df,
        "columns_removed": columns_to_remove,
        "metadata": {
            "threshold": threshold,
            "total_rows": total_rows
        }
    }