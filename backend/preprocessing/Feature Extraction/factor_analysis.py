"""
Factor Analysis Implementation

This module provides Factor Analysis-based dimensionality reduction.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.decomposition import FactorAnalysis


def apply_factor_analysis(
    df: pd.DataFrame,
    columns: List[str],
    n_components: int = 2,
    target_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Factor Analysis.
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        n_components: Number of factors to extract
        target_column: Optional target column (not used)
        **kwargs: Additional parameters (rotation, max_iter, random_state, tol)
        
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
        raise ValueError("No numeric columns found for Factor Analysis")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Get Factor Analysis parameters from kwargs
    max_iter = kwargs.get('max_iter', 1000)
    random_state = kwargs.get('random_state', 42)
    tol = kwargs.get('tol', 1e-2)
    
    # Apply Factor Analysis
    n_components = min(n_components, numeric_df.shape[1])
    fa = FactorAnalysis(
        n_components=n_components,
        max_iter=max_iter,
        random_state=random_state,
        tol=tol
    )
    components = fa.fit_transform(numeric_df)
    
    # Create component columns
    component_cols = [f"Factor{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "method": "factor_analysis"
    }
