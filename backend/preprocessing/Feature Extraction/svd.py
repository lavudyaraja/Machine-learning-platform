"""
Singular Value Decomposition (SVD) Implementation

This module provides SVD-based dimensionality reduction.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.decomposition import TruncatedSVD


def apply_svd(
    df: pd.DataFrame,
    columns: List[str],
    n_components: int = 2,
    target_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Singular Value Decomposition (SVD).
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        n_components: Number of components to extract
        target_column: Optional target column (not used in SVD)
        **kwargs: Additional parameters (algorithm, n_iter, random_state, tol)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        raise ValueError("No numeric columns found for SVD")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Get SVD parameters from kwargs
    algorithm = kwargs.get('algorithm', 'randomized')
    n_iter = kwargs.get('n_iter', 7)
    random_state = kwargs.get('random_state', 42)
    tol = kwargs.get('tol', 0.0)
    
    # Apply SVD
    n_components = min(n_components, numeric_df.shape[1])
    svd = TruncatedSVD(
        n_components=n_components,
        algorithm=algorithm,
        n_iter=n_iter,
        random_state=random_state,
        tol=tol
    )
    components = svd.fit_transform(numeric_df)
    
    # Create component columns
    component_cols = [f"SVD{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    variance_explained = svd.explained_variance_ratio_.sum()
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "variance_explained": float(variance_explained),
        "explained_variance_ratio": svd.explained_variance_ratio_.tolist(),
        "method": "svd"
    }
