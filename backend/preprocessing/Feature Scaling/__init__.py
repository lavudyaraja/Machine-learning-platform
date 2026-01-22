"""
Feature Scaling Package
"""

from .feature_scaling import process_feature_scaling
from .standard_scaling import apply_standard_scaling
from .minmax_scaling import apply_minmax_scaling
from .robust_scaling import apply_robust_scaling
from .maxabs_scaling import apply_maxabs_scaling
from .quantile_scaling import apply_quantile_scaling
from .box_cox_scaling import apply_box_cox_scaling
from .yeo_johnson_scaling import apply_yeo_johnson_scaling
from .l1_normalization import apply_l1_normalization
from .l2_normalization import apply_l2_normalization
from .unit_vector_scaling import apply_unit_vector_scaling
from .log_scaling import apply_log_scaling
from .decimal_scaling import apply_decimal_scaling

__all__ = [
    "process_feature_scaling",
    "apply_standard_scaling",
    "apply_minmax_scaling",
    "apply_robust_scaling",
    "apply_maxabs_scaling",
    "apply_quantile_scaling",
    "apply_box_cox_scaling",
    "apply_yeo_johnson_scaling",
    "apply_l1_normalization",
    "apply_l2_normalization",
    "apply_unit_vector_scaling",
    "apply_log_scaling",
    "apply_decimal_scaling"
]
