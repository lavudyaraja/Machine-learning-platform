"""
Feature Selection Main Module

This module serves as the main entry point for all feature selection operations.
It imports and orchestrates filter, wrapper, and embedded feature selection methods.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import sys

# Add current directory to path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import filter methods
from filter.filter_methods import (
    apply_variance_threshold,
    apply_correlation_selection,
    apply_mutual_info_selection,
    apply_chi2_selection,
    apply_f_test_selection
)

# Import wrapper methods
from wrapper.wrapper_methods import (
    apply_forward_selection,
    apply_backward_elimination,
    apply_rfe
)

# Import embedded methods
from embedded.embedded_methods import (
    apply_lasso_selection,
    apply_ridge_selection,
    apply_elastic_net_selection,
    apply_tree_importance
)


def process_feature_selection(
    dataset_path: str,
    method: str,
    columns: List[str],
    target_column: Optional[str] = None,
    n_features: Optional[int] = None,
    threshold: float = 0.0,
    correlation_threshold: float = 0.8,
    alpha: float = 0.01,
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process feature selection operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method: Selection method - 'variance_threshold', 'correlation', 'mutual_info', 
                'chi2', 'f_test', 'forward_selection', 'backward_elimination', 'rfe',
                'lasso', 'ridge', 'elastic_net', 'tree_importance'
        columns: List of columns to consider
        target_column: Target column (required for supervised methods)
        n_features: Number of features to select
        threshold: Threshold for variance method
        correlation_threshold: Correlation threshold for correlation method
        alpha: Regularization strength for lasso/ridge/elastic_net
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
    
    result = None
    
    # Apply feature selection based on method
    # Filter methods
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
    
    # Wrapper methods
    elif method == "forward_selection":
        if not target_column:
            raise ValueError("target_column is required for forward_selection")
        n_features = n_features or 10
        result = apply_forward_selection(df, columns, target_column, n_features, **kwargs)
    elif method == "backward_elimination":
        if not target_column:
            raise ValueError("target_column is required for backward_elimination")
        n_features = n_features or 10
        result = apply_backward_elimination(df, columns, target_column, n_features, **kwargs)
    elif method == "rfe" or method == "recursive_elimination":
        if not target_column:
            raise ValueError("target_column is required for recursive_elimination")
        n_features = n_features or 10
        result = apply_rfe(df, columns, target_column, n_features, **kwargs)
    
    # Embedded methods
    elif method == "lasso":
        if not target_column:
            raise ValueError("target_column is required for lasso selection")
        result = apply_lasso_selection(df, columns, target_column, n_features, alpha=alpha, **kwargs)
    elif method == "ridge":
        if not target_column:
            raise ValueError("target_column is required for ridge selection")
        n_features = n_features or 10
        result = apply_ridge_selection(df, columns, target_column, n_features, alpha=alpha, **kwargs)
    elif method == "elastic_net":
        if not target_column:
            raise ValueError("target_column is required for elastic_net selection")
        result = apply_elastic_net_selection(df, columns, target_column, n_features, alpha=alpha, **kwargs)
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
    
    # Convert processed_df to CSV string for in-memory transfer (no disk storage)
    processed_csv_content = processed_df.to_csv(index=False)
    
    # Prepare response (no disk storage)
    response = {
        "success": True,
        "processed_csv_content": processed_csv_content,
        "original_rows": original_rows,
        "original_columns": original_cols,
        "processed_rows": processed_rows,
        "processed_columns": processed_cols,
        "selected_features": selected_features,
        "removed_features": removed_features,
        "method": result.get("method", method)
    }
    
    return response
