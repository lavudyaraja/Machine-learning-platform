"""
Principal Component Analysis (PCA) Implementation

This module provides PCA-based dimensionality reduction.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


def apply_pca(
    df: pd.DataFrame,
    columns: List[str],
    n_components: int = 2,
    target_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Principal Component Analysis (PCA).
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        n_components: Number of components to extract
        target_column: Optional target column (not used in PCA)
        **kwargs: Additional parameters (svd_solver, whiten, random_state, tol)
        
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
        raise ValueError("No numeric columns found for PCA")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Standardize features
    scaler = StandardScaler()
    numeric_scaled = scaler.fit_transform(numeric_df)
    
    # Get PCA parameters from kwargs
    svd_solver = kwargs.get('svd_solver', 'auto')
    whiten = kwargs.get('whiten', False)
    random_state = kwargs.get('random_state', 42)
    tol = kwargs.get('tol', 0.0)
    
    # Apply PCA
    n_components = min(n_components, numeric_df.shape[1])
    pca = PCA(
        n_components=n_components,
        svd_solver=svd_solver,
        whiten=whiten,
        random_state=random_state,
        tol=tol
    )
    components = pca.fit_transform(numeric_scaled)
    
    # Create component columns
    component_cols = [f"PC{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    variance_explained = pca.explained_variance_ratio_.sum()
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "variance_explained": float(variance_explained),
        "explained_variance_ratio": pca.explained_variance_ratio_.tolist(),
        "method": "pca"
    }
