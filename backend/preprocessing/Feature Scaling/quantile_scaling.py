"""
Quantile Scaling Module
Applies quantile transformation to numerical columns.
"""

import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import QuantileTransformer


def apply_quantile_scaling(
    df: pd.DataFrame,
    columns: List[str],
    n_quantiles: int = 1000,
    output_distribution: str = "uniform",
    **kwargs
) -> Dict[str, Any]:
    """
    Apply quantile transformation to numerical columns.
    
    Args:
        df: Input DataFrame
        columns: List of column names to scale
        n_quantiles: Number of quantiles to compute
        output_distribution: Output distribution ('uniform' or 'normal')
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    processed_df = df.copy()
    scaled_columns = []
    scalers = {}
    
    for col in columns:
        if col not in processed_df.columns:
            continue
        
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        
        if processed_df[col].isna().all():
            continue
        
        scaler = QuantileTransformer(
            n_quantiles=min(n_quantiles, len(processed_df)),
            output_distribution=output_distribution,
            random_state=42
        )
        processed_df[col] = scaler.fit_transform(processed_df[[col]])
        scaled_columns.append(col)
        scalers[col] = {
            "n_quantiles": n_quantiles,
            "output_distribution": output_distribution
        }
    
    return {
        "processed_df": processed_df,
        "scaled_columns": scaled_columns,
        "scalers": scalers,
        "method": "quantile_scaling"
    }
