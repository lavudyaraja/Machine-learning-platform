"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, Database, Settings, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { useDatasetDetail } from "@/hooks/useDataset";
import { validateDatasetId } from "@/utils/datasetValidation";
import { validateAndHandleDataset } from "@/utils/datasetUtils";
import { usePreprocessingStateRestoration } from "@/hooks/usePreprocessingStateRestoration";
import { MissingValueConfig, MissingValueHandlerProps, ExecutionResult } from "./types";
import { METHODS, STATISTICAL_METHODS, SPECIAL_METHODS } from "./constants";

// Import modular components
import { SelectColumnsTab } from "./components/SelectColumnsTab";
import { ConfigureTab } from "./components/ConfigureTab";
import ResultsTab from "./components/ResultsTab";
import { Dialogs } from "./components/Dialogs";

export type { MissingValueConfig };

export default function MissingValueHandler({
  datasetId,
  columns = [],
  onConfigChange,
  initialConfig,
  validationResults,
  onProcessedDatasetReady,
  onNext,
  onPrev,
  showNavigation = false,
}: MissingValueHandlerProps) {
  console.log(`[MissingValueHandler] Component initialized with datasetId: ${datasetId}, columns: ${columns.length}`);
  
  // State management
  const [config, setConfig] = useState<MissingValueConfig>(
    initialConfig || {
      method: "mean",
      columns: [],
      threshold: 0.5,
      selectedMethods: [],
    }
  );

  const [selectedColumns, setSelectedColumns] = useState<string[]>(config.columns || []);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    config.selectedMethods || (config.method && typeof config.method === "string" ? [config.method] : [])
  );
  const [constantValue, setConstantValue] = useState<string>(config.constantValue?.toString() || "");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [fetchedColumns, setFetchedColumns] = useState<string[]>([]);
  const isFetchingColumns = useRef(false);
  const isMounted = useRef(false);

  // Dataset state
  const [allRows, setAllRows] = useState<unknown[][]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  
  // Statistics state
  const [meanResults, setMeanResults] = useState<Record<string, number>>({});
  const [medianResults, setMedianResults] = useState<Record<string, number>>({});
  const [modeResults, setModeResults] = useState<Record<string, number | string>>({});
  const [stdResults, setStdResults] = useState<Record<string, number>>({});
  const [varianceResults, setVarianceResults] = useState<Record<string, number>>({});
  const [q1Results, setQ1Results] = useState<Record<string, number>>({});
  const [q2Results, setQ2Results] = useState<Record<string, number>>({});
  const [q3Results, setQ3Results] = useState<Record<string, number>>({});
  
  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeTab, setActiveTab] = useState<"select-columns" | "configure" | "results">("select-columns");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [datasetDownloadDialogOpen, setDatasetDownloadDialogOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [selectedMethodForTooltip, setSelectedMethodForTooltip] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Missing values state
  const [missingValuesInfo, setMissingValuesInfo] = useState<Record<string, { count: number; percentage: number }>>({});
  const [columnsWithMissingValues, setColumnsWithMissingValues] = useState<string[]>([]);
  
  const { dataset } = useDatasetDetail(datasetId || "");
  const methods = METHODS;

  // Fetch columns if not provided
  useEffect(() => {
    // Mark component as mounted
    isMounted.current = true;
    
    const fetchColumns = async () => {
      if (!datasetId || columns.length > 0 || isFetchingColumns.current || !isMounted.current) {
        setFetchedColumns(columns);
        return;
      }

      isFetchingColumns.current = true;
      
      try {
        const firstPage = await api.get<{ preview?: { columns: string[] } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=1&preview=true`
        );
        if (firstPage.preview?.columns && isMounted.current) {
          setFetchedColumns(firstPage.preview.columns);
        }
      } catch (error) {
        if (isMounted.current) {
          console.error("Error fetching columns:", error);
        }
      } finally {
        if (isMounted.current) {
          isFetchingColumns.current = false;
        }
      }
    };

    fetchColumns();
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
    };
  }, [datasetId, columns]);

  // Detect missing values in dataset
  const hasValidatedRef = useRef<string | null>(null);
  
  useEffect(() => {
    const detectMissingValues = async () => {
      if (!datasetId || fetchedColumns.length === 0) {
        return;
      }

      // Only validate once per datasetId to prevent infinite loops
      // The dataset validation is already done in useDatasetDetail hook
      if (hasValidatedRef.current !== datasetId) {
        hasValidatedRef.current = datasetId;
      }

      // Use validation results if available
      if (validationResults && validationResults.missingDataChecks) {
        const missingInfo: Record<string, { count: number; percentage: number }> = {};
        const colsWithMissing: string[] = [];
        
        validationResults.missingDataChecks.forEach(check => {
          if (check.column && check.missingCount !== undefined && check.missingPercentage !== undefined) {
            missingInfo[check.column] = {
              count: check.missingCount,
              percentage: check.missingPercentage
            };
            if (check.missingCount > 0) {
              colsWithMissing.push(check.column);
            }
          }
        });

        setMissingValuesInfo(missingInfo);
        setColumnsWithMissingValues(colsWithMissing);
        return;
      }

      // Otherwise fetch from dataset
      try {
        const firstPage = await api.get<{ preview?: { totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=10000&preview=true`
        );

        if (!firstPage.preview) return;

        const { totalRows, columns: datasetCols, rows: firstRows } = firstPage.preview;

        // Use only first page (up to 10k rows) as sample to avoid heavy API loops
        const allRowsData: unknown[][] = firstRows.slice(0, 10000);

        const missingInfo: Record<string, { count: number; percentage: number }> = {};
        const colsWithMissing: string[] = [];

        datasetCols.forEach((colName, colIdx) => {
          let missingCount = 0;

          allRowsData.forEach(row => {
            const value = row[colIdx];
            if (value === null || value === undefined || value === '' || 
                (typeof value === 'string' && (value.toLowerCase() === 'nan' || value.toLowerCase() === 'null'))) {
              missingCount++;
            }
          });

          if (missingCount > 0) {
            const percentage = (missingCount / totalRows) * 100;
            missingInfo[colName] = { count: missingCount, percentage };
            colsWithMissing.push(colName);
          }
        });

        setMissingValuesInfo(missingInfo);
        setColumnsWithMissingValues(colsWithMissing);
      } catch (error) {
        console.error("Error detecting missing values:", error);
      }
    };

    detectMissingValues();
  }, [datasetId, fetchedColumns, validationResults]);

  // Use the state restoration hook
  usePreprocessingStateRestoration(
    datasetId || "",
    "missing_values",
    async (step, stepConfig, executionResult) => {
      // Set execution result first
      setExecutionResult(executionResult);

      // Restore config state
      if (stepConfig.method) {
        const method = stepConfig.method || "mean";
        const methodsArray = Array.isArray(method) ? method : [method];
        
        setSelectedMethods(methodsArray);
        setConfig(prev => ({
          ...prev,
          method: method,
          columns: stepConfig.columns || [],
          constantValue: stepConfig.constant_value,
          threshold: stepConfig.threshold || 0.5,
        }));
      }

      // Restore constant value if it exists
      if (stepConfig.constant_value !== undefined) {
        setConstantValue(stepConfig.constant_value.toString());
      }

      // Auto-switch to results tab since we have a completed execution
      setActiveTab("results");

      // Load preview data if output file exists
      if (step.output_path && datasetId) {
        try {
          // Validate dataset ID before making the API call
          if (!datasetId || datasetId.trim() === '') {
            console.warn("[Missing Values] Invalid dataset ID provided for preview");
            return;
          }

          const previewUrl = API_ENDPOINTS.datasetPreview(datasetId, 1, 100);
          console.log(`[Missing Values] Loading preview from: ${previewUrl}`);
          
          const preview = await api.get<{
            columns: string[];
            rows: unknown[][];
            totalRows: number;
          }>(previewUrl);

          if (preview && preview.columns && preview.rows) {
            setAllColumns(preview.columns);
            setAllRows(preview.rows);
            setTotalRows(preview.totalRows);
            console.log(`[Missing Values] Preview loaded successfully: ${preview.columns.length} columns, ${preview.totalRows} rows`);
          }
        } catch (previewError) {
          console.error("[Missing Values] Could not load preview data:", previewError);
          // Don't throw the error, just log it and continue
          // This prevents the entire component from failing if preview is unavailable
        }
      }
    }
  );

  // Continue in Part 2...
  // Continuation of MissingValueHandler.tsx

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "imputation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-700";
      case "deletion":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-2 border-red-300 dark:border-red-700";
      case "statistical":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-2 border-green-300 dark:border-green-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-700";
    }
  };

  const handleMethodToggle = (method: string) => {
    if (method === "all") {
      const allMethodValues = methods
        .map((m) => m.value)
        .filter((m) => !SPECIAL_METHODS.includes(m));
      setSelectedMethods(allMethodValues);
      const newConfig: MissingValueConfig = {
        ...config,
        selectedMethods: allMethodValues,
        method: allMethodValues[0] as MissingValueConfig["method"]
      };
      setConfig(newConfig);
      onConfigChange?.(newConfig);
      return;
    }

    const isSpecialMethod = SPECIAL_METHODS.includes(method);

    if (isSpecialMethod) {
      setSelectedMethods([method]);
      const newConfig: MissingValueConfig = {
        ...config,
        selectedMethods: [method],
        method: method as MissingValueConfig["method"]
      };
      setConfig(newConfig);
      onConfigChange?.(newConfig);
      return;
    }

    const currentSpecialMethods = selectedMethods.filter((m) => SPECIAL_METHODS.includes(m));
    let newMethods: string[];

    if (currentSpecialMethods.length > 0) {
      newMethods = [method];
    } else {
      newMethods = selectedMethods.includes(method)
        ? selectedMethods.filter((m) => m !== method)
        : [...selectedMethods, method];
    }

    setSelectedMethods(newMethods);
    const newConfig: MissingValueConfig = {
      ...config,
      selectedMethods: newMethods,
      method: newMethods.length > 0 ? (newMethods[0] as MissingValueConfig["method"]) : config.method
    };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    if (selectedMethods.includes("constant") && !constantValue.trim()) {
      newErrors.constant = "Constant value is required when using constant method";
    }

    if (selectedMethods.length === 0) {
      newErrors.methods = "Please select at least one handling method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleColumnToggle = (column: string) => {
    const newColumns = selectedColumns.includes(column)
      ? selectedColumns.filter((c) => c !== column)
      : [...selectedColumns, column];
    setSelectedColumns(newColumns);
    const newConfig = { ...config, columns: newColumns };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleSelectAllColumns = () => {
    const newColumns = selectedColumns.length === fetchedColumns.length ? [] : [...fetchedColumns];
    setSelectedColumns(newColumns);
    const newConfig = { ...config, columns: newColumns };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleConstantValueChange = (value: string) => {
    setConstantValue(value);
    const numValue = Number(value);
    const newConfig = {
      ...config,
      constantValue: isNaN(numValue) ? value : numValue,
    };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleExecute = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsExecuting(true);

    const cols = selectedColumns.length > 0 ? selectedColumns : [];
    const methodsToExecute = selectedMethods.length > 0 ? selectedMethods : (config.method && typeof config.method === "string" ? [config.method] : []);

    if (methodsToExecute.length === 0) {
      toast.error("Please select at least one handling method");
      setIsExecuting(false);
      return;
    }

    // Process first method (backend supports one method at a time)
    const primaryMethod = methodsToExecute[0];
    let constantValueUsed: string | number | undefined = undefined;

    if (primaryMethod === "constant") {
      constantValueUsed = constantValue.trim() || config.constantValue;
    }

    if (!datasetId) {
      toast.error("Dataset ID is required");
      setIsExecuting(false);
      return;
    }

    // Validate dataset exists before proceeding
    const isValidDataset = await validateAndHandleDataset(datasetId || "");
    if (!isValidDataset) {
      setIsExecuting(false);
      return;
    }

    toast.loading("Processing dataset and applying missing value handling...", { id: "missing-value-processing" });

    try {
      // Call backend API
      const response = await api.post<{
        success: boolean;
        error?: string;
        details?: string;
        processedData?: {
          datasetId: string;
          data: {
            columns: string[];
            rows: unknown[][];
            totalRows: number;
          };
        };
        metrics?: {
          originalRows: number;
          originalColumns: number;
          processedRows: number;
          processedColumns: number;
          missing_counts_before?: Record<string, number>;
        };
        statistics?: Record<string, {
          mean?: number;
          median?: number;
          mode?: number | string;
          std?: number;
          variance?: number;
          q1?: number;
          q2?: number;
          q3?: number;
        }>;
        message?: string;
      }>(API_ENDPOINTS.preprocessing.missingValues, {
        dataset_id: datasetId,
        method: primaryMethod,
        columns: cols,
        constant_value: constantValueUsed,
        threshold: config.threshold,
      });

      if (!response.success) {
        const errorMsg = response.error || response.message || 'Processing failed';
        const errorDetails = response.details ? ` ${response.details}` : '';
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      // Extract statistics from backend response
      const backendStats = response.statistics || {};
      const meanRes: Record<string, number> = {};
      const medianRes: Record<string, number> = {};
      const modeRes: Record<string, number | string> = {};
      const stdRes: Record<string, number> = {};
      const varianceRes: Record<string, number> = {};
      const q1Res: Record<string, number> = {};
      const q2Res: Record<string, number> = {};
      const q3Res: Record<string, number> = {};

      // Populate statistics from backend
      Object.entries(backendStats).forEach(([col, stats]) => {
        if (stats?.mean !== null && stats?.mean !== undefined) meanRes[col] = stats.mean;
        if (stats?.median !== null && stats?.median !== undefined) medianRes[col] = stats.median;
        if (stats?.mode !== null && stats?.mode !== undefined) modeRes[col] = stats.mode;
        if (stats?.std !== null && stats?.std !== undefined) stdRes[col] = stats.std;
        if (stats?.variance !== null && stats?.variance !== undefined) varianceRes[col] = stats.variance;
        if (stats?.q1 !== null && stats?.q1 !== undefined) q1Res[col] = stats.q1;
        if (stats?.q2 !== null && stats?.q2 !== undefined) q2Res[col] = stats.q2;
        if (stats?.q3 !== null && stats?.q3 !== undefined) q3Res[col] = stats.q3;
      });

      setMeanResults(meanRes);
      setMedianResults(medianRes);
      setModeResults(modeRes);
      setStdResults(stdRes);
      setVarianceResults(varianceRes);
      setQ1Results(q1Res);
      setQ2Results(q2Res);
      setQ3Results(q3Res);

      // Update dataset state
      if (response.processedData) {
        setAllRows(response.processedData.data.rows);
        setAllColumns(response.processedData.data.columns);
        setTotalRows(response.processedData.data.totalRows);
      }

      // Update missing values info
      const missingInfo: Record<string, { count: number; percentage: number }> = {};
      const metrics = response.metrics;
      const missingBefore = metrics?.missing_counts_before || {};
      const totalRowsCount = metrics?.originalRows || 0;

      Object.entries(missingBefore).forEach(([col, count]) => {
        const countNum = typeof count === 'number' ? count : 0;
        missingInfo[col] = {
          count: countNum,
          percentage: totalRowsCount > 0 ? (countNum / totalRowsCount) * 100 : 0,
        };
      });

      setMissingValuesInfo(missingInfo);
      setColumnsWithMissingValues(Object.keys(missingInfo).filter(col => missingInfo[col].count > 0));

      setExecutionResult({
        methods: methodsToExecute,
        columns: cols,
        executed: true,
        executedAt: new Date().toISOString(),
        droppedRows: primaryMethod === "drop_rows" && metrics ? (metrics.originalRows - metrics.processedRows) : undefined,
        droppedColumns: primaryMethod === "drop_columns" && metrics ? (metrics.originalColumns - metrics.processedColumns) : undefined,
        constantValueUsed: primaryMethod === "constant" ? constantValueUsed : undefined,
      });

      setActiveTab("results");

      // Notify parent component
      if (onProcessedDatasetReady && response.processedData) {
        onProcessedDatasetReady(response.processedData.datasetId, {
          columns: response.processedData.data.columns,
          rows: response.processedData.data.rows,
          totalRows: response.processedData.data.totalRows,
        });
      }

      const methodLabels = methodsToExecute.map((m) => methods.find((method) => method.value === m)?.label || m).join(", ");
      toast.success(
        `Applied ${methodLabels}. Dataset processed successfully.`,
        { id: "missing-value-processing", duration: 5000 }
      );
    } catch (error: any) {
      console.error("Error executing preprocessing step:", error);
      
      // Extract error message from different error formats
      let errorMessage = "Failed to execute preprocessing step. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += `: ${error.response.data.details}`;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Provide helpful message for connection errors
      if (errorMessage.includes('Cannot connect') || errorMessage.includes('not found') || errorMessage.includes('FastAPI')) {
        errorMessage += " Make sure the FastAPI backend server is running.";
      }
      
      toast.error(errorMessage, { id: "missing-value-processing", duration: 7000 });
      setExecutionResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  // Continue in Part 3 for download handlers and render...
  // Continuation of MissingValueHandler.tsx - Download handlers and render

  const handleDownloadReportPDF = () => {
    if (!executionResult) {
      toast.error('No results available to download');
      return;
    }

    try {
      const { downloadReportAsPDF } = require('./utils/reportDownload');
      downloadReportAsPDF({
        datasetName: dataset?.name || dataset?.filename || 'Dataset',
        executionResult,
        statistics: {
          mean: meanResults,
          median: medianResults,
          mode: modeResults,
          std: stdResults,
          variance: varianceResults,
          q1: q1Results,
          q2: q2Results,
          q3: q3Results,
        },
        missingValuesInfo,
      });
      setDownloadDialogOpen(false);
      toast.success('Report downloaded as PDF successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF report');
    }
  };

  const handleDownloadReportExcel = () => {
    if (!executionResult) {
      toast.error('No results available to download');
      return;
    }

    try {
      const { downloadReportAsExcel } = require('./utils/reportDownload');
      downloadReportAsExcel({
        datasetName: dataset?.name || dataset?.filename || 'Dataset',
        executionResult,
        statistics: {
          mean: meanResults,
          median: medianResults,
          mode: modeResults,
          std: stdResults,
          variance: varianceResults,
          q1: q1Results,
          q2: q2Results,
          q3: q3Results,
        },
        missingValuesInfo,
      });
      setDownloadDialogOpen(false);
      toast.success('Report downloaded as Excel successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel report');
    }
  };

  const handleDownloadReportCSV = () => {
    if (!executionResult) {
      toast.error('No results available to download');
      return;
    }

    try {
      const { downloadReportAsCSV } = require('./utils/reportDownload');
      downloadReportAsCSV({
        datasetName: dataset?.name || dataset?.filename || 'Dataset',
        executionResult,
        statistics: {
          mean: meanResults,
          median: medianResults,
          mode: modeResults,
          std: stdResults,
          variance: varianceResults,
          q1: q1Results,
          q2: q2Results,
          q3: q3Results,
        },
        missingValuesInfo,
      });
      setDownloadDialogOpen(false);
      toast.success('Report downloaded as CSV successfully');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV report');
    }
  };

  const handleDownloadDatasetCSV = () => {
    if (!allRows.length || !allColumns.length) {
      toast.error('No dataset available to download');
      return;
    }

    try {
      const { downloadDatasetAsCSV } = require('./utils/reportDownload');
      downloadDatasetAsCSV({
        columns: allColumns,
        rows: allRows,
        statistics: {
          mean: meanResults,
          median: medianResults,
          mode: modeResults,
          std: stdResults,
          variance: varianceResults,
          q1: q1Results,
          q2: q2Results,
          q3: q3Results,
        },
      });
      setDatasetDownloadDialogOpen(false);
      toast.success('Dataset downloaded as CSV successfully');
    } catch (error) {
      console.error('Error downloading dataset CSV:', error);
      toast.error('Failed to download dataset CSV');
    }
  };

  const handleDownloadDatasetExcel = () => {
    if (!allRows.length || !allColumns.length) {
      toast.error('No dataset available to download');
      return;
    }

    try {
      const { downloadDatasetAsExcel } = require('./utils/reportDownload');
      downloadDatasetAsExcel({
        columns: allColumns,
        rows: allRows,
        statistics: {
          mean: meanResults,
          median: medianResults,
          mode: modeResults,
          std: stdResults,
          variance: varianceResults,
          q1: q1Results,
          q2: q2Results,
          q3: q3Results,
        },
      });
      setDatasetDownloadDialogOpen(false);
      toast.success('Dataset downloaded as Excel successfully');
    } catch (error) {
      console.error('Error downloading dataset Excel:', error);
      toast.error('Failed to download dataset Excel');
    }
  };

  const handleOpenTooltip = (methodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMethodForTooltip(methodId);
    setTooltipOpen(true);
  };

  const handleCloseTooltip = () => {
    setTooltipOpen(false);
    setSelectedMethodForTooltip(null);
    setCopiedCode(false);
  };

  const handleCopyMethodCode = () => {
    if (selectedMethodForTooltip) {
      const { missingValueData } = require("./missingValueData");
      const methodInfo = missingValueData.find((m: any) => m.id === selectedMethodForTooltip);
      if (methodInfo) {
        navigator.clipboard.writeText(methodInfo.implementationInsight);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Missing Value Handler</h1>
                <p className="text-gray-600 dark:text-gray-400 text-base">Choose how to handle missing values in your dataset</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleExecute}
                  disabled={isExecuting || selectedMethods.length === 0}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  size="default"
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isExecuting ? "Processing..." : "Execute"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8 items-center">
              <button
                onClick={() => setActiveTab("select-columns")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "select-columns"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-500"
                }`}
              >
                <Database className="h-4 w-4 inline-block mr-2" />
                Select Columns
                {selectedColumns.length > 0 && (
                  <Badge className="ml-2 bg-indigo-600 text-white border-0 rounded-full">
                    {selectedColumns.length}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab("configure")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "configure"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-500"
                }`}
              >
                <Settings className="h-4 w-4 inline-block mr-2" />
                Configuration
              </button>
              <button
                onClick={() => executionResult && setActiveTab("results")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "results"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-500"
                } ${!executionResult ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!executionResult}
              >
                <TrendingUp className="h-4 w-4 inline-block mr-2" />
                Results {executionResult && (
                  <Badge className="ml-2 bg-emerald-600 text-white border-0 rounded-full">
                    {executionResult.executed ? "Saved" : "New"}
                  </Badge>
                )}
              </button>

              {/* Missing Values Info */}
              <div className="flex-1 flex items-center justify-end gap-4">
                {columnsWithMissingValues.length > 0 && (
                  <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/30">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">{columnsWithMissingValues.length}</span> columns with missing values
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {activeTab === "select-columns" && (
              <SelectColumnsTab
                fetchedColumns={fetchedColumns}
                selectedColumns={selectedColumns}
                columnsWithMissingValues={columnsWithMissingValues}
                missingValuesInfo={missingValuesInfo}
                onColumnToggle={handleColumnToggle}
                onSelectAll={handleSelectAllColumns}
                onProceedToConfiguration={() => setActiveTab("configure")}
              />
            )}

            {activeTab === "configure" && (
              <ConfigureTab
                methods={methods}
                selectedMethods={selectedMethods}
                selectedColumns={selectedColumns}
                fetchedColumns={fetchedColumns}
                constantValue={constantValue}
                errors={errors}
                onMethodToggle={handleMethodToggle}
                onConstantValueChange={handleConstantValueChange}
                onBackToSelection={() => setActiveTab("select-columns")}
                onOpenTooltip={handleOpenTooltip}
              />
            )}

            {activeTab === "results" && executionResult ? (
              <ResultsTab
                executionResult={executionResult}
                methods={methods}
                allRows={allRows}
                allColumns={allColumns}
                currentPage={currentPage}
                pageSize={pageSize}
                meanResults={meanResults}
                medianResults={medianResults}
                modeResults={modeResults}
                stdResults={stdResults}
                varianceResults={varianceResults}
                q1Results={q1Results}
                q2Results={q2Results}
                q3Results={q3Results}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            ) : activeTab === "results" && !executionResult ? (
              <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Results Available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Execute missing value handling to see results here.
                </p>
                <Button
                  onClick={() => setActiveTab("configure")}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Go to Configure Tab
                </Button>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* All Dialogs */}
      <Dialogs
        downloadDialogOpen={downloadDialogOpen}
        onDownloadDialogChange={setDownloadDialogOpen}
        onDownloadReportPDF={handleDownloadReportPDF}
        onDownloadReportExcel={handleDownloadReportExcel}
        onDownloadReportCSV={handleDownloadReportCSV}
        datasetDownloadDialogOpen={datasetDownloadDialogOpen}
        onDatasetDownloadDialogChange={setDatasetDownloadDialogOpen}
        onDownloadDatasetCSV={handleDownloadDatasetCSV}
        onDownloadDatasetExcel={handleDownloadDatasetExcel}
        tooltipOpen={tooltipOpen}
        selectedMethodForTooltip={selectedMethodForTooltip}
        copiedCode={copiedCode}
        onTooltipChange={handleCloseTooltip}
        onCopyMethodCode={handleCopyMethodCode}
        getCategoryColor={getCategoryColor}
      />
    </>
  );
}