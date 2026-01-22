/**
 * Decision Tree (Classification & Regression)
 * Non-parametric supervised learning method using tree structure
 */

export interface DecisionTreeConfig {
  criterion?: "gini" | "entropy" | "log_loss" | "squared_error" | "friedman_mse" | "absolute_error" | "poisson";
  splitter?: "best" | "random";
  maxDepth?: number | null;
  minSamplesSplit?: number;
  minSamplesLeaf?: number;
  minWeightFractionLeaf?: number;
  maxFeatures?: "sqrt" | "log2" | number | null;
  randomState?: number;
  maxLeafNodes?: number | null;
  minImpurityDecrease?: number;
  classWeight?: "balanced" | null;
  ccpAlpha?: number; // Complexity parameter for pruning
}

export const DecisionTreeInfo = {
  name: "Decision Tree",
  category: "both", // classification and regression
  description: "Non-parametric supervised learning method using tree structure",
  detailedDescription: `Decision Tree can handle both numerical and categorical features natively, making it ideal for mixed data types without requiring encoding for categorical features.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, target values (classification or regression).

2.Root Node: Start with all training data at root node.

3.Split Selection: For numerical features: find threshold. For categorical features: find subset of categories. Use Gini/Entropy (classification) or MSE (regression).

4.Gini Impurity: G = 1 - Σpᵢ² where pᵢ is proportion of class i. Entropy: H = -Σpᵢlog₂(pᵢ).

5.Create Branches: Split data into child nodes based on feature type: numerical threshold or categorical subset.

6.Recursive Splitting: Repeat steps 3-5 for each child node until stopping criteria met (max depth, min samples, pure node).

7.Leaf Nodes: Assign class label (classification) or mean target (regression) to leaf nodes.

8.Prediction: Traverse tree from root to leaf following feature conditions, output leaf's value.`,
  complexity: "Low to Medium",
  bestFor: "Interpretability, non-linear boundaries, mixed features",
  pros: [
    "Highly interpretable (visualizable)",
    "No feature scaling needed",
    "Handles non-linear relationships",
    "Can handle mixed data types",
    "Feature importance available",
    "Fast training and prediction",
    "Works with numerical and categorical"
  ],
  cons: [
    "Prone to overfitting",
    "Unstable (small data changes = different tree)",
    "Biased toward features with more levels",
    "May create overly complex trees",
    "Poor generalization if not pruned"
  ],
  useCases: [
    "When interpretability is important",
    "Feature selection",
    "Non-linear classification/regression",
    "Datasets with mixed feature types",
    "Business rule extraction"
  ],
  hyperparameters: {
    maxDepth: {
      description: "Maximum depth of tree (null = unlimited)",
      default: null,
      range: [3, 50]
    },
    minSamplesSplit: {
      description: "Minimum samples required to split node",
      default: 2,
      range: [2, 20]
    },
    minSamplesLeaf: {
      description: "Minimum samples required in leaf node",
      default: 1,
      range: [1, 10]
    },
    criterion: {
      description: "Function to measure split quality",
      default: "gini",
      options: ["gini", "entropy", "log_loss", "squared_error", "friedman_mse", "absolute_error", "poisson"]
    },
    ccpAlpha: {
      description: "Complexity parameter for pruning",
      default: 0.0,
      range: [0.0, 1.0]
    }
  },
  requirements: {
    dataType: "Numerical and categorical",
    scaling: "Not required",
    missingValues: "Can handle some",
    categorical: "Can handle natively or encoded"
  },
  performance: {
    trainingSpeed: "Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Low",
    scalability: "Good for medium datasets"
  }
};

export function trainDecisionTree(
  XTrain: (number | string)[][],
  yTrain: number[],
  config: DecisionTreeConfig,
  taskType: "classification" | "regression" = "classification"
) {
  console.log(`Training Decision Tree ${taskType} with config:`, config);
  return {
    model: "decision_tree",
    taskType,
    config,
    trained: true
  };
}
