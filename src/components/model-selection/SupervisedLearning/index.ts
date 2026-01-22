/**
 * Supervised Learning Models Index
 * Central export point for all supervised learning models
 */

// Classification Models
export * from "./classification/LogisticRegression";
export * from "./classification/KNearestNeighbors";
export * from "./classification/SVM_Linear";
export * from "./classification/RandomForestClassifier";
export * from "./classification/XGBoostClassifier";

// Regression Models
export * from "./regression/LinearRegression";
export * from "./regression/RidgeRegression";
export * from "./regression/RandomForestRegressor";

// Mixed Features (Numerical + Categorical)
export * from "./mixed-features/CatBoost";
export * from "./mixed-features/LightGBM";

// Model Categories
export const MODEL_CATEGORIES = {
  CLASSIFICATION: "classification",
  REGRESSION: "regression",
  BOTH: "both",
} as const;

// Feature Type Requirements
export const FEATURE_TYPES = {
  NUMERICAL_ONLY: "numerical_only",
  CATEGORICAL_SUPPORTED: "categorical_supported",
  CATEGORICAL_NATIVE: "categorical_native",
} as const;

// Complexity Levels
export const COMPLEXITY_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const;

// Model Selection Guide
export const MODEL_SELECTION_GUIDE = {
  classification: {
    numerical: {
      simple: ["LogisticRegression", "KNearestNeighbors"],
      advanced: ["RandomForestClassifier", "XGBoostClassifier", "LightGBM"],
      linear: ["LogisticRegression", "SVM_Linear"],
      nonLinear: ["KNearestNeighbors", "RandomForestClassifier", "XGBoostClassifier"],
    },
    categorical: {
      nativeSupport: ["CatBoost", "LightGBM"],
      afterEncoding: ["RandomForestClassifier", "XGBoostClassifier"],
    },
  },
  regression: {
    numerical: {
      simple: ["LinearRegression", "RidgeRegression"],
      advanced: ["RandomForestRegressor", "XGBoostRegressor", "LightGBM"],
      linear: ["LinearRegression", "RidgeRegression", "LassoRegression"],
      nonLinear: ["RandomForestRegressor", "XGBoostRegressor"],
    },
    categorical: {
      nativeSupport: ["CatBoost", "LightGBM"],
      afterEncoding: ["RandomForestRegressor", "XGBoostRegressor"],
    },
  },
};

