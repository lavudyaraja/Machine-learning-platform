/**
 * Gradient Boosting Classifier
 * Ensemble method that builds trees sequentially to correct errors
 */

export interface GradientBoostingClassifierConfig {
  loss?: "log_loss" | "exponential";
  learningRate?: number;
  nEstimators?: number;
  subsample?: number;
  criterion?: "friedman_mse" | "squared_error";
  minSamplesSplit?: number;
  minSamplesLeaf?: number;
  minWeightFractionLeaf?: number;
  maxDepth?: number;
  minImpurityDecrease?: number;
  init?: any;
  randomState?: number;
  maxFeatures?: "sqrt" | "log2" | number | null;
  verbose?: number;
  maxLeafNodes?: number | null;
  warmStart?: boolean;
  validationFraction?: number;
  nIterNoChange?: number;
  tol?: number;
  ccpAlpha?: number;
}

export const GradientBoostingClassifierInfo = {
  name: "Gradient Boosting Classifier",
  category: "classification",
  description: "Ensemble method that builds trees sequentially to correct errors",
  detailedDescription: `Gradient Boosting is an ensemble method that builds decision trees sequentially, where each new tree is trained to correct the errors (residuals) of the previous trees.

Steps:

1.Training Data: Labeled data with features and class labels.

2.Initial Prediction: Start with initial prediction F₀(x) = log(odds) for binary classification.

3.Calculate Residuals: For each sample, compute negative gradient (pseudo-residual) rᵢ = yᵢ - P(y=1|xᵢ) where P is probability from current model.

4.Build Tree: Train decision tree hₘ(x) to fit the residuals from previous iteration.

5.Find Optimal Leaf Values: For each leaf, calculate optimal value that minimizes loss function.

6.Update Model: Add new tree to ensemble: Fₘ(x) = Fₘ₋₁(x) + α × hₘ(x) where α is learning rate (shrinkage).

7.Iterate: Repeat steps 3-6 for M trees (n_estimators).

8.Prediction: Final prediction F(x) = F₀(x) + αΣhₘ(x). Apply sigmoid to get probability P(y=1|x) = 1/(1 + e^(-F(x))).`,
  complexity: "High",
  bestFor: "High accuracy, structured data",
  pros: [
    "Very high accuracy",
    "Handles non-linear relationships",
    "Feature importance available",
    "Reduces bias effectively",
    "Works well with structured data",
    "Can handle missing values"
  ],
  cons: [
    "Slow training (sequential)",
    "Memory intensive",
    "Requires careful hyperparameter tuning",
    "Prone to overfitting",
    "Not parallelizable",
    "Sensitive to outliers"
  ],
  useCases: [
    "High accuracy requirements",
    "Structured/tabular data",
    "When XGBoost is not available",
    "Credit scoring",
    "Click prediction"
  ],
  hyperparameters: {
    nEstimators: {
      description: "Number of boosting stages",
      default: 100,
      range: [50, 1000]
    },
    learningRate: {
      description: "Step size shrinkage",
      default: 0.1,
      range: [0.01, 0.3]
    },
    maxDepth: {
      description: "Maximum depth of trees",
      default: 3,
      range: [3, 10]
    },
    subsample: {
      description: "Fraction of samples for each tree",
      default: 1.0,
      range: [0.5, 1.0]
    }
  },
  requirements: {
    dataType: "Numerical and categorical",
    scaling: "Not required",
    missingValues: "Can handle",
    categorical: "Should be encoded"
  },
  performance: {
    trainingSpeed: "Slow (sequential)",
    predictionSpeed: "Fast",
    memoryUsage: "High",
    scalability: "Good for medium datasets"
  }
};

export function trainGradientBoostingClassifier(
  XTrain: number[][],
  yTrain: number[],
  config: GradientBoostingClassifierConfig
) {
  console.log("Training Gradient Boosting Classifier with config:", config);
  return {
    model: "gradient_boosting_classifier",
    config,
    trained: true
  };
}
