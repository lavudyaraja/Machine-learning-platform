"""
Validation Report Formatter
Converts backend validation results to frontend ValidationReport format
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime

# Category mapping from backend category names to frontend category IDs
CATEGORY_MAP = {
    "File Level": "file_level",
    "Structure": "structure_level",
    "Data Types": "data_type",
    "Missing Data": "missing_data",
    "Duplicates": "duplicate_data",
    "Target Variable": "target_variable",
    "Class Distribution": "class_distribution",
    "Feature Quality": "feature_quality",
    "Value Integrity": "value_integrity",
    "Data Leakage": "data_leakage",
    "Consistency": "dataset_consistency",
}

def convert_status_to_severity(status: str) -> str:
    """Convert status (pass/warning/fail) to severity (info/warning/blocking)"""
    status_map = {
        "fail": "blocking",
        "warning": "warning",
        "pass": "info"
    }
    return status_map.get(status, "info")

def generate_check_id(category_id: str, check_name: str, index: int) -> str:
    """Generate a clean, unique check ID"""
    # Clean the check name
    check_id_base = (
        check_name.lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace(":", "")
        .replace(",", "")
    )
    # Remove special characters, keep only alphanumeric and underscore
    check_id_base = "".join(c for c in check_id_base if c.isalnum() or c == "_")
    
    return f"{category_id}_{check_id_base}" if check_id_base else f"{category_id}_check_{index}"

def clean_nan_values(obj: Any) -> Any:
    """
    Recursively clean NaN, inf, and -inf values from dictionaries and lists
    to make them JSON-compliant.
    
    Args:
        obj: Object to clean (dict, list, or primitive)
    
    Returns:
        Cleaned object with NaN/inf values replaced with None
    """
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, float)):
        # Check for NaN, inf, -inf
        if pd.isna(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, (np.str_, str)):
        return str(obj)
    else:
        return obj


def format_validation_report(
    validation_result: Dict[str, Any],
    dataset_id: str
) -> Dict[str, Any]:
    """
    Convert backend validation result to frontend ValidationReport format
    
    Args:
        validation_result: Result from validate_dataset()
        dataset_id: Dataset ID
    
    Returns:
        ValidationReport in frontend format
    """
    # Clean NaN values from validation result before processing
    validation_result = clean_nan_values(validation_result)
    
    # Validate input
    if "error" in validation_result:
        raise ValueError(f"Validation failed: {validation_result['error']}")
    
    if "categories" not in validation_result:
        raise ValueError("Invalid validation result: missing 'categories' key")
    
    categories = validation_result.get("categories", [])
    if not categories:
        raise ValueError("Invalid validation result: 'categories' list is empty")
    
    all_checks: List[Dict[str, Any]] = []
    
    # Process each category
    for category_result in categories:
        category_name = category_result.get("category", "Unknown")
        category_id = CATEGORY_MAP.get(category_name, "file_level")
        
        # Handle categories with errors
        if "error" in category_result:
            all_checks.append({
                "id": f"{category_id}_error",
                "name": f"{category_name} Validation Error",
                "category": category_id,
                "status": "fail",
                "severity": "blocking",
                "message": category_result.get("error", "Unknown error"),
                "details": {}
            })
            continue
        
        # Process each check in the category
        for idx, check in enumerate(category_result.get("checks", [])):
            check_name = check.get("name", "unknown")
            check_id = generate_check_id(category_id, check_name, idx)
            
            formatted_check = {
                "id": check_id,
                "name": check_name,
                "category": category_id,
                "status": check.get("status", "pass"),  # pass, warning, fail
                "severity": convert_status_to_severity(check.get("status", "pass")),
                "message": check.get("message", ""),
                "details": check.get("details", {})
            }
            all_checks.append(formatted_check)
    
    # Calculate summary statistics
    blocking_issues = sum(1 for c in all_checks if c["severity"] == "blocking")
    warning_issues = sum(1 for c in all_checks if c["severity"] == "warning")
    passed_checks = sum(1 for c in all_checks if c["status"] == "pass")
    failed_checks = sum(1 for c in all_checks if c["status"] == "fail")
    warning_checks = sum(1 for c in all_checks if c["status"] == "warning")
    total_checks = len(all_checks)
    
    # Determine overall status
    if blocking_issues > 0:
        overall_status = "fail"
    elif warning_issues > 0:
        overall_status = "warning"
    else:
        overall_status = "pass"
    
    # Calculate readyForML: No blocking issues and warnings are less than 30% of total checks
    ready_for_ml = (
        blocking_issues == 0 and 
        (warning_checks < total_checks * 0.3 if total_checks > 0 else True)
    )
    
    # Calculate overall health score (0-100)
    # Formula: 
    # - Base score from passed checks: (passed / total) * 100
    # - Penalty for blocking issues: -10 points per blocking issue (max -50)
    # - Penalty for warnings: -2 points per warning (max -20)
    # - Final score capped between 0 and 100
    if total_checks > 0:
        base_score = (passed_checks / total_checks) * 100
        blocking_penalty = min(blocking_issues * 10, 50)  # Max -50 points
        warning_penalty = min(warning_checks * 2, 20)  # Max -20 points
        health_score = max(0, min(100, base_score - blocking_penalty - warning_penalty))
        health_score = round(health_score)
    else:
        health_score = 0
    
    # Group checks by category for summary
    summary = {}
    for category_id in CATEGORY_MAP.values():
        summary[category_id] = [c for c in all_checks if c["category"] == category_id]
    
    # Map category IDs to frontend summary keys (camelCase)
    summary_mapped = {
        "fileLevel": summary.get("file_level", []),
        "structureLevel": summary.get("structure_level", []),
        "dataType": summary.get("data_type", []),
        "missingData": summary.get("missing_data", []),
        "duplicateData": summary.get("duplicate_data", []),
        "targetVariable": summary.get("target_variable", []),
        "classDistribution": summary.get("class_distribution", []),
        "featureQuality": summary.get("feature_quality", []),
        "valueIntegrity": summary.get("value_integrity", []),
        "dataLeakage": summary.get("data_leakage", []),
        "trainTestSafety": [],  # Not in backend validation yet
        "datasetConsistency": summary.get("dataset_consistency", []),
    }
    
    # Build result and clean NaN values
    result = {
        "id": f"validation-{int(datetime.now().timestamp() * 1000)}",
        "datasetId": dataset_id,
        "status": overall_status,
        "blockingIssuesCount": blocking_issues,
        "warningIssuesCount": warning_issues,
        "totalChecks": total_checks,
        "passedChecks": passed_checks,
        "failedChecks": failed_checks,
        "warningChecks": warning_checks,
        "timestamp": datetime.now().isoformat(),
        "readyForML": ready_for_ml,
        "healthScore": health_score,
        "checks": all_checks,
        "summary": summary_mapped
    }
    
    # Add dataset type info if available
    if "dataset_type" in validation_result:
        result["datasetType"] = validation_result["dataset_type"]
    if "dataset_info" in validation_result:
        result["datasetInfo"] = clean_nan_values(validation_result["dataset_info"])
    
    # Final cleanup to ensure all NaN values are removed
    return clean_nan_values(result)