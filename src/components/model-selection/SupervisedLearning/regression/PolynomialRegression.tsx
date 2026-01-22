/**
 * Polynomial Regression
 * Fits polynomial features to capture non-linear relationships
 */

export interface PolynomialRegressionConfig {
  degree?: number; // Degree of polynomial features
  includeBias?: boolean;
  interactionOnly?: boolean;
  order?: "C" | "F";
  fitIntercept?: boolean;
  normalize?: boolean;
  copyX?: boolean;
  nJobs?: number;
}

export const PolynomialRegressionInfo = {
  name: "Polynomial Regression",
  category: "regression",
  description: "Fits polynomial features to capture non-linear relationships",
  detailedDescription: `Polynomial Regression extends linear regression by creating polynomial features (x², x³, interactions) to capture non-linear relationships between features and target.

Steps:

1.Training Data: Labeled data with features and continuous target values.

2.Polynomial Features: Create polynomial features from original features. For degree d, create x₁, x₁², x₁³, ..., x₁ᵈ, x₂, x₂², ..., x₁x₂, etc.

3.Feature Transformation: Transform X to polynomial features: X_poly = [1, x₁, x₂, x₁², x₁x₂, x₂², ...] up to degree d.

4.Linear Model: Fit linear regression on polynomial features: y = w₀ + w₁x₁ + w₂x₂ + w₃x₁² + w₄x₁x₂ + w₅x₂² + ...

5.Objective Function: Minimize SSE = Σ(yᵢ - ŷᵢ)² using OLS or gradient descent.

6.Coefficient Calculation: Calculate coefficients w for all polynomial terms.

7.Curve Fitting: Model can now fit curves, not just straight lines (degree 1 = linear, degree 2 = quadratic, etc.).

8.Prediction: For new point x, create polynomial features and predict ŷ = w₀ + w₁x₁ + w₂x₂ + w₃x₁² + ...`,
  complexity: "Medium",
  bestFor: "Non-linear relationships, feature engineering",
  pros: [
    "Captures non-linear relationships",
    "Simple to understand",
    "Interpretable coefficients",
    "Flexible degree selection",
    "Works with linear regression benefits"
  ],
  cons: [
    "Can overfit easily",
    "Feature explosion with high degree",
    "Sensitive to outliers",
    "May create unrealistic predictions",
    "Computationally expensive for high degrees"
  ],
  useCases: [
    "Non-linear trend modeling",
    "Curve fitting",
    "When relationship is polynomial",
    "Feature engineering",
    "Scientific modeling"
  ],
  hyperparameters: {
    degree: {
      description: "Degree of polynomial features",
      default: 2,
      range: [1, 10]
    },
    includeBias: {
      description: "Include bias term",
      default: true,
      options: [true, false]
    },
    interactionOnly: {
      description: "Only include interaction terms",
      default: false,
      options: [true, false]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Fast to Medium (depends on degree)",
    predictionSpeed: "Fast",
    memoryUsage: "Medium (feature explosion)",
    scalability: "Good for low degrees"
  }
};

export function trainPolynomialRegression(
  XTrain: number[][],
  yTrain: number[],
  config: PolynomialRegressionConfig
) {
  console.log("Training Polynomial Regression with config:", config);
  return {
    model: "polynomial_regression",
    config,
    trained: true
  };
}
