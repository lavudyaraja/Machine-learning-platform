"""
Dataset Validation Module
Comprehensive validation checks for datasets
"""

from .main import validate_dataset
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

__version__ = "1.0.0"

__all__ = [
    "validate_dataset",
    "validate_file_level",
    "validate_structure",
    "validate_data_types",
    "validate_missing_data",
    "validate_duplicates",
    "validate_target_variable",
    "validate_class_distribution",
    "validate_feature_quality",
    "validate_value_integrity",
    "validate_data_leakage",
    "validate_consistency",
]