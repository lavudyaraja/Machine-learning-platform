"""
Random Split Implementation

This module provides random train-test-validation splitting.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.model_selection import train_test_split


def apply_random_split(
    df: pd.DataFrame,
    test_size: float = 0.2,
    validation_size: Optional[float] = None,
    random_state: int = 42,
    shuffle: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply random train-test-validation split.
    
    Args:
        df: Input DataFrame
        test_size: Proportion of dataset to include in test split (0.0 to 1.0)
        validation_size: Optional proportion for validation split
        random_state: Random seed for reproducibility
        shuffle: Whether to shuffle data before splitting
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with train, test, and validation DataFrames
    """
    # Calculate sizes
    if validation_size is None or validation_size == 0:
        # Two-way split: train and test
        train_df, test_df = train_test_split(
            df,
            test_size=test_size,
            random_state=random_state,
            shuffle=shuffle
        )
        validation_df = pd.DataFrame()
    else:
        # Three-way split: train, validation, and test
        # First split: train + val vs test
        test_size_actual = test_size
        train_val_size = 1.0 - test_size_actual
        
        train_val_df, test_df = train_test_split(
            df,
            test_size=test_size_actual,
            random_state=random_state,
            shuffle=shuffle
        )
        
        # Second split: train vs validation
        val_size_relative = validation_size / train_val_size
        
        train_df, validation_df = train_test_split(
            train_val_df,
            test_size=val_size_relative,
            random_state=random_state,
            shuffle=shuffle
        )
    
    return {
        "train_df": train_df,
        "test_df": test_df,
        "validation_df": validation_df if validation_size and validation_size > 0 else pd.DataFrame(),
        "method": "random"
    }
