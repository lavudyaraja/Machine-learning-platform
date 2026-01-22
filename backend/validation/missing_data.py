"""
Missing Data Validation
Checks: Missing value count, missing percentage, missing patterns
"""

import pandas as pd
from typing import Dict, Any

# Constants
LOW_MISSING_THRESHOLD = 5.0
MODERATE_MISSING_THRESHOLD = 20.0
HIGH_MISSING_COLUMN_THRESHOLD = 50.0


def _check_missing_value_count(df: pd.DataFrame) -> Dict[str, Any]:
    """Check overall missing value count"""
    missing_counts = df.isnull().sum()
    total_missing = missing_counts.sum()
    total_cells = len(df) * len(df.columns)
    
    if total_missing == 0:
        return {
            "name": "Missing Value Count",
            "status": "pass",
            "message": "No missing values found in the dataset",
            "details": {
                "total_missing": 0,
                "total_cells": total_cells,
                "missing_percentage": 0.0
            }
        }
    
    missing_percentage = (total_missing / total_cells) * 100
    columns_with_missing = {k: int(v) for k, v in missing_counts[missing_counts > 0].items()}
    
    if missing_percentage < LOW_MISSING_THRESHOLD:
        status = "pass"
        message = f"Low missing data ({total_missing:,} values, {missing_percentage:.2f}%)"
    elif missing_percentage < MODERATE_MISSING_THRESHOLD:
        status = "warning"
        message = f"Moderate missing data ({total_missing:,} values, {missing_percentage:.2f}%)"
    else:
        status = "fail"
        message = f"High missing data ({total_missing:,} values, {missing_percentage:.2f}%)"
    
    return {
        "name": "Missing Value Count",
        "status": status,
        "message": message,
        "details": {
            "total_missing": int(total_missing),
            "total_cells": total_cells,
            "missing_percentage": round(missing_percentage, 2),
            "columns_with_missing": dict(list(columns_with_missing.items())[:10])
        }
    }


def _check_missing_by_column(df: pd.DataFrame) -> Dict[str, Any]:
    """Check missing percentage by column"""
    missing_percentages = (df.isnull().sum() / len(df) * 100).sort_values(ascending=False)
    high_missing_cols = {k: round(v, 2) for k, v in missing_percentages[missing_percentages > HIGH_MISSING_COLUMN_THRESHOLD].items()}
    
    if not high_missing_cols:
        max_missing = missing_percentages.max() if len(missing_percentages) > 0 else 0
        return {
            "name": "Missing Percentage by Column",
            "status": "pass",
            "message": f"No columns have excessive missing data (>{HIGH_MISSING_COLUMN_THRESHOLD}%)",
            "details": {
                "max_missing_percentage": round(float(max_missing), 2),
                "columns_checked": len(df.columns)
            }
        }
    
    return {
        "name": "Missing Percentage by Column",
        "status": "warning",
        "message": f"Found {len(high_missing_cols)} column(s) with >{HIGH_MISSING_COLUMN_THRESHOLD}% missing data",
        "details": {
            "high_missing_columns": high_missing_cols,
            "suggestion": "Consider dropping these columns or using advanced imputation"
        }
    }


def _check_missing_patterns(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for missing data patterns"""
    empty_rows = df.isnull().all(axis=1).sum()
    empty_cols = df.isnull().all(axis=0).sum()
    
    if empty_rows == 0 and empty_cols == 0:
        return {
            "name": "Missing Patterns",
            "status": "pass",
            "message": "No completely empty rows or columns found",
            "details": {
                "empty_rows": 0,
                "empty_columns": 0
            }
        }
    
    issues = []
    if empty_rows > 0:
        issues.append(f"{empty_rows} completely empty row(s)")
    if empty_cols > 0:
        issues.append(f"{empty_cols} completely empty column(s)")
    
    return {
        "name": "Missing Patterns",
        "status": "fail",
        "message": f"Found: {', '.join(issues)}",
        "details": {
            "empty_rows": int(empty_rows),
            "empty_columns": int(empty_cols),
            "suggestion": "Remove empty rows/columns before processing"
        }
    }


def validate_missing_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate missing data in the dataset
    
    Returns:
        {
            "checks": [...],
            "score": "3/3",
            "passed": 3,
            "total": 3,
            "category": "Missing Data"
        }
    """
    checks = [
        _check_missing_value_count(df),
        _check_missing_by_column(df),
        _check_missing_patterns(df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Missing Data"
    }