/**
 * Gradient Boosting (Classification & Regression)
 * Ensemble method that builds trees sequentially to correct errors
 */

export interface GradientBoostingConfig {
  loss?: "log_loss" | "exponential" | "squared_error" | "absolute_error" | "huber" | "quantile";
  learningRate?: number;
  nEstimators?: number;
  subsample?: number;
  criterion?: "friedman_mse" | "squared_error";
  minSamplesSplit?: number;
  minSamplesLeaf?: number;
  maxDepth?: number;
  minImpurityDecrease?: number;
  randomState?: number;
  maxFeatures?: "sqrt" | "log2" | number | null;
  alpha?: number; // For quantile loss
  verbose?: number;
  warmStart?: boolean;
  validationFraction?: number;
  nIterNoChange?: number;
  tol?: number;
  ccpAlpha?: number;
}

export const GradientBoostingInfo = {
  name: "Gradient Boosting",
  category: "both", // classification and regression
  description: "Ensemble method that builds trees sequentially to correct errors",
  detailedDescription: `Gradient Boosting for mixed features builds trees sequentially to correct errors, handling both numerical and categorical features (categorical typically encoded first).

Steps:

1.Training Data: Labeled data with both numerical and categorical features, target values (classification or regression).

2.Feature Encoding: Encode categorical features using one-hot encoding, label encoding, or target encoding to convert to numerical format.

3.Initial Prediction: Start with initial prediction F₀(x) = mean(y) or log(odds).

4.Calculate Residuals: For each sample, compute negative gradient (pseudo-residual) rᵢ = yᵢ - Fₘ₋₁(xᵢ) where Fₘ₋₁ is current model.

5.Build Tree: Train regression tree hₘ(x) to fit the residuals from previous iteration (all features now numerical).

6.Find Optimal Leaf Values: For each leaf, calculate optimal value γⱼ that minimizes loss for samples in leaf.

7.Update Model: Add new tree to ensemble: Fₘ(x) = Fₘ₋₁(x) + α × hₘ(x) where α is learning rate (shrinkage).

8.Iterate: Repeat steps 4-7 for M trees (n_estimators).

9.Prediction: Final prediction F(x) = F₀(x) + αΣhₘ(x). Apply sigmoid for classification probability.`,
  complexity: "High",
  bestFor: "High accuracy, structured data, mixed features",
  pros: [
    "Very high accuracy",
    "Handles non-linear relationships",
    "Feature importance available",
    "Reduces bias effectively",
    "Works well with structured data",
    "Can handle missing values",
    "Handles mixed feature types"
  ],
  cons: [
    "Slow training (sequential)",
    "Memory intensive",
    "Requires careful hyperparameter tuning",
    "Prone to overfitting",
    "Not parallelizable",
    "Sensitive to outliers"
  ],
  useCases: [
    "High accuracy requirements",
    "Structured/tabular data",
    "When XGBoost is not available",
    "Datasets with mixed features",
    "General classification/regression"
  ],
  hyperparameters: {
    nEstimators: {
      description: "Number of boosting stages",
      default: 100,
      range: [50, 1000]
    },
    learningRate: {
      description: "Step size shrinkage",
      default: 0.1,
      range: [0.01, 0.3]
    },
    maxDepth: {
      description: "Maximum depth of trees",
      default: 3,
      range: [3, 10]
    },
    subsample: {
      description: "Fraction of samples for each tree",
      default: 1.0,
      range: [0.5, 1.0]
    }
  },
  requirements: {
    dataType: "Numerical and categorical",
    scaling: "Not required",
    missingValues: "Can handle",
    categorical: "Should be encoded"
  },
  performance: {
    trainingSpeed: "Slow (sequential)",
    predictionSpeed: "Fast",
    memoryUsage: "High",
    scalability: "Good for medium datasets"
  }
};

export function trainGradientBoosting(
  XTrain: (number | string)[][],
  yTrain: number[],
  config: GradientBoostingConfig,
  taskType: "classification" | "regression" = "classification"
) {
  console.log(`Training Gradient Boosting ${taskType} with config:`, config);
  return {
    model: "gradient_boosting",
    taskType,
    config,
    trained: true
  };
}
