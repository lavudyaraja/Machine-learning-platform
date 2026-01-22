/**
 * Logistic Regression Classifier
 * Linear model for binary/multiclass classification using sigmoid/softmax function
 */

export interface LogisticRegressionConfig {
  penalty?: "l1" | "l2" | "elasticnet" | "none";
  C?: number; // Inverse of regularization strength
  solver?: "newton-cg" | "lbfgs" | "liblinear" | "sag" | "saga";
  maxIter?: number;
  multiClass?: "auto" | "ovr" | "multinomial";
  tol?: number;
  fitIntercept?: boolean;
  class_weight?: "balanced" | null;
}

export const LogisticRegressionInfo = {
  name: "Logistic Regression",
  category: "classification",
  description: "Linear model for binary/multiclass classification using sigmoid/softmax function",
  detailedDescription: `Logistic Regression is a supervised learning algorithm that uses the sigmoid function to model the probability of a binary outcome. It extends to multiclass using softmax function.

Steps:

1.Training Data: Labeled data with features (X) and binary/multiclass labels (y).

2.Linear Combination: Calculate weighted sum z = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ where w are weights and x are features.

3.Sigmoid Function (Binary): Apply sigmoid σ(z) = 1/(1 + e⁻ᶻ) to get probability between 0 and 1.

4.Softmax Function (Multiclass): Apply softmax P(y=k) = eᶻᵏ/Σeᶻʲ for each class k to get probabilities.

5.Threshold (Binary): Classify as class 1 if P(y=1) > 0.5, else class 0.

6.Prediction: Output class with highest probability (multiclass) or based on threshold (binary).`,
  complexity: "Low",
  bestFor: "Linear relationships, baseline model",
  pros: [
    "Fast training and prediction",
    "Highly interpretable coefficients",
    "Provides probability estimates",
    "Works well with high-dimensional data",
    "No hyperparameter tuning needed for basics"
  ],
  cons: [
    "Assumes linear decision boundaries",
    "May underfit complex data",
    "Sensitive to feature scaling",
    "Struggles with non-linear relationships"
  ],
  useCases: [
    "Binary classification (yes/no, spam/not spam)",
    "Multi-class classification",
    "When interpretability is important",
    "As a baseline model",
    "Credit scoring, disease diagnosis"
  ],
  hyperparameters: {
    penalty: {
      description: "Type of regularization",
      default: "l2",
      options: ["l1", "l2", "elasticnet", "none"]
    },
    C: {
      description: "Inverse of regularization strength (smaller = stronger regularization)",
      default: 1.0,
      range: [0.001, 100]
    },
    solver: {
      description: "Algorithm for optimization",
      default: "lbfgs",
      options: ["newton-cg", "lbfgs", "liblinear", "sag", "saga"]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: 100,
      range: [50, 1000]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler or MinMaxScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Low",
    scalability: "Excellent for large datasets"
  }
};

export function trainLogisticRegression(
  XTrain: number[][],
  yTrain: number[],
  config: LogisticRegressionConfig
) {
  // Implementation placeholder for training
  console.log("Training Logistic Regression with config:", config);
  return {
    model: "logistic_regression",
    config,
    trained: true
  };
}

