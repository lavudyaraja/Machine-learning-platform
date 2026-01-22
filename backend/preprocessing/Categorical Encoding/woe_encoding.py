"""
Weight of Evidence (WoE) Encoding Module
Applies Weight of Evidence encoding to categorical columns.
Calculates the logarithmic ratio of positive to negative events per category.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List


def apply_woe_encoding(
    df: pd.DataFrame,
    columns: List[str],
    target_column: str,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Weight of Evidence (WoE) encoding to categorical columns.
    Calculates the logarithmic ratio of positive to negative events per category.
    
    WoE = ln((% of positive events in category) / (% of negative events in category))
    
    Args:
        df: Input DataFrame
        columns: List of column names to encode
        target_column: Name of the target column (must be binary: 0/1)
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with processed DataFrame and metadata
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    # Validate target is binary
    unique_targets = df[target_column].unique()
    if not all(val in [0, 1] for val in unique_targets):
        raise ValueError(f"Target column '{target_column}' must be binary (0/1) for WoE encoding")
    
    processed_df = df.copy()
    encoded_columns = []
    mappings = {}
    
    # Calculate overall positive and negative rates
    total_positive = (processed_df[target_column] == 1).sum()
    total_negative = (processed_df[target_column] == 0).sum()
    
    if total_positive == 0 or total_negative == 0:
        raise ValueError("Target column must have both positive and negative cases for WoE encoding")
    
    for col in columns:
        if col not in processed_df.columns or col == target_column:
            continue
        
        # Calculate WoE for each category
        woe_map = {}
        
        for category in processed_df[col].astype(str).unique():
            # Get rows with this category
            category_mask = processed_df[col].astype(str) == category
            category_df = processed_df[category_mask]
            
            # Count positive and negative in this category
            positive_in_category = (category_df[target_column] == 1).sum()
            negative_in_category = (category_df[target_column] == 0).sum()
            
            # Calculate percentages
            pct_positive = positive_in_category / total_positive if total_positive > 0 else 0
            pct_negative = negative_in_category / total_negative if total_negative > 0 else 0
            
            # Calculate WoE
            if pct_positive > 0 and pct_negative > 0:
                woe = np.log(pct_positive / pct_negative)
            elif pct_positive > 0:
                # Only positive cases, use high positive value
                woe = 10.0  # High positive WoE
            elif pct_negative > 0:
                # Only negative cases, use high negative value
                woe = -10.0  # High negative WoE
            else:
                # No cases, use 0
                woe = 0.0
            
            woe_map[category] = woe
        
        mappings[col] = woe_map
        
        # Apply WoE encoding
        processed_df[col] = processed_df[col].astype(str).map(woe_map)
        
        # Fill NaN with 0 (for unseen categories)
        processed_df[col] = processed_df[col].fillna(0.0)
        
        encoded_columns.append(col)
    
    return {
        "processed_df": processed_df,
        "encoded_columns": encoded_columns,
        "mappings": mappings,
        "method": "woe_encoding"
    }
