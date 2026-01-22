import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

export interface FeatureSelectionMethodInfo extends MethodInfo {
  label: string;
  icon: string;
  useCases: string[];
  category: "Filter" | "Wrapper" | "Embedded";
  complexity: "Low" | "Medium" | "High";
  formula?: string;
}

export const featureSelectionData: FeatureSelectionMethodInfo[] = [
  {
    id: "variance_threshold",
    label: "Variance Threshold",
    icon: "📊",
    definition: "Removes features with low variance. Features with variance below a threshold are considered constant and removed.",
    concept: "Variance threshold is a simple filter method that removes features with variance below a specified threshold. Features with very low variance (close to constant) provide little to no information for machine learning models. This method is unsupervised and doesn't require target labels. It's particularly useful for removing constant or near-constant features that don't contribute to model performance.",
    useCases: [
      "Removing constant or near-constant features",
      "Preprocessing before other feature selection methods",
      "Quick dimensionality reduction",
      "When features have very different scales",
      "Data cleaning step",
      "Unsupervised feature selection"
    ],
    implementationInsight: `from sklearn.feature_selection import VarianceThreshold
import pandas as pd
import numpy as np

# Initialize VarianceThreshold
selector = VarianceThreshold(threshold=0.01)

# Fit and transform
X_selected = selector.fit_transform(X)

# Get selected feature names
selected_features = X.columns[selector.get_support()]

# Using pandas
variances = X.var()
threshold = 0.01
selected_features = X.columns[variances > threshold]
X_selected = X[selected_features]

# Manual implementation
def variance_threshold_selection(X, threshold=0.01):
    variances = np.var(X, axis=0)
    selected_indices = np.where(variances > threshold)[0]
    return X[:, selected_indices], selected_indices`,
    effect: "Removes low-variance features quickly. Unsupervised method. Fast and simple but may remove informative features with low variance.",
    category: "Filter",
    impact: "medium",
    complexity: "Low",
    formula: "Keep features where Var(X) > threshold",
  },
  {
    id: "correlation",
    label: "Correlation Filter",
    icon: "🔗",
    definition: "Removes highly correlated features. When two features are highly correlated, one can be removed without losing much information.",
    concept: "Correlation filter identifies and removes features that are highly correlated with each other. When features are highly correlated (e.g., correlation > 0.95), they provide redundant information. This method typically keeps one feature from each highly correlated pair, reducing multicollinearity and dimensionality. It's useful for linear models that are sensitive to multicollinearity.",
    useCases: [
      "Removing multicollinearity",
      "Linear regression preprocessing",
      "When features are highly correlated",
      "Reducing redundant information",
      "Preprocessing for linear models",
      "Feature redundancy removal"
    ],
    implementationInsight: `import pandas as pd
import numpy as np

# Calculate correlation matrix
corr_matrix = X.corr().abs()

# Find highly correlated pairs
threshold = 0.95
upper_triangle = np.triu(np.ones_like(corr_matrix, dtype=bool), k=1)
high_corr_pairs = np.where((corr_matrix > threshold) & upper_triangle)

# Remove one feature from each pair
to_remove = set()
for i, j in zip(high_corr_pairs[0], high_corr_pairs[1]):
    if i not in to_remove and j not in to_remove:
        to_remove.add(j)  # Remove the second feature

X_selected = X.drop(columns=X.columns[list(to_remove)])

# Using sklearn (for correlation with target)
from sklearn.feature_selection import SelectKBest, f_regression
selector = SelectKBest(score_func=f_regression, k=10)
X_selected = selector.fit_transform(X, y)`,
    effect: "Reduces multicollinearity and feature redundancy. Fast filter method. Helps linear models perform better by removing correlated features.",
    category: "Filter",
    impact: "high",
    complexity: "Low",
    formula: "Remove features where |corr(Xi, Xj)| > threshold",
  },
  {
    id: "chi_square",
    label: "Chi-Square Test",
    icon: "χ²",
    definition: "Statistical test for feature independence. Selects features that are most dependent on the target variable.",
    concept: "Chi-square test measures the independence between categorical features and the target variable. It calculates a chi-square statistic for each feature, where higher values indicate stronger dependence on the target. Features with high chi-square scores are selected as they are more likely to be informative for classification. This method is suitable for categorical features and categorical targets.",
    useCases: [
      "Categorical feature selection",
      "Classification tasks",
      "Text classification",
      "When features are categorical",
      "Statistical feature selection",
      "Selecting informative categorical features"
    ],
    implementationInsight: `from sklearn.feature_selection import chi2, SelectKBest
import pandas as pd
import numpy as np

# Initialize selector with chi-square
selector = SelectKBest(score_func=chi2, k=10)

# Fit and transform (requires non-negative features)
X_selected = selector.fit_transform(X, y)

# Get selected feature names
selected_features = X.columns[selector.get_support()]

# Get chi-square scores
scores = selector.scores_
pvalues = selector.pvalues_

# Using pandas with scipy
from scipy.stats import chi2_contingency

def chi2_selection(X, y, k=10):
    scores = []
    for col in X.columns:
        contingency = pd.crosstab(X[col], y)
        chi2, p_value, dof, expected = chi2_contingency(contingency)
        scores.append((col, chi2, p_value))
    
    scores.sort(key=lambda x: x[1], reverse=True)
    selected = [col for col, _, _ in scores[:k]]
    return X[selected]`,
    effect: "Selects features most dependent on target. Good for categorical data. Provides statistical significance scores. Requires non-negative features.",
    category: "Filter",
    impact: "high",
    complexity: "Medium",
    formula: "χ² = Σ((O - E)² / E), where O is observed, E is expected",
  },
  {
    id: "forward_selection",
    label: "Forward Selection",
    icon: "➡️",
    definition: "Iteratively adds best features. Starts with no features and adds one feature at a time that improves model performance most.",
    concept: "Forward selection is a wrapper method that starts with an empty set of features and iteratively adds the feature that provides the best improvement to model performance. At each step, it evaluates all remaining features and selects the one that, when added to the current set, gives the best cross-validation score. This continues until a stopping criterion is met (e.g., no improvement or maximum features reached).",
    useCases: [
      "When you want to find optimal feature subset",
      "Small to medium datasets",
      "When computational time is acceptable",
      "Model-specific feature selection",
      "Finding minimal feature set",
      "When feature interactions matter"
    ],
    implementationInsight: `from sklearn.feature_selection import SequentialFeatureSelector
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import pandas as pd
import numpy as np

# Using sklearn SequentialFeatureSelector
estimator = RandomForestClassifier(n_estimators=100, random_state=42)
selector = SequentialFeatureSelector(
    estimator, 
    n_features_to_select=10,
    direction='forward',
    cv=5
)
X_selected = selector.fit_transform(X, y)

# Manual implementation
def forward_selection(X, y, estimator, max_features=10, cv=5):
    selected_features = []
    remaining_features = list(X.columns)
    
    for _ in range(max_features):
        best_score = -np.inf
        best_feature = None
        
        for feature in remaining_features:
            candidate_features = selected_features + [feature]
            X_candidate = X[candidate_features]
            scores = cross_val_score(estimator, X_candidate, y, cv=cv)
            mean_score = scores.mean()
            
            if mean_score > best_score:
                best_score = mean_score
                best_feature = feature
        
        if best_feature:
            selected_features.append(best_feature)
            remaining_features.remove(best_feature)
    
    return X[selected_features]`,
    effect: "Finds optimal feature subset for specific model. Computationally expensive but effective. Model-specific selection. Can find feature interactions.",
    category: "Wrapper",
    impact: "high",
    complexity: "High",
    formula: "At each step: add feature that maximizes CV score",
  },
  {
    id: "backward_elimination",
    label: "Backward Elimination",
    icon: "⬅️",
    definition: "Iteratively removes worst features. Starts with all features and removes one feature at a time that contributes least to model performance.",
    concept: "Backward elimination is a wrapper method that starts with all features and iteratively removes the feature that, when removed, causes the least decrease in model performance. At each step, it evaluates removing each remaining feature and removes the one with the smallest impact on cross-validation score. This continues until a stopping criterion is met. It's computationally more expensive than forward selection but can find better feature subsets.",
    useCases: [
      "When starting with many features",
      "Finding optimal feature subset",
      "When computational time is acceptable",
      "Model-specific feature selection",
      "When you want to remove redundant features",
      "Medium to large feature sets"
    ],
    implementationInsight: `from sklearn.feature_selection import SequentialFeatureSelector
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import pandas as pd
import numpy as np

# Using sklearn SequentialFeatureSelector
estimator = RandomForestClassifier(n_estimators=100, random_state=42)
selector = SequentialFeatureSelector(
    estimator, 
    n_features_to_select=10,
    direction='backward',
    cv=5
)
X_selected = selector.fit_transform(X, y)

# Manual implementation
def backward_elimination(X, y, estimator, min_features=10, cv=5):
    selected_features = list(X.columns)
    
    while len(selected_features) > min_features:
        worst_score = np.inf
        worst_feature = None
        
        for feature in selected_features:
            candidate_features = [f for f in selected_features if f != feature]
            X_candidate = X[candidate_features]
            scores = cross_val_score(estimator, X_candidate, y, cv=cv)
            mean_score = scores.mean()
            
            if mean_score < worst_score:
                worst_score = mean_score
                worst_feature = feature
        
        if worst_feature:
            selected_features.remove(worst_feature)
    
    return X[selected_features]`,
    effect: "Finds optimal feature subset by removing worst features. More expensive than forward selection but often better. Model-specific selection.",
    category: "Wrapper",
    impact: "high",
    complexity: "High",
    formula: "At each step: remove feature that minimizes CV score decrease",
  },
  {
    id: "rfe",
    label: "RFE (Recursive Feature Elimination)",
    icon: "🔄",
    definition: "Recursively removes features based on model importance. Uses model feature importance to rank and eliminate features.",
    concept: "RFE (Recursive Feature Elimination) is a wrapper method that recursively removes features based on their importance scores from a trained model. It trains a model, ranks features by importance (e.g., coefficients, feature_importances_), removes the least important features, and repeats the process. This continues until the desired number of features is reached. RFE is more efficient than sequential methods as it removes multiple features at once based on importance.",
    useCases: [
      "When model provides feature importance",
      "Tree-based models (Random Forest, XGBoost)",
      "Linear models with coefficients",
      "Large feature sets",
      "When computational efficiency matters",
      "Model-specific feature selection"
    ],
    implementationInsight: `from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Initialize RFE
estimator = RandomForestClassifier(n_estimators=100, random_state=42)
selector = RFE(estimator, n_features_to_select=10, step=1)

# Fit and transform
X_selected = selector.fit_transform(X, y)

# Get selected feature names
selected_features = X.columns[selector.get_support()]

# Get feature rankings
rankings = selector.ranking_

# With step parameter (remove multiple at once)
selector_step = RFE(estimator, n_features_to_select=10, step=5)
X_selected_step = selector_step.fit_transform(X, y)

# Using different estimators
from sklearn.linear_model import LogisticRegression
estimator_lr = LogisticRegression()
selector_lr = RFE(estimator_lr, n_features_to_select=10)
X_selected_lr = selector_lr.fit_transform(X, y)`,
    effect: "Efficient wrapper method using model importance. Faster than sequential methods. Model-specific selection. Works well with tree-based models.",
    category: "Wrapper",
    impact: "high",
    complexity: "High",
    formula: "Rank by importance → Remove bottom k features → Repeat",
  },
  {
    id: "lasso",
    label: "Lasso (L1 Regularization)",
    icon: "L1",
    definition: "L1 regularization for feature selection. Shrinks coefficients to zero, effectively removing features.",
    concept: "Lasso (Least Absolute Shrinkage and Selection Operator) uses L1 regularization which adds a penalty equal to the sum of absolute values of coefficients. This penalty causes some coefficients to shrink to exactly zero, effectively performing feature selection. Features with zero coefficients are removed. Lasso is particularly useful for high-dimensional data and when you want automatic feature selection as part of model training.",
    useCases: [
      "High-dimensional data",
      "Automatic feature selection during training",
      "Linear regression and classification",
      "When you want sparse models",
      "Feature selection with regularization",
      "When many features are irrelevant"
    ],
    implementationInsight: `from sklearn.linear_model import Lasso, LassoCV
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

# Standardize features (important for Lasso)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Lasso with fixed alpha
lasso = Lasso(alpha=0.01, random_state=42)
lasso.fit(X_scaled, y)

# Get selected features (non-zero coefficients)
selected_features = X.columns[lasso.coef_ != 0]

# LassoCV for automatic alpha selection
lasso_cv = LassoCV(cv=5, random_state=42)
lasso_cv.fit(X_scaled, y)
selected_features_cv = X.columns[lasso_cv.coef_ != 0]

# Get coefficients
coefficients = lasso.coef_

# Using pandas
X_selected = X[selected_features]`,
    effect: "Automatic feature selection via L1 regularization. Creates sparse models. Efficient for high-dimensional data. Coefficients can be interpreted.",
    category: "Embedded",
    impact: "high",
    complexity: "Medium",
    formula: "minimize: ||y - Xβ||² + α||β||₁",
  },
  {
    id: "ridge",
    label: "Ridge (L2 Regularization)",
    icon: "L2",
    definition: "L2 regularization for feature shrinkage. Shrinks coefficients toward zero but doesn't remove features completely.",
    concept: "Ridge regression uses L2 regularization which adds a penalty equal to the sum of squares of coefficients. Unlike Lasso, Ridge doesn't set coefficients to exactly zero, but shrinks them toward zero. This helps with multicollinearity and overfitting but doesn't perform explicit feature selection. However, features with very small coefficients can be considered less important. Ridge is useful when you want to keep all features but reduce their impact.",
    useCases: [
      "Multicollinearity reduction",
      "Overfitting prevention",
      "When all features should be kept",
      "Linear regression with many features",
      "Regularization without feature removal",
      "When features are all potentially useful"
    ],
    implementationInsight: `from sklearn.linear_model import Ridge, RidgeCV
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

# Standardize features (important for Ridge)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Ridge with fixed alpha
ridge = Ridge(alpha=1.0, random_state=42)
ridge.fit(X_scaled, y)

# Get feature importance (absolute coefficients)
feature_importance = np.abs(ridge.coef_)
important_features = X.columns[feature_importance > threshold]

# RidgeCV for automatic alpha selection
ridge_cv = RidgeCV(cv=5, alphas=[0.1, 1.0, 10.0])
ridge_cv.fit(X_scaled, y)

# Get coefficients
coefficients = ridge.coef_

# Using pandas
X_selected = X[important_features]`,
    effect: "Reduces overfitting and multicollinearity. Doesn't remove features but shrinks coefficients. All features remain in model. Good for regularization.",
    category: "Embedded",
    impact: "medium",
    complexity: "Medium",
    formula: "minimize: ||y - Xβ||² + α||β||²",
  },
  {
    id: "elastic_net",
    label: "Elastic Net",
    icon: "⚡",
    definition: "Combines L1 and L2 regularization. Provides benefits of both Lasso and Ridge regularization.",
    concept: "Elastic Net combines L1 (Lasso) and L2 (Ridge) regularization penalties. It adds both the sum of absolute values and the sum of squares of coefficients. This provides the feature selection capability of Lasso while maintaining the stability of Ridge. Elastic Net is particularly useful when there are many correlated features, as Lasso tends to select only one from a group of correlated features, while Elastic Net can select groups of correlated features.",
    useCases: [
      "When features are correlated",
      "High-dimensional data",
      "Combining Lasso and Ridge benefits",
      "When Lasso selects too few features",
      "Grouped feature selection",
      "Balanced regularization approach"
    ],
    implementationInsight: `from sklearn.linear_model import ElasticNet, ElasticNetCV
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Elastic Net with fixed alpha and l1_ratio
elastic_net = ElasticNet(alpha=0.01, l1_ratio=0.5, random_state=42)
elastic_net.fit(X_scaled, y)

# Get selected features (non-zero coefficients)
selected_features = X.columns[elastic_net.coef_ != 0]

# ElasticNetCV for automatic parameter selection
elastic_net_cv = ElasticNetCV(cv=5, l1_ratio=[0.1, 0.5, 0.7, 0.9], random_state=42)
elastic_net_cv.fit(X_scaled, y)
selected_features_cv = X.columns[elastic_net_cv.coef_ != 0]

# Get coefficients
coefficients = elastic_net.coef_

# Using pandas
X_selected = X[selected_features]`,
    effect: "Combines L1 and L2 regularization benefits. Feature selection like Lasso with stability of Ridge. Good for correlated features. Balanced approach.",
    category: "Embedded",
    impact: "high",
    complexity: "Medium",
    formula: "minimize: ||y - Xβ||² + α(ρ||β||₁ + (1-ρ)||β||²)",
  },
];

