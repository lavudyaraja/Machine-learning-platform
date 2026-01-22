"""
K-Nearest Neighbors (KNN) Model Implementation

This module provides KNN classifier and regressor implementations.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def apply_knn(
    df: pd.DataFrame,
    target_column: str,
    task_type: str = "classification",
    n_neighbors: int = 5,
    weights: str = "uniform",
    algorithm: str = "auto",
    metric: str = "minkowski",
    p: int = 2,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply K-Nearest Neighbors model.
    
    Args:
        df: Input DataFrame
        target_column: Target column name
        task_type: 'classification' or 'regression'
        n_neighbors: Number of neighbors to use
        weights: Weight function used in prediction ('uniform' or 'distance')
        algorithm: Algorithm used to compute nearest neighbors
        metric: Distance metric to use
        p: Power parameter for Minkowski metric
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
        model = KNeighborsClassifier(
            n_neighbors=n_neighbors,
            weights=weights,
            algorithm=algorithm,
            metric=metric,
            p=p
        )
    else:
        model = KNeighborsRegressor(
            n_neighbors=n_neighbors,
            weights=weights,
            algorithm=algorithm,
            metric=metric,
            p=p
        )
    
    # Train model
    model.fit(X, y)
    
    # Make predictions
    predictions = model.predict(X)
    
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
            "cv_std_score": float(cv_scores.std())
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
            "cv_std_score": float(cv_scores.std())
        }
    
    return {
        "model": model,
        "predictions": predictions.tolist(),
        "metrics": metrics,
        "model_type": "knn",
        "task_type": task_type,
        "target_encoder": target_encoder,
        "label_encoders": label_encoders
    }
