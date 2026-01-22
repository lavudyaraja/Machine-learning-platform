/**
 * Elastic Net Regression
 * Combines L1 (Lasso) and L2 (Ridge) regularization
 */

export interface ElasticNetRegressionConfig {
  alpha?: number; // Regularization strength
  l1Ratio?: number; // Mix of L1 and L2 (0=Ridge, 1=Lasso)
  fitIntercept?: boolean;
  normalize?: boolean;
  precompute?: boolean | "auto";
  maxIter?: number;
  copyX?: boolean;
  tol?: number;
  warmStart?: boolean;
  positive?: boolean;
  randomState?: number;
  selection?: "cyclic" | "random";
}

export const ElasticNetRegressionInfo = {
  name: "Elastic Net Regression",
  category: "regression",
  description: "Combines L1 (Lasso) and L2 (Ridge) regularization",
  detailedDescription: `Elastic Net Regression combines L1 (Lasso) and L2 (Ridge) regularization, providing a balance between feature selection (L1) and coefficient shrinkage (L2).

Steps:

1.Training Data: Labeled data with features (X) and continuous target values (y).

2.Linear Model: Assume relationship y = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.

3.Elastic Net Penalty: Combine L1 and L2 penalties: λ[(1-α)Σwᵢ²/2 + αΣ|wᵢ|] where λ is regularization strength and α is mixing parameter.

4.Objective Function: Minimize L = SSE + λ[(1-α)Σwᵢ²/2 + αΣ|wᵢ|] = Σ(yᵢ - ŷᵢ)² + λ[(1-α)Σwᵢ²/2 + αΣ|wᵢ|].

5.Mixing Parameter: α = 0 → pure Ridge (L2), α = 1 → pure Lasso (L1), 0 < α < 1 → mixed penalty.

6.Benefits: Handles groups of correlated features better than Lasso, performs feature selection like Lasso.

7.Solve: Use coordinate descent algorithm to find optimal coefficients.

8.Hyperparameter Tuning: Select optimal λ and α using cross-validation.

9.Prediction: For new point x, predict ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.`,
  complexity: "Low",
  bestFor: "Feature selection with grouped features",
  pros: [
    "Combines benefits of Lasso and Ridge",
    "Handles grouped features better than Lasso",
    "Feature selection capability",
    "Reduces overfitting",
    "More stable than Lasso",
    "Interpretable"
  ],
  cons: [
    "Two hyperparameters to tune",
    "Assumes linearity",
    "Sensitive to outliers",
    "May underfit if alpha too high",
    "Slower than Ridge or Lasso alone"
  ],
  useCases: [
    "When you have correlated features",
    "Feature selection with grouping",
    "High-dimensional data",
    "When Lasso eliminates too many features",
    "Price prediction with regularization"
  ],
  hyperparameters: {
    alpha: {
      description: "Regularization strength",
      default: 1.0,
      range: [0.001, 100]
    },
    l1Ratio: {
      description: "Mix of L1 and L2 (0=Ridge, 1=Lasso, 0.5=mixed)",
      default: 0.5,
      range: [0.0, 1.0]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: 1000,
      range: [100, 5000]
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

export function trainElasticNetRegression(
  XTrain: number[][],
  yTrain: number[],
  config: ElasticNetRegressionConfig
) {
  console.log("Training Elastic Net Regression with config:", config);
  return {
    model: "elastic_net_regression",
    config,
    trained: true
  };
}
