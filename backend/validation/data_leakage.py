"""
Data Leakage Validation
Checks: Target leakage, temporal leakage, identifier leakage
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

# Constants
COMMON_TARGET_NAMES = ['target', 'label', 'y', 'class', 'outcome', 'result']
PERFECT_CORRELATION_THRESHOLD = 0.99
ID_PATTERNS = ['id', 'uuid', 'key', 'index', 'row']
HIGH_CARDINALITY_THRESHOLD = 0.9
TEMPORAL_PATTERNS = ['date', 'time', 'timestamp', 'created', 'updated', 'modified']


def _detect_target_column(df: pd.DataFrame, target_column: Optional[str]) -> str:
    """Auto-detect target column if not provided"""
    if target_column:
        return target_column
    
    for col in df.columns:
        if col.lower() in COMMON_TARGET_NAMES:
            return col
    
    return df.columns[-1]


def _check_target_leakage(df: pd.DataFrame, feature_df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
    """Check for target leakage (perfect correlation with target)"""
    if target_column not in df.columns:
        return {
            "name": "Target Leakage",
            "status": "info",
            "message": "Cannot check - target column not found",
            "details": {}
        }
    
    target_series = df[target_column]
    leakage_features = []
    numeric_features = feature_df.select_dtypes(include=[np.number])
    
    for col in numeric_features.columns:
        if pd.api.types.is_numeric_dtype(target_series):
            # Check correlation for numeric target
            correlation = abs(numeric_features[col].corr(target_series))
            if correlation > PERFECT_CORRELATION_THRESHOLD:
                leakage_features.append({
                    "column": col,
                    "correlation": round(correlation, 4),
                    "issue": "Near-perfect correlation with target"
                })
        else:
            # Check perfect mapping for categorical target
            if numeric_features[col].nunique() == target_series.nunique():
                mapping = pd.DataFrame({
                    'feature': numeric_features[col],
                    'target': target_series
                }).drop_duplicates()
                
                if len(mapping) == numeric_features[col].nunique():
                    leakage_features.append({
                        "column": col,
                        "issue": "Perfect mapping to target classes"
                    })
    
    if not leakage_features:
        return {
            "name": "Target Leakage",
            "status": "pass",
            "message": "No features with perfect/near-perfect correlation to target",
            "details": {"features_checked": len(feature_df.columns)}
        }
    
    return {
        "name": "Target Leakage",
        "status": "fail",
        "message": f"Found {len(leakage_features)} feature(s) with potential target leakage",
        "details": {
            "leakage_features": leakage_features,
            "suggestion": "Remove these features as they leak target information"
        }
    }


def _check_identifier_leakage(feature_df: pd.DataFrame) -> Dict[str, Any]:
    """Check for identifier columns that shouldn't be features"""
    id_columns = []
    
    for col in feature_df.columns:
        col_lower = col.lower()
        
        if any(pattern in col_lower for pattern in ID_PATTERNS):
            unique_ratio = feature_df[col].nunique() / len(feature_df)
            
            if unique_ratio > HIGH_CARDINALITY_THRESHOLD:
                id_columns.append({
                    "column": col,
                    "unique_ratio": round(unique_ratio, 3),
                    "unique_count": int(feature_df[col].nunique()),
                    "issue": "High cardinality identifier column"
                })
    
    if not id_columns:
        return {
            "name": "Identifier Leakage",
            "status": "pass",
            "message": "No identifier columns detected in features",
            "details": {}
        }
    
    return {
        "name": "Identifier Leakage",
        "status": "warning",
        "message": f"Found {len(id_columns)} potential identifier column(s)",
        "details": {
            "id_columns": id_columns,
            "suggestion": "Remove identifier columns from features - they don't provide predictive value"
        }
    }


def _check_temporal_leakage(feature_df: pd.DataFrame) -> Dict[str, Any]:
    """Check for temporal columns that might cause leakage"""
    temporal_columns = []
    
    for col in feature_df.columns:
        col_lower = col.lower()
        
        if any(pattern in col_lower for pattern in TEMPORAL_PATTERNS):
            # Check if it's a datetime column or can be parsed as datetime
            if pd.api.types.is_datetime64_any_dtype(feature_df[col]) or feature_df[col].dtype == 'object':
                try:
                    pd.to_datetime(feature_df[col].head(10), errors='raise')
                    temporal_columns.append({
                        "column": col,
                        "issue": "Temporal column detected"
                    })
                except:
                    pass
    
    if not temporal_columns:
        return {
            "name": "Temporal Leakage",
            "status": "pass",
            "message": "No temporal columns detected that might cause leakage",
            "details": {}
        }
    
    return {
        "name": "Temporal Leakage",
        "status": "warning",
        "message": f"Found {len(temporal_columns)} temporal column(s)",
        "details": {
            "temporal_columns": temporal_columns,
            "suggestion": "Ensure temporal columns are used correctly (e.g., avoid future dates in training)"
        }
    }


def validate_data_leakage(df: pd.DataFrame, target_column: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate data leakage issues
    
    Returns:
        {
            "checks": [...],
            "score": "3/3",
            "passed": 3,
            "total": 3,
            "category": "Data Leakage"
        }
    """
    target_column = _detect_target_column(df, target_column)
    
    # Get feature dataframe
    feature_df = df.copy()
    if target_column in feature_df.columns:
        feature_df = feature_df.drop(columns=[target_column])
    
    checks = [
        _check_target_leakage(df, feature_df, target_column),
        _check_identifier_leakage(feature_df),
        _check_temporal_leakage(feature_df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning", "info"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Data Leakage"
    }