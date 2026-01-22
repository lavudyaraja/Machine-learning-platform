/**
 * CatBoost (Classification & Regression)
 * Gradient boosting optimized for categorical features with ordered encoding
 */

export interface CatBoostConfig {
  iterations?: number;
  learningRate?: number;
  depth?: number;
  l2LeafReg?: number;
  borderCount?: number;
  catFeatures?: number[]; // Indices of categorical features
  taskType?: "CPU" | "GPU";
  lossFunction?: string;
  evalMetric?: string;
  verbose?: boolean;
  randomSeed?: number;
}

export const CatBoostInfo = {
  name: "CatBoost",
  category: "both", // classification and regression
  description: "Gradient boosting optimized for categorical features with ordered encoding",
  detailedDescription: `CatBoost is a gradient boosting algorithm specifically optimized for categorical features, using ordered target encoding to handle categorical data natively without manual encoding.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, target values (classification or regression).

2.Ordered Target Encoding: For categorical features, use ordered target encoding: encode categorical value based on target statistics from previous samples only (prevents target leakage).

3.Gradient Calculation: Calculate gradients and hessians for each sample using loss function.

4.Build Tree: Train decision tree that can split on both numerical and categorical features directly.

5.Categorical Splits: For categorical features, find optimal subset of categories for split (not just binary).

6.Symmetric Trees: Use symmetric (oblivious) trees where all nodes at same level use same feature, reducing overfitting.

7.Update Model: Add new tree to ensemble: Fₘ(x) = Fₘ₋₁(x) + α × hₘ(x) where α is learning rate.

8.Iterate: Repeat steps 3-7 for M trees.

9.Prediction: Final prediction F(x) = F₀(x) + αΣhₘ(x). Apply sigmoid for classification probability.`,
  complexity: "High",
  bestFor: "Datasets with many categorical features",
  pros: [
    "Built specifically for categorical data",
    "No need for preprocessing categorical features",
    "High accuracy out-of-the-box",
    "Handles missing values automatically",
    "Built-in regularization",
    "GPU support for faster training"
  ],
  cons: [
    "Slower training than LightGBM",
    "More complex than simpler models",
    "May overfit on small datasets",
    "Requires careful hyperparameter tuning"
  ],
  useCases: [
    "Datasets with many categorical columns",
    "E-commerce recommendations",
    "Fraud detection",
    "Customer churn prediction",
    "Click-through rate prediction"
  ],
  hyperparameters: {
    iterations: {
      description: "Number of boosting iterations",
      default: 1000,
      range: [100, 5000]
    },
    learningRate: {
      description: "Step size shrinkage",
      default: 0.03,
      range: [0.01, 0.3]
    },
    depth: {
      description: "Depth of trees",
      default: 6,
      range: [4, 10]
    },
    l2LeafReg: {
      description: "L2 regularization",
      default: 3.0,
      range: [1, 10]
    }
  },
  requirements: {
    dataType: "Numerical and categorical (native support)",
    scaling: "Not required",
    missingValues: "Can handle",
    categorical: "Can handle natively (no encoding needed)"
  },
  performance: {
    trainingSpeed: "Medium to Slow",
    predictionSpeed: "Fast",
    memoryUsage: "Medium",
    scalability: "Good"
  }
};

export function trainCatBoost(
  XTrain: (number | string)[][],
  yTrain: number[],
  config: CatBoostConfig,
  taskType: "classification" | "regression" = "classification"
) {
  console.log(`Training CatBoost ${taskType} with config:`, config);
  return {
    model: "catboost",
    taskType,
    config,
    trained: true
  };
}

