/**
 * Support Vector Machine (SVM - RBF) Classifier
 * Uses Radial Basis Function kernel for non-linear classification
 */

export interface SVMRBFConfig {
  C?: number; // Regularization parameter
  gamma?: number | "scale" | "auto"; // Kernel coefficient
  kernel?: "rbf" | "poly" | "sigmoid";
  degree?: number; // For polynomial kernel
  coef0?: number; // For polynomial and sigmoid kernels
  tol?: number;
  maxIter?: number;
  shrinking?: boolean;
  probability?: boolean;
  cacheSize?: number;
  classWeight?: "balanced" | null;
  decisionFunctionShape?: "ovr" | "ovo";
}

export const SVMRBFInfo = {
  name: "Support Vector Machine (SVM - RBF)",
  category: "classification",
  description: "Uses Radial Basis Function kernel for non-linear classification",
  detailedDescription: `SVM with RBF (Radial Basis Function) kernel extends linear SVM to handle non-linear classification by mapping data to higher-dimensional space using kernel trick.

Steps:

1.Training Data: Labeled data with features and class labels.

2.Kernel Function: Use RBF kernel K(xᵢ, xⱼ) = exp(-γ||xᵢ - xⱼ||²) where γ controls influence of each sample.

3.Feature Space: RBF kernel implicitly maps data to infinite-dimensional space without explicit transformation.

4.Hyperplane: Find optimal hyperplane in high-dimensional feature space that maximizes margin.

5.Support Vectors: Identify support vectors (data points on margin) that define decision boundary.

6.Regularization (C): Control trade-off between margin maximization and misclassification tolerance.

7.Prediction: For new point x, compute f(x) = ΣαᵢyᵢK(xᵢ, x) + b. Classify based on sign of f(x).`,
  complexity: "High",
  bestFor: "Non-linear boundaries, complex patterns",
  pros: [
    "Handles non-linear decision boundaries",
    "Effective for complex patterns",
    "Memory efficient (uses support vectors)",
    "Works well with clear margin of separation",
    "Can handle high-dimensional data"
  ],
  cons: [
    "Slow training on large datasets",
    "Requires careful hyperparameter tuning",
    "Sensitive to feature scaling",
    "Difficult to interpret",
    "Memory intensive for large datasets"
  ],
  useCases: [
    "Non-linear classification problems",
    "Image classification",
    "Text classification",
    "Bioinformatics",
    "When data is not linearly separable"
  ],
  hyperparameters: {
    C: {
      description: "Regularization parameter (larger = less regularization)",
      default: 1.0,
      range: [0.001, 1000]
    },
    gamma: {
      description: "Kernel coefficient (larger = more complex boundaries)",
      default: "scale",
      options: ["scale", "auto", "number"]
    },
    kernel: {
      description: "Kernel type",
      default: "rbf",
      options: ["rbf", "poly", "sigmoid"]
    },
    maxIter: {
      description: "Maximum number of iterations",
      default: -1,
      range: [100, 10000]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (StandardScaler)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Slow for large datasets",
    predictionSpeed: "Medium",
    memoryUsage: "Medium to High",
    scalability: "Poor for very large datasets"
  }
};

export function trainSVMRBF(
  XTrain: number[][],
  yTrain: number[],
  config: SVMRBFConfig
) {
  console.log("Training SVM RBF with config:", config);
  return {
    model: "svm_rbf",
    config,
    trained: true
  };
}
