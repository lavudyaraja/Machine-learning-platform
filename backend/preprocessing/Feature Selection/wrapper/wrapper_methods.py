"""
Wrapper-based Feature Selection Methods

This module contains implementations for wrapper-based feature selection methods.
Wrapper methods use a learning algorithm to evaluate feature subsets.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def apply_forward_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using forward selection (wrapper method).
    Uses RFE with forward direction.
    
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
            "method": "forward_selection"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        estimator = LogisticRegression(max_iter=1000, random_state=42)
    else:
        from sklearn.linear_model import LinearRegression
        estimator = LinearRegression()
    
    selector = RFE(estimator=estimator, n_features_to_select=min(n_features, len(numeric_cols)))
    selector.fit(numeric_df, target)
    selected_cols = numeric_df.columns[selector.get_support()].tolist()
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "forward_selection"
    }


def apply_backward_elimination(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using backward elimination (wrapper method).
    Uses RFE which inherently performs backward elimination.
    
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
            "method": "backward_elimination"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        estimator = LogisticRegression(max_iter=1000, random_state=42)
    else:
        from sklearn.linear_model import LinearRegression
        estimator = LinearRegression()
    
    selector = RFE(estimator=estimator, n_features_to_select=min(n_features, len(numeric_cols)))
    selector.fit(numeric_df, target)
    selected_cols = numeric_df.columns[selector.get_support()].tolist()
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "backward_elimination"
    }


def apply_rfe(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using Recursive Feature Elimination (RFE).
    
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
            "method": "rfe"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        estimator = LogisticRegression(max_iter=1000, random_state=42)
    else:
        from sklearn.linear_model import LinearRegression
        estimator = LinearRegression()
    
    selector = RFE(estimator=estimator, n_features_to_select=min(n_features, len(numeric_cols)))
    selector.fit(numeric_df, target)
    selected_cols = numeric_df.columns[selector.get_support()].tolist()
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "rfe"
    }
