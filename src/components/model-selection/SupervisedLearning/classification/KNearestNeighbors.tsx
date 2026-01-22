/**
 * K-Nearest Neighbors (KNN) Classifier
 * Classifies based on majority vote of K nearest data points
 */

export interface KNNConfig {
  nNeighbors?: number;
  weights?: "uniform" | "distance";
  algorithm?: "auto" | "ball_tree" | "kd_tree" | "brute";
  leafSize?: number;
  p?: number; // Power parameter for Minkowski metric
  metric?: string;
}

export const KNNInfo = {
  name: "K-Nearest Neighbors (KNN)",
  category: "classification",
  description: "Classifies based on majority vote of K nearest data points",
  detailedDescription: `KNN (K-Nearest Neighbors) is a supervised machine learning algorithm used for classification and regression that predicts the output of a new data point by analyzing the K closest data points from the training dataset using distance.

Steps:

1.Training Data: Labeled data is stored; no training phase in KNN.

2.Choose K: Select the number of neighbors (K). Small K → noise sensitive, Large K → stable.

3.New Data Point: Input with unknown output is given.

4.Distance Calculation: Distance between the new point and all training points is calculated (commonly Euclidean distance). Formula: d = √[Σ(xᵢ - yᵢ)²] where xᵢ and yᵢ are feature values of two points.

5.Select Neighbors: Choose the K nearest data points.

6.Prediction: Classification: majority class. Regression: average value.`,
  complexity: "Low",
  bestFor: "Small datasets, non-linear boundaries",
  pros: [
    "No training phase (lazy learning)",
    "Adapts to local patterns",
    "Non-parametric (no assumptions)",
    "Simple to understand",
    "Works well with small datasets"
  ],
  cons: [
    "Slow prediction on large datasets",
    "Sensitive to irrelevant features",
    "Requires feature scaling",
    "Memory intensive",
    "Curse of dimensionality"
  ],
  useCases: [
    "Image classification",
    "Recommendation systems",
    "Pattern recognition",
    "Anomaly detection",
    "When decision boundaries are irregular"
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

export function trainKNN(
  XTrain: number[][],
  yTrain: number[],
  config: KNNConfig
) {
  console.log("Training KNN with config:", config);
  return {
    model: "knn",
    config,
    trained: true
  };
}

