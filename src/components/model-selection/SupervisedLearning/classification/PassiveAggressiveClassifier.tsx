/**
 * Passive Aggressive Classifier
 * Online learning algorithm that updates model only when misclassified
 */

export interface PassiveAggressiveClassifierConfig {
  C?: number; // Aggressiveness parameter
  fitIntercept?: boolean;
  maxIter?: number;
  tol?: number;
  shuffle?: boolean;
  verbose?: number;
  loss?: "hinge" | "squared_hinge";
  nJobs?: number;
  randomState?: number;
  earlyStopping?: boolean;
  validationFraction?: number;
  nIterNoChange?: number;
  classWeight?: "balanced" | null;
}

export const PassiveAggressiveClassifierInfo = {
  name: "Passive Aggressive Classifier",
  category: "classification",
  description: "Online learning algorithm that updates model only when misclassified",
  detailedDescription: `Passive Aggressive Classifier is an online learning algorithm that updates the model only when a sample is misclassified, making aggressive updates to correct errors while remaining passive on correctly classified samples.

Steps:

1.Training Data: Labeled data with features and class labels (processed one sample at a time).

2.Initialize Weights: Start with initial weight vector w = [w₀, w₁, ..., wₙ] (usually zeros).

3.Process Sample: For each training sample (xᵢ, yᵢ), compute prediction y_pred = sign(w·xᵢ).

4.Loss Calculation: Calculate hinge loss L = max(0, 1 - yᵢ(w·xᵢ)). If L = 0, sample is correctly classified (passive).

5.Update Rule: If misclassified (L > 0), update weights aggressively: w = w + τ × yᵢ × xᵢ where τ = L/(||xᵢ||² + 1/(2C)) and C is aggressiveness parameter.

6.Aggressiveness: Higher C → more aggressive updates, lower C → more conservative updates.

7.Online Learning: Process samples one-by-one, updating model incrementally without storing all data.

8.Prediction: For new point x, compute y_pred = sign(w·x).`,
  complexity: "Low",
  bestFor: "Online learning, streaming data",
  pros: [
    "Excellent for online/streaming data",
    "Very fast training",
    "Memory efficient",
    "Adapts quickly to new patterns",
    "No hyperparameter tuning needed",
    "Works well with large datasets"
  ],
  cons: [
    "Sensitive to noisy data",
    "May not converge on non-separable data",
    "Requires feature scaling",
    "Limited interpretability",
    "No probability estimates"
  ],
  useCases: [
    "Online learning scenarios",
    "Streaming data classification",
    "Real-time prediction systems",
    "Large-scale text classification",
    "When data arrives incrementally"
  ],
  hyperparameters: {
    C: {
      description: "Aggressiveness parameter (larger = more aggressive updates)",
      default: 1.0,
      range: [0.001, 100]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: 1000,
      range: [100, 5000]
    },
    loss: {
      description: "Loss function",
      default: "hinge",
      options: ["hinge", "squared_hinge"]
    },
    tol: {
      description: "Stopping criterion tolerance",
      default: 0.001,
      range: [0.0001, 0.1]
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
    scalability: "Excellent for streaming data"
  }
};

export function trainPassiveAggressiveClassifier(
  XTrain: number[][],
  yTrain: number[],
  config: PassiveAggressiveClassifierConfig
) {
  console.log("Training Passive Aggressive Classifier with config:", config);
  return {
    model: "passive_aggressive_classifier",
    config,
    trained: true
  };
}
