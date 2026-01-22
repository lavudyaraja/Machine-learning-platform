/**
 * K-Nearest Neighbors Regressor
 * Predicts based on average of K nearest neighbors
 */

export interface KNearestNeighborsRegressorConfig {
  nNeighbors?: number;
  weights?: "uniform" | "distance";
  algorithm?: "auto" | "ball_tree" | "kd_tree" | "brute";
  leafSize?: number;
  p?: number; // Power parameter for Minkowski metric
  metric?: string;
  metricParams?: Record<string, any>;
  nJobs?: number;
}

export const KNearestNeighborsRegressorInfo = {
  name: "K-Nearest Neighbors Regressor",
  category: "regression",
  description: "Predicts based on average of K nearest neighbors",
  detailedDescription: `K-Nearest Neighbors Regressor predicts the target value of a new data point by averaging the target values of its K closest neighbors from the training data.

Steps:

1.Training Data: Labeled data with features and continuous target values (stored; no training phase).

2.Choose K: Select the number of neighbors (K). Small K → sensitive to noise, Large K → smoother predictions.

3.New Data Point: Input with unknown target value is given.

4.Distance Calculation: Calculate distance between new point and all training points using Euclidean distance: d = √[Σ(xᵢ - yᵢ)²].

5.Select Neighbors: Choose the K nearest data points based on distance.

6.Average Calculation: Compute average of target values of K neighbors: ŷ = (1/K)Σyᵢ where yᵢ are target values of neighbors.

7.Weighted Average (optional): If using distance weights, ŷ = Σ(wᵢ × yᵢ)/Σwᵢ where wᵢ = 1/dᵢ².

8.Prediction: Output the average (or weighted average) as predicted target value.`,
  complexity: "Low",
  bestFor: "Non-linear relationships, local patterns",
  pros: [
    "No training phase (lazy learning)",
    "Adapts to local patterns",
    "Non-parametric (no assumptions)",
    "Simple to understand",
    "Works well with small datasets",
    "Handles non-linear relationships"
  ],
  cons: [
    "Slow prediction on large datasets",
    "Sensitive to irrelevant features",
    "Requires feature scaling",
    "Memory intensive",
    "Curse of dimensionality",
    "Sensitive to outliers"
  ],
  useCases: [
    "Local pattern recognition",
    "Small to medium datasets",
    "Non-linear regression",
    "When interpretability is important",
    "Real estate price prediction"
  ],
  hyperparameters: {
    nNeighbors: {
      description: "Number of neighbors to consider",
      default: 5,
      range: [1, 50]
    },
    weights: {
      description: "Weight function",
      default: "uniform",
      options: ["uniform", "distance"]
    },
    algorithm: {
      description: "Algorithm to compute nearest neighbors",
      default: "auto",
      options: ["auto", "ball_tree", "kd_tree", "brute"]
    },
    p: {
      description: "Power parameter for Minkowski metric (1=Manhattan, 2=Euclidean)",
      default: 2,
      range: [1, 5]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler or MinMaxScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "None (lazy learning)",
    predictionSpeed: "Slow for large datasets",
    memoryUsage: "High (stores all training data)",
    scalability: "Poor for large datasets"
  }
};

export function trainKNearestNeighborsRegressor(
  XTrain: number[][],
  yTrain: number[],
  config: KNearestNeighborsRegressorConfig
) {
  console.log("Training K-Nearest Neighbors Regressor with config:", config);
  return {
    model: "knn_regressor",
    config,
    trained: true
  };
}
