"""
Stratified Split Implementation

This module provides stratified train-test-validation splitting for classification tasks.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.model_selection import train_test_split


def apply_stratified_split(
    df: pd.DataFrame,
    stratify_column: str,
    test_size: float = 0.2,
    validation_size: Optional[float] = None,
    random_state: int = 42,
    shuffle: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply stratified train-test-validation split.
    
    Args:
        df: Input DataFrame
        stratify_column: Column name to stratify on (target column for classification)
        test_size: Proportion of dataset to include in test split (0.0 to 1.0)
        validation_size: Optional proportion for validation split
        random_state: Random seed for reproducibility
        shuffle: Whether to shuffle data before splitting
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with train, test, and validation DataFrames
    """
    if stratify_column not in df.columns:
        raise ValueError(f"Stratify column '{stratify_column}' not found in dataset")
    
    stratify_values = df[stratify_column]
    
    if validation_size is None or validation_size == 0:
        # Two-way split: train and test
        train_df, test_df = train_test_split(
            df,
            test_size=test_size,
            stratify=stratify_values,
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
            stratify=stratify_values,
            random_state=random_state,
            shuffle=shuffle
        )
        
        # Second split: train vs validation (stratify on train_val subset)
        val_size_relative = validation_size / train_val_size
        train_val_stratify = train_val_df[stratify_column]
        
        train_df, validation_df = train_test_split(
            train_val_df,
            test_size=val_size_relative,
            stratify=train_val_stratify,
            random_state=random_state,
            shuffle=shuffle
        )
    
    return {
        "train_df": train_df,
        "test_df": test_df,
        "validation_df": validation_df if validation_size and validation_size > 0 else pd.DataFrame(),
        "method": "stratified"
    }
