/**
 * Naive Bayes (Classification)
 * Probabilistic classifier based on Bayes' theorem (after encoding)
 */

export interface NaiveBayesConfig {
  priors?: number[] | null;
  varSmoothing?: number; // Portion of largest variance to add (for Gaussian)
  alpha?: number; // Smoothing parameter (for Multinomial/Bernoulli)
  fitPrior?: boolean; // For Multinomial/Bernoulli
  classPrior?: number[] | null; // For Multinomial/Bernoulli
}

export const NaiveBayesInfo = {
  name: "Naive Bayes",
  category: "classification", // classification only
  description: "Probabilistic classifier based on Bayes' theorem (after encoding)",
  detailedDescription: `Naive Bayes for mixed features is a probabilistic classifier based on Bayes' theorem that requires categorical features to be encoded, then uses appropriate distributions for numerical and encoded categorical features.

Steps:

1.Training Data: Labeled data with both numerical and categorical features, class labels.

2.Feature Encoding: Encode categorical features using one-hot encoding or label encoding to convert to numerical format.

3.Prior Probability: Calculate P(C) = count(C)/total_samples for each class C.

4.Feature Statistics: For numerical features: calculate mean μ and variance σ² (Gaussian). For encoded categorical: calculate probabilities P(xᵢ|C) (Multinomial/Bernoulli).

5.Gaussian Probability: For numerical feature xᵢ in class C: P(xᵢ|C) = (1/√(2πσ²))e^(-(xᵢ-μ)²/(2σ²)).

6.Multinomial Probability: For encoded categorical features: P(xᵢ|C) = count(xᵢ in C)/count(C).

7.Naive Assumption: Assume features are independent: P(x₁,x₂,...,xₙ|C) = P(x₁|C) × P(x₂|C) × ... × P(xₙ|C).

8.Bayes' Theorem: Calculate posterior P(C|x) = (P(x|C) × P(C)) / P(x) for each class.

9.Prediction: Select class with highest posterior probability: argmax P(C|x).`,
  complexity: "Low",
  bestFor: "Text classification, baseline model, after encoding categorical",
  pros: [
    "Very fast training and prediction",
    "Works well with small datasets",
    "Handles multiple classes naturally",
    "Provides probability estimates",
    "Not sensitive to irrelevant features",
    "No hyperparameter tuning needed",
    "Works after encoding categorical features"
  ],
  cons: [
    "Assumes feature independence (naive assumption)",
    "Assumes Gaussian distribution (for Gaussian NB)",
    "May perform poorly if assumptions violated",
    "Less accurate than complex models",
    "Sensitive to feature scaling",
    "Requires encoding categorical features first"
  ],
  useCases: [
    "Text classification (spam detection)",
    "Document classification",
    "Baseline model",
    "Real-time prediction",
    "When speed is critical",
    "After encoding categorical features"
  ],
  hyperparameters: {
    varSmoothing: {
      description: "Portion of largest variance to add for stability (Gaussian NB)",
      default: 1e-9,
      range: [1e-10, 1e-6]
    },
    alpha: {
      description: "Smoothing parameter (Multinomial/Bernoulli NB)",
      default: 1.0,
      range: [0.1, 10.0]
    },
    priors: {
      description: "Prior probabilities of classes",
      default: null,
      options: ["array", null]
    }
  },
  requirements: {
    dataType: "Numerical and categorical (after encoding)",
    scaling: "Recommended (StandardScaler for Gaussian NB)",
    missingValues: "Not allowed",
    categorical: "Must be encoded first"
  },
  performance: {
    trainingSpeed: "Very Fast",
    predictionSpeed: "Very Fast",
    memoryUsage: "Low",
    scalability: "Excellent for large datasets"
  }
};

export function trainNaiveBayes(
  XTrain: number[][], // After encoding
  yTrain: number[],
  config: NaiveBayesConfig
) {
  console.log("Training Naive Bayes with config:", config);
  return {
    model: "naive_bayes",
    config,
    trained: true
  };
}
