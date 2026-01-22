"""
Target Variable Validation
Checks: Target exists, target type, target distribution, target balance
"""

import pandas as pd
from typing import Dict, Any, Optional

# Constants
COMMON_TARGET_NAMES = ['target', 'label', 'y', 'class', 'outcome', 'result', 'dependent']
CLASSIFICATION_THRESHOLD = 20
SEVERE_IMBALANCE_RATIO = 10.0
RARE_CLASS_THRESHOLD = 1.0


def _detect_target_column(df: pd.DataFrame, target_column: Optional[str]) -> str:
    """Auto-detect target column if not provided"""
    if target_column:
        return target_column
    
    # Try common target names
    for col in df.columns:
        if col.lower() in COMMON_TARGET_NAMES:
            return col
    
    # Default to last column
    return df.columns[-1]


def _check_target_exists(df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
    """Check if target column exists"""
    if target_column in df.columns:
        return {
            "name": "Target Exists",
            "status": "pass",
            "message": f"Target column '{target_column}' found in dataset",
            "details": {
                "target_column": target_column,
                "total_columns": len(df.columns)
            }
        }
    
    return {
        "name": "Target Exists",
        "status": "fail",
        "message": f"Target column '{target_column}' not found in dataset",
        "details": {
            "target_column": target_column,
            "available_columns": df.columns.tolist()[:10]
        }
    }


def _check_target_type(target_series: pd.Series) -> Dict[str, Any]:
    """Check target variable type"""
    is_numeric = pd.api.types.is_numeric_dtype(target_series)
    unique_count = target_series.nunique()
    target_dtype = str(target_series.dtype)
    
    if is_numeric:
        if unique_count <= CLASSIFICATION_THRESHOLD:
            message = f"Target is numeric with {unique_count} unique values (likely classification)"
            suggestion = "Consider encoding as categorical for classification"
        else:
            message = f"Target is numeric with {unique_count} unique values (likely regression)"
            suggestion = None
        
        return {
            "name": "Target Type",
            "status": "pass",
            "message": message,
            "details": {
                "dtype": target_dtype,
                "unique_values": int(unique_count),
                "is_numeric": True,
                **({"suggestion": suggestion} if suggestion else {})
            }
        }
    
    # Categorical/object type
    return {
        "name": "Target Type",
        "status": "pass",
        "message": f"Target is categorical with {unique_count} unique values",
        "details": {
            "dtype": target_dtype,
            "unique_values": int(unique_count),
            "is_numeric": False,
            "unique_labels": target_series.unique().tolist()[:10]
        }
    }


def _check_target_distribution(target_series: pd.Series) -> Dict[str, Any]:
    """Check target distribution/balance"""
    is_numeric = pd.api.types.is_numeric_dtype(target_series)
    unique_count = target_series.nunique()
    
    # Regression target
    if is_numeric and unique_count > CLASSIFICATION_THRESHOLD:
        target_stats = target_series.describe()
        
        if target_stats['std'] == 0:
            return {
                "name": "Target Distribution",
                "status": "fail",
                "message": "Target has zero variance (all values are the same)",
                "details": {
                    "mean": float(target_stats['mean']),
                    "std": float(target_stats['std'])
                }
            }
        
        return {
            "name": "Target Distribution",
            "status": "pass",
            "message": "Target distribution looks reasonable for regression",
            "details": {
                "mean": round(float(target_stats['mean']), 2),
                "std": round(float(target_stats['std']), 2),
                "min": round(float(target_stats['min']), 2),
                "max": round(float(target_stats['max']), 2)
            }
        }
    
    # Classification target - check balance
    total_count = target_series.notna().sum()
    class_counts = target_series.value_counts()
    class_percentages = (class_counts / total_count * 100).round(2)
    
    min_percentage = class_percentages.min()
    max_percentage = class_percentages.max()
    imbalance_ratio = max_percentage / min_percentage if min_percentage > 0 else float('inf')
    
    if imbalance_ratio > SEVERE_IMBALANCE_RATIO:
        return {
            "name": "Target Distribution",
            "status": "warning",
            "message": f"Significant class imbalance detected (ratio: {imbalance_ratio:.1f}:1)",
            "details": {
                "class_distribution": class_percentages.to_dict(),
                "imbalance_ratio": round(imbalance_ratio, 2),
                "suggestion": "Consider using class weights or resampling techniques"
            }
        }
    
    if min_percentage < RARE_CLASS_THRESHOLD:
        return {
            "name": "Target Distribution",
            "status": "warning",
            "message": f"Very small class detected ({min_percentage}% of data)",
            "details": {
                "class_distribution": class_percentages.to_dict(),
                "suggestion": "Consider combining rare classes or using specialized techniques"
            }
        }
    
    return {
        "name": "Target Distribution",
        "status": "pass",
        "message": "Target classes are reasonably balanced",
        "details": {
            "class_distribution": class_percentages.to_dict(),
            "total_classes": len(class_counts)
        }
    }


def validate_target_variable(df: pd.DataFrame, target_column: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate target variable
    
    Returns:
        {
            "checks": [...],
            "score": "3/3",
            "passed": 3,
            "total": 3,
            "category": "Target Variable"
        }
    """
    target_column = _detect_target_column(df, target_column)
    
    # Check if target exists
    target_exists_check = _check_target_exists(df, target_column)
    
    if target_exists_check["status"] == "fail":
        return {
            "checks": [target_exists_check],
            "score": "0/3",
            "passed": 0,
            "total": 3,
            "category": "Target Variable"
        }
    
    target_series = df[target_column]
    
    checks = [
        target_exists_check,
        _check_target_type(target_series),
        _check_target_distribution(target_series)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Target Variable"
    }