// Metrics types

export interface Metrics {
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  confusionMatrix?: number[][];
}

export interface EpochMetrics {
  epoch: number;
  trainLoss: number;
  trainAccuracy: number;
  valLoss: number;
  valAccuracy: number;
}

