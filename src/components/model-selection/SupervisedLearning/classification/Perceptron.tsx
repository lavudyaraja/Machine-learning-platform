/**
 * Perceptron Classifier
 * Single layer neural network for binary classification
 */

export interface PerceptronConfig {
  penalty?: "l1" | "l2" | "elasticnet" | null;
  alpha?: number; // Regularization strength
  fitIntercept?: boolean;
  maxIter?: number;
  tol?: number;
  shuffle?: boolean;
  eta0?: number; // Initial learning rate
  nJobs?: number;
  randomState?: number;
  earlyStopping?: boolean;
  validationFraction?: number;
  nIterNoChange?: number;
  classWeight?: "balanced" | null;
}

export const PerceptronInfo = {
  name: "Perceptron",
  category: "classification",
  description: "Single layer neural network for binary classification",
  detailedDescription: `Perceptron is a single-layer neural network algorithm for binary classification that learns a linear decision boundary by updating weights based on misclassified samples.

Steps:

1.Training Data: Labeled data with features and binary class labels (+1, -1).

2.Initialize Weights: Set initial weights w = [w₀, w₁, w₂, ..., wₙ] to small random values or zeros.

3.Linear Combination: For each sample x, compute output z = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.

4.Activation Function: Apply step function: y_pred = +1 if z ≥ 0, else -1.

5.Update Rule: If misclassified (y_pred ≠ y_true), update weights: w = w + η × y_true × x where η is learning rate.

6.Iterate: Repeat steps 3-5 for all samples, continue until convergence or max iterations.

7.Prediction: For new point x, compute z = w·x + w₀. Classify as +1 if z ≥ 0, else -1.`,
  complexity: "Low",
  bestFor: "Linearly separable data, online learning",
  pros: [
    "Very fast training",
    "Simple and interpretable",
    "Works well with linearly separable data",
    "Online learning capability",
    "Memory efficient",
    "No hyperparameter tuning needed"
  ],
  cons: [
    "Only works for linearly separable data",
    "May not converge if data is not separable",
    "Sensitive to feature scaling",
    "Limited to binary classification",
    "No probability estimates"
  ],
  useCases: [
    "Linearly separable binary classification",
    "Online learning scenarios",
    "Baseline model",
    "When speed is critical",
    "Simple pattern recognition"
  ],
  hyperparameters: {
    penalty: {
      description: "Type of regularization",
      default: null,
      options: ["l1", "l2", "elasticnet", null]
    },
    alpha: {
      description: "Regularization strength",
      default: 0.0001,
      range: [0.0001, 1.0]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: 1000,
      range: [100, 5000]
    },
    eta0: {
      description: "Initial learning rate",
      default: 1.0,
      range: [0.01, 10.0]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Very Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Low",
    scalability: "Excellent for large datasets"
  }
};

export function trainPerceptron(
  XTrain: number[][],
  yTrain: number[],
  config: PerceptronConfig
) {
  console.log("Training Perceptron with config:", config);
  return {
    model: "perceptron",
    config,
    trained: true
  };
}
