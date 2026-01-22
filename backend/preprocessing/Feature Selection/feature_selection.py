"""
Feature Selection Module

This module provides various feature selection methods for preprocessing datasets.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
from sklearn.feature_selection import (
    VarianceThreshold, SelectKBest, f_classif, f_regression,
    chi2, mutual_info_classif, mutual_info_regression,
    RFE, SelectFromModel
)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LassoCV, LogisticRegression
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


def apply_recursive_elimination(
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
            "method": "recursive_elimination"
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
        "method": "recursive_elimination"
    }


def apply_lasso_selection(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_features: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Select features using Lasso regularization.
    
    Args:
        df: Input DataFrame
        columns: List of column names to consider
        target_column: Target column
        n_features: Optional number of features to select
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
        model = LogisticRegression(penalty='l1', solver='liblinear', max_iter=1000, random_state=42)
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


def process_feature_selection(
    dataset_path: str,
    method: str,
    columns: List[str],
    target_column: Optional[str] = None,
    n_features: Optional[int] = None,
    threshold: float = 0.0,
    correlation_threshold: float = 0.8,
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process feature selection operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method: Selection method - 'variance_threshold', 'correlation', 'mutual_info', 
                'chi2', 'f_test', 'recursive_elimination', 'lasso', 'tree_importance'
        columns: List of columns to consider
        target_column: Target column (required for supervised methods)
        n_features: Number of features to select
        threshold: Threshold for variance or correlation methods
        correlation_threshold: Correlation threshold for correlation method
        **kwargs: Additional method-specific parameters
        
    Returns:
        Dictionary with processed DataFrame path and metadata
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # Validate columns
    invalid_columns = [col for col in columns if col not in df.columns]
    if invalid_columns:
        raise ValueError(f"Columns not found in dataset: {invalid_columns}")
    
    # Apply feature selection based on method
    if method == "variance_threshold":
        result = apply_variance_threshold(df, columns, threshold=threshold, **kwargs)
    elif method == "correlation":
        result = apply_correlation_selection(
            df, columns, target_column=target_column, 
            threshold=correlation_threshold, **kwargs
        )
    elif method == "mutual_info":
        if not target_column:
            raise ValueError("target_column is required for mutual_info selection")
        n_features = n_features or 10
        result = apply_mutual_info_selection(df, columns, target_column, n_features, **kwargs)
    elif method == "chi2":
        if not target_column:
            raise ValueError("target_column is required for chi2 selection")
        n_features = n_features or 10
        result = apply_chi2_selection(df, columns, target_column, n_features, **kwargs)
    elif method == "f_test":
        if not target_column:
            raise ValueError("target_column is required for f_test selection")
        n_features = n_features or 10
        result = apply_f_test_selection(df, columns, target_column, n_features, **kwargs)
    elif method == "recursive_elimination":
        if not target_column:
            raise ValueError("target_column is required for recursive_elimination")
        n_features = n_features or 10
        result = apply_recursive_elimination(df, columns, target_column, n_features, **kwargs)
    elif method == "lasso":
        if not target_column:
            raise ValueError("target_column is required for lasso selection")
        result = apply_lasso_selection(df, columns, target_column, n_features, **kwargs)
    elif method == "tree_importance":
        if not target_column:
            raise ValueError("target_column is required for tree_importance selection")
        n_features = n_features or 10
        result = apply_tree_importance(df, columns, target_column, n_features, **kwargs)
    else:
        raise ValueError(f"Unknown selection method: {method}")
    
    selected_features = result.get("selected_features", [])
    removed_features = result.get("removed_features", [])
    
    # Create processed dataset with only selected features
    # Keep all non-selected columns and add selected features
    all_columns = df.columns.tolist()
    columns_to_keep = [col for col in all_columns if col not in columns or col in selected_features]
    
    processed_df = df[columns_to_keep]
    processed_rows, processed_cols = processed_df.shape
    
    # Save processed dataset
    output_dir = Path(dataset_path).parent
    output_filename = f"selected_{Path(dataset_path).stem}_{method}.csv"
    output_path = output_dir / output_filename
    processed_df.to_csv(output_path, index=False)
    
    # Prepare response
    response = {
        "success": True,
        "processed_path": str(output_path),
        "original_rows": original_rows,
        "original_columns": original_cols,
        "processed_rows": processed_rows,
        "processed_columns": processed_cols,
        "selected_features": selected_features,
        "removed_features": removed_features,
        "method": result.get("method", method)
    }
    
    return response

