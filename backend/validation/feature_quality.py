"""
Feature Quality Validation
Checks: Feature variance, constant features, correlated features
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

# Constants
LOW_VARIANCE_THRESHOLD = 0.01
LOW_STD_THRESHOLD = 0.1
HIGH_CORRELATION_THRESHOLD = 0.95
MAX_CORRELATION_PAIRS = 10


def _get_feature_df(df: pd.DataFrame, target_column: Optional[str]) -> pd.DataFrame:
    """Get feature dataframe excluding target column"""
    feature_df = df.copy()
    if target_column and target_column in feature_df.columns:
        feature_df = feature_df.drop(columns=[target_column])
    return feature_df


def _check_constant_features(feature_df: pd.DataFrame) -> Dict[str, Any]:
    """Check for constant features (no variance)"""
    constant_features = []
    
    for col in feature_df.columns:
        if feature_df[col].nunique() <= 1:
            value = feature_df[col].iloc[0] if len(feature_df) > 0 else None
            constant_features.append({
                "column": col,
                "unique_values": int(feature_df[col].nunique()),
                "value": value
            })
    
    if not constant_features:
        return {
            "name": "Constant Features",
            "status": "pass",
            "message": "No constant features found",
            "details": {"total_features": len(feature_df.columns)}
        }
    
    return {
        "name": "Constant Features",
        "status": "warning",
        "message": f"Found {len(constant_features)} constant feature(s) (no variance)",
        "details": {
            "constant_features": constant_features,
            "suggestion": "Remove constant features as they provide no information"
        }
    }


def _check_low_variance(feature_df: pd.DataFrame) -> Dict[str, Any]:
    """Check for low variance features"""
    numeric_features = feature_df.select_dtypes(include=[np.number])
    
    if len(numeric_features.columns) == 0:
        return {
            "name": "Low Variance Features",
            "status": "info",
            "message": "No numeric features to check for variance",
            "details": {}
        }
    
    low_variance_features = []
    for col in numeric_features.columns:
        variance = numeric_features[col].var()
        std = numeric_features[col].std()
        
        # Handle NaN values
        if pd.isna(variance):
            variance = 0.0
        if pd.isna(std):
            std = 0.0
        
        if variance < LOW_VARIANCE_THRESHOLD or std < LOW_STD_THRESHOLD:
            low_variance_features.append({
                "column": col,
                "variance": round(float(variance), 6) if not pd.isna(variance) else 0.0,
                "std": round(float(std), 4) if not pd.isna(std) else 0.0
            })
    
    if not low_variance_features:
        return {
            "name": "Low Variance Features",
            "status": "pass",
            "message": "No low variance features detected",
            "details": {"numeric_features_checked": len(numeric_features.columns)}
        }
    
    return {
        "name": "Low Variance Features",
        "status": "warning",
        "message": f"Found {len(low_variance_features)} feature(s) with very low variance",
        "details": {
            "low_variance_features": low_variance_features[:5],
            "suggestion": "Consider removing or transforming low variance features"
        }
    }


def _check_correlated_features(feature_df: pd.DataFrame) -> Dict[str, Any]:
    """Check for highly correlated features"""
    numeric_features = feature_df.select_dtypes(include=[np.number])
    
    if len(numeric_features.columns) < 2:
        return {
            "name": "Highly Correlated Features",
            "status": "info",
            "message": "Need at least 2 numeric features to check correlation",
            "details": {"numeric_features": len(numeric_features.columns)}
        }
    
    corr_matrix = numeric_features.corr().abs()
    high_corr_pairs = []
    
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            corr_value = corr_matrix.iloc[i, j]
            
            # Handle NaN correlation values
            if pd.isna(corr_value):
                continue
            
            if corr_value > HIGH_CORRELATION_THRESHOLD:
                high_corr_pairs.append({
                    "feature1": corr_matrix.columns[i],
                    "feature2": corr_matrix.columns[j],
                    "correlation": round(float(corr_value), 3)
                })
                
                if len(high_corr_pairs) >= MAX_CORRELATION_PAIRS:
                    break
        
        if len(high_corr_pairs) >= MAX_CORRELATION_PAIRS:
            break
    
    if not high_corr_pairs:
        return {
            "name": "Highly Correlated Features",
            "status": "pass",
            "message": f"No highly correlated feature pairs found (correlation > {HIGH_CORRELATION_THRESHOLD})",
            "details": {"numeric_features_checked": len(numeric_features.columns)}
        }
    
    return {
        "name": "Highly Correlated Features",
        "status": "warning",
        "message": f"Found {len(high_corr_pairs)} highly correlated feature pair(s)",
        "details": {
            "correlated_pairs": high_corr_pairs[:5],
            "suggestion": "Consider removing one feature from each highly correlated pair to reduce multicollinearity"
        }
    }


def validate_feature_quality(df: pd.DataFrame, target_column: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate feature quality
    
    Returns:
        {
            "checks": [...],
            "score": "2/3",
            "passed": 2,
            "total": 3,
            "category": "Feature Quality"
        }
    """
    feature_df = _get_feature_df(df, target_column)
    
    if len(feature_df.columns) == 0:
        return {
            "checks": [{
                "name": "Features Available",
                "status": "fail",
                "message": "No features available for validation",
                "details": {}
            }],
            "score": "0/3",
            "passed": 0,
            "total": 3,
            "category": "Feature Quality"
        }
    
    checks = [
        _check_constant_features(feature_df),
        _check_low_variance(feature_df),
        _check_correlated_features(feature_df)
    ]
    
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning", "info"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "Feature Quality"
    }