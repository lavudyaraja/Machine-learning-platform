/**
 * Model Selection Types
 * Shared type definitions for model selection components
 */

export type LearningParadigm = "supervised" | "unsupervised" | "reinforcement";
export type TaskType = "classification" | "regression" | "clustering" | "association_rules" | "reinforcement";
export type FeatureType = "numerical" | "categorical_mixed";
export type ComplexityLevel = "Low" | "Medium" | "High";

export interface Model {
  id: string;
  name: string;
  category: TaskType;
  paradigm: LearningParadigm;
  featureType: FeatureType;
  complexity: ComplexityLevel;
  description: string;
  icon: string;
  color: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  useCases: string[];
}

export interface ModelConfig {
  targetType?: TaskType;
  featureType?: FeatureType;
  selectedModels: string[];
  targetColumn?: string;
}

export interface ModelTrainingResult {
  modelId: string;
  modelName: string;
  status: "training" | "completed" | "failed";
  accuracy?: number;
  trainingTime?: number;
  error?: string;
}

