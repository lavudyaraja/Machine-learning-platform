/**
 * Quadratic Discriminant Analysis (QDA) Classifier
 * Similar to LDA but allows different covariance matrices per class
 */

export interface QuadraticDiscriminantAnalysisConfig {
  priors?: number[] | null;
  regParam?: number; // Regularization parameter
  storeCovariance?: boolean;
  tol?: number;
}

export const QuadraticDiscriminantAnalysisInfo = {
  name: "Quadratic Discriminant Analysis (QDA)",
  category: "classification",
  description: "Similar to LDA but allows different covariance matrices per class",
  detailedDescription: `Quadratic Discriminant Analysis (QDA) is similar to LDA but allows each class to have its own covariance matrix, resulting in quadratic decision boundaries instead of linear.

Steps:

1.Training Data: Labeled data with features and class labels.

2.Class Means: Calculate mean vector μₖ for each class k.

3.Class Covariances: Calculate separate covariance matrix Σₖ for each class k: Σₖ = (1/(nₖ-1))Σᵢ(xᵢ - μₖ)(xᵢ - μₖ)ᵀ.

4.Prior Probabilities: Calculate prior P(Cₖ) = nₖ/N for each class.

5.Quadratic Discriminant Function: For each class, compute Qₖ(x) = -½log|Σₖ| - ½(x - μₖ)ᵀΣₖ⁻¹(x - μₖ) + log P(Cₖ).

6.Prediction: For new point x, calculate Qₖ(x) for all classes. Assign to class with highest Qₖ(x) value.

7.Decision Boundary: Result is quadratic (curved) boundary, more flexible than LDA's linear boundary.`,
  complexity: "Medium",
  bestFor: "Non-linear boundaries, different class distributions",
  pros: [
    "Can model non-linear decision boundaries",
    "More flexible than LDA",
    "Provides probability estimates",
    "Fast prediction",
    "Works well when classes have different covariances"
  ],
  cons: [
    "Assumes Gaussian distribution",
    "Requires more data than LDA",
    "Sensitive to outliers",
    "Higher computational cost than LDA",
    "May overfit with small datasets"
  ],
  useCases: [
    "When classes have different covariance structures",
    "Non-linear classification problems",
    "Medical diagnosis",
    "Pattern recognition",
    "When LDA assumptions are violated"
  ],
  hyperparameters: {
    regParam: {
      description: "Regularization parameter for covariance estimation",
      default: 0.0,
      range: [0.0, 1.0]
    },
    priors: {
      description: "Prior probabilities of classes",
      default: null,
      options: ["array", null]
    },
    tol: {
      description: "Absolute threshold for singular values",
      default: 0.0001,
      range: [0.0001, 0.01]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Medium",
    predictionSpeed: "Fast",
    memoryUsage: "Medium",
    scalability: "Good for medium datasets"
  }
};

export function trainQuadraticDiscriminantAnalysis(
  XTrain: number[][],
  yTrain: number[],
  config: QuadraticDiscriminantAnalysisConfig
) {
  console.log("Training Quadratic Discriminant Analysis with config:", config);
  return {
    model: "quadratic_discriminant_analysis",
    config,
    trained: true
  };
}
