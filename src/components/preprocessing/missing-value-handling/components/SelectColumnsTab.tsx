"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Filter, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SelectColumnsTabProps {
  fetchedColumns: string[];
  selectedColumns: string[];
  columnsWithMissingValues: string[];
  missingValuesInfo: Record<string, { count: number; percentage: number }>;
  onColumnToggle: (column: string) => void;
  onSelectAll: () => void;
  onProceedToConfiguration: () => void;
}

export function SelectColumnsTab({
  fetchedColumns,
  selectedColumns,
  columnsWithMissingValues,
  missingValuesInfo,
  onColumnToggle,
  onSelectAll,
  onProceedToConfiguration,
}: SelectColumnsTabProps) {
  const [searchColumn, setSearchColumn] = useState("");

  const handleColumnToggle = (column: string) => {
    onColumnToggle(column);
  };

  const handleSelectAllColumns = (checked: boolean) => {
    // The parent's onSelectAll toggles: selects all if not all selected, deselects all if all selected
    // So we just call it when the checkbox state changes
    if ((checked && !allSelected) || (!checked && allSelected)) {
      onSelectAll();
    }
  };

  // Filter columns based on search
  const filteredColumns = useMemo(() => {
    if (!searchColumn) return fetchedColumns;
    return fetchedColumns.filter(col =>
      col.toLowerCase().includes(searchColumn.toLowerCase())
    );
  }, [fetchedColumns, searchColumn]);

  const allSelected = selectedColumns.length === filteredColumns.length && filteredColumns.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Filter className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select Columns to Process</h2>
              <p className="text-sm text-slate-500">Choose which columns to handle missing values (leave empty for all)</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search columns..."
              value={searchColumn}
              onChange={(e) => setSearchColumn(e.target.value)}
              className="pl-10 rounded-xl border-slate-200"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-cols"
                checked={allSelected}
                onCheckedChange={handleSelectAllColumns}
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
          {filteredColumns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                {searchColumn ? "No columns found matching your search" : "No columns available"}
              </p>
              {searchColumn && (
                <p className="text-xs text-slate-400 mt-2">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredColumns.map((column) => {
                const isSelected = selectedColumns.includes(column);
                const hasMissingValues = columnsWithMissingValues.includes(column);
                const missingInfo = missingValuesInfo[column];
                
                return (
                  <div
                    key={column}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all w-full ${
                      isSelected
                        ? "bg-purple-50/50 border-purple-300 shadow-md"
                        : "border-slate-100 hover:border-purple-200 bg-slate-50/30"
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
                        <p className={`font-medium text-sm truncate mb-1.5 ${isSelected ? "text-purple-900" : "text-slate-900"}`}>{column}</p>
                        {hasMissingValues && missingInfo ? (
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              isSelected 
                                ? "text-amber-600 bg-amber-100" 
                                : "text-amber-600 bg-amber-50"
                            }`}>
                              <AlertCircle className="h-3 w-3" />
                              {missingInfo.count} missing ({missingInfo.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            No missing values
                          </span>
                        )}
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
                <span key={col} className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-100 rounded-xl">
            <AlertCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Column Selection Summary</h3>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• <span className="font-semibold">{selectedColumns.length > 0 ? selectedColumns.length : fetchedColumns.length}</span> column{selectedColumns.length !== 1 ? 's' : ''} will be processed</li>
              {columnsWithMissingValues.length > 0 && (
                <li>• <span className="font-semibold">{columnsWithMissingValues.length}</span> column{columnsWithMissingValues.length !== 1 ? 's' : ''} contain{columnsWithMissingValues.length === 1 ? 's' : ''} missing values</li>
              )}
              <li>• After selecting columns, proceed to Configuration tab to choose handling methods</li>
            </ul>
            <Button
              onClick={onProceedToConfiguration}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Proceed to Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
