"""
Numerical Data Cleaning Methods Implementation

This module contains implementations for numerical data cleaning methods.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union


def handle_missing_values_numerical(
    df: pd.DataFrame,
    strategy: str,
    columns: Optional[List[str]] = None,
    constant_value: Optional[Union[int, float]] = None
) -> Dict[str, Any]:
    """
    Handle missing values in numerical columns.
    
    Args:
        df: Input DataFrame
        strategy: 'mean', 'median', 'mode', 'constant', 'zero', 'interpolate', 'forward_fill', 'backward_fill'
        columns: List of columns to process
        constant_value: Value to use for constant strategy
        
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
        target_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        if not pd.api.types.is_numeric_dtype(processed_df[col]):
            continue
        
        missing_count = processed_df[col].isnull().sum()
        if missing_count == 0:
            continue
        
        fill_value = None
        
        if strategy == "mean":
            fill_value = processed_df[col].mean()
        elif strategy == "median":
            fill_value = processed_df[col].median()
        elif strategy == "mode":
            mode_values = processed_df[col].mode()
            fill_value = mode_values[0] if len(mode_values) > 0 else 0
        elif strategy == "constant":
            fill_value = constant_value if constant_value is not None else 0
        elif strategy == "zero":
            fill_value = 0
        elif strategy == "interpolate":
            processed_df[col] = processed_df[col].interpolate(method='linear')
            columns_processed.append(col)
            missing_handled += missing_count
            metadata[col] = {
                "strategy": strategy,
                "missing_count": int(missing_count)
            }
            continue
        elif strategy == "forward_fill":
            # Use ffill() instead of deprecated method
            processed_df[col] = processed_df[col].ffill()
            columns_processed.append(col)
            missing_handled += missing_count
            metadata[col] = {
                "strategy": strategy,
                "missing_count": int(missing_count)
            }
            continue
        elif strategy == "backward_fill":
            # Use bfill() instead of deprecated method
            processed_df[col] = processed_df[col].bfill()
            columns_processed.append(col)
            missing_handled += missing_count
            metadata[col] = {
                "strategy": strategy,
                "missing_count": int(missing_count)
            }
            continue
        
        if fill_value is not None and not pd.isna(fill_value):
            processed_df[col].fillna(fill_value, inplace=True)
            columns_processed.append(col)
            missing_handled += missing_count
            metadata[col] = {
                "strategy": strategy,
                "fill_value": float(fill_value),
                "missing_count": int(missing_count)
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "missing_handled": missing_handled,
        "metadata": metadata
    }


def apply_log_transformation(
    df: pd.DataFrame,
    method: str,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Apply logarithmic transformation to numerical columns.
    
    Args:
        df: Input DataFrame
        method: 'log' or 'log1p'
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
        target_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        if not pd.api.types.is_numeric_dtype(processed_df[col]):
            continue
        
        transformed_count = 0
        zero_count = 0
        negative_count = 0
        
        original_values = processed_df[col].copy()
        
        try:
            if method == "log":
                # Only transform positive values
                mask = (processed_df[col] > 0) & (~pd.isna(processed_df[col]))
                if mask.sum() > 0:
                    processed_df.loc[mask, col] = np.log(processed_df.loc[mask, col])
                    transformed_count = mask.sum()
                    zero_count = ((original_values == 0) & (~pd.isna(original_values))).sum()
                    negative_count = ((original_values < 0) & (~pd.isna(original_values))).sum()
            elif method == "log1p":
                # log1p can handle zeros
                mask = (processed_df[col] >= 0) & (~pd.isna(processed_df[col]))
                if mask.sum() > 0:
                    processed_df.loc[mask, col] = np.log1p(processed_df.loc[mask, col])
                    transformed_count = mask.sum()
                    negative_count = ((original_values < 0) & (~pd.isna(original_values))).sum()
        except Exception as e:
            print(f"Error transforming column {col}: {str(e)}")
            continue
        
        if transformed_count > 0:
            columns_processed.append(col)
            rows_affected += transformed_count
            metadata[col] = {
                "method": method,
                "transformed_count": int(transformed_count),
                "zero_count": int(zero_count),
                "negative_count": int(negative_count)
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }


def handle_outliers(
    df: pd.DataFrame,
    method: str,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Detect and handle outliers in numerical columns.
    
    Args:
        df: Input DataFrame
        method: 'iqr' (Interquartile Range)
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
        target_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        if not pd.api.types.is_numeric_dtype(processed_df[col]):
            continue
        
        if method == "iqr":
            Q1 = processed_df[col].quantile(0.25)
            Q3 = processed_df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_count = 0
            
            # Cap outliers
            mask = ~pd.isna(processed_df[col])
            lower_outliers = (processed_df[col] < lower_bound) & mask
            upper_outliers = (processed_df[col] > upper_bound) & mask
            
            processed_df.loc[lower_outliers, col] = lower_bound
            processed_df.loc[upper_outliers, col] = upper_bound
            
            outlier_count = lower_outliers.sum() + upper_outliers.sum()
            
            if outlier_count > 0:
                columns_processed.append(col)
                rows_affected += outlier_count
                metadata[col] = {
                    "method": method,
                    "q1": float(Q1),
                    "q3": float(Q3),
                    "iqr": float(IQR),
                    "lower_bound": float(lower_bound),
                    "upper_bound": float(upper_bound),
                    "outlier_count": int(outlier_count)
                }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }


def fix_skewness(
    df: pd.DataFrame,
    method: str,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Fix skewness in numerical columns.
    
    Args:
        df: Input DataFrame
        method: 'log' or 'sqrt'
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
        target_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        if not pd.api.types.is_numeric_dtype(processed_df[col]):
            continue
        
        transformed_count = 0
        
        try:
            if method == "log":
                mask = (processed_df[col] > 0) & (~pd.isna(processed_df[col]))
                if mask.sum() > 0:
                    processed_df.loc[mask, col] = np.log(processed_df.loc[mask, col])
                    transformed_count = mask.sum()
            elif method == "sqrt":
                mask = (processed_df[col] >= 0) & (~pd.isna(processed_df[col]))
                if mask.sum() > 0:
                    processed_df.loc[mask, col] = np.sqrt(processed_df.loc[mask, col])
                    transformed_count = mask.sum()
        except Exception as e:
            print(f"Error fixing skewness for column {col}: {str(e)}")
            continue
        
        if transformed_count > 0:
            columns_processed.append(col)
            rows_affected += transformed_count
            metadata[col] = {
                "method": method,
                "transformed_count": int(transformed_count)
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }


def remove_collinearity(
    df: pd.DataFrame,
    threshold: float = 0.95,
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Remove highly correlated numerical columns.
    
    Args:
        df: Input DataFrame
        threshold: Correlation threshold (default 0.95)
        columns: List of columns to consider (None = all numerical)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    
    if columns:
        target_columns = [col for col in columns if col in df.columns]
    else:
        target_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(target_columns) < 2:
        return {
            "processed_df": processed_df,
            "columns_removed": [],
            "metadata": {}
        }
    
    # Calculate correlation matrix
    corr_matrix = processed_df[target_columns].corr().abs()
    
    # Find highly correlated pairs
    columns_to_remove = set()
    correlations = {}
    
    for i in range(len(corr_matrix.columns)):
        for j in range(i + 1, len(corr_matrix.columns)):
            col1 = corr_matrix.columns[i]
            col2 = corr_matrix.columns[j]
            corr_value = corr_matrix.iloc[i, j]
            
            if corr_value > threshold:
                # Remove the second column (arbitrary choice)
                columns_to_remove.add(col2)
                if col1 not in correlations:
                    correlations[col1] = {}
                correlations[col1][col2] = float(corr_value)
    
    # Remove columns
    if columns_to_remove:
        processed_df = processed_df.drop(columns=list(columns_to_remove))
    
    return {
        "processed_df": processed_df,
        "columns_removed": list(columns_to_remove),
        "metadata": {
            "threshold": threshold,
            "correlations": correlations
        }
    }


def smooth_noisy_data(
    df: pd.DataFrame,
    method: str,
    columns: Optional[List[str]] = None,
    window_size: int = 3
) -> Dict[str, Any]:
    """
    Smooth noisy data in numerical columns.
    
    Args:
        df: Input DataFrame
        method: 'moving_average' or 'binning'
        columns: List of columns to process
        window_size: Window size for moving average
        
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
        target_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in target_columns:
        if col not in processed_df.columns:
            continue
        
        if not pd.api.types.is_numeric_dtype(processed_df[col]):
            continue
        
        if method == "moving_average":
            # Apply rolling mean
            smoothed = processed_df[col].rolling(window=window_size, center=True, min_periods=1).mean()
            processed_df[col] = smoothed
            columns_processed.append(col)
            rows_affected += len(processed_df)
            metadata[col] = {
                "method": method,
                "window_size": window_size
            }
        
        elif method == "binning":
            # Create bins and replace with bin centers
            num_bins = 10
            min_val = processed_df[col].min()
            max_val = processed_df[col].max()
            
            if pd.isna(min_val) or pd.isna(max_val) or max_val == min_val:
                continue
            
            bin_width = (max_val - min_val) / num_bins
            
            def bin_value(val):
                if pd.isna(val):
                    return val
                bin_idx = min(int((float(val) - min_val) / bin_width), num_bins - 1)
                return min_val + (bin_idx + 0.5) * bin_width
            
            processed_df[col] = processed_df[col].apply(bin_value)
            columns_processed.append(col)
            rows_affected += len(processed_df)
            metadata[col] = {
                "method": method,
                "num_bins": num_bins,
                "min": float(min_val),
                "max": float(max_val),
                "bin_width": float(bin_width)
            }
    
    return {
        "processed_df": processed_df,
        "columns_processed": columns_processed,
        "rows_affected": rows_affected,
        "metadata": metadata
    }