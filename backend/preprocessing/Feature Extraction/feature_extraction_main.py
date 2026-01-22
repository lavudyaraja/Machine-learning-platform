"""
Feature Extraction Main Module

This module serves as the main entry point for all feature extraction operations.
It imports and exposes all feature extraction methods.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import sys

# Add current directory to path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import individual method modules
from pca import apply_pca
from lda import apply_lda
from ica import apply_ica
from svd import apply_svd
from factor_analysis import apply_factor_analysis
from tsne import apply_tsne
from umap import apply_umap


def process_feature_extraction(
    dataset_path: str,
    method: str,
    columns: Optional[List[str]] = None,
    n_components: int = 2,
    target_column: Optional[str] = None,
    variance_threshold: Optional[float] = None,
    random_state: int = 42,
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process feature extraction / dimensionality reduction operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method: Extraction method - 'pca', 'lda', 'ica', 'svd', 'factor_analysis', 'tsne', 'umap'
        columns: List of columns to use
        n_components: Number of components to extract
        target_column: Target column (required for LDA)
        variance_threshold: Optional variance threshold for PCA
        random_state: Random state for reproducibility
        **kwargs: Additional method-specific parameters
        
    Returns:
        Dictionary with processed DataFrame path and metadata
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # If columns is empty or None, use all numeric columns
    if not columns:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        columns = numeric_cols
        if not columns:
            raise ValueError("No numeric columns found in dataset. Please specify columns to use.")
    
    # Validate columns
    invalid_columns = [col for col in columns if col not in df.columns]
    if invalid_columns:
        raise ValueError(f"Columns not found in dataset: {invalid_columns}")
    
    # Add random_state to kwargs if not present
    if 'random_state' not in kwargs:
        kwargs['random_state'] = random_state
    
    # Apply extraction based on method
    if method == "pca":
        result = apply_pca(df, columns, n_components=n_components, target_column=target_column, **kwargs)
    elif method == "lda":
        if not target_column:
            raise ValueError("target_column is required for LDA")
        result = apply_lda(df, columns, target_column, n_components=n_components, **kwargs)
    elif method == "ica":
        result = apply_ica(df, columns, n_components=n_components, target_column=target_column, **kwargs)
    elif method == "svd":
        result = apply_svd(df, columns, n_components=n_components, target_column=target_column, **kwargs)
    elif method == "factor_analysis":
        result = apply_factor_analysis(df, columns, n_components=n_components, target_column=target_column, **kwargs)
    elif method == "tsne":
        result = apply_tsne(df, columns, n_components=n_components, target_column=target_column, **kwargs)
    elif method == "umap":
        result = apply_umap(df, columns, n_components=n_components, target_column=target_column, **kwargs)
    else:
        raise ValueError(f"Unknown extraction method: {method}")
    
    processed_df = result["processed_df"]
    processed_rows, processed_cols = processed_df.shape
    
    # Convert DataFrame to CSV string for response
    import io
    csv_buffer = io.StringIO()
    processed_df.to_csv(csv_buffer, index=False)
    processed_csv_content = csv_buffer.getvalue()
    
    # Prepare response
    response = {
        "success": True,
        "processed_csv_content": processed_csv_content,
        "original_rows": original_rows,
        "original_columns": original_cols,
        "processed_rows": processed_rows,
        "processed_columns": processed_cols,
        "extracted_components": result.get("components", []),
        "variance_explained": result.get("variance_explained", 0.0),
        "explained_variance_ratio": result.get("explained_variance_ratio", []),
        "method": result.get("method", method)
    }
    
    return response


# Export all functions for direct access if needed
__all__ = [
    # Individual methods
    "apply_pca",
    "apply_lda",
    "apply_ica",
    "apply_svd",
    "apply_factor_analysis",
    "apply_tsne",
    "apply_umap",
    # Main function
    "process_feature_extraction"
]
