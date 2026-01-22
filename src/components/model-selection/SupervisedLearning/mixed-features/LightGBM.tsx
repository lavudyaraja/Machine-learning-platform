/**
 * LightGBM (Classification & Regression)
 * Fast gradient boosting using histogram-based learning
 */

export interface LightGBMConfig {
  numLeaves?: number;
  maxDepth?: number;
  learningRate?: number;
  nEstimators?: number;
  subsampleForBin?: number;
  objective?: string;
  classWeight?: string | object;
  minSplitGain?: number;
  minChildWeight?: number;
  minChildSamples?: number;
  subsample?: number;
  colsampleBytree?: number;
  regAlpha?: number;
  regLambda?: number;
  randomState?: number;
  nJobs?: number;
  catFeature?: string | number[];
}

export const LightGBMInfo = {
  name: "LightGBM",
  category: "both",
  description: "Fast gradient boosting using histogram-based learning",
  detailedDescription: `LightGBM for mixed features is a fast gradient boosting framework that can handle both numerical and categorical features, with categorical features handled natively or after encoding.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, target values (classification or regression).

2.Categorical Handling: LightGBM can handle categorical features natively by finding optimal categorical splits, or use encoding if needed.

3.Gradient Calculation: Calculate gradients and hessians for each sample using loss function.

4.Leaf-wise Growth: Build trees by selecting leaf with maximum delta loss to split (best-first), not level-by-level.

5.Histogram-based Algorithm: Use histogram-based method to find best splits for numerical features, reducing computation.

6.Categorical Splits: For categorical features, find optimal subset of categories for split.

7.Update Model: Add new tree to ensemble: Fₘ(x) = Fₘ₋₁(x) + α × hₘ(x) where α is learning rate.

8.Prediction: Final prediction F(x) = F₀(x) + αΣhₘ(x). Apply sigmoid for classification probability.`,
  complexity: "High",
  bestFor: "Large datasets with categorical features",
  pros: [
    "Very fast training and prediction",
    "Low memory usage",
    "Handles categorical features",
    "Supports parallel and GPU learning",
    "High accuracy",
    "Efficient with large datasets"
  ],
  cons: [
    "Can overfit on small datasets",
    "Sensitive to hyperparameters",
    "May require careful tuning",
    "Black box model"
  ],
  useCases: [
    "Large-scale machine learning",
    "Real-time prediction systems",
    "Kaggle competitions",
    "Financial modeling",
    "When speed is critical"
  ],
  hyperparameters: {
    numLeaves: {
      description: "Maximum number of leaves in one tree",
      default: 31,
      range: [20, 100]
    },
    learningRate: {
      description: "Boosting learning rate",
      default: 0.1,
      range: [0.01, 0.3]
    },
    nEstimators: {
      description: "Number of boosted trees",
      default: 100,
      range: [50, 1000]
    },
    maxDepth: {
      description: "Maximum tree depth (-1 = no limit)",
      default: -1,
      range: [3, 12]
    }
  },
  requirements: {
    dataType: "Numerical and categorical",
    scaling: "Not required",
    missingValues: "Can handle",
    categorical: "Can handle with proper specification"
  },
  performance: {
    trainingSpeed: "Very Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Low",
    scalability: "Excellent for large datasets"
  }
};

export function trainLightGBM(
  XTrain: (number | string)[][],
  yTrain: number[],
  config: LightGBMConfig,
  taskType: "classification" | "regression" = "classification"
) {
  console.log(`Training LightGBM ${taskType} with config:`, config);
  return {
    model: "lightgbm",
    taskType,
    config,
    trained: true
  };
}

