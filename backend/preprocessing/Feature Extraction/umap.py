"""
UMAP (Uniform Manifold Approximation and Projection) Implementation

This module provides UMAP-based dimensionality reduction.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler

# Try to import UMAP (optional dependency)
try:
    import umap
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False


def apply_umap(
    df: pd.DataFrame,
    columns: List[str],
    n_components: int = 2,
    target_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply UMAP (Uniform Manifold Approximation and Projection).
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        n_components: Number of components to extract
        target_column: Optional target column (not used in UMAP)
        **kwargs: Additional parameters (n_neighbors, min_dist, metric, random_state)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    if not HAS_UMAP:
        raise ImportError("UMAP requires umap-learn. Install with: pip install umap-learn")
    
    processed_df = df.copy()
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        raise ValueError("No numeric columns found for UMAP")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Standardize features
    scaler = StandardScaler()
    numeric_scaled = scaler.fit_transform(numeric_df)
    
    # Get UMAP parameters from kwargs
    n_neighbors = kwargs.get('n_neighbors', 15)
    min_dist = kwargs.get('min_dist', 0.1)
    metric = kwargs.get('metric', 'euclidean')
    random_state = kwargs.get('random_state', 42)
    
    # Apply UMAP
    n_components = min(n_components, numeric_df.shape[1])
    reducer = umap.UMAP(
        n_components=n_components,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric=metric,
        random_state=random_state
    )
    components = reducer.fit_transform(numeric_scaled)
    
    # Create component columns
    component_cols = [f"UMAP{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "method": "umap"
    }
