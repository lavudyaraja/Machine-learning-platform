"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Play, Database, ChevronRight, CheckCircle2, ArrowRight, Settings, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import SelectMethods from "./mainui/SelectMethods";
import SelectColumns from "./mainui/SelectColumns";
import Configure from "./mainui/Configure";
import Result from "./mainui/Result";
import { toast } from "sonner";

// Types
export interface DataCleaningConfig {
  selectedMethods?: string[];
  methodType?: string;
  columns?: string[];
  strategy?: string | string[];
  categoricalStrategy?: string | string[];
  scalingMethod?: string | string[];
  normalizationMethod?: string | string[];
  logTransformMethod?: string | string[];
  outlierMethod?: string | string[];
  skewnessMethod?: string | string[];
  collinearityMethod?: string | string[];
  noisyDataMethod?: string | string[];
  textNormalizerMethod?: string | string[];
  whitespaceTrimmerMethod?: string | string[];
  imbalanceHandlerMethod?: string | string[];
  consistencyFixerMethod?: string | string[];
  duplicateRemoverMethod?: string | string[];
  typeCorrectorMethod?: string | string[];
  nullColumnDropperMethod?: string | string[];
  validationCheckMethod?: string | string[];
  featurePrunerMethod?: string | string[];
  dateTimeParserMethod?: string | string[];
  unitConverterMethod?: string | string[];
  toLowerCase?: boolean;
  trim?: boolean;
  transformMethod?: string;
  targetColumn?: string;
  constantValue?: string | number;
  categoricalConstantValue?: string;
  threshold?: number;
  textMethod?: string;
  trimMethod?: string;
  imbalanceMethod?: string;
  logMethod?: string;
  smoothMethod?: string;
  windowSize?: number;
  removeSpecialChars?: boolean;
  subset?: string[];
}

interface ProcessedDataset {
  datasetId: string;
  data: {
    columns: string[];
    rows: unknown[][];
    totalRows: number;
  };
}

// Map frontend method names to backend method names
function mapFrontendMethodToBackend(frontendMethod: string, strategy?: string | string[]): string {
  // Handle missing values category - map based on strategy
  if (frontendMethod === "handling_missing_values") {
    const strategyValue = Array.isArray(strategy) ? strategy[0] : strategy;
    const strategyMapping: Record<string, string> = {
      "mode": "apply_mode_imputation",
      "forward_fill": "apply_forward_fill",
      "backward_fill": "apply_backward_fill",
      "drop": "drop_rows_with_missing",
      "drop_rows": "drop_rows_with_missing",
      "drop_columns": "drop_columns_with_missing",
    };
    return strategyMapping[strategyValue || "mode"] || "apply_mode_imputation";
  }

  const methodMapping: Record<string, string> = {
    "drop_duplicates": "remove_duplicates",
    "remove_duplicates": "remove_duplicates",
    "drop_rows_with_missing": "drop_rows_with_missing",
    "drop_columns_with_missing": "drop_columns_with_missing",
    "apply_mode_imputation": "apply_mode_imputation",
    "apply_forward_fill": "apply_forward_fill",
    "apply_backward_fill": "apply_backward_fill",
  };

  return methodMapping[frontendMethod] || frontendMethod;
}

interface DataCleanerProps {
  datasetId?: string;
  columns?: string[];
  targetColumn?: string;
  onConfigChange?: (config: DataCleaningConfig) => void;
  initialConfig?: DataCleaningConfig;
  processedDatasetFromMissingHandler?: ProcessedDataset;
  onProcessedDatasetReady?: (processedId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => void;
  onExecutionResultChange?: (result: ExecutionResult | null) => void;
  persistedResult?: ExecutionResult | null;
  onNext?: () => void;
  onPrev?: () => void;
  showNavigation?: boolean;
}

interface ExecutionResult {
  methods: string[];
  columns: string[];
  executed: boolean;
  executedAt?: string;
  pipelineResults?: Record<string, any>;
  finalData?: { columns: string[]; rows: unknown[][]; totalRows: number };
  originalData?: { columns: string[]; rows: unknown[][]; totalRows: number };
}

// Constants
const INITIAL_CONFIG: DataCleaningConfig = {
  selectedMethods: [],
  columns: [],
  strategy: "drop",
  toLowerCase: true,
  trim: true,
  transformMethod: "log",
};

const STEPS = [
  { num: 1, label: "Select Methods", icon: Wand2 },
  { num: 2, label: "Choose Columns", icon: Database },
  { num: 3, label: "Configure", icon: Settings },
  { num: 4, label: "Execute", icon: Zap },
] as const;

const MAX_PAGE_SIZE = 10000;

// Helper Functions
const stripQuotes = (str: string): string => {
  return str.replace(/^"""|"""$/g, "").replace(/^"|"$/g, "").trim();
};

const cleanColumns = (columns: string[]): string[] => {
  return columns.map(col => stripQuotes(col));
};

// Step Progress Component
const StepProgress = ({ 
  currentStep, 
  onStepClick 
}: { 
  currentStep: number; 
  onStepClick: (step: number) => void;
}) => (
  <div className="flex items-center gap-3">
    {STEPS.map((s, idx) => (
      <div key={s.num} className="flex items-center flex-1">
        <button
          onClick={() => onStepClick(s.num)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${
            currentStep === s.num
              ? "bg-blue-600 text-white shadow-md"
              : currentStep > s.num
              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <div
            className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
              currentStep === s.num
                ? "bg-white/20"
                : currentStep > s.num
                ? "bg-green-100"
                : "bg-slate-100"
            }`}
          >
            {currentStep > s.num ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <s.icon className="h-4 w-4" />
            )}
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs opacity-75">Step {s.num}</div>
            <div className="text-sm font-medium truncate">{s.label}</div>
          </div>
        </button>
        {idx < STEPS.length - 1 && (
          <ArrowRight className="h-5 w-5 text-slate-300 mx-2 flex-shrink-0" />
        )}
      </div>
    ))}
  </div>
);


export default function DataCleaner({
  datasetId,
  columns = [],
  targetColumn,
  onConfigChange,
  initialConfig,
  processedDatasetFromMissingHandler,
  onProcessedDatasetReady,
  onExecutionResultChange,
  persistedResult,
  onNext,
  onPrev,
  showNavigation,
}: DataCleanerProps) {
  // State
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<DataCleaningConfig>(initialConfig || INITIAL_CONFIG);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(config.selectedMethods || []);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(config.columns || []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(persistedResult || null);

  // Restore persisted result when component mounts or persistedResult changes
  useEffect(() => {
    if (persistedResult && persistedResult.executed) {
      setExecutionResult(persistedResult);
      // If we have a result, show it (step 4 is Results)
      setStep(4);
    }
  }, [persistedResult]);
  const [datasetColumns, setDatasetColumns] = useState<string[]>(cleanColumns(columns));
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [searchColumn, setSearchColumn] = useState("");
  const [allRows, setAllRows] = useState<unknown[][]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const [columnStats, setColumnStats] = useState<Record<string, { uniqueValues: number; cardinality: "High" | "Medium" | "Low"; nullCount: number; sampleValues: string[] }>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch dataset columns
  const fetchDatasetColumns = useCallback(async () => {
    if (!datasetId) {
      setDatasetColumns(cleanColumns(columns));
      return;
    }

    if (loadingColumns) return; // Prevent multiple simultaneous calls

    setLoadingColumns(true);
    try {
      const response = await api.get<{ columns: string[] }>(
        API_ENDPOINTS.datasetPreview(datasetId, 1, 1)
      );

      const cols = response.columns && response.columns.length > 0
        ? cleanColumns(response.columns)
        : cleanColumns(columns);
      
      setDatasetColumns(cols);
    } catch (error) {
      console.error("Error fetching dataset columns:", error);
      setDatasetColumns(cleanColumns(columns));
    } finally {
      setLoadingColumns(false);
    }
  }, [datasetId]); // Removed columns from dependencies to prevent unnecessary re-fetches

  useEffect(() => {
    fetchDatasetColumns();
  }, [datasetId]); // Only depend on datasetId

  // Fetch and calculate column statistics
  const fetchColumnStats = useCallback(async () => {
    const datasetToUse = processedDatasetFromMissingHandler?.datasetId || datasetId;
    if (!datasetToUse) return;

    setStatsLoading(true);
    try {
      let fetchedColumns: string[] = [];
      let allRowsData: unknown[][] = [];
      
      // First, check if we have processed data available (from missing values, encoding, scaling, etc.)
      if (processedDatasetFromMissingHandler?.data) {
        fetchedColumns = cleanColumns(processedDatasetFromMissingHandler.data.columns);
        // Use only first 10000 rows for statistics calculation (sample)
        allRowsData = processedDatasetFromMissingHandler.data.rows.slice(0, 10000);
        setAllColumns(fetchedColumns);
        setAllRows(allRowsData);
      } else {
        // Only fetch if processed data is not available
        // Use a small sample (first page only) for statistics
        const firstPage = await api.get<{ totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number }>(
          API_ENDPOINTS.datasetPreview(datasetToUse, 1, 10000)
        );

        if (!firstPage.columns || !firstPage.rows) {
          setStatsLoading(false);
          return;
        }

        const { columns: cols, rows: firstRows } = firstPage;
        
        // Clean column names to match datasetColumns
        fetchedColumns = cleanColumns(cols);
        
        // Set all columns from dataset if not already set
        setAllColumns(fetchedColumns);
        
        // Use only first page for statistics (sample of 10000 rows is enough)
        allRowsData = firstRows.slice(0, 10000);
        setAllRows(allRowsData);
      }

      // Calculate statistics for all columns
      const stats: Record<string, { uniqueValues: number; cardinality: "High" | "Medium" | "Low"; nullCount: number; sampleValues: string[] }> = {};
      
      fetchedColumns.forEach((columnName: string, index: number) => {
        const columnIndex = index;

        const values = allRowsData.map(row => row[columnIndex]);
        const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
        const uniqueValuesSet = new Set(nonNullValues);
        const uniqueCount = uniqueValuesSet.size;
        const nullCount = values.length - nonNullValues.length;
        
        // Determine cardinality
        let cardinality: "High" | "Medium" | "Low";
        const ratio = nonNullValues.length > 0 ? uniqueCount / nonNullValues.length : 0;
        
        if (uniqueCount > 100 || ratio > 0.5) {
          cardinality = "High";
        } else if (uniqueCount > 20 || ratio > 0.1) {
          cardinality = "Medium";
        } else {
          cardinality = "Low";
        }
        
        // Get sample values
        const sampleValues = Array.from(uniqueValuesSet)
          .slice(0, 5)
          .map(v => String(v));
        
        stats[columnName] = {
          uniqueValues: uniqueCount,
          cardinality,
          nullCount,
          sampleValues
        };
      });

      setColumnStats(stats);
    } catch (error) {
      console.error("Error fetching column stats:", error);
      toast.error("Failed to fetch column statistics");
    } finally {
      setStatsLoading(false);
    }
  }, [datasetId, processedDatasetFromMissingHandler]);

  // Memoize filtered columns for search
  const filteredColumns = useMemo(() => {
    if (!searchColumn) return datasetColumns;
    return datasetColumns.filter(col =>
      col.toLowerCase().includes(searchColumn.toLowerCase())
    );
  }, [datasetColumns, searchColumn]);

  // Fetch column stats only when dataset changes
  useEffect(() => {
    const datasetToUse = processedDatasetFromMissingHandler?.datasetId || datasetId;
    if (!datasetToUse) return;
    
    // Reset stats when dataset changes
    setColumnStats({});
    setAllRows([]);
    setAllColumns([]);
    
    // Fetch stats for new dataset
    fetchColumnStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, processedDatasetFromMissingHandler?.datasetId]);

  // Update config when methods or columns change
  useEffect(() => {
    const newConfig = { ...config, selectedMethods, columns: selectedColumns };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [selectedMethods, selectedColumns]);

  // Handlers
  const handleColumnToggle = useCallback((column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  }, []);

  const handleExecute = useCallback(async () => {
    if (isExecuting) return; // Prevent multiple simultaneous executions
    
    if (selectedMethods.length === 0) {
      toast.error("Please select at least one cleaning method");
      return;
    }

    const datasetToUse = processedDatasetFromMissingHandler?.datasetId || datasetId;
    if (!datasetToUse) {
      toast.error("Dataset ID is required");
      return;
    }

    setIsExecuting(true);
    toast.loading("Executing data cleaning pipeline...", { id: "cleaning-execution" });

    try {
      let fetchedColumns: string[] = [];
      let allRowsData: unknown[][] = [];
      let totalRows = 0;

      // Use processed dataset if available
      if (processedDatasetFromMissingHandler) {
        fetchedColumns = cleanColumns(processedDatasetFromMissingHandler.data.columns);
        allRowsData = processedDatasetFromMissingHandler.data.rows.map(row => [...row]);
        totalRows = processedDatasetFromMissingHandler.data.totalRows;
      } else {
        // Fetch from API using preview endpoint
        const firstPage = await api.get<{
          columns: string[];
          rows: unknown[][];
          totalRows: number;
          page: number;
          pageSize: number;
          totalPages: number;
        }>(API_ENDPOINTS.datasetPreview(datasetToUse, 1, MAX_PAGE_SIZE));

        if (!firstPage.columns || !firstPage.rows) {
          throw new Error(`Failed to fetch dataset: Preview data not available for dataset ${datasetToUse}`);
        }

        const { columns: cols, rows: firstRows, totalPages, totalRows: total } = firstPage;
        fetchedColumns = cleanColumns(cols);
        allRowsData = [...firstRows];

        // Fetch remaining pages sequentially to avoid overwhelming the API
        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page++) {
            const pageData = await api.get<{
              rows: unknown[][];
            }>(API_ENDPOINTS.datasetPreview(datasetToUse, page, MAX_PAGE_SIZE));
            if (pageData.rows) {
              allRowsData.push(...pageData.rows);
            }
            
            // Small delay between requests to prevent API overload
            if (page < totalPages) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        totalRows = total || allRowsData.length;
      }

      // Store original data
      const originalData = {
        columns: [...fetchedColumns],
        rows: allRowsData.map(row => [...row]),
        totalRows,
      };

      // Call backend API
      let response: any;
      try {
        response = await api.post<{
          success?: boolean;
          processedData?: ProcessedDataset;
          results?: Record<string, any>;
          summary?: {
            totalMethods: number;
            succeededMethods: number;
            failedMethods: number;
            totalRowsProcessed: number;
            totalRowsAffected: number;
            uniqueColumnsAffected: string[];
          };
          message?: string;
          error?: string;
          details?: string;
        }>(API_ENDPOINTS.preprocessing.dataCleaning, {
          dataset_id: datasetToUse,
          method_type: config.methodType || "common",
          method: mapFrontendMethodToBackend(selectedMethods[0] || "drop_duplicates", config.strategy),
          columns: selectedColumns.length > 0 ? selectedColumns : undefined,
          target_column: targetColumn || config.targetColumn,
          strategy: config.strategy,
          constant_value: config.constantValue,
          threshold: config.threshold,
          text_method: config.textMethod,
          trim_method: config.trimMethod,
          imbalance_method: config.imbalanceMethod,
          log_method: config.logMethod,
          outlier_method: config.outlierMethod,
          skewness_method: config.skewnessMethod,
          smooth_method: config.smoothMethod,
          window_size: config.windowSize,
          remove_special_chars: config.removeSpecialChars,
          subset: config.subset,
        });
      } catch (apiError: any) {
        console.error("Data cleaning API error:", apiError);
        throw new Error(apiError?.message || "Failed to call data cleaning API");
      }

      // Handle response - check if it's successful and has processedData
      if (!response) {
        throw new Error("No response received from data cleaning API");
      }

      console.log("[Data Cleaning] Response received:", {
        hasSuccess: 'success' in response,
        success: response.success,
        hasProcessedData: 'processedData' in response,
        processedData: response.processedData ? 'exists' : 'missing'
      });

      // Check if response has success field and processedData
      if (response && (response.success === true || response.success === undefined) && response.processedData) {
        const cleanedColumns = cleanColumns(response.processedData.data.columns);
        const allCleanedRows = response.processedData.data.rows;
        const cleanedTotalRows = response.processedData.data.totalRows;


        // Update dataset
        try {
          await api.put(`/api/datasets/${response.processedData.datasetId}/data`, {
            columns: cleanedColumns,
            rows: allCleanedRows,
            totalRows: cleanedTotalRows,
          });

          await api.put(API_ENDPOINTS.datasetsById(response.processedData.datasetId), {
            columns: cleanedColumns.length,
            rows: cleanedTotalRows,
            updatedAt: new Date().toISOString(),
          });
        } catch (saveError) {
          console.error("Error saving cleaned data:", saveError);
        }

        // Ensure we're using the cleaned data from API response, not original
        const result: ExecutionResult = {
          methods: selectedMethods,
          columns: selectedColumns.length > 0 ? selectedColumns : [],
          executed: true,
          executedAt: new Date().toISOString(),
          pipelineResults: response.results || {},
          finalData: { 
            columns: cleanedColumns, 
            rows: allCleanedRows, // Use cleaned rows from API response
            totalRows: cleanedTotalRows 
          },
          originalData, // Keep original separate
        };
        
        setExecutionResult(result);
        
        // Notify parent about execution result for persistence
        onExecutionResultChange?.(result);

        // Automatically move to step 4 (Results) to show the results
        setStep(4);

        onProcessedDatasetReady?.(response.processedData.datasetId, {
          columns: cleanedColumns,
          rows: allCleanedRows,
          totalRows: cleanedTotalRows,
        });

        toast.success(
          response.message || 
          `Successfully applied ${selectedMethods.length} cleaning method(s). ${cleanedColumns.length} columns, ${cleanedTotalRows} rows`,
          { id: "cleaning-execution", duration: 5000 }
        );
      } else {
        const errors: string[] = [];
        if (response.results) {
          Object.values(response.results).forEach((r: any) => {
            if (r.success === false && r.error) {
              errors.push(r.error);
            }
          });
        }
        if (response.error) errors.push(response.error);
        if (response.details) errors.push(response.details);

        toast.error(errors.length > 0 ? errors[0] : "Data cleaning failed", {
          id: "cleaning-execution",
        });
      }
    } catch (error) {
      console.error("Error executing cleaning pipeline:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to execute cleaning pipeline",
        { id: "cleaning-execution" }
      );
    } finally {
      setIsExecuting(false);
    }
  }, [selectedMethods, datasetId, processedDatasetFromMissingHandler, config, selectedColumns, targetColumn, onProcessedDatasetReady]);

  return (
    <div className="w-full bg-slate-50">
      {/* Fixed Header */}
      <div className=" z-30 bg-white border-b shadow-sm">
        <div className="w-full py-5">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Data Cleaner</h1>
                <p className="text-sm text-slate-500">Automated data preprocessing workflow</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedMethods.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedMethods.length} methods selected
                  </span>
                </div>
              )}
              <Button
                onClick={handleExecute}
                disabled={isExecuting || selectedMethods.length === 0}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Execute Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <StepProgress currentStep={step} onStepClick={setStep} />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="w-full">
        {/* Step 1: Select Methods */}
        {step === 1 && (
          <SelectMethods
            selectedMethods={selectedMethods}
            onMethodsChange={setSelectedMethods}
            onNext={() => setStep(2)}
          />
        )}

        {/* Step 2: Select Columns */}
        {step === 2 && (
          <div className="space-y-6">
            <SelectColumns
              selectedColumns={selectedColumns}
              onColumnsChange={setSelectedColumns}
              categoricalColumns={datasetColumns}
              filteredColumns={filteredColumns}
              columnStats={columnStats}
              statsLoading={statsLoading}
              searchColumn={searchColumn}
              onSearchChange={setSearchColumn}
            />

            <div className="flex justify-between">
              <Button variant="outline" size="lg" onClick={() => setStep(1)} className="gap-2">
                <ChevronRight className="h-5 w-5 rotate-180" />
                Back
              </Button>
              <Button
                size="lg"
                onClick={() => setStep(3)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue to Configuration
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <Configure
            selectedMethods={selectedMethods}
            config={config}
            onConfigChange={(newConfig) => {
              setConfig(newConfig);
              onConfigChange?.(newConfig);
            }}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {/* Step 4: Execute */}
        {step === 4 && (
          <Result
            selectedMethods={selectedMethods}
            selectedColumns={selectedColumns}
            config={config}
            executionResult={executionResult}
            isExecuting={isExecuting}
            datasetId={processedDatasetFromMissingHandler?.datasetId || datasetId}
            onBack={() => setStep(3)}
            onExecute={handleExecute}
          />
        )}
      </div>
    </div>
  );
}