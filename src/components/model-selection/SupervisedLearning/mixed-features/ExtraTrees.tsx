/**
 * Extra Trees (Extremely Randomized Trees) - Classification & Regression
 * Ensemble of decision trees with additional randomization
 */

export interface ExtraTreesConfig {
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

export const ExtraTreesInfo = {
  name: "Extra Trees",
  category: "both", // classification and regression
  description: "Ensemble of decision trees with additional randomization",
  detailedDescription: `Extra Trees for mixed features is an ensemble method with additional randomization that can handle both numerical and categorical features natively, similar to Random Forest.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, target values (classification or regression).

2.Bootstrap Sampling: Create bootstrap samples (random sampling with replacement) from training data.

3.Random Feature Selection: Randomly select subset of features at each node.

4.Random Split Selection: Instead of choosing best split, randomly select from top-k best splits (k = sqrt(n_features) typically).

5.Build Trees: Train decision trees with random splits. Trees can split on both numerical (threshold) and categorical (subset) features.

6.Tree Diversity: Extra randomization reduces variance and overfitting, creating diverse models for mixed data types.

7.Prediction: Each tree makes independent prediction, final output is majority vote (classification) or average (regression): ŷ = (1/M)Σŷₘ.

8.Ensemble Result: Combine predictions from all trees for robust results with mixed feature types.`,
  complexity: "Medium",
  bestFor: "Noisy data, reducing variance, mixed features",
  pros: [
    "Reduces variance more than Random Forest",
    "Faster training than Random Forest",
    "Less prone to overfitting",
    "Robust to noisy data",
    "Provides feature importance",
    "Works well out-of-the-box",
    "Handles mixed feature types"
  ],
  cons: [
    "Slightly less accurate than Random Forest",
    "Less interpretable than single tree",
    "Memory intensive",
    "Can be slower than Random Forest for prediction",
    "Requires more trees for stability"
  ],
  useCases: [
    "Noisy datasets",
    "When variance reduction is important",
    "General classification/regression tasks",
    "Feature selection",
    "Datasets with mixed feature types"
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
    trainingSpeed: "Fast (faster than Random Forest)",
    predictionSpeed: "Fast",
    memoryUsage: "High",
    scalability: "Good with parallel processing"
  }
};

export function trainExtraTrees(
  XTrain: (number | string)[][],
  yTrain: number[],
  config: ExtraTreesConfig,
  taskType: "classification" | "regression" = "classification"
) {
  console.log(`Training Extra Trees ${taskType} with config:`, config);
  return {
    model: "extra_trees",
    taskType,
    config,
    trained: true
  };
}
