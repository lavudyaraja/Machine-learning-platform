// Job/training types

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  algorithm: string;
  dataset: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

export interface TrainingConfig {
  algorithm: string;
  dataset: string;
  parameters: Record<string, unknown>;
  preprocessing?: PreprocessingConfig;
}

export interface PreprocessingConfig {
  normalization?: string;
  missingValues?: string;
  trainTestSplit?: number;
}

