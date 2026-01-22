"""
Main Validation Module
Orchestrates all validation checks
Supports numerical, categorical, and mixed datasets
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional, Callable, List, Tuple

from .file_level import validate_file_level
from .structure import validate_structure
from .data_types import validate_data_types
from .missing_data import validate_missing_data
from .duplicates import validate_duplicates
from .target_variable import validate_target_variable
from .class_distribution import validate_class_distribution
from .feature_quality import validate_feature_quality
from .value_integrity import validate_value_integrity
from .data_leakage import validate_data_leakage
from .consistency import validate_consistency


def _update_summary(summary: Dict[str, int], category_result: Dict[str, Any]) -> None:
    """Update summary statistics with category results"""
    summary["total_checks"] += category_result["total"]
    summary["passed"] += category_result["passed"]
    
    for check in category_result["checks"]:
        if check["status"] == "fail":
            summary["failed"] += 1
        elif check["status"] == "warning":
            summary["warnings"] += 1


def _get_validation_steps() -> List[Tuple[str, Callable]]:
    """Get ordered list of validation steps with their names"""
    return [
        ("File Level", validate_file_level),
        ("Structure", validate_structure),
        ("Data Types", validate_data_types),
        ("Missing Data", validate_missing_data),
        ("Duplicates", validate_duplicates),
        ("Target Variable", validate_target_variable),
        ("Class Distribution", validate_class_distribution),
        ("Feature Quality", validate_feature_quality),
        ("Value Integrity", validate_value_integrity),
        ("Data Leakage", validate_data_leakage),
        ("Consistency", validate_consistency),
    ]


def validate_dataset(
    dataset_path: str,
    target_column: Optional[str] = None,
    progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
) -> Dict[str, Any]:
    """
    Run comprehensive dataset validation
    
    Args:
        dataset_path: Path to the dataset file
        target_column: Optional name of target column
        progress_callback: Optional callback for progress updates
    
    Returns:
        {
            "overall_score": "X/Y",
            "categories": [
                {
                    "category": "File Level",
                    "score": "3/3",
                    "passed": 3,
                    "total": 3,
                    "checks": [...]
                },
                ...
            ],
            "summary": {
                "total_checks": 35,
                "passed": 30,
                "failed": 3,
                "warnings": 2
            }
        }
    """
    results = {
        "categories": [],
        "summary": {
            "total_checks": 0,
            "passed": 0,
            "failed": 0,
            "warnings": 0
        }
    }
    
    # Load dataset
    try:
        if progress_callback:
            progress_callback({"step": "Loading dataset", "progress": 5})
        
        df = pd.read_csv(dataset_path)
        
        if progress_callback:
            progress_callback({
                "step": "Dataset loaded",
                "progress": 10,
                "totalColumns": len(df.columns),
                "columns": list(df.columns)
            })
    except Exception as e:
        return {
            "error": f"Failed to load dataset: {str(e)}",
            "dataset_path": dataset_path
        }
    
    # Run all validation checks
    validations = _get_validation_steps()
    total_validations = len(validations)
    
    for idx, (category_name, validation_func) in enumerate(validations):
        if progress_callback:
            progress = 10 + int((idx / total_validations) * 80)
            progress_callback({
                "step": f"Validating {category_name}",
                "progress": progress,
                "category": category_name,
                "current": idx + 1,
                "total": total_validations
            })
        
        try:
            # Call validation function with appropriate parameters
            if category_name == "File Level":
                category_result = validation_func(dataset_path)
            elif category_name == "Structure":
                category_result = validation_func(df, dataset_path)
            elif category_name in ["Target Variable", "Class Distribution", "Feature Quality", "Data Leakage"]:
                category_result = validation_func(df, target_column)
            else:
                category_result = validation_func(df)
            
            results["categories"].append(category_result)
            _update_summary(results["summary"], category_result)
            
        except Exception as e:
            # Handle validation errors gracefully
            error_result = {
                "category": category_name,
                "error": str(e),
                "checks": [],
                "score": "0/0",
                "passed": 0,
                "total": 0
            }
            results["categories"].append(error_result)
    
    # Calculate overall score
    total_passed = results["summary"]["passed"]
    total_checks = results["summary"]["total_checks"]
    results["overall_score"] = f"{total_passed}/{total_checks}"
    
    # Detect dataset type (numerical, categorical, or mixed)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if len(numeric_cols) > 0 and len(categorical_cols) > 0:
        dataset_type = "mixed"
    elif len(numeric_cols) > 0:
        dataset_type = "numerical"
    elif len(categorical_cols) > 0:
        dataset_type = "categorical"
    else:
        dataset_type = "unknown"
    
    # Add dataset type information to results
    results["dataset_type"] = dataset_type
    results["dataset_info"] = {
        "total_columns": len(df.columns),
        "numeric_columns": len(numeric_cols),
        "categorical_columns": len(categorical_cols),
        "total_rows": len(df),
        "numeric_column_names": numeric_cols[:10],  # First 10 for preview
        "categorical_column_names": categorical_cols[:10]  # First 10 for preview
    }
    
    # Final progress update
    if progress_callback:
        progress_callback({
            "step": "Validation complete",
            "progress": 100,
            "totalChecks": total_checks,
            "passedChecks": total_passed,
            "datasetType": dataset_type
        })
    
    return results