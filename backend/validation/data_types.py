"""
Data Types Validation
Checks: Type consistency, mixed types, numeric detection, categorical detection
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List

# Constants
MIXED_TYPE_THRESHOLD_LOW = 0.1
MIXED_TYPE_THRESHOLD_HIGH = 0.9
LOW_CARDINALITY_RATIO = 0.1
LOW_CARDINALITY_MAX = 20
CATEGORICAL_MAX_UNIQUE = 10
CATEGORICAL_RATIO = 0.1


def _check_type_consistency(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for type consistency in columns"""
    type_inconsistencies = []
    
    for col in df.select_dtypes(include=['object']).columns:
        numeric_count = pd.to_numeric(df[col], errors='coerce').notna().sum()
        total_count = df[col].notna().sum()
        
        if total_count > 0:
            numeric_ratio = numeric_count / total_count
            if MIXED_TYPE_THRESHOLD_LOW < numeric_ratio < MIXED_TYPE_THRESHOLD_HIGH:
                type_inconsistencies.append({
                    "column": col,
                    "current_type": "object",
                    "numeric_ratio": round(numeric_ratio, 2),
                    "suggestion": "Consider converting to numeric or cleaning data"
                })
    
    if not type_inconsistencies:
        return {
            "name": "Type Consistency",
            "status": "pass",
            "message": "All columns have consistent data types",
            "details": {
                "total_columns": len(df.columns),
                "type_summary": {str(k): int(v) for k, v in df.dtypes.value_counts().items()}
            }
        }
    
    return {
        "name": "Type Consistency",
        "status": "warning",
        "message": f"Found {len(type_inconsistencies)} columns with potential type inconsistencies",
        "details": {
            "inconsistencies": type_inconsistencies[:5],
            "total_columns": len(df.columns)
        }
    }


def _check_numeric_detection(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for numeric columns"""
    numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    numeric_count = len(numeric_columns)
    total_columns = len(df.columns)
    
    if numeric_count > 0:
        return {
            "name": "Numeric Detection",
            "status": "pass",
            "message": f"Found {numeric_count} numeric column(s)",
            "details": {
                "numeric_columns": numeric_columns,
                "numeric_count": numeric_count,
                "total_columns": total_columns
            }
        }
    
    return {
        "name": "Numeric Detection",
        "status": "warning",
        "message": "No numeric columns detected. Most ML models require numeric features.",
        "details": {
            "numeric_count": 0,
            "total_columns": total_columns
        }
    }


def _check_categorical_detection(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for categorical columns"""
    categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
    categorical_count = len(categorical_columns)
    
    # Check for low-cardinality numeric columns
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    potential_categorical = []
    
    for col in numeric_columns:
        unique_ratio = df[col].nunique() / len(df)
        unique_count = df[col].nunique()
        if unique_ratio < LOW_CARDINALITY_RATIO and unique_count < LOW_CARDINALITY_MAX:
            potential_categorical.append({
                "column": col,
                "unique_values": int(unique_count),
                "unique_ratio": round(unique_ratio, 3)
            })
    
    if categorical_count > 0 or potential_categorical:
        return {
            "name": "Categorical Detection",
            "status": "pass",
            "message": f"Found {categorical_count} categorical column(s) and {len(potential_categorical)} potential categorical column(s)",
            "details": {
                "categorical_columns": categorical_columns,
                "potential_categorical": potential_categorical[:5],
                "categorical_count": categorical_count
            }
        }
    
    return {
        "name": "Categorical Detection",
        "status": "info",
        "message": "No categorical columns detected",
        "details": {"categorical_count": 0}
    }


def _check_type_appropriateness(df: pd.DataFrame) -> Dict[str, Any]:
    """Check if data types are appropriate for their content"""
    type_issues = []
    
    for col in df.select_dtypes(include=['object']).columns:
        unique_count = df[col].nunique()
        total_count = len(df)
        
        if unique_count < CATEGORICAL_MAX_UNIQUE and unique_count < total_count * CATEGORICAL_RATIO:
            type_issues.append({
                "column": col,
                "current_type": "object",
                "unique_values": int(unique_count),
                "suggestion": "Consider converting to categorical type"
            })
    
    if not type_issues:
        return {
            "name": "Type Appropriateness",
            "status": "pass",
            "message": "Data types are appropriate for their content",
            "details": {}
        }
    
    return {
        "name": "Type Appropriateness",
        "status": "warning",
        "message": f"Found {len(type_issues)} columns that might benefit from type conversion",
        "details": {"type_issues": type_issues[:5]}
    }


def validate_data_types(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate data types in the dataset
    
    Returns:
        {
            "checks": [...],
            "score": "3/4",
            "passed": 3,
            "total": 4,
            "category": "Data Types"
        }
    """
    checks = [
        _check_type_consistency(df),
        _check_numeric_detection(df),
        _check_categorical_detection(df),
        _check_type_appropriateness(df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning", "info"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Data Types"
    }