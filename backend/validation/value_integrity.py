"""
Value Integrity Validation
Checks: Outliers, invalid values, range checks, format validation
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List

# Constants
IQR_MULTIPLIER = 1.5
HIGH_OUTLIER_THRESHOLD = 10.0
EXTREME_VALUE_THRESHOLD = 1e10
NEGATIVE_VALUE_KEYWORDS = ['age', 'count', 'quantity', 'amount', 'price', 'size']


def _check_outliers(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for outliers using IQR method"""
    numeric_df = df.select_dtypes(include=[np.number])
    
    if len(numeric_df.columns) == 0:
        return {
            "name": "Outliers Detection",
            "status": "info",
            "message": "No numeric columns to check for outliers",
            "details": {}
        }
    
    outlier_columns = []
    
    for col in numeric_df.columns:
        Q1 = numeric_df[col].quantile(0.25)
        Q3 = numeric_df[col].quantile(0.75)
        
        # Handle NaN values from quantile
        if pd.isna(Q1) or pd.isna(Q3):
            continue  # Skip columns with insufficient data
        
        IQR = Q3 - Q1
        lower_bound = Q1 - IQR_MULTIPLIER * IQR
        upper_bound = Q3 + IQR_MULTIPLIER * IQR
        
        # Handle NaN bounds
        if pd.isna(lower_bound) or pd.isna(upper_bound):
            continue
        
        outliers = numeric_df[(numeric_df[col] < lower_bound) | (numeric_df[col] > upper_bound)]
        outlier_count = len(outliers)
        
        if outlier_count > 0:
            outlier_percentage = (outlier_count / len(numeric_df)) * 100
            outlier_columns.append({
                "column": col,
                "outlier_count": int(outlier_count),
                "outlier_percentage": round(float(outlier_percentage), 2),
                "lower_bound": round(float(lower_bound), 2),
                "upper_bound": round(float(upper_bound), 2)
            })
    
    if not outlier_columns:
        return {
            "name": "Outliers Detection",
            "status": "pass",
            "message": "No significant outliers detected using IQR method",
            "details": {"numeric_columns_checked": len(numeric_df.columns)}
        }
    
    high_outlier_cols = [col for col in outlier_columns if col["outlier_percentage"] > HIGH_OUTLIER_THRESHOLD]
    
    if high_outlier_cols:
        status = "warning"
        message = f"Found outliers in {len(outlier_columns)} column(s), {len(high_outlier_cols)} with >{HIGH_OUTLIER_THRESHOLD}% outliers"
    else:
        status = "pass"
        message = f"Found outliers in {len(outlier_columns)} column(s), but percentage is acceptable"
    
    return {
        "name": "Outliers Detection",
        "status": status,
        "message": message,
        "details": {
            "outlier_columns": outlier_columns[:5],
            **({"suggestion": "Review outliers - they may be errors or require special handling"} if high_outlier_cols else {})
        }
    }


def _check_invalid_values(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for invalid values (inf, NaN strings)"""
    invalid_values = []
    
    for col in df.columns:
        inf_count = 0
        invalid_string_count = 0
        
        # Check for inf values
        if pd.api.types.is_numeric_dtype(df[col]):
            inf_count = df[col].isin([np.inf, -np.inf]).sum()
        
        # Check for invalid string representations
        if df[col].dtype == 'object':
            invalid_string_count = df[col].astype(str).str.lower().isin(
                ['nan', 'none', 'null', 'undefined', '']
            ).sum()
        
        total_invalid = inf_count + invalid_string_count
        if total_invalid > 0:
            invalid_values.append({
                "column": col,
                "inf_count": int(inf_count),
                "invalid_string_count": int(invalid_string_count),
                "total_invalid": int(total_invalid)
            })
    
    if not invalid_values:
        return {
            "name": "Invalid Values",
            "status": "pass",
            "message": "No invalid values (inf, NaN strings) detected",
            "details": {"columns_checked": len(df.columns)}
        }
    
    return {
        "name": "Invalid Values",
        "status": "warning",
        "message": f"Found invalid values in {len(invalid_values)} column(s)",
        "details": {
            "invalid_columns": invalid_values[:5],
            "suggestion": "Clean invalid values before processing"
        }
    }


def _check_range_issues(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for range issues in numeric columns"""
    numeric_df = df.select_dtypes(include=[np.number])
    
    if len(numeric_df.columns) == 0:
        return {
            "name": "Range Checks",
            "status": "info",
            "message": "No numeric columns to check for range issues",
            "details": {}
        }
    
    range_issues = []
    
    for col in numeric_df.columns:
        col_min = numeric_df[col].min()
        col_max = numeric_df[col].max()
        
        # Handle NaN values
        if pd.isna(col_min) or pd.isna(col_max):
            continue  # Skip columns with all NaN values
        
        col_lower = col.lower()
        
        # Check for extreme values
        if col_max > EXTREME_VALUE_THRESHOLD:
            range_issues.append({
                "column": col,
                "issue": "Very large maximum value",
                "max_value": float(col_max) if not pd.isna(col_max) else None,
                "min_value": float(col_min) if not pd.isna(col_min) else None
            })
        elif col_min < -EXTREME_VALUE_THRESHOLD:
            range_issues.append({
                "column": col,
                "issue": "Very small minimum value",
                "max_value": float(col_max) if not pd.isna(col_max) else None,
                "min_value": float(col_min) if not pd.isna(col_min) else None
            })
        # Check for negative values in columns that shouldn't have them
        elif any(keyword in col_lower for keyword in NEGATIVE_VALUE_KEYWORDS):
            if col_min < 0:
                range_issues.append({
                    "column": col,
                    "issue": "Negative values in non-negative column",
                    "min_value": float(col_min) if not pd.isna(col_min) else None
                })
    
    if not range_issues:
        return {
            "name": "Range Checks",
            "status": "pass",
            "message": "All numeric columns have reasonable value ranges",
            "details": {"numeric_columns_checked": len(numeric_df.columns)}
        }
    
    return {
        "name": "Range Checks",
        "status": "warning",
        "message": f"Found range issues in {len(range_issues)} column(s)",
        "details": {
            "range_issues": range_issues[:5],
            "suggestion": "Review value ranges - may indicate data quality issues"
        }
    }


def validate_value_integrity(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate value integrity in the dataset
    
    Returns:
        {
            "checks": [...],
            "score": "3/3",
            "passed": 3,
            "total": 3,
            "category": "Value Integrity"
        }
    """
    checks = [
        _check_outliers(df),
        _check_invalid_values(df),
        _check_range_issues(df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning", "info"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Value Integrity"
    }