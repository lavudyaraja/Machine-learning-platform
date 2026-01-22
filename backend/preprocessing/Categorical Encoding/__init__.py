"""
Categorical Encoding Package
"""

from .categorical_encoding import process_categorical_encoding
from .label_encoding import apply_label_encoding
from .one_hot_encoding import apply_one_hot_encoding
from .ordinal_encoding import apply_ordinal_encoding
from .target_encoding import apply_target_encoding
from .binary_encoding import apply_binary_encoding
from .frequency_encoding import apply_frequency_encoding
from .count_encoding import apply_count_encoding
from .hash_encoding import apply_hash_encoding
from .leave_one_out_encoding import apply_leave_one_out_encoding
from .woe_encoding import apply_woe_encoding

__all__ = [
    "process_categorical_encoding",
    "apply_label_encoding",
    "apply_one_hot_encoding",
    "apply_ordinal_encoding",
    "apply_target_encoding",
    "apply_binary_encoding",
    "apply_frequency_encoding",
    "apply_count_encoding",
    "apply_hash_encoding",
    "apply_leave_one_out_encoding",
    "apply_woe_encoding"
]

