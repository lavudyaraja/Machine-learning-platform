/**
 * Stochastic Gradient Descent Regressor
 * Linear regression using stochastic gradient descent optimization
 */

export interface SGDRegressorConfig {
  loss?: "squared_error" | "huber" | "epsilon_insensitive" | "squared_epsilon_insensitive";
  penalty?: "l1" | "l2" | "elasticnet" | null;
  alpha?: number; // Regularization strength
  l1Ratio?: number; // For elasticnet
  fitIntercept?: boolean;
  maxIter?: number;
  tol?: number;
  shuffle?: boolean;
  verbose?: number;
  epsilon?: number; // For epsilon-insensitive loss
  learningRate?: "constant" | "optimal" | "invscaling" | "adaptive";
  eta0?: number; // Initial learning rate
  powerT?: number; // For invscaling
  earlyStopping?: boolean;
  validationFraction?: number;
  nIterNoChange?: number;
  warmStart?: boolean;
  average?: boolean | number;
}

export const SGDRegressorInfo = {
  name: "Stochastic Gradient Descent Regressor",
  category: "regression",
  description: "Linear regression using stochastic gradient descent optimization",
  detailedDescription: `Stochastic Gradient Descent Regressor performs linear regression using stochastic gradient descent, updating weights incrementally on small batches of data for efficient training on large datasets.

Steps:

1.Training Data: Labeled data with features and continuous target values.

2.Initialize Weights: Set initial weights w = [w₀, w₁, w₂, ..., wₙ] to small random values or zeros.

3.Linear Model: Assume relationship y = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.

4.Random Batch: Randomly select small batch (typically 1-32 samples) from training data.

5.Gradient Calculation: Calculate gradient of loss function (MSE) for batch: ∇L = -2Σ(yᵢ - ŷᵢ)xᵢ.

6.Update Weights: Update weights using gradient: w = w - η × ∇L where η is learning rate.

7.Learning Rate Schedule: Adjust learning rate over time (constant, invscaling, adaptive) for convergence.

8.Iterate: Repeat steps 4-7 for multiple epochs until convergence or max iterations.

9.Prediction: For new point x, predict ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ.`,
  complexity: "Low",
  bestFor: "Large datasets, online learning",
  pros: [
    "Efficient for large datasets",
    "Supports online learning",
    "Memory efficient",
    "Supports various loss functions",
    "Fast training",
    "Supports regularization"
  ],
  cons: [
    "Requires feature scaling",
    "Sensitive to hyperparameters",
    "May need many iterations",
    "Less stable than batch methods",
    "Requires learning rate tuning"
  ],
  useCases: [
    "Large-scale regression",
    "Online learning scenarios",
    "Streaming data",
    "When memory is limited",
    "Real-time prediction systems"
  ],
  hyperparameters: {
    loss: {
      description: "Loss function to use",
      default: "squared_error",
      options: ["squared_error", "huber", "epsilon_insensitive", "squared_epsilon_insensitive"]
    },
    penalty: {
      description: "Type of regularization",
      default: "l2",
      options: ["l1", "l2", "elasticnet", null]
    },
    alpha: {
      description: "Regularization strength",
      default: 0.0001,
      range: [0.0001, 1.0]
    },
    learningRate: {
      description: "Learning rate schedule",
      default: "invscaling",
      options: ["constant", "optimal", "invscaling", "adaptive"]
    },
    eta0: {
      description: "Initial learning rate",
      default: 0.01,
      range: [0.001, 1.0]
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
    memoryUsage: "Very Low",
    scalability: "Excellent for large datasets"
  }
};

export function trainSGDRegressor(
  XTrain: number[][],
  yTrain: number[],
  config: SGDRegressorConfig
) {
  console.log("Training SGD Regressor with config:", config);
  return {
    model: "sgd_regressor",
    config,
    trained: true
  };
}
