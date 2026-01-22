"""
Embedded Feature Selection Methods

This module contains implementations for embedded feature selection methods.
Embedded methods perform feature selection as part of the learning process.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.linear_model import LassoCV, LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def apply_lasso_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: Optional[int] = None,
    alpha: float = 0.01,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using Lasso regularization.
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Optional number of features to select
        alpha: Regularization strength
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
            "method": "lasso_selection"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        model = LogisticRegression(penalty='l1', solver='liblinear', C=1.0/alpha, max_iter=1000, random_state=42)
    else:
        model = LassoCV(cv=5, random_state=42)
    
    model.fit(numeric_df, target)
    
    # Select features with non-zero coefficients
    if hasattr(model, 'coef_'):
        if model.coef_.ndim > 1:
            # For multi-class, use max absolute coefficient
            coef = np.abs(model.coef_).max(axis=0)
        else:
            coef = np.abs(model.coef_)
        selected_indices = np.where(coef > 1e-5)[0]
        selected_cols = numeric_df.columns[selected_indices].tolist()
    else:
        selected_cols = numeric_cols
    
    # Limit to n_features if specified
    if n_features and len(selected_cols) > n_features:
        # Sort by coefficient magnitude
        coef_values = coef[selected_indices]
        top_indices = np.argsort(coef_values)[-n_features:]
        selected_cols = [numeric_df.columns[selected_indices[i]] for i in top_indices]
    
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "lasso_selection"
    }


def apply_ridge_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    alpha: float = 1.0,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using Ridge regularization (L2).
    Note: Ridge doesn't perform feature selection directly, so we use F-test instead.
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Number of features to select
        alpha: Regularization strength
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with selected features and metadata
    """
    # Ridge doesn't perform feature selection, so we use F-test as alternative
    from sklearn.feature_selection import SelectKBest, f_classif, f_regression
    
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
            "method": "ridge_selection"
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
        "method": "ridge_selection"
    }


def apply_elastic_net_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: Optional[int] = None,
    alpha: float = 0.01,
    l1_ratio: float = 0.5,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using Elastic Net regularization (L1 + L2).
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Optional number of features to select
        alpha: Regularization strength
        l1_ratio: Mixing parameter (0 = Ridge, 1 = Lasso)
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
            "method": "elastic_net_selection"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        from sklearn.linear_model import ElasticNet
        model = ElasticNet(alpha=alpha, l1_ratio=l1_ratio, max_iter=1000, random_state=42)
        # For classification, we'll use LogisticRegression with elasticnet
        model = LogisticRegression(
            penalty='elasticnet', 
            solver='saga', 
            C=1.0/alpha, 
            l1_ratio=l1_ratio,
            max_iter=1000, 
            random_state=42
        )
    else:
        from sklearn.linear_model import ElasticNetCV
        model = ElasticNetCV(cv=5, l1_ratio=l1_ratio, random_state=42)
    
    model.fit(numeric_df, target)
    
    # Select features with non-zero coefficients
    if hasattr(model, 'coef_'):
        if model.coef_.ndim > 1:
            coef = np.abs(model.coef_).max(axis=0)
        else:
            coef = np.abs(model.coef_)
        selected_indices = np.where(coef > 1e-5)[0]
        selected_cols = numeric_df.columns[selected_indices].tolist()
    else:
        selected_cols = numeric_cols
    
    # Limit to n_features if specified
    if n_features and len(selected_cols) > n_features:
        coef_values = coef[selected_indices]
        top_indices = np.argsort(coef_values)[-n_features:]
        selected_cols = [numeric_df.columns[selected_indices[i]] for i in top_indices]
    
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "elastic_net_selection"
    }


def apply_tree_importance(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: int = 10,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features based on tree-based feature importance.
    
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
            "method": "tree_importance"
        }
    
    # Determine if classification or regression
    is_classification = len(np.unique(target)) < 20
    
    if is_classification:
        model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    
    model.fit(numeric_df, target)
    
    # Get feature importances
    importances = model.feature_importances_
    feature_importance = list(zip(numeric_cols, importances))
    feature_importance.sort(key=lambda x: x[1], reverse=True)
    
    selected_cols = [col for col, _ in feature_importance[:n_features]]
    removed_cols = [col for col in numeric_cols if col not in selected_cols]
    
    return {
        "selected_features": selected_cols,
        "removed_features": removed_cols,
        "method": "tree_importance"
    }
