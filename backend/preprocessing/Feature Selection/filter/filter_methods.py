"""
Filter-based Feature Selection Methods

This module contains implementations for filter-based feature selection methods.
Filter methods are fast and independent of any learning algorithm.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.feature_selection import (
    VarianceThreshold, SelectKBest, f_classif, f_regression,
    chi2, mutual_info_classif, mutual_info_regression
)
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def apply_variance_threshold(
    df: pd.DataFrame,
    columns: List[str],
    threshold: float = 0.0,
    **kwargs
) -> Dict[str, Any]:
    """
    Remove features with low variance.
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        threshold: Variance threshold
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with selected features and metadata
    """
    processed_df = df.copy()
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return {
            "selected_features": [],
            "removed_features": columns,
            "method": "variance_threshold"
        }
    
    selector = VarianceThreshold(threshold=threshold)
    selector.fit(numeric_df)
    
    selected_cols = numeric_df.columns[selector.get_support()].tolist()
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "variance_threshold"
    }


def apply_correlation_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: Optional[str] = None,
    threshold: float = 0.8,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features based on correlation with target or remove highly correlated features.
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column for correlation
        threshold: Correlation threshold
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with selected features and metadata
    """
    processed_df = df.copy()
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return {
            "selected_features": [],
            "removed_features": columns,
            "method": "correlation_selection"
        }
    
    if target_column and target_column in processed_df.columns:
        # Select based on correlation with target
        target_series = pd.to_numeric(processed_df[target_column], errors='coerce')
        correlations = numeric_df.corrwith(target_series).abs()
        selected_cols = correlations[correlations >= threshold].index.tolist()
    else:
        # Remove highly correlated features
        corr_matrix = numeric_df.corr().abs()
        upper_triangle = corr_matrix.where(
            np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
        )
        to_drop = [column for column in upper_triangle.columns if any(upper_triangle[column] > threshold)]
        selected_cols = [col for col in numeric_cols if col not in to_drop]
    
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "correlation_selection"
    }


def apply_mutual_info_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features based on mutual information with target.
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Number of features to select
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with selected features and metadata
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    processed_df = df.copy()
    
    # Prepare target
    target = processed_df[target_column]
    if target.dtype == 'object':
        le = LabelEncoder()
        target = le.fit_transform(target.astype(str))
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns and col != target_column]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return {
            "selected_features": [],
            "removed_features": columns,
            "method": "mutual_info_selection"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        scores = mutual_info_classif(numeric_df, target, random_state=42)
    else:
        scores = mutual_info_regression(numeric_df, target, random_state=42)
    
    # Select top n features
    feature_scores = list(zip(numeric_cols, scores))
    feature_scores.sort(key=lambda x: x[1], reverse=True)
    selected_cols = [col for col, _ in feature_scores[:n_features]]
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "mutual_info_selection"
    }


def apply_chi2_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using chi-squared test (for classification).
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Number of features to select
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with selected features and metadata
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    processed_df = df.copy()
    
    # Prepare target
    target = processed_df[target_column]
    if target.dtype == 'object':
        le = LabelEncoder()
        target = le.fit_transform(target.astype(str))
    
    # Select numeric columns (chi2 requires non-negative values)
    numeric_cols = [col for col in columns if col in processed_df.columns and col != target_column]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        # Ensure non-negative for chi2
        if processed_df[col].min() < 0:
            processed_df[col] = processed_df[col] - processed_df[col].min()
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return {
            "selected_features": [],
            "removed_features": columns,
            "method": "chi2_selection"
        }
    
    try:
        selector = SelectKBest(score_func=chi2, k=min(n_features, len(numeric_cols)))
        selector.fit(numeric_df, target)
        selected_cols = numeric_df.columns[selector.get_support()].tolist()
    except ValueError:
        # If chi2 fails, fall back to all features
        selected_cols = numeric_cols[:n_features]
    
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "chi2_selection"
    }


def apply_f_test_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using F-test (ANOVA F-value).
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Number of features to select
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with selected features and metadata
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    processed_df = df.copy()
    
    # Prepare target
    target = processed_df[target_column]
    if target.dtype == 'object':
        le = LabelEncoder()
        target = le.fit_transform(target.astype(str))
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns and col != target_column]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return {
            "selected_features": [],
            "removed_features": columns,
            "method": "f_test_selection"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        score_func = f_classif
    else:
        score_func = f_regression
    
    selector = SelectKBest(score_func=score_func, k=min(n_features, len(numeric_cols)))
    selector.fit(numeric_df, target)
    selected_cols = numeric_df.columns[selector.get_support()].tolist()
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "f_test_selection"
    }
