"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUpDown, Search, Database, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";

interface ColumnStats {
  uniqueValues: number;
  cardinality: "High" | "Medium" | "Low";
  nullCount: number;
  sampleValues: string[];
}

interface SelectColumnsProps {
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  datasetId?: string;
  processedDatasetFromFeatureSelector?: {
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  };
}

export default function SelectColumns({
  selectedColumns,
  onColumnsChange,
  datasetId,
  processedDatasetFromFeatureSelector,
}: SelectColumnsProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [columnStats, setColumnStats] = useState<Record<string, ColumnStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  const filteredColumns = useMemo(() => {
    return columns.filter(col =>
      col.toLowerCase().includes(columnSearch.toLowerCase())
    ).sort((a, b) => {
      return sortOrder === "asc"
        ? a.localeCompare(b)
        : b.localeCompare(a);
    });
  }, [columns, columnSearch, sortOrder]);

  useEffect(() => {
    const fetchColumns = async () => {
      if (processedDatasetFromFeatureSelector) {
        setColumns(processedDatasetFromFeatureSelector.data.columns);
        return;
      }

      if (!datasetId) return;

      setLoading(true);
      try {
        const response = await api.get<{ preview?: { columns: string[] } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=1&preview=true`
        );

        if (response.preview?.columns) {
          setColumns(response.preview.columns);
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
        toast.error("Failed to load dataset columns");
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [datasetId, processedDatasetFromFeatureSelector]);

  // Fetch column statistics
  const fetchColumnStats = useCallback(async () => {
    const datasetToUse = processedDatasetFromFeatureSelector?.datasetId || datasetId;
    if (!datasetToUse || columns.length === 0) {
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
      const stats: Record<string, ColumnStats> = {};
      
      columns.forEach((columnName: string) => {
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
  }, [datasetId, processedDatasetFromFeatureSelector?.datasetId, columns]);

  // Fetch column stats when columns change
  useEffect(() => {
    if (columns.length > 0) {
      fetchColumnStats();
    }
  }, [columns.length, fetchColumnStats]);

  const handleColumnToggle = (column: string) => {
    const newColumns = selectedColumns.includes(column)
      ? selectedColumns.filter((c) => c !== column)
      : [...selectedColumns, column];
    onColumnsChange(newColumns);
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === filteredColumns.length) {
      onColumnsChange([]);
    } else {
      onColumnsChange(filteredColumns);
    }
  };

  const isAllSelected = filteredColumns.length > 0 && selectedColumns.length === filteredColumns.length;


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500">Loading columns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Features for Extraction</h2>
        <p className="text-slate-500">
          Choose which columns to include in the feature extraction process
        </p>
      </div>

      {/* Column Selection */}
      {columns.length > 0 ? (
        <div className="space-y-4">
          {/* Search, Sort, and Select All */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search columns..."
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                className="pl-10 rounded-xl border-slate-200"
              />
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </button>
            <button
              onClick={handleSelectAll}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isAllSelected
                  ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200 hover:from-red-200 hover:to-rose-200"
                  : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 hover:from-emerald-200 hover:to-teal-200"
              }`}
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {selectedColumns.length} of {filteredColumns.length} columns selected
              </span>
            </div>
            {selectedColumns.length > 0 && (
              <button
                onClick={() => onColumnsChange([])}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Column Grid - Scrollable */}
          <div className="bg-gradient-to-br from-slate-50/30 to-slate-100/20 rounded-xl p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredColumns.map((column) => {
                const isSelected = selectedColumns.includes(column);
                const stats = columnStats[column];
                return (
                  <button
                    key={column}
                    onClick={() => handleColumnToggle(column)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-2 border-emerald-300 shadow-sm"
                        : "bg-white/60 text-slate-700 border border-slate-200/50 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <span className={`font-medium text-sm truncate ${isSelected ? "text-emerald-900" : "text-slate-900"}`}>
                        {column}
                      </span>
                      {stats ? (
                        <div className="flex flex-wrap gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            isSelected ? "text-blue-600 bg-blue-50" : "text-blue-500 bg-blue-50"
                          }`}>
                            {stats.uniqueValues} unique
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            stats.cardinality === "High" ? "text-rose-600 bg-rose-100" : 
                            stats.cardinality === "Medium" ? "text-amber-600 bg-amber-100" : 
                            "text-emerald-600 bg-emerald-100"
                          }`}>
                            {stats.cardinality}
                          </span>
                          {stats.nullCount > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              isSelected ? "text-orange-600 bg-orange-50" : "text-orange-500 bg-orange-50"
                            }`}>
                              {stats.nullCount} null
                            </span>
                          )}
                        </div>
                      ) : statsLoading ? (
                        <span className="text-xs text-slate-400">Loading...</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredColumns.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No columns match your search</p>
              </div>
            )}
          </div>

          {/* Selected Columns Tags */}
          {selectedColumns.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Selected Columns
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedColumns.map((col) => (
                  <span
                    key={col}
                    className="text-xs font-medium text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 rounded-lg border border-emerald-200/60"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          {selectedColumns.length === 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    No columns selected
                  </p>
                  <p className="text-sm text-amber-700">
                    All numeric columns will be automatically used for feature extraction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-red-50 rounded-xl border border-red-200 text-center">
          <Database className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">No Columns Available</h3>
          <p className="text-red-800 text-sm">
            Unable to load dataset columns. Please check your dataset and try again.
          </p>
        </div>
      )}
    </div>
  );
}