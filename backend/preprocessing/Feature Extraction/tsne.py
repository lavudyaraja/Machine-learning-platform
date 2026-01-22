"""
t-SNE (t-distributed Stochastic Neighbor Embedding) Implementation

This module provides t-SNE-based dimensionality reduction.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler

# Try to import t-SNE (optional dependency)
try:
    from sklearn.manifold import TSNE
    HAS_TSNE = True
except ImportError:
    HAS_TSNE = False


def apply_tsne(
    df: pd.DataFrame,
    columns: List[str],
    n_components: int = 2,
    target_column: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply t-SNE (t-distributed Stochastic Neighbor Embedding).
    
    Args:
        df: Input DataFrame
        columns: List of column names to use
        n_components: Number of components to extract (typically 2 or 3)
        target_column: Optional target column (not used in t-SNE)
        **kwargs: Additional parameters (perplexity, early_exaggeration, learning_rate, n_iter, random_state)
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    if not HAS_TSNE:
        raise ImportError("t-SNE requires scikit-learn. Install with: pip install scikit-learn")
    
    processed_df = df.copy()
    
    # Select numeric columns
    numeric_cols = [col for col in columns if col in processed_df.columns]
    for col in numeric_cols:
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    numeric_df = processed_df[numeric_cols].select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        raise ValueError("No numeric columns found for t-SNE")
    
    # Handle missing values
    numeric_df = numeric_df.fillna(numeric_df.mean())
    
    # Standardize features
    scaler = StandardScaler()
    numeric_scaled = scaler.fit_transform(numeric_df)
    
    # Get t-SNE parameters from kwargs
    perplexity = kwargs.get('perplexity', min(30, len(numeric_df) - 1))
    early_exaggeration = kwargs.get('early_exaggeration', 12.0)
    learning_rate = kwargs.get('learning_rate', 'auto')
    n_iter = kwargs.get('n_iter', 1000)
    random_state = kwargs.get('random_state', 42)
    
    # Apply t-SNE (limit to 3 components max)
    n_components = min(n_components, 3, numeric_df.shape[1])
    tsne = TSNE(
        n_components=n_components,
        perplexity=perplexity,
        early_exaggeration=early_exaggeration,
        learning_rate=learning_rate,
        n_iter=n_iter,
        random_state=random_state
    )
    components = tsne.fit_transform(numeric_scaled)
    
    # Create component columns
    component_cols = [f"tSNE{i+1}" for i in range(n_components)]
    components_df = pd.DataFrame(components, columns=component_cols, index=processed_df.index)
    
    # Remove original columns and add components
    processed_df = processed_df.drop(columns=numeric_cols)
    processed_df = pd.concat([processed_df, components_df], axis=1)
    
    return {
        "processed_df": processed_df,
        "components": component_cols,
        "method": "tsne"
    }
