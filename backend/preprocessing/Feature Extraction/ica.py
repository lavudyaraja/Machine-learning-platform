"""
Independent Component Analysis (ICA) Implementation

This module provides ICA-based feature extraction.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.decomposition import FastICA
from sklearn.preprocessing import StandardScaler


def apply_ica(
    df: pd.DataFrame,
    columns: List[str],
    n_components: int = 2,
    target_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Independent Component Analysis (ICA).
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        n_components: Number of components to extract
        target_column: Optional target column (not used in ICA)
        **kwargs: Additional parameters (algorithm, fun, max_iter, random_state, tol, whiten)
        
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
        raise ValueError("No numeric columns found for ICA")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Standardize features
    scaler = StandardScaler()
    numeric_scaled = scaler.fit_transform(numeric_df)
    
    # Get ICA parameters from kwargs
    algorithm = kwargs.get('algorithm', 'parallel')
    fun = kwargs.get('fun', 'logcosh')
    max_iter = kwargs.get('max_iter', 1000)
    random_state = kwargs.get('random_state', 42)
    tol = kwargs.get('tol', 1e-4)
    whiten = kwargs.get('whiten', True)
    
    # Apply ICA
    n_components = min(n_components, numeric_df.shape[1])
    ica = FastICA(
        n_components=n_components,
        algorithm=algorithm,
        fun=fun,
        max_iter=max_iter,
        random_state=random_state,
        tol=tol,
        whiten=whiten
    )
    components = ica.fit_transform(numeric_scaled)
    
    # Create component columns
    component_cols = [f"ICA{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "method": "ica"
    }
