"""
Support Vector Machine (SVM) Model Implementation

This module provides SVM classifier and regressor implementations.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.svm import SVC, SVR
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import warnings
warnings.filterwarnings('ignore')


def apply_svm(
    df: pd.DataFrame,
    target_column: str,
    task_type: str = "classification",
    kernel: str = "rbf",
    C: float = 1.0,
    gamma: Optional[str] = "scale",
    degree: int = 3,
    random_state: int = 42,
    **kwargs
) -> Dict[str, Any]:
    """
    Apply Support Vector Machine model.
    
    Args:
        df: Input DataFrame
        target_column: Target column name
        task_type: 'classification' or 'regression'
        kernel: Specifies the kernel type ('linear', 'poly', 'rbf', 'sigmoid')
        C: Regularization parameter
        gamma: Kernel coefficient ('scale', 'auto', or float)
        degree: Degree of the polynomial kernel function
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
    
    # Standardize features (important for SVM)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Convert target to numpy array
    y = y.values
    
    # Initialize model
    if task_type == "classification":
        model = SVC(
            kernel=kernel,
            C=C,
            gamma=gamma,
            degree=degree,
            random_state=random_state,
            probability=True
        )
    else:
        model = SVR(
            kernel=kernel,
            C=C,
            gamma=gamma,
            degree=degree
        )
    
    # Train model
    model.fit(X_scaled, y)
    
    # Make predictions
    predictions = model.predict(X_scaled)
    
    # Calculate metrics
    if task_type == "classification":
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
        
        accuracy = accuracy_score(y, predictions)
        precision = precision_score(y, predictions, average='weighted', zero_division=0)
        recall = recall_score(y, predictions, average='weighted', zero_division=0)
        f1 = f1_score(y, predictions, average='weighted', zero_division=0)
        cm = confusion_matrix(y, predictions).tolist()
        
        # Cross-validation score
        cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='accuracy')
        
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
        cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='neg_mean_squared_error')
        
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
        "model_type": "svm",
        "task_type": task_type,
        "target_encoder": target_encoder,
        "label_encoders": label_encoders,
        "scaler": scaler
    }
