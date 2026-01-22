"""
Linear Discriminant Analysis (LDA) Implementation

This module provides LDA-based dimensionality reduction for classification tasks.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.preprocessing import LabelEncoder


def apply_lda(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    n_components: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Linear Discriminant Analysis (LDA).
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        target_column: Target column (required for LDA)
        n_components: Number of components to extract
        **kwargs: Additional parameters (solver, shrinkage, priors, store_covariance)
        
    Returns:
        Dictionary with processed DataFrame and metadata
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
        raise ValueError("No numeric columns found for LDA")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Determine n_components
    n_classes = len(np.unique(target))
    max_components = min(n_classes - 1, numeric_df.shape[1])
    n_components = n_components or max_components
    n_components = min(n_components, max_components)
    
    # Get LDA parameters from kwargs
    solver = kwargs.get('solver', 'svd')
    shrinkage = kwargs.get('shrinkage', None)
    priors = kwargs.get('priors', None)
    store_covariance = kwargs.get('store_covariance', False)
    
    # Apply LDA
    lda = LDA(
        n_components=n_components,
        solver=solver,
        shrinkage=shrinkage,
        priors=priors,
        store_covariance=store_covariance
    )
    components = lda.fit_transform(numeric_df, target)
    
    # Create component columns
    component_cols = [f"LDA{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    variance_explained = float(lda.explained_variance_ratio_.sum()) if hasattr(lda, 'explained_variance_ratio_') else 0.0
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "variance_explained": variance_explained,
        "method": "lda"
    }
