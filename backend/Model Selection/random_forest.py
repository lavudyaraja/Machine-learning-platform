"""
Random Forest Model Implementation

This module provides Random Forest classifier and regressor implementations.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def apply_random_forest(
    df: pd.DataFrame,
    target_column: str,
    task_type: str = "classification",
    n_estimators: int = 100,
    max_depth: Optional[int] = None,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    max_features: Optional[str] = "sqrt",
    random_state: int = 42,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Random Forest model.
    
    Args:
        df: Input DataFrame
        target_column: Target column name
        task_type: 'classification' or 'regression'
        n_estimators: Number of trees in the forest
        max_depth: Maximum depth of the tree
        min_samples_split: Minimum number of samples required to split a node
        min_samples_leaf: Minimum number of samples required at a leaf node
        max_features: Number of features to consider when looking for the best split
        random_state: Random seed for reproducibility
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with model, predictions, and metrics
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    # Prepare features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    # Handle missing values
    X = X.fillna(X.mean() if task_type == "regression" else X.mode().iloc[0])
    
    # Encode categorical features
    categorical_cols = X.select_dtypes(include=['object']).columns
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        label_encoders[col] = le
    
    # Encode target for classification
    if task_type == "classification" and y.dtype == 'object':
        target_encoder = LabelEncoder()
        y = target_encoder.fit_transform(y.astype(str))
    else:
        target_encoder = None
    
    # Convert to numpy arrays
    X = X.values
    y = y.values
    
    # Initialize model
    if task_type == "classification":
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            max_features=max_features,
            random_state=random_state,
            n_jobs=-1
        )
    else:
        model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            max_features=max_features,
            random_state=random_state,
            n_jobs=-1
        )
    
    # Train model
    model.fit(X, y)
    
    # Make predictions
    predictions = model.predict(X)
    
    # Feature importance
    feature_importance = model.feature_importances_.tolist()
    feature_names = df.drop(columns=[target_column]).columns.tolist()
    
    # Calculate metrics
    if task_type == "classification":
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
        
        accuracy = accuracy_score(y, predictions)
        precision = precision_score(y, predictions, average='weighted', zero_division=0)
        recall = recall_score(y, predictions, average='weighted', zero_division=0)
        f1 = f1_score(y, predictions, average='weighted', zero_division=0)
        cm = confusion_matrix(y, predictions).tolist()
        
        # Cross-validation score
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
        
        metrics = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "confusion_matrix": cm,
            "cv_mean_score": float(cv_scores.mean()),
            "cv_std_score": float(cv_scores.std()),
            "feature_importance": dict(zip(feature_names, feature_importance))
        }
    else:
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        
        mse = mean_squared_error(y, predictions)
        mae = mean_absolute_error(y, predictions)
        r2 = r2_score(y, predictions)
        rmse = np.sqrt(mse)
        
        # Cross-validation score
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error')
        
        metrics = {
            "mse": float(mse),
            "mae": float(mae),
            "rmse": float(rmse),
            "r2_score": float(r2),
            "cv_mean_score": float(-cv_scores.mean()),
            "cv_std_score": float(cv_scores.std()),
            "feature_importance": dict(zip(feature_names, feature_importance))
        }
    
    return {
        "model": model,
        "predictions": predictions.tolist(),
        "metrics": metrics,
        "model_type": "random_forest",
        "task_type": task_type,
        "target_encoder": target_encoder,
        "label_encoders": label_encoders
    }
