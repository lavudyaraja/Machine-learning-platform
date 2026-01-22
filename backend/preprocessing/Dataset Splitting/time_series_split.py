"""
Time Series Split Implementation

This module provides time-based train-test-validation splitting for time series data.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime


def apply_time_series_split(
    df: pd.DataFrame,
    time_column: Optional[str] = None,
    test_size: float = 0.2,
    validation_size: Optional[float] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply time-based train-test-validation split (chronological order).
    
    Args:
        df: Input DataFrame
        time_column: Optional column name for time-based sorting
        test_size: Proportion of dataset to include in test split (0.0 to 1.0)
        validation_size: Optional proportion for validation split
        **kwargs: Additional parameters (shuffle and random_state ignored for time series)
        
    Returns:
        Dictionary with train, test, and validation DataFrames
    """
    # Sort by time column if provided
    if time_column and time_column in df.columns:
        # Try to convert to datetime
        try:
            df[time_column] = pd.to_datetime(df[time_column])
            df = df.sort_values(by=time_column).reset_index(drop=True)
        except (ValueError, TypeError):
            # If conversion fails, try numeric sorting
            try:
                df[time_column] = pd.to_numeric(df[time_column], errors='coerce')
                df = df.sort_values(by=time_column).reset_index(drop=True)
            except (ValueError, TypeError):
                # If both fail, use index order (assume already chronological)
                pass
    else:
        # No time column, use index order (assume already chronological)
        df = df.reset_index(drop=True)
    
    total_rows = len(df)
    
    # Calculate split indices
    test_start = int(total_rows * (1 - test_size))
    if validation_size and validation_size > 0:
        val_start = int(total_rows * (1 - test_size - validation_size))
        train_df = df.iloc[:val_start].copy()
        validation_df = df.iloc[val_start:test_start].copy()
        test_df = df.iloc[test_start:].copy()
    else:
        train_df = df.iloc[:test_start].copy()
        validation_df = pd.DataFrame()
        test_df = df.iloc[test_start:].copy()
    
    return {
        "train_df": train_df,
        "test_df": test_df,
        "validation_df": validation_df if validation_size and validation_size > 0 else pd.DataFrame(),
        "method": "time_series"
    }
