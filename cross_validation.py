"""
Cross-Validation Implementation for Machine Learning Models

This module provides comprehensive cross-validation functionality using scikit-learn.
Supports multiple CV strategies: K-Fold, Stratified K-Fold, Leave-One-Out, 
Time Series Split, and Shuffle Split.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union, Any
from sklearn.model_selection import (
    KFold,
    StratifiedKFold,
    LeaveOneOut,
    TimeSeriesSplit,
    ShuffleSplit,
    cross_val_score,
    cross_validate
)
from sklearn.base import BaseEstimator
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    make_scorer
)
import json


class CrossValidation:
    """
    Comprehensive cross-validation class for evaluating machine learning models.
    
    Supports multiple cross-validation strategies and various evaluation metrics.
    """
    
    def __init__(
        self,
        cv_type: str = "kfold",
        n_folds: Optional[int] = 5,
        n_splits: Optional[int] = None,
        test_size: Optional[float] = None,
        random_state: Optional[int] = 42,
        shuffle: bool = True,
        stratify: bool = False
    ):
        """
        Initialize cross-validation configuration.
        
        Parameters:
        -----------
        cv_type : str
            Type of cross-validation: 'kfold', 'stratified_kfold', 'leave_one_out',
            'time_series_split', or 'shuffle_split'
        n_folds : int, optional
            Number of folds for K-Fold or Stratified K-Fold
        n_splits : int, optional
            Number of splits for Shuffle Split
        test_size : float, optional
            Test size ratio for Shuffle Split (0.0 to 1.0)
        random_state : int, optional
            Random seed for reproducibility
        shuffle : bool
            Whether to shuffle data before splitting
        stratify : bool
            Whether to stratify splits (maintain class distribution)
        """
        self.cv_type = cv_type.lower()
        self.n_folds = n_folds
        self.n_splits = n_splits
        self.test_size = test_size
        self.random_state = random_state
        self.shuffle = shuffle
        self.stratify = stratify
        self.cv_splitter = None
        self._initialize_cv_splitter()
    
    def _initialize_cv_splitter(self):
        """Initialize the appropriate cross-validation splitter based on type."""
        if self.cv_type == "kfold":
            self.cv_splitter = KFold(
                n_splits=self.n_folds or 5,
                shuffle=self.shuffle,
                random_state=self.random_state
            )
        elif self.cv_type == "stratified_kfold":
            self.cv_splitter = StratifiedKFold(
                n_splits=self.n_folds or 5,
                shuffle=self.shuffle,
                random_state=self.random_state
            )
        elif self.cv_type == "leave_one_out":
            self.cv_splitter = LeaveOneOut()
        elif self.cv_type == "time_series_split":
            self.cv_splitter = TimeSeriesSplit(n_splits=self.n_folds or 5)
        elif self.cv_type == "shuffle_split":
            self.cv_splitter = ShuffleSplit(
                n_splits=self.n_splits or 5,
                test_size=self.test_size or 0.2,
                random_state=self.random_state
            )
        else:
            raise ValueError(
                f"Unknown CV type: {self.cv_type}. "
                "Supported types: 'kfold', 'stratified_kfold', 'leave_one_out', "
                "'time_series_split', 'shuffle_split'"
            )
    
    def _get_scoring_metric(self, problem_type: str = "classification") -> Union[str, callable]:
        """
        Get appropriate scoring metric based on problem type.
        
        Parameters:
        -----------
        problem_type : str
            'classification' or 'regression'
        
        Returns:
        --------
        str or callable
            Scoring metric name or scorer function
        """
        if problem_type == "classification":
            return "accuracy"  # Can be extended to support other metrics
        elif problem_type == "regression":
            return "neg_mean_squared_error"  # Returns negative MSE
        else:
            return "accuracy"
    
    def _detect_problem_type(self, y: pd.Series) -> str:
        """
        Detect if the problem is classification or regression.
        
        Parameters:
        -----------
        y : pd.Series
            Target variable
        
        Returns:
        --------
        str
            'classification' or 'regression'
        """
        # Check if target is numeric and has many unique values
        if pd.api.types.is_numeric_dtype(y):
            unique_ratio = y.nunique() / len(y)
            # If more than 20% unique values, likely regression
            if unique_ratio > 0.2:
                return "regression"
        return "classification"
    
    def perform_cross_validation(
        self,
        model: BaseEstimator,
        X: pd.DataFrame,
        y: pd.Series,
        scoring: Optional[Union[str, callable, List]] = None,
        return_train_score: bool = False,
        n_jobs: int = -1
    ) -> Dict[str, Any]:
        """
        Perform cross-validation on a model.
        
        Parameters:
        -----------
        model : BaseEstimator
            Scikit-learn model to evaluate
        X : pd.DataFrame
            Feature matrix
        y : pd.Series
            Target variable
        scoring : str, callable, or list, optional
            Scoring metric(s) to use. If None, auto-detects based on problem type.
        return_train_score : bool
            Whether to return training scores
        n_jobs : int
            Number of parallel jobs (-1 for all cores)
        
        Returns:
        --------
        dict
            Dictionary containing CV results with keys:
            - mean_score: Mean CV score
            - std_score: Standard deviation of CV scores
            - scores: List of scores for each fold
            - fold_results: Detailed results for each fold
        """
        # Auto-detect problem type and scoring if not provided
        if scoring is None:
            problem_type = self._detect_problem_type(y)
            scoring = self._get_scoring_metric(problem_type)
        
        # Handle stratified CV
        if self.cv_type == "stratified_kfold" and self.stratify:
            # Ensure we use stratified splitter
            if not isinstance(self.cv_splitter, StratifiedKFold):
                self.cv_splitter = StratifiedKFold(
                    n_splits=self.n_folds or 5,
                    shuffle=self.shuffle,
                    random_state=self.random_state
                )
        
        # Perform cross-validation
        try:
            cv_results = cross_validate(
                model,
                X,
                y,
                cv=self.cv_splitter,
                scoring=scoring,
                return_train_score=return_train_score,
                n_jobs=n_jobs,
                return_estimator=False
            )
        except ValueError as e:
            # Fallback to cross_val_score if cross_validate fails
            scores = cross_val_score(
                model,
                X,
                y,
                cv=self.cv_splitter,
                scoring=scoring,
                n_jobs=n_jobs
            )
            cv_results = {"test_score": scores}
        
        # Extract scores
        if isinstance(scoring, list):
            # Multiple metrics
            all_scores = {}
            for metric in scoring:
                key = f"test_{metric}" if f"test_{metric}" in cv_results else "test_score"
                scores = cv_results.get(key, cv_results.get("test_score", []))
                all_scores[metric] = scores
            primary_scores = all_scores[list(all_scores.keys())[0]]
        else:
            # Single metric
            primary_scores = cv_results.get("test_score", [])
            if len(primary_scores) == 0:
                primary_scores = list(cv_results.values())[0] if cv_results else []
        
        # Calculate statistics
        mean_score = np.mean(primary_scores)
        std_score = np.std(primary_scores)
        
        # Get fold sizes
        fold_results = []
        for fold_idx, (train_idx, test_idx) in enumerate(self.cv_splitter.split(X, y)):
            fold_results.append({
                "fold": fold_idx + 1,
                "trainSize": len(train_idx),
                "testSize": len(test_idx),
                "score": float(primary_scores[fold_idx]) if fold_idx < len(primary_scores) else 0.0
            })
        
        return {
            "meanScore": float(mean_score),
            "stdScore": float(std_score),
            "scores": [float(score) for score in primary_scores],
            "foldResults": fold_results
        }
    
    def perform_cross_validation_detailed(
        self,
        model: BaseEstimator,
        X: pd.DataFrame,
        y: pd.Series,
        metrics: Optional[List[str]] = None,
        n_jobs: int = -1
    ) -> Dict[str, Any]:
        """
        Perform cross-validation with detailed metrics for each fold.
        
        Parameters:
        -----------
        model : BaseEstimator
            Scikit-learn model to evaluate
        X : pd.DataFrame
            Feature matrix
        y : pd.Series
            Target variable
        metrics : list of str, optional
            List of metric names to compute. If None, uses default metrics.
        n_jobs : int
            Number of parallel jobs
        
        Returns:
        --------
        dict
            Detailed CV results with metrics for each fold
        """
        problem_type = self._detect_problem_type(y)
        
        if metrics is None:
            if problem_type == "classification":
                metrics = ["accuracy", "precision", "recall", "f1"]
            else:
                metrics = ["mse", "mae", "r2"]
        
        fold_results = []
        all_scores = {metric: [] for metric in metrics}
        
        for fold_idx, (train_idx, test_idx) in enumerate(self.cv_splitter.split(X, y)):
            X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
            y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
            
            # Train model
            model.fit(X_train, y_train)
            
            # Predict
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            fold_metrics = {}
            for metric in metrics:
                if problem_type == "classification":
                    if metric == "accuracy":
                        score = accuracy_score(y_test, y_pred)
                    elif metric == "precision":
                        score = precision_score(y_test, y_pred, average="weighted", zero_division=0)
                    elif metric == "recall":
                        score = recall_score(y_test, y_pred, average="weighted", zero_division=0)
                    elif metric == "f1":
                        score = f1_score(y_test, y_pred, average="weighted", zero_division=0)
                    elif metric == "roc_auc":
                        try:
                            # Only for binary classification
                            if y.nunique() == 2:
                                y_pred_proba = model.predict_proba(X_test)[:, 1]
                                score = roc_auc_score(y_test, y_pred_proba)
                            else:
                                score = 0.0
                        except:
                            score = 0.0
                    else:
                        score = 0.0
                else:  # regression
                    if metric == "mse":
                        score = mean_squared_error(y_test, y_pred)
                    elif metric == "mae":
                        score = mean_absolute_error(y_test, y_pred)
                    elif metric == "r2":
                        score = r2_score(y_test, y_pred)
                    else:
                        score = 0.0
                
                fold_metrics[metric] = float(score)
                all_scores[metric].append(score)
            
            fold_results.append({
                "fold": fold_idx + 1,
                "trainSize": len(train_idx),
                "testSize": len(test_idx),
                "metrics": fold_metrics
            })
        
        # Calculate summary statistics
        summary = {}
        for metric, scores in all_scores.items():
            summary[metric] = {
                "mean": float(np.mean(scores)),
                "std": float(np.std(scores)),
                "min": float(np.min(scores)),
                "max": float(np.max(scores))
            }
        
        return {
            "summary": summary,
            "foldResults": fold_results,
            "allScores": {k: [float(s) for s in v] for k, v in all_scores.items()}
        }


def run_cross_validation(
    model: BaseEstimator,
    X: pd.DataFrame,
    y: pd.Series,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Convenience function to run cross-validation with a configuration dictionary.
    
    Parameters:
    -----------
    model : BaseEstimator
        Scikit-learn model to evaluate
    X : pd.DataFrame
        Feature matrix
    y : pd.Series
        Target variable
    config : dict
        Configuration dictionary with keys:
        - type: CV type ('kfold', 'stratified_kfold', etc.)
        - nFolds: Number of folds
        - nSplits: Number of splits (for shuffle_split)
        - testSize: Test size (for shuffle_split)
        - randomState: Random seed
        - shuffle: Whether to shuffle
        - stratify: Whether to stratify
    
    Returns:
    --------
    dict
        Cross-validation results
    """
    cv = CrossValidation(
        cv_type=config.get("type", "kfold"),
        n_folds=config.get("nFolds"),
        n_splits=config.get("nSplits"),
        test_size=config.get("testSize"),
        random_state=config.get("randomState", 42),
        shuffle=config.get("shuffle", True),
        stratify=config.get("stratify", False)
    )
    
    return cv.perform_cross_validation(model, X, y)


# Example usage
if __name__ == "__main__":
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.datasets import make_classification
    
    # Generate sample data
    X, y = make_classification(
        n_samples=1000,
        n_features=20,
        n_informative=10,
        n_redundant=10,
        n_classes=2,
        random_state=42
    )
    X = pd.DataFrame(X, columns=[f"feature_{i}" for i in range(20)])
    y = pd.Series(y, name="target")
    
    # Create model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    
    # Test different CV types
    print("Testing K-Fold Cross-Validation...")
    cv_kfold = CrossValidation(cv_type="kfold", n_folds=5, random_state=42)
    results_kfold = cv_kfold.perform_cross_validation(model, X, y)
    print(f"Mean Score: {results_kfold['meanScore']:.4f} ± {results_kfold['stdScore']:.4f}")
    print()
    
    print("Testing Stratified K-Fold Cross-Validation...")
    cv_stratified = CrossValidation(cv_type="stratified_kfold", n_folds=5, random_state=42)
    results_stratified = cv_stratified.perform_cross_validation(model, X, y)
    print(f"Mean Score: {results_stratified['meanScore']:.4f} ± {results_stratified['stdScore']:.4f}")
    print()
    
    print("Testing Shuffle Split Cross-Validation...")
    cv_shuffle = CrossValidation(
        cv_type="shuffle_split",
        n_splits=5,
        test_size=0.2,
        random_state=42
    )
    results_shuffle = cv_shuffle.perform_cross_validation(model, X, y)
    print(f"Mean Score: {results_shuffle['meanScore']:.4f} ± {results_shuffle['stdScore']:.4f}")
    print()
    
    print("Cross-validation implementation complete!")

