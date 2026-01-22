"""
Class Distribution Validation
Checks: Class balance, rare classes, class overlap
"""

import pandas as pd
from typing import Dict, Any, Optional

# Constants
COMMON_TARGET_NAMES = ['target', 'label', 'y', 'class', 'outcome', 'result']
BALANCED_RATIO = 2.0
MODERATE_IMBALANCE_RATIO = 5.0
RARE_CLASS_THRESHOLD = 1.0
MIN_SAMPLES_PER_CLASS = 30
MIN_CLASS_SIZE_RATIO = 0.01


def _detect_target_column(df: pd.DataFrame, target_column: Optional[str]) -> str:
    """Auto-detect target column if not provided"""
    if target_column:
        return target_column
    
    for col in df.columns:
        if col.lower() in COMMON_TARGET_NAMES:
            return col
    
    return df.columns[-1]


def _check_class_balance(target_series: pd.Series) -> Dict[str, Any]:
    """Check class balance in target variable"""
    class_counts = target_series.value_counts()
    total_samples = len(target_series)
    class_percentages = (class_counts / total_samples * 100).round(2)
    
    min_percentage = class_percentages.min()
    max_percentage = class_percentages.max()
    imbalance_ratio = max_percentage / min_percentage if min_percentage > 0 else float('inf')
    
    details = {
        "class_distribution": class_percentages.to_dict(),
        "imbalance_ratio": round(imbalance_ratio, 2),
        "total_classes": len(class_counts)
    }
    
    if imbalance_ratio <= BALANCED_RATIO:
        return {
            "name": "Class Balance",
            "status": "pass",
            "message": "Classes are well balanced",
            "details": details
        }
    
    if imbalance_ratio <= MODERATE_IMBALANCE_RATIO:
        details["suggestion"] = "Consider using class weights"
        return {
            "name": "Class Balance",
            "status": "warning",
            "message": f"Moderate class imbalance (ratio: {imbalance_ratio:.1f}:1)",
            "details": details
        }
    
    details["suggestion"] = "Use resampling techniques (SMOTE, undersampling) or class weights"
    return {
        "name": "Class Balance",
        "status": "fail",
        "message": f"Severe class imbalance (ratio: {imbalance_ratio:.1f}:1)",
        "details": details
    }


def _check_rare_classes(target_series: pd.Series) -> Dict[str, Any]:
    """Check for rare classes"""
    class_counts = target_series.value_counts()
    total_samples = len(target_series)
    class_percentages = (class_counts / total_samples * 100).round(2)
    
    rare_classes = class_percentages[class_percentages < RARE_CLASS_THRESHOLD]
    
    if len(rare_classes) == 0:
        return {
            "name": "Rare Classes",
            "status": "pass",
            "message": f"No rare classes detected (<{RARE_CLASS_THRESHOLD}% of data)",
            "details": {
                "rare_threshold": RARE_CLASS_THRESHOLD,
                "total_classes": len(class_counts)
            }
        }
    
    return {
        "name": "Rare Classes",
        "status": "warning",
        "message": f"Found {len(rare_classes)} rare class(es) with <{RARE_CLASS_THRESHOLD}% of data",
        "details": {
            "rare_classes": rare_classes.to_dict(),
            "suggestion": "Consider combining rare classes or using specialized techniques"
        }
    }


def _check_class_overlap(target_series: pd.Series) -> Dict[str, Any]:
    """Check class overlap / sufficient samples per class"""
    if pd.api.types.is_numeric_dtype(target_series):
        return {
            "name": "Class Overlap",
            "status": "info",
            "message": "Class overlap check is for categorical targets. Target is numeric.",
            "details": {"target_type": "numeric"}
        }
    
    class_counts = target_series.value_counts()
    total_samples = len(target_series)
    min_class_size = class_counts.min()
    recommended_min = max(MIN_SAMPLES_PER_CLASS, total_samples * MIN_CLASS_SIZE_RATIO)
    
    if min_class_size >= recommended_min:
        return {
            "name": "Class Overlap",
            "status": "pass",
            "message": f"All classes have sufficient samples (min: {min_class_size})",
            "details": {
                "min_class_size": int(min_class_size),
                "recommended_min": int(recommended_min)
            }
        }
    
    small_classes = class_counts[class_counts < recommended_min]
    return {
        "name": "Class Overlap",
        "status": "warning",
        "message": f"Some classes have very few samples (min: {min_class_size}, recommended: {int(recommended_min)})",
        "details": {
            "min_class_size": int(min_class_size),
            "recommended_min": int(recommended_min),
            "small_classes": small_classes.to_dict()
        }
    }


def validate_class_distribution(df: pd.DataFrame, target_column: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate class distribution in target variable
    
    Returns:
        {
            "checks": [...],
            "score": "2/3",
            "passed": 2,
            "total": 3,
            "category": "Class Distribution"
        }
    """
    target_column = _detect_target_column(df, target_column)
    
    if target_column not in df.columns:
        return {
            "checks": [{
                "name": "Target Column",
                "status": "fail",
                "message": f"Target column '{target_column}' not found",
                "details": {}
            }],
            "score": "0/3",
            "passed": 0,
            "total": 3,
            "category": "Class Distribution"
        }
    
    target_series = df[target_column].dropna()
    
    checks = [
        _check_class_balance(target_series),
        _check_rare_classes(target_series),
        _check_class_overlap(target_series)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning", "info"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Class Distribution"
    }