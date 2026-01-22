"""
Consistency Validation
Checks: Naming consistency, format consistency, value consistency
"""

import pandas as pd
from typing import Dict, Any, List

# Constants
DATE_SAMPLE_SIZE = 100
MAX_ISSUE_DISPLAY = 5


def _check_naming_consistency(df: pd.DataFrame) -> Dict[str, Any]:
    """Check column naming consistency"""
    columns = df.columns
    naming_issues = []
    
    has_underscore = any('_' in col for col in columns)
    has_camelcase = any(col[0].islower() and any(c.isupper() for c in col[1:]) for col in columns)
    has_spaces = any(' ' in col for col in columns)
    
    if has_underscore and has_camelcase:
        naming_issues.append("Mixed naming conventions (snake_case and camelCase)")
    if has_spaces:
        naming_issues.append("Column names contain spaces")
    
    if not naming_issues:
        return {
            "name": "Naming Consistency",
            "status": "pass",
            "message": "Column names follow consistent naming convention",
            "details": {
                "total_columns": len(columns),
                "naming_style": "consistent"
            }
        }
    
    return {
        "name": "Naming Consistency",
        "status": "warning",
        "message": f"Found naming inconsistencies: {', '.join(naming_issues)}",
        "details": {
            "issues": naming_issues,
            "suggestion": "Standardize column naming for better maintainability"
        }
    }


def _check_format_consistency(df: pd.DataFrame) -> Dict[str, Any]:
    """Check format consistency in object columns"""
    format_issues = []
    object_columns = df.select_dtypes(include=['object']).columns
    
    for col in object_columns:
        date_like_count = 0
        sample_values = df[col].dropna().head(DATE_SAMPLE_SIZE)
        
        for val in sample_values:
            val_str = str(val)
            # Simple check for date-like strings
            if '/' in val_str or '-' in val_str:
                parts = val_str.split('/') if '/' in val_str else val_str.split('-')
                if len(parts) == 3:
                    date_like_count += 1
        
        # Check for mixed formats
        if 0 < date_like_count < len(sample_values):
            format_issues.append({
                "column": col,
                "issue": "Mixed date formats detected",
                "date_like_count": date_like_count,
                "total_samples": len(sample_values)
            })
    
    if not format_issues:
        return {
            "name": "Format Consistency",
            "status": "pass",
            "message": "Data formats are consistent across columns",
            "details": {"object_columns_checked": len(object_columns)}
        }
    
    return {
        "name": "Format Consistency",
        "status": "warning",
        "message": f"Found format inconsistencies in {len(format_issues)} column(s)",
        "details": {
            "format_issues": format_issues[:MAX_ISSUE_DISPLAY],
            "suggestion": "Standardize data formats for better processing"
        }
    }


def _check_value_consistency(df: pd.DataFrame) -> Dict[str, Any]:
    """Check value consistency (case, whitespace)"""
    value_issues = []
    object_columns = df.select_dtypes(include=['object']).columns
    
    for col in object_columns:
        # Check only categorical-like columns
        if df[col].nunique() >= 50:
            continue
        
        unique_values = df[col].dropna().unique()
        
        # Check case inconsistencies
        lower_values = [str(v).lower() for v in unique_values]
        if len(lower_values) != len(set(lower_values)):
            value_issues.append({
                "column": col,
                "issue": "Case inconsistencies in categorical values",
                "unique_count": len(unique_values),
                "unique_lower_count": len(set(lower_values))
            })
            continue
        
        # Check whitespace inconsistencies
        stripped_values = [str(v).strip() for v in unique_values if pd.notna(v)]
        if len(stripped_values) != len(set(stripped_values)):
            value_issues.append({
                "column": col,
                "issue": "Whitespace inconsistencies in values"
            })
    
    if not value_issues:
        return {
            "name": "Value Consistency",
            "status": "pass",
            "message": "Values are consistently represented",
            "details": {}
        }
    
    return {
        "name": "Value Consistency",
        "status": "warning",
        "message": f"Found value inconsistencies in {len(value_issues)} column(s)",
        "details": {
            "value_issues": value_issues[:MAX_ISSUE_DISPLAY],
            "suggestion": "Normalize values (case, whitespace) for consistency"
        }
    }


def validate_consistency(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate consistency across the dataset
    
    Returns:
        {
            "checks": [...],
            "score": "3/3",
            "passed": 3,
            "total": 3,
            "category": "Consistency"
        }
    """
    checks = [
        _check_naming_consistency(df),
        _check_format_consistency(df),
        _check_value_consistency(df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Consistency"
    }