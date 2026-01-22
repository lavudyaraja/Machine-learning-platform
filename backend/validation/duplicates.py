"""
Duplicates Validation
Checks: Duplicate rows, duplicate columns, near-duplicates
"""

import pandas as pd
from typing import Dict, Any, List

# Constants
DUPLICATE_ROW_WARNING_THRESHOLD = 5.0
NEAR_DUPLICATE_SAMPLE_SIZE = 1000
NEAR_DUPLICATE_DIFF_THRESHOLD = 5.0
MAX_NEAR_DUPLICATE_CHECK = 10


def _check_duplicate_rows(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for duplicate rows"""
    duplicate_rows = df.duplicated()
    duplicate_count = duplicate_rows.sum()
    total_rows = len(df)
    
    if duplicate_count == 0:
        return {
            "name": "Duplicate Rows",
            "status": "pass",
            "message": "No duplicate rows found",
            "details": {
                "duplicate_count": 0,
                "total_rows": total_rows
            }
        }
    
    duplicate_percentage = (duplicate_count / total_rows) * 100
    
    if duplicate_percentage < DUPLICATE_ROW_WARNING_THRESHOLD:
        status = "warning"
        message = f"Found {duplicate_count:,} duplicate row(s) ({duplicate_percentage:.2f}%)"
    else:
        status = "fail"
        message = f"Found {duplicate_count:,} duplicate row(s) ({duplicate_percentage:.2f}%) - high percentage"
    
    return {
        "name": "Duplicate Rows",
        "status": status,
        "message": message,
        "details": {
            "duplicate_count": int(duplicate_count),
            "total_rows": total_rows,
            "duplicate_percentage": round(duplicate_percentage, 2),
            "suggestion": "Consider removing duplicate rows to avoid data leakage"
        }
    }


def _check_duplicate_columns(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for duplicate columns"""
    duplicate_cols = []
    columns = df.columns.tolist()
    
    for i, col1 in enumerate(columns):
        for col2 in columns[i+1:]:
            if df[col1].equals(df[col2]):
                duplicate_cols.append({
                    "column1": col1,
                    "column2": col2,
                    "identical": True
                })
    
    if not duplicate_cols:
        return {
            "name": "Duplicate Columns",
            "status": "pass",
            "message": "No duplicate columns found",
            "details": {
                "duplicate_count": 0,
                "total_columns": len(columns)
            }
        }
    
    return {
        "name": "Duplicate Columns",
        "status": "warning",
        "message": f"Found {len(duplicate_cols)} pair(s) of duplicate columns",
        "details": {
            "duplicate_pairs": duplicate_cols[:5],
            "suggestion": "Remove duplicate columns to reduce redundancy"
        }
    }


def _check_near_duplicates(df: pd.DataFrame) -> Dict[str, Any]:
    """Check for near-duplicate rows"""
    if len(df) == 0 or len(df.columns) == 0:
        return {
            "name": "Near-Duplicates",
            "status": "skip",
            "message": "Cannot check - dataset is empty",
            "details": {}
        }
    
    sample_size = min(NEAR_DUPLICATE_SAMPLE_SIZE, len(df))
    df_sample = df.head(sample_size)
    near_duplicate_count = 0
    
    for i in range(len(df_sample)):
        for j in range(i+1, len(df_sample)):
            differences = (df_sample.iloc[i] != df_sample.iloc[j]).sum()
            diff_percentage = (differences / len(df.columns)) * 100
            
            if diff_percentage < NEAR_DUPLICATE_DIFF_THRESHOLD:
                near_duplicate_count += 1
                if near_duplicate_count >= MAX_NEAR_DUPLICATE_CHECK:
                    break
        
        if near_duplicate_count >= MAX_NEAR_DUPLICATE_CHECK:
            break
    
    if near_duplicate_count == 0:
        return {
            "name": "Near-Duplicates",
            "status": "pass",
            "message": "No near-duplicate rows detected",
            "details": {
                "near_duplicate_count": 0,
                "rows_checked": sample_size
            }
        }
    
    return {
        "name": "Near-Duplicates",
        "status": "info",
        "message": f"Found {near_duplicate_count} potential near-duplicate row pairs",
        "details": {
            "near_duplicate_count": near_duplicate_count,
            "rows_checked": sample_size,
            "note": "This is a sample check. Full dataset may have more."
        }
    }


def validate_duplicates(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate duplicates in the dataset
    
    Returns:
        {
            "checks": [...],
            "score": "2/3",
            "passed": 2,
            "total": 3,
            "category": "Duplicates"
        }
    """
    checks = [
        _check_duplicate_rows(df),
        _check_duplicate_columns(df),
        _check_near_duplicates(df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning", "info", "skip"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Duplicates"
    }