/**
 * Extra Trees (Extremely Randomized Trees) Regressor
 * Ensemble of regression trees with additional randomization
 */

export interface ExtraTreesRegressorConfig {
  nEstimators?: number;
  criterion?: "squared_error" | "absolute_error" | "friedman_mse" | "poisson";
  maxDepth?: number | null;
  minSamplesSplit?: number;
  minSamplesLeaf?: number;
  minWeightFractionLeaf?: number;
  maxFeatures?: "sqrt" | "log2" | number | null;
  maxLeafNodes?: number | null;
  minImpurityDecrease?: number;
  bootstrap?: boolean;
  oobScore?: boolean;
  nJobs?: number;
  randomState?: number;
  verbose?: number;
  warmStart?: boolean;
  ccpAlpha?: number;
}

export const ExtraTreesRegressorInfo = {
  name: "Extra Trees Regressor",
  category: "regression",
  description: "Ensemble of regression trees with additional randomization",
  detailedDescription: `Extra Trees Regressor is an ensemble method similar to Random Forest but with additional randomization: splits are chosen completely at random from top-k best splits, not the absolute best.

Steps:

1.Training Data: Labeled data with features and continuous target values.

2.Bootstrap Sampling: Create bootstrap samples (random sampling with replacement) from training data.

3.Random Feature Selection: Randomly select subset of features at each node.

4.Random Split Selection: Instead of choosing best split, randomly select from top-k best splits (k = sqrt(n_features) typically).

5.Build Trees: Train regression trees with random splits, creating more diverse ensemble than Random Forest.

6.Tree Diversity: Extra randomization reduces variance and overfitting compared to standard Random Forest.

7.Prediction: Each tree makes independent prediction (mean target in leaf), final output is average: ŷ = (1/M)Σŷₘ.

8.Ensemble Result: Average predictions from all trees for robust regression.`,
  complexity: "Medium",
  bestFor: "Noisy data, reducing variance",
  pros: [
    "Reduces variance more than Random Forest",
    "Faster training than Random Forest",
    "Less prone to overfitting",
    "Robust to noisy data",
    "Provides feature importance",
    "Works well out-of-the-box"
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
    "General regression tasks",
    "Feature selection",
    "When Random Forest overfits"
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
    dataType: "Numerical and categorical (after encoding)",
    scaling: "Not required",
    missingValues: "Can handle some",
    categorical: "Should be encoded"
  },
  performance: {
    trainingSpeed: "Fast (faster than Random Forest)",
    predictionSpeed: "Fast",
    memoryUsage: "High",
    scalability: "Good with parallel processing"
  }
};

export function trainExtraTreesRegressor(
  XTrain: number[][],
  yTrain: number[],
  config: ExtraTreesRegressorConfig
) {
  console.log("Training Extra Trees Regressor with config:", config);
  return {
    model: "extra_trees_regressor",
    config,
    trained: true
  };
}
