/**
 * Decision Tree Classifier
 * Non-parametric supervised learning method using tree structure
 */

export interface DecisionTreeClassifierConfig {
  criterion?: "gini" | "entropy" | "log_loss";
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

export const DecisionTreeClassifierInfo = {
  name: "Decision Tree Classifier",
  category: "classification",
  description: "Non-parametric supervised learning method using tree structure",
  detailedDescription: `Decision Tree is a non-parametric algorithm that splits data into branches based on feature values to create a tree structure for classification.

Steps:

1.Training Data: Labeled data with features and class labels.

2.Root Node: Start with all training data at root node.

3.Split Selection: Find best feature and threshold that maximizes information gain (Gini impurity or Entropy). Gini: G = 1 - Σpᵢ², Entropy: H = -Σpᵢlog₂(pᵢ).

4.Create Branches: Split data into left and right child nodes based on threshold.

5.Recursive Splitting: Repeat steps 3-4 for each child node until stopping criteria met (max depth, min samples, pure node).

6.Leaf Nodes: Assign class label to leaf nodes (majority class or pure class).

7.Prediction: Traverse tree from root to leaf following feature conditions, output leaf's class label.`,
  complexity: "Low to Medium",
  bestFor: "Interpretability, non-linear boundaries",
  pros: [
    "Highly interpretable (visualizable)",
    "No feature scaling needed",
    "Handles non-linear relationships",
    "Can handle mixed data types",
    "Feature importance available",
    "Fast training and prediction"
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
    "Non-linear classification",
    "Medical diagnosis",
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
      options: ["gini", "entropy", "log_loss"]
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

export function trainDecisionTreeClassifier(
  XTrain: number[][],
  yTrain: number[],
  config: DecisionTreeClassifierConfig
) {
  console.log("Training Decision Tree Classifier with config:", config);
  return {
    model: "decision_tree_classifier",
    config,
    trained: true
  };
}
