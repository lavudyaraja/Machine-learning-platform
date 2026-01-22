"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CheckCircle2, Scale, Settings, Zap, Database, Wand2, Play, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import SelectMethods from "./mainui/SelectMethods";
import SelectColumns from "./mainui/SelectColumns";
import Configure from "./mainui/Configure";
import Result from "./mainui/Result";

export interface FeatureScalingConfig {
  method: "standard" | "minmax" | "maxabs" | "l1" | "l2" | string[];
  columns?: string[];
  withMean?: boolean;
  withStd?: boolean;
  featureRange?: [number, number];
  selectedMethods?: string[];
  // StandardScaler specific
  copy?: boolean;
  // MinMaxScaler specific
  clip?: boolean;
  // Normalizer specific
  norm?: "l1" | "l2" | "max";
  // RobustScaler (if added)
  quantileRange?: [number, number];
  unitVariance?: boolean;
}

interface FeatureScalerProps {
  datasetId?: string;
  columns?: string[];
  onConfigChange?: (config: FeatureScalingConfig) => void;
  initialConfig?: FeatureScalingConfig;
  processedDatasetFromDataCleaner?: {
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  };
  onProcessedDatasetReady?: (datasetId: string, data: {
    columns: string[];
    rows: unknown[][];
    totalRows: number;
  }) => void;
}

export default function FeatureScaler({
  datasetId,
  columns = [],
  onConfigChange,
  initialConfig,
  processedDatasetFromDataCleaner,
  onProcessedDatasetReady,
}: FeatureScalerProps) {
  const params = useParams();
  const id = useMemo(() => {
    return (params?.id as string) || datasetId || "";
  }, [params?.id, datasetId]);

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<FeatureScalingConfig>(
    initialConfig || {
      method: "standard",
      columns: [],
      withMean: true,
      withStd: true,
      featureRange: [0, 1],
      selectedMethods: [],
    }
  );

  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    config.selectedMethods || []
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(config.columns || []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    methods: string[];
    columns: string[];
    executed: boolean;
    executedAt?: string;
    scaledData?: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
    originalData?: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [datasetColumns, setDatasetColumns] = useState<string[]>(columns);
  const [columnStats, setColumnStats] = useState<Record<string, { uniqueValues: number; cardinality: "High" | "Medium" | "Low"; nullCount: number; sampleValues: string[] }>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch or update datasetColumns
  useEffect(() => {
    const fetchColumns = async () => {
      // First, check if we have processed data available
      if (processedDatasetFromDataCleaner?.data?.columns) {
        const stripQuotes = (str: string): string => {
          return str.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
        };
        const cleanedColumns = processedDatasetFromDataCleaner.data.columns.map(col => stripQuotes(col));
        setDatasetColumns(cleanedColumns);
        return;
      }

      if (columns.length > 0) {
        setDatasetColumns(columns);
        return;
      }

      const datasetToUse = processedDatasetFromDataCleaner?.datasetId || id || datasetId;
      if (!datasetToUse) {
        setDatasetColumns([]);
        return;
      }

      try {
        const response = await api.get<{ preview?: { columns: string[] } }>(
          `${API_ENDPOINTS.datasetsById(datasetToUse)}?page=1&pageSize=1&preview=true`
        );

        if (response.preview?.columns && response.preview.columns.length > 0) {
          const stripQuotes = (str: string): string => {
            return str.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
          };
          const cleanedColumns = response.preview.columns.map(col => stripQuotes(col));
          setDatasetColumns(cleanedColumns);
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, id, processedDatasetFromDataCleaner]);

  useEffect(() => {
    const newConfig = {
      ...config,
      selectedMethods,
      columns: selectedColumns,
    };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [selectedMethods, selectedColumns]);

  // Fetch and calculate column statistics
  const fetchColumnStats = useCallback(async () => {
    const datasetToUse = processedDatasetFromDataCleaner?.datasetId || id || datasetId;
    if (!datasetToUse || datasetColumns.length === 0) {
      return;
    }

    setStatsLoading(true);
    try {
      let fetchedColumns: string[] = [];
      let allRowsData: unknown[][] = [];

      // First, check if we have processed data available (from data cleaner, etc.)
      if (processedDatasetFromDataCleaner?.data) {
        fetchedColumns = processedDatasetFromDataCleaner.data.columns;
        // Use only first 10000 rows for statistics calculation (sample)
        allRowsData = processedDatasetFromDataCleaner.data.rows.slice(0, 10000);
      } else {
        // Only fetch if processed data is not available
        const response = await api.get<{ preview?: { columns: string[]; rows: unknown[][]; totalRows: number } }>(
          `${API_ENDPOINTS.datasetsById(datasetToUse)}?page=1&pageSize=10000&preview=true`
        );

        if (!response.preview) {
          return;
        }

        fetchedColumns = response.preview.columns;
        allRowsData = response.preview.rows;
      }

      // Helper function to strip quotes
      const stripQuotes = (str: string): string => {
        return str.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
      };

      // Calculate statistics for all columns
      const stats: Record<string, { uniqueValues: number; cardinality: "High" | "Medium" | "Low"; nullCount: number; sampleValues: string[] }> = {};

      datasetColumns.forEach((columnName: string) => {
        // Try to find column index - check both with and without quotes
        let columnIndex = fetchedColumns.findIndex(col => {
          const cleanedCol = stripQuotes(col);
          return cleanedCol === columnName || col === columnName;
        });

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
  }, [id, datasetId, datasetColumns, processedDatasetFromDataCleaner]);

  // Fetch column stats when dataset columns change
  useEffect(() => {
    if (datasetColumns.length > 0) {
      fetchColumnStats();
    }
  }, [datasetColumns.length, fetchColumnStats]);

  // Apply scaling transformations
  const applyScaling = (
    data: { columns: string[]; rows: unknown[][]; totalRows: number },
    methods: string[],
    columnsToScale: string[]
  ): { columns: string[]; rows: unknown[][]; totalRows: number } => {
    const newColumns: string[] = [...data.columns];
    const newRows: unknown[][] = data.rows.map(row => [...row]);

    // For each selected method, create scaled columns
    methods.forEach((method) => {
      columnsToScale.forEach((colName) => {
        const colIndex = data.columns.indexOf(colName);
        if (colIndex === -1) return;

        // Extract numeric values
        const values = data.rows.map(row => {
          const val = row[colIndex];
          if (val === null || val === undefined || val === '') return null;
          const num = Number(val);
          return isNaN(num) ? null : num;
        });

        const numericValues = values.filter((v): v is number => v !== null);
        if (numericValues.length === 0) return;

        // Calculate scaling parameters
        let scaledValues: number[] = [];
        const newColName = `${colName}_${method}`;
        newColumns.push(newColName);

        if (method === "standard") {
          // Calculate mean and standard deviation
          const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
          const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
          const std = Math.sqrt(variance);

          scaledValues = values.map(v => {
            if (v === null) return null;

            // Step 1: Center to zero (subtract mean) if withMean is enabled
            // If withMean is false, skip this step and keep original value
            const withMean = config.withMean !== false ? v - mean : v;

            // Step 2: Scale to unit variance (divide by std) if withStd is enabled
            // If withStd is false, return the value after mean centering (or original if mean was also disabled)
            const withStd = config.withStd !== false
              ? (std !== 0 ? withMean / std : 0)  // Divide by std, handle division by zero
              : withMean;  // Return value without scaling by std

            return withStd;
          }) as number[];
        } else if (method === "minmax") {
          const min = Math.min(...numericValues);
          const max = Math.max(...numericValues);
          const range = max - min;
          const [minRange, maxRange] = config.featureRange || [0, 1];

          scaledValues = values.map(v => {
            if (v === null) return null;
            if (range === 0) return minRange;
            const scaled = ((v - min) / range) * (maxRange - minRange) + minRange;
            return config.clip ? Math.max(minRange, Math.min(maxRange, scaled)) : scaled;
          }) as number[];
        } else if (method === "maxabs") {
          const maxAbs = Math.max(...numericValues.map(Math.abs));

          scaledValues = values.map(v => {
            if (v === null) return null;
            return maxAbs !== 0 ? v / maxAbs : 0;
          }) as number[];
        } else if (method === "l1") {
          // L1 normalization per row (sum of absolute values = 1)
          data.rows.forEach((row) => {
            const rowValues = columnsToScale.map(col => {
              const idx = data.columns.indexOf(col);
              const val = row[idx];
              if (val === null || val === undefined || val === '') return 0;
              const num = Number(val);
              return isNaN(num) ? 0 : Math.abs(num);
            });
            const rowSum = rowValues.reduce((sum, val) => sum + val, 0);
            const val = row[colIndex];
            if (val === null || val === undefined || val === '') {
              scaledValues.push(null as any);
            } else {
              const num = Number(val);
              scaledValues.push(isNaN(num) ? null : (rowSum !== 0 ? num / rowSum : 0) as any);
            }
          });
        } else if (method === "l2") {
          // L2 normalization per row (Euclidean length = 1)
          data.rows.forEach((row) => {
            const rowValues = columnsToScale.map(col => {
              const idx = data.columns.indexOf(col);
              const val = row[idx];
              if (val === null || val === undefined || val === '') return 0;
              const num = Number(val);
              return isNaN(num) ? 0 : num * num;
            });
            const rowNorm = Math.sqrt(rowValues.reduce((sum, val) => sum + val, 0));
            const val = row[colIndex];
            if (val === null || val === undefined || val === '') {
              scaledValues.push(null as any);
            } else {
              const num = Number(val);
              scaledValues.push(isNaN(num) ? null : (rowNorm !== 0 ? num / rowNorm : 0) as any);
            }
          });
        }

        // Add scaled values to rows
        newRows.forEach((row, idx) => {
          row.push(scaledValues[idx] !== null && scaledValues[idx] !== undefined
            ? Number(scaledValues[idx]!.toFixed(6))
            : null);
        });
      });
    });

    return {
      columns: newColumns,
      rows: newRows,
      totalRows: data.totalRows
    };
  };

  const handleExecute = async () => {
    if (selectedMethods.length === 0) {
      toast.error("At least one scaling method must be selected");
      return;
    }

    setIsExecuting(true);
    toast.loading("Applying feature scaling...", { id: "feature-scaling-processing" });

    try {
      const datasetToUse = processedDatasetFromDataCleaner?.datasetId || id || datasetId;
      if (!datasetToUse) {
        toast.error("Dataset ID is required");
        return;
      }

      // Process first method (backend supports one method at a time)
      const primaryMethod = selectedMethods[0];

      // Map frontend method names to backend method names
      const methodMap: Record<string, string> = {
        "standard": "standard",
        "minmax": "minmax",
        "robust": "robust",
        "maxabs": "maxabs",
        "quantile": "quantile",
        "box_cox": "box_cox",
        "yeo_johnson": "yeo_johnson",
        "l1": "l1",
        "l2": "l2",
        "unit_vector": "unit_vector",
        "log": "log",
        "decimal": "decimal"
      };

      const backendMethod = methodMap[primaryMethod] || primaryMethod;

      // Determine columns to scale
      const columnsToScale = selectedColumns.length > 0 ? selectedColumns : [];

      if (columnsToScale.length === 0) {
        toast.error("Please select at least one column to scale");
        return;
      }

      // Call backend API
      const response = await api.post<{
        success: boolean;
        processedData: {
          datasetId: string;
          data: {
            columns: string[];
            rows: unknown[][];
            totalRows: number;
          };
        };
        results: Record<string, any>;
        message: string;
      }>(API_ENDPOINTS.preprocessing.featureScaling, {
        dataset_id: datasetToUse,
        method: backendMethod,
        columns: columnsToScale,
        feature_range: config.featureRange,
        with_mean: config.withMean,
        with_std: config.withStd,
        with_centering: config.withMean, // Use withMean as default for robust
        with_scaling: config.withStd, // Use withStd as default for robust
        n_quantiles: 1000,
        output_distribution: "uniform",
        log_base: 2.718281828459045, // e
      });

      if (!response.success) {
        throw new Error(response.message || "Feature scaling failed");
      }

      const { processedData, results } = response;

      setExecutionResult({
        methods: selectedMethods,
        columns: columnsToScale,
        executed: true,
        executedAt: new Date().toISOString(),
        scaledData: processedData?.data || { columns: [], rows: [], totalRows: 0 },
        originalData: undefined // Original data is not returned
      });

      setStep(4); // Move to results step

      // Pass processed data to next component in pipeline
      if (processedData?.data) {
        onProcessedDatasetReady?.(datasetToUse, processedData.data);
      }

      toast.success(response.message, { id: "feature-scaling-processing", duration: 5000 });

    } catch (error: any) {
      console.error("Failed to execute scaling", error);
      const errorMessage = error?.response?.data?.details || error?.message || "Failed to execute scaling";
      toast.error(errorMessage, { id: "feature-scaling-processing" });
      setExecutionResult(null);
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
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Feature Scaling</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Normalize and standardize numerical features for optimal model performance
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
                className={`flex-1 relative py-4 px-6 transition-all ${step === s.num
                    ? "text-slate-900"
                    : step > s.num
                      ? "text-slate-600"
                      : "text-slate-400"
                  }`}
              >
                <div className="flex items-center gap-3 justify-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${step === s.num
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

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
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
          <SelectColumns
            selectedColumns={selectedColumns}
            onColumnsChange={setSelectedColumns}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            datasetId={id}
            availableColumns={datasetColumns}
            columnStats={columnStats}
            statsLoading={statsLoading}
          />
        )}

        {/* Step 3: Configure */}
        {step === 3 && (
          <Configure
            selectedMethods={selectedMethods}
            config={config}
            onConfigChange={setConfig}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {/* Step 4: Review & Execute */}
        {step === 4 && (
          <Result
            selectedMethods={selectedMethods}
            selectedColumns={selectedColumns}
            config={config}
            executionResult={executionResult}
            isExecuting={isExecuting}
            datasetId={id}
            onBack={() => setStep(3)}
            onExecute={handleExecute}
          />
        )}
      </div>
    </div>
  );
}

