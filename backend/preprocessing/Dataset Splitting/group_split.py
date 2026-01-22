"""
Group Split Implementation

This module provides group-based train-test-validation splitting.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.model_selection import train_test_split


def apply_group_split(
    df: pd.DataFrame,
    group_column: str,
    test_size: float = 0.2,
    validation_size: Optional[float] = None,
    random_state: int = 42,
    shuffle: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply group-based train-test-validation split.
    
    Args:
        df: Input DataFrame
        group_column: Column name to group by
        test_size: Proportion of groups to include in test split (0.0 to 1.0)
        validation_size: Optional proportion for validation split
        random_state: Random seed for reproducibility
        shuffle: Whether to shuffle groups before splitting
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with train, test, and validation DataFrames
    """
    if group_column not in df.columns:
        raise ValueError(f"Group column '{group_column}' not found in dataset")
    
    # Get unique groups
    unique_groups = df[group_column].unique()
    
    # Shuffle groups if requested
    if shuffle:
        np.random.seed(random_state)
        unique_groups = np.random.permutation(unique_groups)
    
    # Split groups
    total_groups = len(unique_groups)
    
    if validation_size is None or validation_size == 0:
        # Two-way split: train and test groups
        test_group_count = int(total_groups * test_size)
        test_groups = set(unique_groups[:test_group_count])
        train_groups = set(unique_groups[test_group_count:])
        val_groups = set()
    else:
        # Three-way split: train, validation, and test groups
        test_group_count = int(total_groups * test_size)
        val_group_count = int(total_groups * validation_size)
        
        test_groups = set(unique_groups[:test_group_count])
        val_groups = set(unique_groups[test_group_count:test_group_count + val_group_count])
        train_groups = set(unique_groups[test_group_count + val_group_count:])
    
    # Split DataFrame based on groups
    train_df = df[df[group_column].isin(train_groups)].copy()
    test_df = df[df[group_column].isin(test_groups)].copy()
    validation_df = df[df[group_column].isin(val_groups)].copy() if val_groups else pd.DataFrame()
    
    return {
        "train_df": train_df,
        "test_df": test_df,
        "validation_df": validation_df if validation_size and validation_size > 0 else pd.DataFrame(),
        "method": "group"
    }
