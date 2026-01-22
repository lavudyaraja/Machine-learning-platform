"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Filter, AlertCircle, CheckCircle2, Settings, Database, Zap, Wand2, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import MethodSelection from "./mainui/MethodSelection";
import Configuration from "./mainui/Configuration";
import ColumnSelection from "./mainui/ColumnSelection";
import Result from "./mainui/Result";

export interface FeatureSelectionConfig {
  methods?: string[];
  selectedColumns?: string[];
  varianceThreshold?: number;
  correlationThreshold?: number;
  nFeatures?: number;
  alpha?: number;
  nComponents?: number;
  targetColumn?: string;
}

interface FeatureSelectorProps {
  datasetId?: string;
  datasetName?: string;
  columns?: string[];
  targetColumn?: string;
  onConfigChange?: (config: FeatureSelectionConfig) => void;
  initialConfig?: FeatureSelectionConfig;
  processedDatasetFromFeatureScaler?: {
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  };
  onProcessedDatasetReady?: (
    datasetId: string,
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    }
  ) => void;
}

const stripQuotes = (str: string): string => {
  return str.replace(/^"""|"""$/g, "").replace(/^"|"$/g, "").trim();
};

export default function FeatureSelector({
  datasetId,
  datasetName,
  columns = [],
  targetColumn,
  onConfigChange,
  initialConfig,
  processedDatasetFromFeatureScaler,
  onProcessedDatasetReady,
}: FeatureSelectorProps) {
  // State management
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    initialConfig?.methods || []
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    initialConfig?.selectedColumns || []
  );
  const [step, setStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [fetchedColumns, setFetchedColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columnStats, setColumnStats] = useState<Record<string, { uniqueValues: number; cardinality: "High" | "Medium" | "Low"; nullCount: number; sampleValues: string[] }>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  const [config, setConfig] = useState({
    varianceThreshold: initialConfig?.varianceThreshold ?? 0.01,
    correlationThreshold: initialConfig?.correlationThreshold ?? 0.95,
    nFeatures: initialConfig?.nFeatures ?? 10,
    alpha: initialConfig?.alpha ?? 0.01,
    targetColumn: initialConfig?.targetColumn || targetColumn || "",
  });

  // Refs
  const onConfigChangeRef = useRef(onConfigChange);
  const prevConfigRef = useRef<FeatureSelectionConfig>({});
  const isInitialMount = useRef(true);

  // Update config change ref
  useEffect(() => {
    onConfigChangeRef.current = onConfigChange;
  }, [onConfigChange]);

  // Sync target column with config
  useEffect(() => {
    if (targetColumn && targetColumn !== config.targetColumn) {
      setConfig((prev) => ({ ...prev, targetColumn }));
    }
  }, [targetColumn, config.targetColumn]);

  // Fetch dataset columns
  useEffect(() => {
    const fetchDatasetColumns = async () => {
      // Priority 1: Processed data from feature scaler
      if (
        processedDatasetFromFeatureScaler?.data?.columns &&
        processedDatasetFromFeatureScaler.data.columns.length > 0
      ) {
        return;
      }

      // Priority 2: Columns from props
      if (columns.length > 0) {
        setFetchedColumns(columns);
        return;
      }

      // Priority 3: Fetch from API if datasetId exists
      if (!datasetId) {
        setFetchedColumns([]);
        return;
      }

      setLoadingColumns(true);
      setError(null);

      try {
        const response = await api.get<{ preview?: { columns: string[] } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=1&preview=true`
        );

        if (response.preview?.columns && response.preview.columns.length > 0) {
          const cleanedColumns = response.preview.columns.map(stripQuotes);
          setFetchedColumns(cleanedColumns);
        } else {
          setFetchedColumns([]);
          setError("No columns found in dataset");
        }
      } catch (err) {
        console.error("Error fetching dataset columns:", err);
        setError("Failed to fetch columns from dataset");
        setFetchedColumns([]);
      } finally {
        setLoadingColumns(false);
      }
    };

    fetchDatasetColumns();
  }, [datasetId, columns, processedDatasetFromFeatureScaler?.data?.columns]);

  // Notify parent component of config changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevConfigRef.current = {
        methods: selectedMethods,
        selectedColumns,
        varianceThreshold: config.varianceThreshold,
        correlationThreshold: config.correlationThreshold,
        nFeatures: config.nFeatures,
        alpha: config.alpha,
        targetColumn: config.targetColumn,
      };
      return;
    }

    const currentConfig: FeatureSelectionConfig = {
      methods: selectedMethods,
      selectedColumns,
      varianceThreshold: config.varianceThreshold,
      correlationThreshold: config.correlationThreshold,
      nFeatures: config.nFeatures,
      alpha: config.alpha,
      targetColumn: config.targetColumn,
    };

    const prev = prevConfigRef.current;
    const hasChanged =
      JSON.stringify(prev.methods) !== JSON.stringify(currentConfig.methods) ||
      JSON.stringify(prev.selectedColumns) !==
        JSON.stringify(currentConfig.selectedColumns) ||
      prev.varianceThreshold !== currentConfig.varianceThreshold ||
      prev.correlationThreshold !== currentConfig.correlationThreshold ||
      prev.nFeatures !== currentConfig.nFeatures ||
      prev.alpha !== currentConfig.alpha ||
      prev.targetColumn !== currentConfig.targetColumn;

    if (hasChanged && onConfigChangeRef.current) {
      prevConfigRef.current = currentConfig;
      onConfigChangeRef.current(currentConfig);
    }
  }, [
    selectedMethods,
    selectedColumns,
    config.varianceThreshold,
    config.correlationThreshold,
    config.nFeatures,
    config.alpha,
    config.targetColumn,
  ]);

  // Calculate available columns with priority
  const availableColumns = useMemo(() => {
    if (
      processedDatasetFromFeatureScaler?.data?.columns &&
      processedDatasetFromFeatureScaler.data.columns.length > 0
    ) {
      return processedDatasetFromFeatureScaler.data.columns;
    }
    if (columns.length > 0) {
      return columns;
    }
    if (fetchedColumns.length > 0) {
      return fetchedColumns;
    }
    return [];
  }, [
    processedDatasetFromFeatureScaler?.data?.columns,
    columns,
    fetchedColumns,
  ]);

  // Fetch and calculate column statistics
  const fetchColumnStats = useCallback(async () => {
    const datasetToUse = processedDatasetFromFeatureScaler?.datasetId || datasetId;
    if (!datasetToUse || availableColumns.length === 0) {
      return;
    }

    setStatsLoading(true);
    try {
      // Fetch dataset data
      const response = await api.get<{ preview?: { columns: string[]; rows: unknown[][]; totalRows: number } }>(
        `${API_ENDPOINTS.datasetsById(datasetToUse)}?page=1&pageSize=10000&preview=true`
      );

      if (!response.preview) {
        return;
      }

      const { columns: fetchedColumns, rows: allRowsData } = response.preview;

      // Calculate statistics for all columns
      const stats: Record<string, { uniqueValues: number; cardinality: "High" | "Medium" | "Low"; nullCount: number; sampleValues: string[] }> = {};
      
      availableColumns.forEach((columnName: string) => {
        const columnIndex = fetchedColumns.indexOf(columnName);
        if (columnIndex === -1) return;

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
  }, [datasetId, processedDatasetFromFeatureScaler?.datasetId, availableColumns]);

  // Fetch column stats when available columns change
  useEffect(() => {
    if (availableColumns.length > 0) {
      fetchColumnStats();
    }
  }, [availableColumns.length, fetchColumnStats]);

  // Handler functions
  const handleMethodToggle = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleSelectAllColumns = (checked: boolean) => {
    setSelectedColumns(checked ? [...availableColumns] : []);
  };

  const handleExecute = async () => {
    if (!datasetId) {
      setError("No dataset available for processing");
      return;
    }

    if (selectedMethods.length === 0) {
      setError("Please select at least one feature selection method");
      return;
    }

    // If no columns selected, use all available columns
    const columnsToUse = selectedColumns.length === 0 ? availableColumns : selectedColumns;

    setIsExecuting(true);
    setError(null);

    try {
      // First, fetch the original dataset data
      // Fetch a reasonable amount for preview (500 rows max to prevent browser freeze)
      const originalResponse: any = await api.get(`${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=500&preview=true`);
      const originalData = originalResponse.data?.preview || originalResponse.preview || {
        columns: availableColumns,
        rows: [],
        totalRows: originalResponse.data?.totalRows || originalResponse.totalRows || 0,
      };
      
      // Ensure totalRows is set correctly
      if (!originalData.totalRows && originalResponse.data?.totalRows) {
        originalData.totalRows = originalResponse.data.totalRows;
      } else if (!originalData.totalRows && originalResponse.totalRows) {
        originalData.totalRows = originalResponse.totalRows;
      }



      // Map component method IDs to API method names
      const methodMapping: Record<string, string> = {
        'variance_threshold': 'variance_threshold',
        'correlation': 'correlation',
        'chi_square': 'chi2',
        'mutual_info': 'mutual_info',
        'forward_selection': 'forward_selection',
        'backward_elimination': 'backward_elimination',
        'rfe': 'rfe',
        'lasso': 'lasso',
        'ridge': 'ridge',
        'elastic_net': 'elastic_net',
      };

      const apiMethod = methodMapping[selectedMethods[0]] || selectedMethods[0] || 'correlation';

      // Prepare feature selection configuration
      const featureSelectionConfig = {
        method: apiMethod,
        nFeatures: config.nFeatures,
        threshold: config.varianceThreshold,
        targetColumn: config.targetColumn || "",
        correlationThreshold: config.correlationThreshold,
        columns: columnsToUse,
        alpha: config.alpha,
      };

      // Call feature selection API
      let featureSelectionResponse: any;
      try {
        featureSelectionResponse = await api.post(API_ENDPOINTS.preprocessing.featureSelection, {
          dataset_id: datasetId,
          method: apiMethod,
          n_features: config.nFeatures,
          threshold: config.varianceThreshold,
          target_column: config.targetColumn || "",
          correlation_threshold: config.correlationThreshold,
          columns: columnsToUse,
          alpha: config.alpha,
        });
        console.log("Feature selection API response:", featureSelectionResponse);
      } catch (apiError: any) {
        console.error("API call failed:", apiError);
        const errorMessage = apiError?.message || apiError?.error || "Failed to connect to feature selection service. Please try again.";
        throw new Error(errorMessage);
      }

      if (!featureSelectionResponse) {
        throw new Error("No response received from feature selection service");
      }

      if (!featureSelectionResponse.success) {
        const errorMsg = featureSelectionResponse.error || featureSelectionResponse.message || "Feature selection failed";
        throw new Error(errorMsg);
      }

      // Handle response structure - api.post returns data directly if it has success/processedData
      const processedData = featureSelectionResponse.processedData?.data || featureSelectionResponse.processedData;

      if (!processedData || !processedData.columns) {
        console.error("Invalid processed data structure:", processedData);
        console.error("Full response:", featureSelectionResponse);
        throw new Error("No processed data received from feature selection service. Invalid response structure.");
      }

      // Create the result object
      const result = {
        selectedFeatures: processedData.columns || [],
        removedFeatures: originalData.columns.filter(
          (col: string) => !processedData.columns.includes(col)
        ),
        appliedMethods: selectedMethods,
        timestamp: new Date().toISOString(),
        originalData: originalData,
        processedData: processedData,
      };

      console.log("Feature selection result:", result);

      setExecutionResult(result);
      setStep(4); // Move to results step

      // Notify parent with processed data
      if (onProcessedDatasetReady) {
        onProcessedDatasetReady(datasetId, processedData);
      }
    } catch (err: any) {
      console.error("Error executing feature selection:", err);
      const errorMessage = err?.message || err?.error || "Failed to execute feature selection. Please try again.";
      setError(errorMessage);
      // Make sure to stop loading even on error
      setIsExecuting(false);
    } finally {
      setIsExecuting(false);
    }
  };


  const steps = [
    { num: 1, label: "Select Methods", icon: Wand2 },
    { num: 2, label: "Select Columns", icon: Database },
    { num: 3, label: "Configure", icon: Settings },
    { num: 4, label: "Review & Execute", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Feature Selection</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Select optimal features for your model performance
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {selectedMethods.length > 0 && (
                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    {selectedMethods.length} method{selectedMethods.length > 1 ? 's' : ''} selected
                  </span>
                </div>
              )}
              <button
                onClick={handleExecute}
                disabled={isExecuting || selectedMethods.length === 0}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isExecuting ? "Running..." : "Execute"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex">
            {steps.map((s, idx) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex-1 relative py-4 px-6 transition-all ${
                  step === s.num
                    ? "text-slate-900"
                    : step > s.num
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3 justify-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    step === s.num 
                      ? "bg-slate-900 text-white" 
                      : step > s.num 
                      ? "bg-slate-100 text-slate-600" 
                      : "bg-slate-50 text-slate-400"
                  }`}>
                    {step > s.num ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-400">Step {s.num}</div>
                    <div className="text-sm font-medium">{s.label}</div>
                  </div>
                </div>
                {/* Active indicator */}
                {step === s.num && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-[1600px] mx-auto px-8 pt-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Step 1: Select Methods */}
        {step === 1 && (
          <MethodSelection
            selectedMethods={selectedMethods}
            onMethodToggle={handleMethodToggle}
            onExecute={handleExecute}
            isExecuting={isExecuting}
            columns={availableColumns}
            onNext={() => setStep(2)}
          />
        )}

        {/* Step 2: Select Columns */}
        {step === 2 && (
          <ColumnSelection
            availableColumns={availableColumns}
            selectedColumns={selectedColumns}
            onColumnToggle={handleColumnToggle}
            onSelectAll={handleSelectAllColumns}
            loadingColumns={loadingColumns}
            columnStats={columnStats}
            statsLoading={statsLoading}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* Step 3: Configure */}
        {step === 3 && (
          <Configuration 
            config={config} 
            onConfigChange={setConfig}
            availableColumns={availableColumns}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {/* Step 4: Review & Execute */}
        {step === 4 && (
          <>
            {isExecuting ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Processing feature selection...</p>
                  <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
                </div>
              </div>
            ) : executionResult ? (
              <Result
                executionResult={executionResult}
                selectedMethods={selectedMethods}
                selectedColumns={selectedColumns}
                config={config}
                datasetId={datasetId}
                datasetName={datasetName}
                onBack={() => setStep(3)}
                onExecute={handleExecute}
                isExecuting={isExecuting}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No results available</p>
                  <p className="text-sm text-slate-500 mt-2">Please execute feature selection to see results</p>
                  <Button
                    onClick={handleExecute}
                    disabled={isExecuting || selectedMethods.length === 0}
                    className="mt-4"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Feature Selection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}