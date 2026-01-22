"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play, CheckCircle2, Loader2,
  Sparkles, TrendingUp, Hash,
  Layers, Eye, Filter
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import { parse } from "csv-parse/sync";
import SelectMethods from "./mainui/SelectMethods";
import SelectColumns from "./mainui/SelectColumns";
import Configure from "./mainui/Configure";
import Result from "./mainui/Result";
import { ENCODING_METHODS } from "./data/encodingMethods";

export interface CategoricalEncodingConfig {
  method: "label" | "one_hot" | "ordinal" | "binary" | "frequency" | "target" | "count" | "hash" | "leave_one_out" | "woe" | string[];
  columns?: string[];
  handleUnknown?: "error" | "ignore" | "use_encoded_value";
  dropFirst?: boolean;
  targetColumn?: string;
  selectedMethods?: string[];
}

interface CategoricalEncoderProps {
  datasetId?: string;
  columns?: string[];
  targetColumn?: string;
  onConfigChange?: (config: CategoricalEncodingConfig) => void;
  initialConfig?: CategoricalEncodingConfig;
  onProcessedDatasetReady?: (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => void;
  onNext?: () => void;
  onPrev?: () => void;
  showNavigation?: boolean;
  processedDatasetFromDataCleaner?: {
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  };
}

interface ColumnStats {
  uniqueValues: number;
  cardinality: "High" | "Medium" | "Low";
  nullCount: number;
  sampleValues: string[];
}

interface EncodedDataResult {
  original: unknown[][];
  encoded: unknown[][];
  newColumns: string[];
  originalColumns?: string[];
}


export default function CategoricalEncoder({
  datasetId,
  columns = [],
  targetColumn,
  onConfigChange,
  initialConfig,
  onProcessedDatasetReady,
  onNext,
  onPrev,
  showNavigation,
  processedDatasetFromDataCleaner,
}: CategoricalEncoderProps) {
  // Debug logging
  console.log("CategoricalEncoder props:", {
    datasetId,
    columnsLength: columns.length,
    processedDatasetFromDataCleaner: processedDatasetFromDataCleaner ? "available" : "not available"
  });

  // State Management
  const [config, setConfig] = useState<CategoricalEncodingConfig>(
    initialConfig || {
      method: "label",
      columns: [],
      handleUnknown: "error",
      dropFirst: false,
      selectedMethods: [],
    }
  );

  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    config.selectedMethods || (config.method && typeof config.method === "string" ? [config.method] : [])
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [searchColumn, setSearchColumn] = useState("");
  const [activeTab, setActiveTab] = useState("methods");
  const [columnStats, setColumnStats] = useState<Record<string, ColumnStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [allRows, setAllRows] = useState<unknown[][]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  
  // Get available columns from processed dataset or props
  const availableColumns = useMemo(() => {
    if (processedDatasetFromDataCleaner?.data?.columns) {
      return processedDatasetFromDataCleaner.data.columns;
    }
    return columns.length > 0 ? columns : allColumns;
  }, [processedDatasetFromDataCleaner?.data?.columns, columns, allColumns]);

  // Filter selectedColumns to only include columns that exist in available columns
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    const initial = config.columns || [];
    // Filter to only include columns that exist in available columns
    // This will be updated when availableColumns changes
    return initial;
  });
  const [encodedData, setEncodedData] = useState<EncodedDataResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);


  // For categorical encoding, show all columns since encoding can be applied to any column type
  // Statistics will be shown for columns that have them calculated
  const categoricalColumns = useMemo(() => {
    if (!datasetId) return [];

    // Show all available columns - encoding can work on any column type
    const availableColumns = columns.length > 0 ? columns : allColumns;
    return availableColumns;
  }, [columns, allColumns, datasetId]);

  // Filtered columns based on search - memoized
  const filteredColumns = useMemo(() => {
    // Always prefer categoricalColumns if available, otherwise use allColumns or columns
    const baseColumns = categoricalColumns.length > 0 
      ? categoricalColumns 
      : (allColumns.length > 0 ? allColumns : columns);
    
    if (!searchColumn) return baseColumns;
    return baseColumns.filter(col =>
      col.toLowerCase().includes(searchColumn.toLowerCase())
    );
  }, [categoricalColumns, columns, allColumns, searchColumn]);

  // Calculate recommended methods based on selected columns
  const recommendedMethods = useMemo(() => {
    if (selectedColumns.length === 0) return [];
    
    const recommendations: string[] = [];
    const hasHighCardinality = selectedColumns.some(col => columnStats[col]?.cardinality === "High");
    const hasLowCardinality = selectedColumns.some(col => columnStats[col]?.cardinality === "Low");
    
    if (hasLowCardinality) {
      recommendations.push("one_hot");
    }
    if (hasHighCardinality) {
      recommendations.push("frequency", "target", "hash");
    }
    
    return recommendations;
  }, [selectedColumns, columnStats]);

  // Update selectedColumns when available columns change (e.g., after data cleaning)
  useEffect(() => {
    if (availableColumns.length > 0) {
      // Filter selectedColumns to only include columns that exist in available columns
      setSelectedColumns(prev => {
        const filtered = prev.filter(col => availableColumns.includes(col));
        // If all selected columns were removed, return empty array
        return filtered;
      });
    }
  }, [availableColumns]);

  // Fetch and calculate column statistics
  const fetchColumnStats = useCallback(async () => {
    console.log("fetchColumnStats called", { processedDatasetFromDataCleaner: !!processedDatasetFromDataCleaner?.data, datasetId });

    setStatsLoading(true);
    try {
      let fetchedColumns: string[] = [];
      let allRowsData: unknown[][] = [];

      // First, check if we have processed data available (from data cleaner, missing values, etc.)
      if (processedDatasetFromDataCleaner?.data) {
        console.log("Using processed data from data cleaner for stats");
        fetchedColumns = processedDatasetFromDataCleaner.data.columns;
        // Use only first 10000 rows for statistics calculation (sample)
        allRowsData = processedDatasetFromDataCleaner.data.rows.slice(0, 10000);
        setAllColumns(fetchedColumns);
        setAllRows(allRowsData);
      } else if (datasetId) {
        console.log("Fetching data from API for dataset:", datasetId);
        // Only fetch if processed data is not available
        // Use a small sample (first page only) for statistics
        const firstPage = await api.get<{ preview?: { totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=10000&preview=true`
        );

        if (!firstPage.preview) {
          console.log("No preview data returned from API");
          setStatsLoading(false);
          return;
        }

        const { columns: cols, rows: firstRows } = firstPage.preview;
        fetchedColumns = cols;

        // Set all columns from dataset if not already set
        setAllColumns(fetchedColumns);

        // Use only first page for statistics (sample of 10000 rows is enough)
        allRowsData = firstRows.slice(0, 10000);
        setAllRows(allRowsData);
        console.log("Fetched data from API:", { columns: fetchedColumns.length, rows: allRowsData.length });
      } else {
        console.log("No data source available for statistics");
        setStatsLoading(false);
        return;
      }

      // Calculate comprehensive statistics for all columns or specified columns
      // Always calculate stats for fetchedColumns to ensure all possible columns have stats
      const columnsToAnalyze = fetchedColumns;
      const stats: Record<string, ColumnStats> = {};

      console.log("Calculating stats for", columnsToAnalyze.length, "columns");

      columnsToAnalyze.forEach((columnName: string) => {
        const columnIndex = fetchedColumns.indexOf(columnName);
        if (columnIndex === -1) return;

        const values = allRowsData.map(row => row[columnIndex]);
        const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
        const uniqueValuesSet = new Set(nonNullValues);
        const uniqueCount = uniqueValuesSet.size;
        const nullCount = values.length - nonNullValues.length;
        
        // Determine cardinality with more nuanced thresholds
        let cardinality: "High" | "Medium" | "Low";
        const ratio = uniqueCount / (nonNullValues.length || 1);
        
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
  }, [datasetId, processedDatasetFromDataCleaner, columns, allColumns.length]);

  // Fetch and restore execution result from database on component load
  const hasFetchedRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  useEffect(() => {
    const fetchPreviousResult = async () => {
      if (!datasetId) return;

      // Skip if we've already fetched for this datasetId or are currently fetching
      if (hasFetchedRef.current === datasetId || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      
      try {
        // Fetch preprocessing steps for this dataset
        const steps = await api.get<Array<{
          id: number;
          dataset_id: string;
          step_type: string;
          step_name: string;
          config: any;
          output_path: string | null;
          status: string;
          created_at: string | null;
        }>>(API_ENDPOINTS.datasetPreprocessingSteps(datasetId));

        // Find the latest categorical_encoding preprocessing step
        const encodingStep = steps
          .filter(step => step.step_type === "categorical_encoding" && step.status === "completed")
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA; // Most recent first
          })[0];

        if (encodingStep) {
          console.log("[Categorical Encoding] Found previous encoding result:", encodingStep);

          // Restore execution result
          setExecutionResult({
            methods: encodingStep.config?.methods || [],
            columns: encodingStep.config?.columns || [],
            executed: true,
            timestamp: encodingStep.created_at || new Date().toISOString(),
            newColumns: encodingStep.config?.newColumns || [],
            mappings: encodingStep.config?.mappings || {},
            datasetAnalysis: encodingStep.config?.datasetAnalysis || null
          });

          // Try to fetch the processed data
          try {
            const processedData = await api.get<{ preview?: { totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number } }>(
              `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=10000&preview=true`
            );

            if (processedData.preview) {
              setAllColumns(processedData.preview.columns);
              setAllRows(processedData.preview.rows);
              setActiveTab("results");
            }
          } catch (dataError) {
            console.warn("Could not fetch processed data:", dataError);
          }

          // Show a toast to inform user that result was restored
          toast.success("Previous categorical encoding result restored", {
            description: `Completed on ${new Date(encodingStep.created_at || '').toLocaleString()}`,
            id: "encoding-result-restored"
          });
        }
        
        // Mark as fetched to prevent repeated calls
        hasFetchedRef.current = datasetId;
      } catch (error) {
        console.warn("Could not fetch previous encoding results:", error);
        // Mark as fetched even on error to prevent infinite retries
        hasFetchedRef.current = datasetId;
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchPreviousResult();
  }, [datasetId]);

  // Fetch column stats when component mounts or dataset changes
  useEffect(() => {
    const datasetToUse = processedDatasetFromDataCleaner?.datasetId || datasetId;

    if (!datasetToUse) {
      return;
    }

    // Reset stats when dataset changes
    setColumnStats({});
    setAllRows([]);
    setAllColumns([]);

    // Fetch stats for new dataset
    fetchColumnStats();
  }, [datasetId, processedDatasetFromDataCleaner?.datasetId, fetchColumnStats]);

  // Sync config changes to parent component (avoid setState during render)
  useEffect(() => {
    const newConfig: CategoricalEncodingConfig = {
      ...config,
      selectedMethods,
      columns: selectedColumns,
      method: selectedMethods.length > 0 ? (selectedMethods[0] as any) : config.method
    };
    setConfig(newConfig);
    // Use requestAnimationFrame to defer callback to next frame, avoiding setState during render
    requestAnimationFrame(() => {
      onConfigChange?.(newConfig);
    });
  }, [selectedMethods, selectedColumns]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle method toggle with optimized state updates
  const handleMethodToggle = useCallback((method: string) => {
    setSelectedMethods(prev => {
      const newMethods = prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method];
      return newMethods;
    });
  }, []);

  // Handle column toggle with optimized state updates
  const handleColumnToggle = useCallback((column: string) => {
    setSelectedColumns(prev => {
      const newColumns = prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column];
      return newColumns;
    });
  }, []);

  // Handle bulk column selection
  const handleSelectAllColumns = useCallback((checked: boolean) => {
    const availableColumns = categoricalColumns.length > 0 ? categoricalColumns : filteredColumns;
    if (checked) {
      setSelectedColumns([...availableColumns]);
    } else {
      setSelectedColumns([]);
    }
  }, [categoricalColumns, filteredColumns]);

  // Execute encoding
  const handleExecute = useCallback(async () => {
    if (selectedMethods.length === 0) {
      toast.error("Please select at least one encoding method");
      return;
    }

    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to encode");
      return;
    }

    const datasetToUse = processedDatasetFromDataCleaner?.datasetId || datasetId;
    if (!datasetToUse) {
      toast.error("Dataset ID is required");
      return;
    }

    setIsExecuting(true);
    const loadingToast = toast.loading("Processing categorical encoding...", { id: "encoding-processing" });
    
    try {
      // Fetch original dataset data BEFORE encoding - this is critical!
      // We need to get the TRUE original data for comparison
      let originalData: { columns: string[]; rows: unknown[][]; totalRows: number } | null = null;
      try {
        if (processedDatasetFromDataCleaner) {
          // Use the processed data from data cleaning as the "original" for encoding comparison
          // This ensures we compare the encoded result with what was actually fed into encoding
          originalData = {
            columns: [...processedDatasetFromDataCleaner.data.columns],
            rows: processedDatasetFromDataCleaner.data.rows.map(row =>
              row.map(cell => {
                // Deep copy each cell value
                if (cell === null || cell === undefined) return cell;
                // Return primitive values as-is, create new object/array if needed
                return typeof cell === 'object' ? JSON.parse(JSON.stringify(cell)) : cell;
              })
            ),
            totalRows: processedDatasetFromDataCleaner.data.totalRows
          };
        } else {
          // Fetch original dataset from API - get the actual original dataset
          const firstPage = await api.get<{ preview?: { totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number } }>(
            `${API_ENDPOINTS.datasetsById(datasetToUse)}?page=1&pageSize=10000&preview=true`
          );
          if (firstPage.preview) {
            // Deep copy to preserve original state
            originalData = {
              columns: [...firstPage.preview.columns],
              rows: firstPage.preview.rows.map(row =>
                row.map(cell => {
                  if (cell === null || cell === undefined) return cell;
                  return typeof cell === 'object' ? JSON.parse(JSON.stringify(cell)) : cell;
                })
              ),
              totalRows: firstPage.preview.totalRows
            };
          }
        }
      } catch (error) {
        console.warn("Could not fetch original data:", error);
      }

      // Process first method (backend supports one method at a time)
      const primaryMethod = selectedMethods[0];
      
      // Map frontend method names to backend method names
      const methodMap: Record<string, string> = {
        "label": "label",
        "one_hot": "onehot",
        "ordinal": "ordinal",
        "target": "target",
        "binary": "binary",
        "frequency": "frequency",
        "count": "count",
        "hash": "hash",
        "leave_one_out": "leave_one_out",
        "woe": "woe"
      };
      
      const backendMethod = methodMap[primaryMethod] || primaryMethod;
      
      // Validate that all selected columns exist in the processed dataset
      const datasetToUseForValidation = processedDatasetFromDataCleaner?.datasetId || datasetId;
      if (!datasetToUseForValidation) {
        toast.error("Dataset ID is required");
        setIsExecuting(false);
        toast.dismiss(loadingToast);
        return;
      }
      
      let actualColumns: string[] = [];
      if (processedDatasetFromDataCleaner?.data) {
        // Ensure columns is an array
        const cols = processedDatasetFromDataCleaner.data.columns;
        actualColumns = Array.isArray(cols) ? cols : [];
      } else {
        // Fetch current columns from dataset
        try {
          const preview = await api.get<{ columns?: string[]; preview?: { columns: string[] } }>(
            `${API_ENDPOINTS.datasetsById(datasetToUseForValidation)}?page=1&pageSize=1&preview=true`
          );
          // Handle different response structures
          if (preview.preview?.columns && Array.isArray(preview.preview.columns)) {
            actualColumns = preview.preview.columns;
          } else if (preview.columns && Array.isArray(preview.columns)) {
            actualColumns = preview.columns;
          }
        } catch (error) {
          console.warn('Could not fetch dataset columns for validation:', error);
        }
      }
      
      // Ensure actualColumns is always an array
      if (!Array.isArray(actualColumns)) {
        console.warn('actualColumns is not an array, defaulting to empty array');
        actualColumns = [];
      }
      
      // Filter selectedColumns to only include columns that actually exist
      const validSelectedColumns = selectedColumns.filter(col => actualColumns.includes(col));
      
      if (validSelectedColumns.length === 0) {
        toast.error("No valid columns selected. Please select columns that exist in the processed dataset.");
        setIsExecuting(false);
        toast.dismiss(loadingToast);
        return;
      }
      
      if (validSelectedColumns.length < selectedColumns.length) {
        const removedColumns = selectedColumns.filter(col => !actualColumns.includes(col));
        toast.warning(`Some selected columns were removed in previous steps: ${removedColumns.join(', ')}. Using available columns.`);
        setSelectedColumns(validSelectedColumns);
      }
      
      // Call backend API
      const response = await api.post<{
        success: boolean;
        processed_csv_content?: string;
        processedData?: {
          datasetId: string;
          data: {
            columns: string[];
            rows: unknown[][];
            totalRows: number;
          };
        };
        results?: Record<string, any>;
        message?: string;
        new_columns_created?: string[];
        original_rows?: number;
        original_columns?: number;
        processed_rows?: number;
        processed_columns?: number;
        encoded_columns?: string[];
        method?: string;
        mappings?: Record<string, any>;
        datasetAnalysis?: {
          categorical_columns: string[];
          numerical_columns: string[];
          mixed_columns: Array<{ column: string; type: string; [key: string]: any }>;
          dataset_type: string;
        } | null;
      }>(API_ENDPOINTS.preprocessing.categoricalEncoding, {
        dataset_id: datasetToUseForValidation,
        method: backendMethod,
        columns: validSelectedColumns,
        drop_first: config.dropFirst || false,
        handle_unknown: config.handleUnknown || "ignore",
        target_column: config.targetColumn || targetColumn || undefined,
        ordinal_mapping: undefined,
        n_features: backendMethod === "hash" ? 8 : undefined, // Default 8 features for hash encoding
      });

      if (!response.success) {
        throw new Error(response.message || 'Encoding failed');
      }

      // Parse CSV content from backend response
      let processedColumns: string[] = [];
      let processedRows: unknown[][] = [];

      if (response.processed_csv_content) {
        // Parse the CSV content returned by backend
        const parsedData = parse(response.processed_csv_content, {
          skip_empty_lines: true,
          from_line: 2, // Skip header row
        });

        // Extract columns from CSV content
        const csvLines = response.processed_csv_content.split('\n').filter(line => line.trim());
        if (csvLines.length > 0) {
          processedColumns = csvLines[0].split(',').map(col => col.trim());
          processedRows = parsedData.slice(0, 1000); // Limit to first 1000 rows for preview
        }
      } else if (response.processedData) {
        // Fallback for old response format
        processedColumns = response.processedData.data.columns;
        processedRows = response.processedData.data.rows;
      }

      const newColumnsCreated = response.new_columns_created || response.results?.[backendMethod]?.newColumnsCreated || [];

      // Separate original columns from new encoded columns
      const originalColumns = processedColumns.filter(col =>
        !newColumnsCreated.includes(col) && selectedColumns.some(selectedCol => col.startsWith(selectedCol))
      );
      const allColumnNames = [...processedColumns];

      setAllColumns(allColumnNames);
      setAllRows(processedRows);

      // Save processed data to dataset (like missing values handler)
      if (datasetId) {
        try {
          await api.put(`/api/datasets/${datasetId}/data`, {
            columns: processedColumns,
            rows: processedRows,
            totalRows: processedRows.length,
          });

          await api.put(API_ENDPOINTS.datasetsById(datasetId), {
            columns: processedColumns.length,
            rows: processedRows.length,
            updatedAt: new Date().toISOString(),
          });
        } catch (saveError) {
          console.error("Error saving encoded data:", saveError);
        }
      }

      // Store original and encoded data
      // CRITICAL: Use the originalData we fetched BEFORE encoding, not the processed data
      // The originalData was fetched before the encoding API call, so it contains true original values
      setEncodedData({
        original: originalData?.rows || processedRows, // Use fetched original data (before encoding)
        encoded: processedRows, // This is the encoded data from backend
        newColumns: newColumnsCreated,
        originalColumns: originalData?.columns || processedColumns // Use original columns
      });

      setExecutionResult({
        methods: [backendMethod], // Store the actual backend method that was executed
        columns: selectedColumns,
        executed: true,
        timestamp: new Date().toISOString(),
        newColumns: response.results?.[backendMethod]?.newColumnsCreated || [],
        mappings: response.results?.[backendMethod]?.mappings || {},
        datasetAnalysis: response.datasetAnalysis || null
      });

      // Notify parent component that dataset has been processed
      if (onProcessedDatasetReady) {
        onProcessedDatasetReady(datasetId || "", {
          columns: processedColumns,
          rows: processedRows,
          totalRows: processedRows.length
        });
      }

      setActiveTab("results");
      toast.success(response.message || "Encoding executed successfully!", { id: "encoding-processing" });
      
    } catch (error: any) {
      console.error("Failed to execute encoding", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to execute encoding";
      toast.error(errorMessage, { id: "encoding-processing" });
    } finally {
      setIsExecuting(false);
    }
  }, [selectedMethods, selectedColumns, datasetId, processedDatasetFromDataCleaner, config, targetColumn]);


  // Fetch and encode data (removed - not used, encoding is done via API)
  // This function was causing unnecessary API calls and is no longer needed
  // Encoding is now handled by the backend API in handleExecute

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Hash className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Categorical Encoding</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Transform categorical variables into numerical format
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {selectedMethods.length > 0 && (
                <div className="px-4 py-2 bg-violet-50 rounded-xl border border-violet-200">
                  <span className="text-sm font-medium text-violet-700">
                    {selectedMethods.length} method{selectedMethods.length > 1 ? 's' : ''} selected
                  </span>
                </div>
              )}
              <button
                onClick={handleExecute}
                disabled={isExecuting || selectedMethods.length === 0 || selectedColumns.length === 0}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isExecuting ? "Processing..." : "Execute"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Quick Stats */}
        {(selectedColumns.length > 0 || selectedMethods.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{selectedColumns.length}</p>
                  <p className="text-xs text-slate-500">Columns</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{selectedMethods.length}</p>
                  <p className="text-xs text-slate-500">Methods</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{executionResult ? "Done" : "Ready"}</p>
                  <p className="text-xs text-slate-500">Status</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {Object.values(columnStats).filter(s => s.cardinality === "High").length}
                  </p>
                  <p className="text-xs text-slate-500">High Cardinality</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-1.5">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-50 rounded-xl">
              <TabsTrigger value="methods" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Sparkles className="h-4 w-4" />
                Encoding Methods
              </TabsTrigger>
              <TabsTrigger value="columns" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Filter className="h-4 w-4" />
                Column Selection
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled={!executionResult}>
                <Eye className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Methods Tab */}
          <TabsContent value="methods" className="space-y-6">
            <SelectMethods
              selectedMethods={selectedMethods}
              onMethodsChange={setSelectedMethods}
            />
            <Configure
              config={config}
              selectedMethods={selectedMethods}
              targetColumn={targetColumn}
              onConfigChange={(newConfig) => {
                        setConfig(newConfig);
                        onConfigChange?.(newConfig);
                      }}
            />
          </TabsContent>

          {/* Columns Tab */}
          <TabsContent value="columns" className="space-y-6">
            <SelectColumns
              selectedColumns={selectedColumns}
              onColumnsChange={setSelectedColumns}
              categoricalColumns={categoricalColumns}
              filteredColumns={filteredColumns}
              columnStats={columnStats}
              statsLoading={statsLoading}
              searchColumn={searchColumn}
              onSearchChange={setSearchColumn}
            />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Result
              executionResult={executionResult}
              encodedData={encodedData}
              allColumns={allColumns}
              datasetId={datasetId}
              selectedMethods={selectedMethods}
              selectedColumns={selectedColumns}
              previewLoading={previewLoading}
              isExecuting={isExecuting}
              onExecute={handleExecute}
            />
          </TabsContent>
        </Tabs>

      </div>


    </div>
  );
}