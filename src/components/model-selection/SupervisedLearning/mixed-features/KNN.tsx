/**
 * K-Nearest Neighbors (KNN) - Classification
 * Classifies based on majority vote of K nearest data points (after encoding)
 */

export interface KNNConfig {
  nNeighbors?: number;
  weights?: "uniform" | "distance";
  algorithm?: "auto" | "ball_tree" | "kd_tree" | "brute";
  leafSize?: number;
  p?: number; // Power parameter for Minkowski metric
  metric?: string;
  metricParams?: Record<string, any>;
  nJobs?: number;
}

export const KNNInfo = {
  name: "K-Nearest Neighbors (KNN)",
  category: "classification", // classification only
  description: "Classifies based on majority vote of K nearest data points (after encoding)",
  detailedDescription: `KNN for mixed features classifies based on majority vote of K nearest data points, but requires categorical features to be encoded first since distance calculation needs numerical values.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, class labels.

2.Feature Encoding: Encode categorical features using one-hot encoding, label encoding, or target encoding to convert to numerical format.

3.Choose K: Select the number of neighbors (K). Small K → noise sensitive, Large K → stable.

4.New Data Point: Input with unknown class label is given.

5.Distance Calculation: Calculate Euclidean distance d = √[Σ(xᵢ - yᵢ)²] between new point and all training points (all features now numerical after encoding).

6.Select Neighbors: Choose the K nearest data points based on distance.

7.Majority Vote: Count class labels of K neighbors, assign majority class as prediction.

8.Prediction: Output the majority class from K nearest neighbors.`,
  complexity: "Low",
  bestFor: "Small datasets, non-linear boundaries, after encoding",
  pros: [
    "No training phase (lazy learning)",
    "Adapts to local patterns",
    "Non-parametric (no assumptions)",
    "Simple to understand",
    "Works well with small datasets",
    "Works after encoding categorical features"
  ],
  cons: [
    "Slow prediction on large datasets",
    "Sensitive to irrelevant features",
    "Requires feature scaling",
    "Memory intensive",
    "Curse of dimensionality",
    "Requires encoding categorical features first"
  ],
  useCases: [
    "Image classification",
    "Recommendation systems",
    "Pattern recognition",
    "Anomaly detection",
    "When decision boundaries are irregular",
    "After encoding categorical features"
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
    dataType: "Numerical and categorical (after encoding)",
    scaling: "Required (StandardScaler or MinMaxScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded first"
  },
  performance: {
    trainingSpeed: "None (lazy learning)",
    predictionSpeed: "Slow for large datasets",
    memoryUsage: "High (stores all training data)",
    scalability: "Poor for large datasets"
  }
};

export function trainKNN(
  XTrain: number[][], // After encoding
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
