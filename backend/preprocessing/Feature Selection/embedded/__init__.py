"""
Embedded Feature Selection Methods Package
"""

from .embedded_methods import (
    apply_lasso_selection,
    apply_ridge_selection,
    apply_elastic_net_selection,
    apply_tree_importance
)

__all__ = [
    "apply_lasso_selection",
    "apply_ridge_selection",
    "apply_elastic_net_selection",
    "apply_tree_importance"
]
