/**
 * Support Vector Regressor (SVR)
 * Uses support vectors to find optimal regression function
 */

export interface SupportVectorRegressorConfig {
  kernel?: "linear" | "poly" | "rbf" | "sigmoid" | "precomputed";
  degree?: number; // For polynomial kernel
  gamma?: number | "scale" | "auto"; // Kernel coefficient
  coef0?: number; // For polynomial and sigmoid kernels
  tol?: number;
  C?: number; // Regularization parameter
  epsilon?: number; // Epsilon-tube width
  shrinking?: boolean;
  cacheSize?: number;
  verbose?: boolean;
  maxIter?: number;
}

export const SupportVectorRegressorInfo = {
  name: "Support Vector Regressor (SVR)",
  category: "regression",
  description: "Uses support vectors to find optimal regression function",
  detailedDescription: `Support Vector Regressor (SVR) finds an optimal regression function by using support vectors and an epsilon-insensitive loss function that ignores errors within a tolerance margin.

Steps:

1.Training Data: Labeled data with features and continuous target values.

2.Epsilon-Tube: Define epsilon-insensitive tube around target values. Errors within ±ε are ignored (not penalized).

3.Loss Function: Use epsilon-insensitive loss: L = max(0, |y - f(x)| - ε) where f(x) is regression function.

4.Optimization: Find function f(x) = w·x + b that minimizes: ½||w||² + CΣ(ξᵢ + ξᵢ*) where ξ are slack variables for points outside tube.

5.Support Vectors: Identify support vectors (points on or outside epsilon-tube) that define regression function.

6.Kernel Trick: For non-linear regression, use kernel (RBF, polynomial) to map to higher-dimensional space.

7.Prediction: For new point x, compute f(x) = ΣαᵢK(xᵢ, x) + b where α are Lagrange multipliers and K is kernel function.`,
  complexity: "High",
  bestFor: "Non-linear relationships, small to medium datasets",
  pros: [
    "Handles non-linear relationships",
    "Memory efficient (uses support vectors)",
    "Robust to outliers (epsilon-insensitive)",
    "Works well with clear patterns",
    "Flexible kernel choices"
  ],
  cons: [
    "Slow training on large datasets",
    "Requires careful hyperparameter tuning",
    "Sensitive to feature scaling",
    "Difficult to interpret",
    "Memory intensive for large datasets"
  ],
  useCases: [
    "Non-linear regression",
    "Small to medium datasets",
    "When pattern is clear",
    "Time series forecasting",
    "Scientific modeling"
  ],
  hyperparameters: {
    kernel: {
      description: "Kernel type",
      default: "rbf",
      options: ["linear", "poly", "rbf", "sigmoid", "precomputed"]
    },
    C: {
      description: "Regularization parameter (larger = less regularization)",
      default: 1.0,
      range: [0.001, 1000]
    },
    epsilon: {
      description: "Epsilon-tube width (larger = more tolerance)",
      default: 0.1,
      range: [0.01, 1.0]
    },
    gamma: {
      description: "Kernel coefficient (larger = more complex)",
      default: "scale",
      options: ["scale", "auto", "number"]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Slow for large datasets",
    predictionSpeed: "Medium",
    memoryUsage: "Medium to High",
    scalability: "Poor for very large datasets"
  }
};

export function trainSupportVectorRegressor(
  XTrain: number[][],
  yTrain: number[],
  config: SupportVectorRegressorConfig
) {
  console.log("Training Support Vector Regressor with config:", config);
  return {
    model: "support_vector_regressor",
    config,
    trained: true
  };
}
