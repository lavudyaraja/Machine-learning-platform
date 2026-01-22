"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Database, Loader2, Search, Filter } from "lucide-react";

interface ColumnStats {
  uniqueValues: number;
  cardinality: "High" | "Medium" | "Low";
  nullCount: number;
  sampleValues: string[];
}

interface ColumnSelectionProps {
  availableColumns: string[];
  selectedColumns: string[];
  onColumnToggle: (column: string) => void;
  onSelectAll: (checked: boolean) => void;
  loadingColumns?: boolean;
  columnStats?: Record<string, ColumnStats>;
  statsLoading?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

export default function ColumnSelection({
  availableColumns,
  selectedColumns,
  onColumnToggle,
  onSelectAll,
  loadingColumns = false,
  columnStats = {},
  statsLoading = false,
  onBack,
  onNext,
}: ColumnSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = availableColumns.filter((col) =>
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allFilteredSelected =
    filteredColumns.length > 0 &&
    filteredColumns.every((col) => selectedColumns.includes(col));

  const allSelected = selectedColumns.length === availableColumns.length && availableColumns.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Select Columns</h2>
            <p className="text-sm text-slate-500">Choose which columns to apply feature selection</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-slate-200"
          />
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-cols"
              checked={searchTerm ? allFilteredSelected : allSelected}
              onCheckedChange={(checked) => {
                if (searchTerm) {
                  filteredColumns.forEach((col) => {
                    if (checked && !selectedColumns.includes(col)) {
                      onColumnToggle(col);
                    } else if (!checked && selectedColumns.includes(col)) {
                      onColumnToggle(col);
                    }
                  });
                } else {
                  onSelectAll(!!checked);
                }
              }}
            />
            <Label htmlFor="select-all-cols" className="font-medium text-sm text-slate-700 cursor-pointer">
              Select All Columns
            </Label>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {selectedColumns.length} selected
          </span>
        </div>

        {/* Columns Grid */}
        {loadingColumns ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mr-3" />
            <p className="text-sm text-slate-500">Loading columns...</p>
          </div>
        ) : filteredColumns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              {searchTerm ? "No columns found matching your search" : "No columns available"}
            </p>
            {searchTerm && (
              <p className="text-xs text-slate-400 mt-2">
                Try adjusting your search query
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredColumns.map((column) => {
              const isSelected = selectedColumns.includes(column);
              const stats = columnStats[column];
              
              return (
                <div
                  key={column}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all w-full ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-300 shadow-md"
                      : "border-slate-100 hover:border-blue-200 bg-slate-50/30"
                  }`}
                  onClick={() => onColumnToggle(column)}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onColumnToggle(column)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate mb-1.5 ${isSelected ? "text-blue-900" : "text-slate-900"}`}>{column}</p>
                      {stats ? (
                        <div className="flex flex-wrap gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? "text-blue-600 bg-blue-100" : "text-slate-500 bg-slate-100"}`}>
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
        )}

        {/* Selected Columns Tags */}
        {selectedColumns.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedColumns.map((col) => (
              <span key={col} className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
                {col}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
