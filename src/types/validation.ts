// Dataset Validation Types

export type ValidationStatus = "pass" | "warning" | "fail";
export type ValidationSeverity = "blocking" | "warning" | "info";

export interface ValidationCheck {
  id: string;
  name: string;
  category: ValidationCategory;
  status: ValidationStatus;
  severity: ValidationSeverity;
  message: string;
  details?: Record<string, any>;
}

export type ValidationCategory =
  | "file_level"
  | "structure_level"
  | "data_type"
  | "missing_data"
  | "duplicate_data"
  | "target_variable"
  | "class_distribution"
  | "feature_quality"
  | "value_integrity"
  | "data_leakage"
  | "train_test_safety"
  | "dataset_consistency";

export interface ValidationReport {
  id: string;
  datasetId: string;
  status: ValidationStatus;
  blockingIssuesCount: number;
  warningIssuesCount: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  timestamp: string;
  readyForML: boolean;
  healthScore?: number;
  checks: ValidationCheck[];
  summary: {
    fileLevel: ValidationCheck[];
    structureLevel: ValidationCheck[];
    dataType: ValidationCheck[];
    missingData: ValidationCheck[];
    duplicateData: ValidationCheck[];
    targetVariable: ValidationCheck[];
    classDistribution: ValidationCheck[];
    featureQuality: ValidationCheck[];
    valueIntegrity: ValidationCheck[];
    dataLeakage: ValidationCheck[];
    trainTestSafety: ValidationCheck[];
    datasetConsistency: ValidationCheck[];
  };
}

export interface ValidationRequest {
  datasetId: string;
  targetColumn?: string;
  validationLevel?: "basic" | "standard" | "comprehensive";
}

