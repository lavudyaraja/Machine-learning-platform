"""
Structure Validation
Checks: Headers present, consistent columns, row count, column count
"""

import pandas as pd
from typing import Dict, Any, List

# Constants
MIN_ROWS_WARNING = 10
MAX_COLUMNS_WARNING = 1000
MIN_COLUMNS_WARNING = 1


def _check_headers(df: pd.DataFrame) -> Dict[str, Any]:
    """Check if headers are present"""
    if len(df.columns) > 0:
        return {
            "name": "Headers Present",
            "status": "pass",
            "message": f"Dataset has {len(df.columns)} column headers",
            "details": {
                "column_count": len(df.columns),
                "columns": df.columns.tolist()[:10]
            }
        }
    
    return {
        "name": "Headers Present",
        "status": "fail",
        "message": "Dataset has no column headers",
        "details": {}
    }


def _check_consistent_columns(df: pd.DataFrame) -> Dict[str, Any]:
    """Check if all rows have consistent column structure"""
    if len(df.columns) == 0:
        return {
            "name": "Consistent Columns",
            "status": "fail",
            "message": "Cannot check - no columns found",
            "details": {}
        }
    
    # Note: In pandas, all rows have the same structure by definition
    # This check looks for rows with all NaN values which might indicate structure issues
    expected_cols = len(df.columns)
    all_nan_rows = df.isnull().all(axis=1)
    all_nan_count = all_nan_rows.sum()
    
    if all_nan_count == 0:
        return {
            "name": "Consistent Columns",
            "status": "pass",
            "message": "All rows have consistent column structure",
            "details": {
                "total_rows": len(df),
                "columns_per_row": expected_cols
            }
        }
    
    return {
        "name": "Consistent Columns",
        "status": "warning",
        "message": f"Found {all_nan_count} rows with all NaN values",
        "details": {
            "total_rows": len(df),
            "all_nan_rows": int(all_nan_count),
            "columns_per_row": expected_cols
        }
    }


def _check_row_count(df: pd.DataFrame) -> Dict[str, Any]:
    """Check row count"""
    row_count = len(df)
    
    if row_count == 0:
        return {
            "name": "Row Count",
            "status": "fail",
            "message": "Dataset is empty (0 rows)",
            "details": {"row_count": 0}
        }
    
    if row_count < MIN_ROWS_WARNING:
        return {
            "name": "Row Count",
            "status": "warning",
            "message": f"Dataset has very few rows ({row_count}). May not be sufficient for training.",
            "details": {"row_count": row_count}
        }
    
    return {
        "name": "Row Count",
        "status": "pass",
        "message": f"Dataset has {row_count:,} rows",
        "details": {"row_count": row_count}
    }


def _check_column_count(df: pd.DataFrame) -> Dict[str, Any]:
    """Check column count"""
    col_count = len(df.columns)
    
    if col_count == 0:
        return {
            "name": "Column Count",
            "status": "fail",
            "message": "Dataset has no columns",
            "details": {"column_count": 0}
        }
    
    if col_count > MAX_COLUMNS_WARNING:
        return {
            "name": "Column Count",
            "status": "warning",
            "message": f"Dataset has many columns ({col_count}). May cause performance issues.",
            "details": {"column_count": col_count}
        }
    
    if col_count == MIN_COLUMNS_WARNING:
        return {
            "name": "Column Count",
            "status": "warning",
            "message": "Dataset has only 1 column. May need more features for ML.",
            "details": {"column_count": col_count}
        }
    
    return {
        "name": "Column Count",
        "status": "pass",
        "message": f"Dataset has {col_count} columns",
        "details": {"column_count": col_count}
    }


def validate_structure(df: pd.DataFrame, dataset_path: str = "") -> Dict[str, Any]:
    """
    Validate dataset structure
    
    Returns:
        {
            "checks": [...],
            "score": "4/4",
            "passed": 4,
            "total": 4,
            "category": "Structure"
        }
    """
    checks = [
        _check_headers(df),
        _check_consistent_columns(df),
        _check_row_count(df),
        _check_column_count(df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Structure"
    }