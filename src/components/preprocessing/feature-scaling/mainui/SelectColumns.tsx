"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ChevronRight, Database, Search, X, ArrowUpDown } from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";

interface ColumnStats {
  uniqueValues: number;
  cardinality: "High" | "Medium" | "Low";
  nullCount: number;
  sampleValues: string[];
}

interface SelectColumnsProps {
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  onBack: () => void;
  onNext: () => void;
  datasetId?: string;
  availableColumns?: string[];
  columnStats?: Record<string, ColumnStats>;
  statsLoading?: boolean;
}

export default function SelectColumns({
  selectedColumns,
  onColumnsChange,
  onBack,
  onNext,
  datasetId,
  availableColumns,
  columnStats = {},
  statsLoading = false,
}: SelectColumnsProps) {
  const [datasetColumns, setDatasetColumns] = useState<string[]>(availableColumns || []);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Helper function to remove quotes from column names
  const stripQuotes = (str: string): string => {
    return str.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
  };

  useEffect(() => {
    if (availableColumns && availableColumns.length > 0) {
      setDatasetColumns(availableColumns);
      return;
    }

    const fetchDatasetColumns = async () => {
      if (!datasetId) {
        setDatasetColumns([]);
        return;
      }

      setLoadingColumns(true);
      try {
        const response = await api.get<{ preview?: { columns: string[] } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=1&preview=true`
        );
        
        if (response.preview?.columns && response.preview.columns.length > 0) {
          const cleanedColumns = response.preview.columns.map(col => stripQuotes(col));
          setDatasetColumns(cleanedColumns);
        }
      } catch (error) {
        console.error("Error fetching dataset columns:", error);
      } finally {
        setLoadingColumns(false);
      }
    };

    fetchDatasetColumns();
  }, [datasetId, availableColumns]);

  const handleColumnToggle = (column: string) => {
    const newColumns = selectedColumns.includes(column)
      ? selectedColumns.filter((c) => c !== column)
      : [...selectedColumns, column];
    onColumnsChange(newColumns);
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === datasetColumns.length) {
      onColumnsChange([]);
    } else {
      onColumnsChange([...datasetColumns]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredColumns = searchQuery
    ? datasetColumns.filter(col =>
        col.toLowerCase().includes(searchQuery.toLowerCase())
      ).sort((a, b) => sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a))
    : datasetColumns.sort((a, b) => sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a));


  const selectedCount = selectedColumns.length;
  const totalCount = datasetColumns.length;

  return (
    <div className="space-y-6">
      {/* Column Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl shadow-md">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Features (Optional)</h2>
                <p className="text-sm text-slate-600">Leave empty to use all numeric columns</p>
              </div>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-2 text-sm font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500" />
              <input
                type="text"
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-cyan-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-cyan-600" />
                </button>
              )}
            </div>
            {datasetColumns.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-50 to-indigo-50 border-2 border-cyan-200 text-cyan-700 rounded-xl text-sm font-semibold hover:from-cyan-100 hover:to-indigo-100 transition-all flex items-center gap-2 shadow-sm"
              >
                {selectedColumns.length === datasetColumns.length ? (
                  <>
                    <X className="h-4 w-4" />
                    Clear All
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Select All
                  </>
                )}
              </button>
            )}
          </div>

          {/* Columns Grid */}
          {loadingColumns ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Loading Columns...</h3>
              <p className="text-sm text-slate-500">Fetching columns from dataset</p>
            </div>
          ) : datasetColumns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No Columns Detected</h3>
              <p className="text-sm text-slate-500">Upload a dataset to see available columns</p>
            </div>
          ) : filteredColumns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No Columns Found</h3>
              <p className="text-sm text-slate-500 mb-4">
                No columns match "{searchQuery}"
              </p>
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="border-2 border-cyan-100 rounded-2xl p-5 max-h-[400px] overflow-y-auto bg-gradient-to-br from-white to-cyan-50/20">
              <div className="flex items-center justify-center gap-2 pb-4 border-b-2 border-cyan-100 mb-4">
                <Checkbox
                  id="select-all-columns"
                  checked={selectedColumns.length === datasetColumns.length && datasetColumns.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onColumnsChange([...datasetColumns]);
                    } else {
                      onColumnsChange([]);
                    }
                  }}
                />
                <label
                  htmlFor="select-all-columns"
                  className="font-semibold text-sm text-cyan-900 cursor-pointer"
                >
                  Select All ({filteredColumns.length} columns)
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredColumns.map((column) => {
                  const isSelected = selectedColumns.includes(column);
                  const stats = columnStats[column];
                  
                  return (
                    <div
                      key={column}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all w-full ${
                        isSelected
                          ? "bg-cyan-50/50 border-cyan-300 shadow-md"
                          : "border-slate-100 hover:border-cyan-200 bg-slate-50/30"
                      }`}
                      onClick={() => handleColumnToggle(column)}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleColumnToggle(column)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate mb-1.5 ${isSelected ? "text-cyan-900" : "text-slate-900"}`}>{column}</p>
                          {stats ? (
                            <div className="flex flex-wrap gap-1">
                              <span className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? "text-cyan-600 bg-cyan-100" : "text-slate-500 bg-slate-100"}`}>
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
                                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {stats.nullCount} null
                                </span>
                              )}
                            </div>
                          ) : statsLoading ? (
                            <span className="text-xs text-slate-400">Loading...</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Columns Tags */}
          {selectedColumns.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedColumns.map((col) => (
                <span key={col} className="text-xs font-semibold text-cyan-700 bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-lg shadow-sm">
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

