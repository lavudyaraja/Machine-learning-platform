/**
 * Support Vector Machine (SVM - Linear) Classifier
 * Finds optimal linear hyperplane that maximizes margin between classes
 */

export interface SVMLinearConfig {
  C?: number; // Regularization parameter
  penalty?: "l1" | "l2";
  loss?: "hinge" | "squared_hinge";
  dual?: boolean;
  tol?: number;
  maxIter?: number;
  multiClass?: "ovr" | "crammer_singer";
  fitIntercept?: boolean;
  class_weight?: "balanced" | null;
}

export const SVMLinearInfo = {
  name: "Support Vector Machine (SVM - Linear)",
  category: "classification",
  description: "Finds optimal linear hyperplane that maximizes margin between classes",
  detailedDescription: `Support Vector Machine (SVM) is a supervised learning algorithm that finds the optimal linear hyperplane that maximizes the margin (distance) between classes.

Steps:

1.Training Data: Labeled data with features and binary class labels (+1, -1).

2.Hyperplane: Find linear decision boundary w·x + b = 0 that separates classes, where w is weight vector and b is bias.

3.Margin Maximization: Maximize margin = 2/||w|| between support vectors (closest points to hyperplane).

4.Optimization: Solve quadratic programming problem: minimize ½||w||² subject to yᵢ(w·xᵢ + b) ≥ 1 for all points.

5.Support Vectors: Identify data points on margin boundaries (these define the hyperplane).

6.Soft Margin (C parameter): Allow some misclassification for non-separable data using slack variables ξ.

7.Prediction: For new point x, compute f(x) = sign(w·x + b). If f(x) > 0, class +1; else class -1.`,
  complexity: "Medium",
  bestFor: "High-dimensional data, clear linear margins",
  pros: [
    "Effective in high dimensions",
    "Memory efficient (uses support vectors)",
    "Works well with clear margin of separation",
    "Robust to overfitting in high dimensions",
    "Fast training with linear kernel"
  ],
  cons: [
    "Slow on very large datasets",
    "Difficult to interpret",
    "Requires feature scaling",
    "Sensitive to noise",
    "Not suitable for non-linear problems"
  ],
  useCases: [
    "Text classification",
    "Image classification",
    "Bioinformatics",
    "High-dimensional data",
    "When data is linearly separable"
  ],
  hyperparameters: {
    C: {
      description: "Regularization parameter (smaller = more regularization)",
      default: 1.0,
      range: [0.001, 1000]
    },
    penalty: {
      description: "Type of penalty",
      default: "l2",
      options: ["l1", "l2"]
    },
    loss: {
      description: "Loss function",
      default: "squared_hinge",
      options: ["hinge", "squared_hinge"]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: 1000,
      range: [100, 5000]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Fast for linear kernel",
    predictionSpeed: "Fast",
    memoryUsage: "Low (sparse support vectors)",
    scalability: "Good for high dimensions"
  }
};

export function trainSVMLinear(
  XTrain: number[][],
  yTrain: number[],
  config: SVMLinearConfig
) {
  console.log("Training SVM Linear with config:", config);
  return {
    model: "svm_linear",
    config,
    trained: true
  };
}

