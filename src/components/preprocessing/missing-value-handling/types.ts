export interface MissingValueConfig {
  method: "drop_rows" | "drop_columns" | "mean" | "median" | "mode" | "constant" | "std" | "variance" | "q1" | "q2" | "q3" | string[];
  columns?: string[];
  constantValue?: string | number;
  threshold?: number;
  selectedMethods?: string[];
}

export interface MissingValueHandlerProps {
  datasetId?: string;
  columns?: string[];
  onConfigChange?: (config: MissingValueConfig) => void;
  initialConfig?: MissingValueConfig;
  validationResults?: {
    missingDataChecks?: Array<{
      column?: string;
      missingCount?: number;
      missingPercentage?: number;
      rows?: number[];
    }>;
    columnsWithMissingValues?: string[];
  };
  onProcessedDatasetReady?: (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => void;
  onNext?: () => void;
  onPrev?: () => void;
  showNavigation?: boolean;
}

export interface ExecutionResult {
  methods: string[];
  columns: string[];
  executed: boolean;
  executedAt?: string;
  droppedRows?: number;
  droppedColumns?: number;
  constantValueUsed?: string | number;
  rowsWithMissingValues?: Array<{ rowNumber: number; rowId?: string | number }>;
  columnsWithMissingValues?: string[];
  columnMissingDetails?: Record<string, Array<{ rowNumber: number; rowId?: string | number }>>;
  hasIdColumn?: boolean;
  idColumnName?: string;
}

export interface MethodOption {
  value: string;
  label: string;
  icon: string;
}

export interface MissingValueInfo {
  count: number;
  percentage: number;
}

