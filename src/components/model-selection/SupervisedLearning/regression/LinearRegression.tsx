/**
 * Linear Regression
 * Fits a linear relationship between features and target
 */

export interface LinearRegressionConfig {
  fitIntercept?: boolean;
  normalize?: boolean; // Deprecated in sklearn 1.2+, use preprocessing instead
  copyX?: boolean;
  nJobs?: number;
  positive?: boolean; // Force coefficients to be positive
}

export const LinearRegressionInfo = {
  name: "Linear Regression",
  category: "regression",
  description: "Fits a linear relationship between features and target",
  detailedDescription: `Linear Regression is a supervised learning algorithm that models the relationship between features and a continuous target variable using a linear equation.

Steps:

1.Training Data: Labeled data with features (X) and continuous target values (y).

2.Linear Model: Assume relationship y = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ + ε where w are coefficients and ε is error.

3.Objective Function: Minimize sum of squared errors: SSE = Σ(yᵢ - ŷᵢ)² = Σ(yᵢ - (w₀ + w₁x₁ᵢ + ... + wₙxₙᵢ))².

4.Ordinary Least Squares (OLS): Solve for coefficients using normal equation: w = (XᵀX)⁻¹Xᵀy or gradient descent.

5.Coefficient Calculation: Calculate w₀ (intercept) and w₁...wₙ (slopes) that minimize SSE.

6.Goodness of Fit: Calculate R² = 1 - (SSE/SST) where SST is total sum of squares.

7.Prediction: For new point x, predict ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.`,
  complexity: "Low",
  bestFor: "Linear relationships, baseline model",
  pros: [
    "Simple and fast",
    "Highly interpretable",
    "Provides coefficients for each feature",
    "No hyperparameters to tune",
    "Works well when relationship is linear",
    "Statistical significance tests available"
  ],
  cons: [
    "Assumes linearity",
    "Sensitive to outliers",
    "May underfit complex data",
    "Assumes independence of features",
    "Sensitive to multicollinearity"
  ],
  useCases: [
    "Price prediction",
    "Sales forecasting",
    "Trend analysis",
    "Risk assessment",
    "As a baseline model"
  ],
  hyperparameters: {
    fitIntercept: {
      description: "Calculate intercept (bias term)",
      default: true,
      options: [true, false]
    },
    positive: {
      description: "Force coefficients to be positive",
      default: false,
      options: [true, false]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Recommended for better interpretation",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Very Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Very Low",
    scalability: "Excellent"
  }
};

export function trainLinearRegression(
  XTrain: number[][],
  yTrain: number[],
  config: LinearRegressionConfig
) {
  console.log("Training Linear Regression with config:", config);
  return {
    model: "linear_regression",
    config,
    trained: true
  };
}

