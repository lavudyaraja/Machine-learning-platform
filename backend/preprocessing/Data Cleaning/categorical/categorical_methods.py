"""
Categorical Data Cleaning Methods Implementation

This module contains implementations for categorical/text data cleaning methods.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
import re


def handle_missing_values_categorical(
    df: pd.DataFrame,
    strategy: str,
    columns: Optional[List[str]] = None,
    constant_value: Optional[str] = None
) -> Dict[str, Any]:
    """
    Handle missing values in categorical/text columns.
    
    Args:
        df: Input DataFrame
        strategy: 'constant_category', 'most_frequent', or 'missing_indicator'
        columns: List of columns to process (None = all categorical columns)
        constant_value: Value to use for constant_category strategy
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    columns_processed = []
    missing_handled = 0
    metadata = {}
    
    # Determine target columns
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        # Auto-detect categorical columns (object type or low cardinality numeric)
        target_columns = df.select_dtypes(include=['object']).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
            
        missing_count = processed_df[col].isnull().sum()
        if missing_count == 0:
            continue
        
        fill_value = None
        
        if strategy == "constant_category":
            fill_value = constant_value if constant_value is not None else "Unknown"
        elif strategy == "most_frequent":
            mode_values = processed_df[col].mode()
            fill_value = mode_values[0] if len(mode_values) > 0 else (constant_value or "Unknown")
        elif strategy == "missing_indicator":
            fill_value = constant_value if constant_value is not None else "Missing"
        else:
            fill_value = "Unknown"
        
        if fill_value is not None:
            processed_df[col].fillna(fill_value, inplace=True)
            columns_processed.append(col)
            missing_handled += missing_count
            metadata[col] = {
                "strategy": strategy,
                "fill_value": fill_value,
                "missing_count": int(missing_count)
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "missing_handled": missing_handled,
        "metadata": metadata
    }


def standardize_text(
    df: pd.DataFrame,
    method: str,
    columns: Optional[List[str]] = None,
    remove_special_chars: bool = False
) -> Dict[str, Any]:
    """
    Standardize text values in categorical columns.
    
    Args:
        df: Input DataFrame
        method: 'lowercase' or 'uppercase'
        columns: List of columns to process
        remove_special_chars: Whether to remove special characters
        
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
        target_columns = df.select_dtypes(include=['object']).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        transformed_count = 0
        
        def transform_value(val):
            nonlocal transformed_count
            
            if pd.isna(val) or val is None:
                return val
            
            str_val = str(val)
            original = str_val
            
            # Apply case transformation
            if method == "lowercase":
                str_val = str_val.lower()
            elif method == "uppercase":
                str_val = str_val.upper()
            
            # Remove special characters if requested
            if remove_special_chars:
                str_val = re.sub(r'[^a-zA-Z0-9\s]', '', str_val)
            
            if str_val != original:
                transformed_count += 1
            
            return str_val
        
        processed_df[col] = processed_df[col].apply(transform_value)
        
        if transformed_count > 0:
            columns_processed.append(col)
            rows_affected += transformed_count
            metadata[col] = {
                "method": method,
                "transformed_count": transformed_count,
                "remove_special_chars": remove_special_chars
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }


def trim_whitespace(
    df: pd.DataFrame,
    method: str,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Trim whitespace in text columns.
    
    Args:
        df: Input DataFrame
        method: 'trim' or 'normalize'
        columns: List of columns to process
        
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
        target_columns = df.select_dtypes(include=['object']).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        transformed_count = 0
        
        def transform_value(val):
            nonlocal transformed_count
            
            if pd.isna(val) or val is None:
                return val
            
            str_val = str(val)
            original = str_val
            
            if method == "trim":
                str_val = str_val.strip()
            elif method == "normalize":
                str_val = re.sub(r'\s+', ' ', str_val).strip()
            
            if str_val != original:
                transformed_count += 1
            
            return str_val
        
        processed_df[col] = processed_df[col].apply(transform_value)
        
        if transformed_count > 0:
            columns_processed.append(col)
            rows_affected += transformed_count
            metadata[col] = {
                "method": method,
                "transformed_count": transformed_count
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }


def handle_class_imbalance(
    df: pd.DataFrame,
    method: str,
    target_column: str
) -> Dict[str, Any]:
    """
    Handle imbalanced class distributions.
    
    Args:
        df: Input DataFrame
        method: 'smote' or 'undersample'
        target_column: Target column name
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    if target_column not in df.columns:
        return {
            "processed_df": df,
            "error": f"Target column '{target_column}' not found"
        }
    
    processed_df = df.copy()
    metadata = {}
    
    # Calculate class distribution
    class_counts = processed_df[target_column].value_counts()
    
    if len(class_counts) < 2:
        return {
            "processed_df": processed_df,
            "warning": "Need at least 2 classes for imbalance handling"
        }
    
    min_count = class_counts.min()
    max_count = class_counts.max()
    
    if method == "smote":
        # Simplified SMOTE: duplicate minority class samples
        minority_class = class_counts.idxmin()
        minority_samples = processed_df[processed_df[target_column] == minority_class]
        samples_to_add = max_count - min_count
        
        new_samples = []
        for i in range(samples_to_add):
            source_idx = i % len(minority_samples)
            new_samples.append(minority_samples.iloc[source_idx])
        
        if new_samples:
            new_df = pd.DataFrame(new_samples)
            processed_df = pd.concat([processed_df, new_df], ignore_index=True)
            metadata = {
                "method": "smote",
                "minority_class": str(minority_class),
                "samples_added": len(new_samples)
            }
    
    elif method == "undersample":
        # Undersample: randomly remove majority class samples
        majority_class = class_counts.idxmax()
        majority_samples = processed_df[processed_df[target_column] == majority_class]
        samples_to_remove = max_count - min_count
        
        if samples_to_remove > 0:
            indices_to_remove = majority_samples.sample(n=min(samples_to_remove, len(majority_samples))).index
            processed_df = processed_df.drop(indices_to_remove).reset_index(drop=True)
            metadata = {
                "method": "undersample",
                "majority_class": str(majority_class),
                "samples_removed": len(indices_to_remove)
            }
    
    return {
        "processed_df": processed_df,
        "metadata": metadata
    }


def fix_consistency(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Standardize inconsistent categorical values.
    
    Args:
        df: Input DataFrame
        columns: List of columns to process
        
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
        target_columns = df.select_dtypes(include=['object']).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        # Track transformations per column
        col_transformed_count = 0
        
        def standardize_value(val):
            nonlocal col_transformed_count
            
            if pd.isna(val) or val is None:
                return val
            
            str_val = str(val)
            # Create canonical form: lowercase, trimmed, normalized spaces
            canonical = re.sub(r'\s+', ' ', str_val.lower().strip())
            
            if canonical != str_val:
                col_transformed_count += 1
            
            return canonical
        
        # Apply transformation
        processed_df[col] = processed_df[col].apply(standardize_value)
        
        if col_transformed_count > 0:
            columns_processed.append(col)
            rows_affected += col_transformed_count
            metadata[col] = {
                "method": "standardize",
                "transformed_count": col_transformed_count
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }