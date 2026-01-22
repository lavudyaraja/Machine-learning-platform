/**
 * Random Forest (Classification & Regression)
 * Ensemble of decision trees using bagging and feature randomness
 */

export interface RandomForestConfig {
  nEstimators?: number;
  criterion?: "gini" | "entropy" | "log_loss" | "squared_error" | "friedman_mse" | "absolute_error" | "poisson";
  maxDepth?: number | null;
  minSamplesSplit?: number;
  minSamplesLeaf?: number;
  maxFeatures?: "sqrt" | "log2" | number | null;
  bootstrap?: boolean;
  oobScore?: boolean;
  nJobs?: number;
  randomState?: number;
  classWeight?: "balanced" | "balanced_subsample" | null;
}

export const RandomForestInfo = {
  name: "Random Forest",
  category: "both", // classification and regression
  description: "Ensemble of decision trees using bagging and feature randomness",
  detailedDescription: `Random Forest for mixed features combines multiple decision trees using bagging, where each tree can handle both numerical and categorical features natively.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, target values (classification or regression).

2.Bootstrap Sampling: Create multiple bootstrap samples (random sampling with replacement) from training data.

3.Random Feature Selection: For each tree, randomly select subset of features (typically √n features) at each split.

4.Build Trees: Train independent decision trees on each bootstrap sample. Trees can split on both numerical (threshold) and categorical (subset) features.

5.Tree Diversity: Each tree sees different data and features, creating diverse models that handle mixed data types.

6.Prediction: Each tree makes independent prediction, final output is majority vote (classification) or average (regression): ŷ = (1/M)Σŷₘ.

7.Ensemble Result: Combine predictions from all trees for robust results with mixed feature types.`,
  complexity: "Medium",
  bestFor: "General purpose, tabular data, mixed features",
  pros: [
    "Reduces overfitting vs single tree",
    "Provides feature importance",
    "Robust to outliers and noise",
    "Handles non-linear relationships",
    "Works well out-of-the-box",
    "Can handle missing values",
    "Works with numerical and categorical"
  ],
  cons: [
    "Less interpretable than single tree",
    "Slower than single tree",
    "Memory intensive",
    "Can overfit noisy datasets",
    "Biased toward high cardinality features"
  ],
  useCases: [
    "General classification/regression tasks",
    "Feature selection",
    "Handling imbalanced data",
    "Datasets with mixed feature types",
    "When accuracy is priority"
  ],
  hyperparameters: {
    nEstimators: {
      description: "Number of trees in the forest",
      default: 100,
      range: [10, 1000]
    },
    maxDepth: {
      description: "Maximum depth of trees (null = unlimited)",
      default: null,
      range: [3, 50]
    },
    minSamplesSplit: {
      description: "Minimum samples required to split node",
      default: 2,
      range: [2, 20]
    },
    maxFeatures: {
      description: "Number of features for best split",
      default: "sqrt",
      options: ["sqrt", "log2", "number"]
    }
  },
  requirements: {
    dataType: "Numerical and categorical",
    scaling: "Not required",
    missingValues: "Can handle some",
    categorical: "Can handle natively or encoded"
  },
  performance: {
    trainingSpeed: "Medium (parallelizable)",
    predictionSpeed: "Fast",
    memoryUsage: "High",
    scalability: "Good with parallel processing"
  }
};

export function trainRandomForest(
  XTrain: (number | string)[][],
  yTrain: number[],
  config: RandomForestConfig,
  taskType: "classification" | "regression" = "classification"
) {
  console.log(`Training Random Forest ${taskType} with config:`, config);
  return {
    model: "random_forest",
    taskType,
    config,
    trained: true
  };
}
