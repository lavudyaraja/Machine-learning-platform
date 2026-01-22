"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Scale, Settings, Zap, Database, Wand2, Play, Loader2, Layers, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import SelectMethods from "./mainui/SelectMethods";
import SelectColumns from "./mainui/SelectColumns";
import Configure from "./mainui/Configure";
import Result from "./mainui/Result";

export interface FeatureExtractionConfig {
  method?: string | string[];
  selectedMethods?: string[];
  nComponents?: number;
  columns?: string[];
  targetColumn?: string;
  // PCA specific
  svdSolver?: "auto" | "full" | "arpack" | "randomized";
  whiten?: boolean;
  // LDA specific
  solver?: string;
  shrinkage?: number;
  // ICA specific
  algorithm?: string;
  fun?: string;
  maxIter?: number;
  // SVD specific
  nIter?: number;
  // Factor Analysis specific
  nFactors?: number;
  rotation?: "varimax" | "promax" | "oblimin" | "quartimax";
  // Common
  randomState?: number;
  tol?: number;
  // t-SNE specific
  perplexity?: number;
  earlyExaggeration?: number;
  learningRate?: string | number;
  // UMAP specific
  nNeighbors?: number;
  minDist?: number;
  metric?: string;
}

interface FeatureExtractorProps {
  datasetId?: string;
  columns?: string[];
  targetColumn?: string;
  onConfigChange?: (config: FeatureExtractionConfig) => void;
  initialConfig?: FeatureExtractionConfig;
  processedDatasetFromFeatureSelector?: {
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

export default function FeatureExtractor({
  datasetId,
  columns = [],
  targetColumn,
  onConfigChange,
  initialConfig,
  processedDatasetFromFeatureSelector,
  onProcessedDatasetReady,
}: FeatureExtractorProps) {
  const params = useParams();
  const id = params?.id as string || processedDatasetFromFeatureSelector?.datasetId || datasetId || "";

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<FeatureExtractionConfig>(
    initialConfig || {
      method: "pca",
      selectedMethods: [],
      nComponents: 2,
      columns: [],
      svdSolver: "auto",
      whiten: false,
      randomState: 42,
      tol: 0.0001,
      maxIter: 1000,
      nFactors: 2,
      rotation: "varimax",
    }
  );

  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    config.selectedMethods || []
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(config.columns || []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    methods: string[];
    columns: string[];
    executed: boolean;
    executedAt?: string;
    transformedData?: {
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
  const [fetchedColumns, setFetchedColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

  // Calculate available columns with priority
  const availableColumns = useMemo(() => {
    if (
      processedDatasetFromFeatureSelector?.data?.columns &&
      processedDatasetFromFeatureSelector.data.columns.length > 0
    ) {
      return processedDatasetFromFeatureSelector.data.columns;
    }
    if (columns.length > 0) {
      return columns;
    }
    if (fetchedColumns.length > 0) {
      return fetchedColumns;
    }
    return [];
  }, [
    processedDatasetFromFeatureSelector?.data?.columns,
    columns,
    fetchedColumns,
  ]);

  // Fetch dataset columns
  useEffect(() => {
    const fetchDatasetColumns = async () => {
      // Priority 1: Processed data from feature selector
      if (
        processedDatasetFromFeatureSelector?.data?.columns &&
        processedDatasetFromFeatureSelector.data.columns.length > 0
      ) {
        return;
      }

      // Priority 2: Columns from props
      if (columns.length > 0) {
        setFetchedColumns(columns);
        return;
      }

      // Priority 3: Fetch from API if datasetId exists
      if (!id && !datasetId) {
        setFetchedColumns([]);
        return;
      }

      setLoadingColumns(true);
      try {
        const datasetToUse = id || datasetId || "";
        if (!datasetToUse) {
          setFetchedColumns([]);
          return;
        }
        const response = await api.get<{ preview?: { columns: string[] } }>(
          `${API_ENDPOINTS.datasetsById(datasetToUse)}?page=1&pageSize=1&preview=true`
        );

        if (response.preview?.columns && response.preview.columns.length > 0) {
          const cleanedColumns = response.preview.columns.map((col: string) => 
            col.replace(/^"""|"""$/g, "").replace(/^"|"$/g, "").trim()
          );
          setFetchedColumns(cleanedColumns);
        } else {
          setFetchedColumns([]);
        }
      } catch (err) {
        console.error("Error fetching dataset columns:", err);
        setFetchedColumns([]);
      } finally {
        setLoadingColumns(false);
      }
    };

    fetchDatasetColumns();
  }, [id, datasetId, columns, processedDatasetFromFeatureSelector?.data?.columns]);

  useEffect(() => {
    const newConfig = {
      ...config,
      selectedMethods,
      columns: selectedColumns,
    };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [selectedMethods, selectedColumns]);

  const handleExecute = async () => {
    if (selectedMethods.length === 0) {
      toast.error("At least one extraction method must be selected");
      return;
    }

    const datasetToUse = processedDatasetFromFeatureSelector?.datasetId || id || datasetId;
    if (!datasetToUse) {
      toast.error("Dataset ID is required");
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Fetch original dataset preview for display
      const originalResponse: any = await api.get(
        `${API_ENDPOINTS.datasetsById(datasetToUse)}?page=1&pageSize=500&preview=true`
      );
      const originalData = originalResponse.data?.preview || originalResponse.preview || {
        columns: [],
        rows: [],
        totalRows: originalResponse.data?.totalRows || originalResponse.totalRows || 0,
      };

      // Prepare feature extraction configuration with method-specific parameters
      const method = selectedMethods[0] as 'pca' | 'lda' | 'ica' | 'svd' | 'factor_analysis';
      const featureExtractionConfig: any = {
        method,
        nComponents: config.nComponents || 2,
        columns: selectedColumns.length > 0 ? selectedColumns : undefined,
        targetColumn: config.targetColumn || targetColumn || undefined,
        randomState: config.randomState || 42,
      };

      // Add method-specific parameters
      if (method === "pca") {
        if (config.svdSolver) featureExtractionConfig.svdSolver = config.svdSolver;
        if (config.whiten !== undefined) featureExtractionConfig.whiten = config.whiten;
        if (config.tol !== undefined) featureExtractionConfig.tol = config.tol;
      } else if (method === "lda") {
        if (config.solver) featureExtractionConfig.solver = config.solver;
        if (config.shrinkage !== undefined) featureExtractionConfig.shrinkage = config.shrinkage;
      } else if (method === "ica") {
        if (config.algorithm) featureExtractionConfig.algorithm = config.algorithm;
        if (config.fun) featureExtractionConfig.fun = config.fun;
        if (config.maxIter) featureExtractionConfig.maxIter = config.maxIter;
        if (config.tol !== undefined) featureExtractionConfig.tol = config.tol;
      } else if (method === "svd") {
        if (config.svdSolver) featureExtractionConfig.svdSolver = config.svdSolver;
        if (config.nIter) featureExtractionConfig.nIter = config.nIter;
        if (config.tol !== undefined) featureExtractionConfig.tol = config.tol;
      } else if (method === "factor_analysis") {
        if (config.maxIter) featureExtractionConfig.maxIter = config.maxIter;
        if (config.tol !== undefined) featureExtractionConfig.tol = config.tol;
      } else if (method === "tsne") {
        if (config.perplexity !== undefined) featureExtractionConfig.perplexity = config.perplexity;
        if (config.earlyExaggeration !== undefined) featureExtractionConfig.earlyExaggeration = config.earlyExaggeration;
        if (config.learningRate) featureExtractionConfig.learningRate = config.learningRate;
      } else if (method === "umap") {
        if (config.nNeighbors) featureExtractionConfig.nNeighbors = config.nNeighbors;
        if (config.minDist !== undefined) featureExtractionConfig.minDist = config.minDist;
        if (config.metric) featureExtractionConfig.metric = config.metric;
      }

      // Call feature extraction API
      let featureExtractionResponse: any;
      try {
        featureExtractionResponse = await api.post(API_ENDPOINTS.preprocessing.featureExtraction, {
          dataset_id: datasetToUse,
          method: featureExtractionConfig.method,
          n_components: featureExtractionConfig.nComponents,
          columns: featureExtractionConfig.columns,
          target_column: featureExtractionConfig.targetColumn,
          random_state: featureExtractionConfig.randomState,
          svd_solver: featureExtractionConfig.svdSolver,
          whiten: featureExtractionConfig.whiten,
          tol: featureExtractionConfig.tol,
          solver: featureExtractionConfig.solver,
          shrinkage: featureExtractionConfig.shrinkage,
          algorithm: featureExtractionConfig.algorithm,
          fun: featureExtractionConfig.fun,
        });
        console.log("Feature extraction API response:", featureExtractionResponse);
      } catch (apiError: any) {
        console.error("API call failed:", apiError);
        const errorMessage = apiError?.message || apiError?.error || "Failed to connect to feature extraction service. Please try again.";
        throw new Error(errorMessage);
      }

      if (!featureExtractionResponse) {
        throw new Error("No response received from feature extraction service");
      }

      if (!featureExtractionResponse.success) {
        const errorMsg = featureExtractionResponse.error || featureExtractionResponse.message || "Feature extraction failed";
        throw new Error(errorMsg);
      }

      // Handle response structure
      const processedData = featureExtractionResponse.processedData?.data || featureExtractionResponse.processedData;

      if (!processedData || !processedData.columns) {
        console.error("Invalid processed data structure:", processedData);
        console.error("Full response:", featureExtractionResponse);
        throw new Error("No processed data received from feature extraction service. Invalid response structure.");
      }

      // Create the result object
      const result = {
        methods: selectedMethods,
        columns: processedData.columns || selectedColumns,
        executed: true,
        executedAt: new Date().toISOString(),
        transformedData: processedData,
        originalData: originalData,
      };

      console.log("Feature extraction result:", result);

      setExecutionResult(result);
      setStep(4); // Move to results step

      // Notify parent with processed data
      if (onProcessedDatasetReady) {
        onProcessedDatasetReady(datasetToUse, processedData);
      }

      toast.success("Feature extraction completed successfully!");

    } catch (err: any) {
      console.error("Error executing feature extraction:", err);
      const errorMessage = err?.message || err?.error || "Failed to execute feature extraction. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Feature Extraction & Dimensionality Reduction</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Transform your high-dimensional data into meaningful lower-dimensional representations
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
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <SelectMethods
            selectedMethods={selectedMethods}
            onMethodsChange={setSelectedMethods}
          />
        )}

        {/* Step 2: Select Columns */}
        {step === 2 && (
          <SelectColumns
            selectedColumns={selectedColumns}
            onColumnsChange={setSelectedColumns}
            datasetId={id}
            processedDatasetFromFeatureSelector={processedDatasetFromFeatureSelector}
          />
        )}

        {/* Step 3: Configure */}
        {step === 3 && (
          <Configure
            selectedMethods={selectedMethods}
            config={config}
            onConfigChange={setConfig}
            availableColumns={availableColumns}
            targetColumn={targetColumn}
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
            targetColumn={targetColumn}
            processedDatasetFromFeatureSelector={processedDatasetFromFeatureSelector}
          />
        )}
      </div>
    </div>
  );
}