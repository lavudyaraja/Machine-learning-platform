/**
 * Lasso Regression
 * Linear regression with L1 regularization for feature selection
 */

export interface LassoRegressionConfig {
  alpha?: number; // Regularization strength
  fitIntercept?: boolean;
  normalize?: boolean;
  precompute?: boolean | "auto";
  copyX?: boolean;
  maxIter?: number;
  tol?: number;
  warmStart?: boolean;
  positive?: boolean;
  randomState?: number;
  selection?: "cyclic" | "random";
}

export const LassoRegressionInfo = {
  name: "Lasso Regression",
  category: "regression",
  description: "Linear regression with L1 regularization for feature selection",
  detailedDescription: `Lasso (Least Absolute Shrinkage and Selection Operator) Regression is linear regression with L1 regularization that performs feature selection by setting some coefficients to exactly zero.

Steps:

1.Training Data: Labeled data with features (X) and continuous target values (y).

2.Linear Model: Assume relationship y = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.

3.L1 Regularization: Add penalty term λΣ|wᵢ| to objective function, where λ (alpha) is regularization strength.

4.Objective Function: Minimize L = SSE + λΣ|wᵢ| = Σ(yᵢ - ŷᵢ)² + λ(|w₁| + |w₂| + ... + |wₙ|).

5.Feature Selection: L1 penalty can set coefficients to exactly zero, effectively removing features from model.

6.Sparse Solution: Produces sparse model with fewer features, useful for high-dimensional data.

7.Solve: Use coordinate descent or least angle regression (LARS) algorithm to find optimal coefficients.

8.Hyperparameter Tuning: Select optimal λ using cross-validation (larger λ → more features eliminated).

9.Prediction: For new point x, predict ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ (some wᵢ may be zero).`,
  complexity: "Low",
  bestFor: "Feature selection, sparse models",
  pros: [
    "Performs automatic feature selection",
    "Reduces overfitting",
    "Creates sparse models (many coefficients = 0)",
    "Interpretable coefficients",
    "Handles multicollinearity",
    "Fast training"
  ],
  cons: [
    "May eliminate important features",
    "Assumes linearity",
    "Sensitive to outliers",
    "May underfit if alpha too high",
    "Can select only one feature from correlated group"
  ],
  useCases: [
    "Feature selection",
    "High-dimensional data",
    "When you have many features",
    "Sparse model requirements",
    "Price prediction with feature selection"
  ],
  hyperparameters: {
    alpha: {
      description: "Regularization strength (larger = more regularization)",
      default: 1.0,
      range: [0.001, 100]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: 1000,
      range: [100, 5000]
    },
    selection: {
      description: "How to select features",
      default: "cyclic",
      options: ["cyclic", "random"]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Low",
    scalability: "Excellent"
  }
};

export function trainLassoRegression(
  XTrain: number[][],
  yTrain: number[],
  config: LassoRegressionConfig
) {
  console.log("Training Lasso Regression with config:", config);
  return {
    model: "lasso_regression",
    config,
    trained: true
  };
}
