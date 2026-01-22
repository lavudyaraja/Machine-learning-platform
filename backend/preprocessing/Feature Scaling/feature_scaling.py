"""
Feature Scaling Module

This module provides various feature scaling and normalization methods for preprocessing datasets.
Refactored to use individual method files.
"""

import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import warnings
import importlib.util
import sys
warnings.filterwarnings('ignore')

# Get the directory of this file
_current_dir = Path(__file__).parent

# Import individual scaling methods using importlib to avoid relative import issues
def _load_module(module_name, file_name):
    """Load a module from the same directory"""
    file_path = _current_dir / file_name
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

# Load all scaling method modules
standard_scaling_module = _load_module("standard_scaling", "standard_scaling.py")
minmax_scaling_module = _load_module("minmax_scaling", "minmax_scaling.py")
robust_scaling_module = _load_module("robust_scaling", "robust_scaling.py")
maxabs_scaling_module = _load_module("maxabs_scaling", "maxabs_scaling.py")
quantile_scaling_module = _load_module("quantile_scaling", "quantile_scaling.py")
box_cox_scaling_module = _load_module("box_cox_scaling", "box_cox_scaling.py")
yeo_johnson_scaling_module = _load_module("yeo_johnson_scaling", "yeo_johnson_scaling.py")
l1_normalization_module = _load_module("l1_normalization", "l1_normalization.py")
l2_normalization_module = _load_module("l2_normalization", "l2_normalization.py")
unit_vector_scaling_module = _load_module("unit_vector_scaling", "unit_vector_scaling.py")
log_scaling_module = _load_module("log_scaling", "log_scaling.py")
decimal_scaling_module = _load_module("decimal_scaling", "decimal_scaling.py")

# Get the functions from modules
apply_standard_scaling = standard_scaling_module.apply_standard_scaling
apply_minmax_scaling = minmax_scaling_module.apply_minmax_scaling
apply_robust_scaling = robust_scaling_module.apply_robust_scaling
apply_maxabs_scaling = maxabs_scaling_module.apply_maxabs_scaling
apply_quantile_scaling = quantile_scaling_module.apply_quantile_scaling
apply_box_cox_scaling = box_cox_scaling_module.apply_box_cox_scaling
apply_yeo_johnson_scaling = yeo_johnson_scaling_module.apply_yeo_johnson_scaling
apply_l1_normalization = l1_normalization_module.apply_l1_normalization
apply_l2_normalization = l2_normalization_module.apply_l2_normalization
apply_unit_vector_scaling = unit_vector_scaling_module.apply_unit_vector_scaling
apply_log_scaling = log_scaling_module.apply_log_scaling
apply_decimal_scaling = decimal_scaling_module.apply_decimal_scaling


def process_feature_scaling(
    dataset_path: str,
    method: str,
    columns: List[str],
    feature_range: Optional[Tuple[float, float]] = None,
    with_mean: bool = True,
    with_std: bool = True,
    with_centering: bool = True,
    with_scaling: bool = True,
    n_quantiles: int = 1000,
    output_distribution: str = "uniform",
    log_base: float = 2.718281828459045,  # e
    **kwargs
) -> Dict[str, Any]:
    """
    Main function to process feature scaling operations.
    
    Args:
        dataset_path: Path to the dataset file (CSV)
        method: Scaling method - 'standard', 'minmax', 'robust', 'maxabs', 'quantile', 
                'box_cox', 'yeo_johnson', 'l1', 'l2', 'unit_vector', 'log', 'decimal'
        columns: List of columns to scale
        feature_range: Range for minmax scaling (default: (0, 1))
        with_mean: Center data for standard scaling
        with_std: Scale to unit variance for standard scaling
        with_centering: Center data for robust scaling
        with_scaling: Scale data for robust scaling
        n_quantiles: Number of quantiles for quantile scaling
        output_distribution: Output distribution for quantile scaling
        log_base: Base for logarithmic scaling
        **kwargs: Additional method-specific parameters
        
    Returns:
        Dictionary with processed CSV content and metadata (in-memory, no disk storage)
    """
    # Load dataset
    if not Path(dataset_path).exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    original_rows, original_cols = df.shape
    
    # Validate columns
    invalid_columns = [col for col in columns if col not in df.columns]
    if invalid_columns:
        raise ValueError(f"Columns not found in dataset: {invalid_columns}")
    
    # Apply scaling based on method
    method_lower = method.lower()
    
    if method_lower == "standard":
        result = apply_standard_scaling(
            df, columns, with_mean=with_mean, with_std=with_std, **kwargs
        )
    elif method_lower == "minmax":
        feature_range = feature_range or (0, 1)
        result = apply_minmax_scaling(df, columns, feature_range=feature_range, **kwargs)
    elif method_lower == "robust":
        result = apply_robust_scaling(
            df, columns, with_centering=with_centering, with_scaling=with_scaling, **kwargs
        )
    elif method_lower == "maxabs":
        result = apply_maxabs_scaling(df, columns, **kwargs)
    elif method_lower == "quantile":
        result = apply_quantile_scaling(
            df, columns, n_quantiles=n_quantiles, 
            output_distribution=output_distribution, **kwargs
        )
    elif method_lower == "box_cox" or method_lower == "box-cox":
        result = apply_box_cox_scaling(df, columns, **kwargs)
    elif method_lower == "yeo_johnson" or method_lower == "yeo-johnson":
        result = apply_yeo_johnson_scaling(df, columns, **kwargs)
    elif method_lower == "l1":
        result = apply_l1_normalization(df, columns, **kwargs)
    elif method_lower == "l2":
        result = apply_l2_normalization(df, columns, **kwargs)
    elif method_lower == "unit_vector" or method_lower == "unit-vector":
        result = apply_unit_vector_scaling(df, columns, **kwargs)
    elif method_lower == "log":
        result = apply_log_scaling(df, columns, base=log_base, **kwargs)
    elif method_lower == "decimal":
        result = apply_decimal_scaling(df, columns, **kwargs)
    else:
        raise ValueError(f"Unknown scaling method: {method}")
    
    processed_df = result["processed_df"]
    processed_rows, processed_cols = processed_df.shape
    
    # Convert processed_df to CSV string for in-memory transfer
    processed_csv_content = processed_df.to_csv(index=False)
    
    # Prepare response (no disk storage)
    response = {
        "success": True,
        "processed_csv_content": processed_csv_content,  # Return CSV content directly
        "original_rows": original_rows,
        "original_columns": original_cols,
        "processed_rows": processed_rows,
        "processed_columns": processed_cols,
        "scaled_columns": result.get("scaled_columns", []),
        "method": result.get("method", method),
        "scalers": result.get("scalers", {})
    }
    
    return response
