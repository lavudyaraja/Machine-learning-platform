"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/ui/pagination";
import { CheckCircle2, Download, FileText, FileCode, ArrowRight, Eye, Sparkles, Layers, Play } from "lucide-react";
import { toast } from "sonner";
import { downloadCategoricalEncodingReportAsHTML } from "../categoricalEncodingReport";
import { ENCODING_METHODS } from "../data/encodingMethods";

interface EncodedDataResult {
  original: unknown[][];
  encoded: unknown[][];
  newColumns: string[];
  originalColumns?: string[];
}

interface ExecutionResult {
  methods: string[];
  columns: string[];
  executed: boolean;
  timestamp?: string;
  newColumns?: string[];
  mappings?: Record<string, Record<string, number>>;
  datasetAnalysis?: {
    categorical_columns: string[];
    numerical_columns: string[];
    mixed_columns: Array<{ column: string; type: string; [key: string]: any }>;
    dataset_type: string;
  } | null;
}

interface ResultProps {
  executionResult: ExecutionResult | null;
  encodedData: EncodedDataResult | null;
  allColumns: string[];
  datasetId?: string;
  selectedMethods: string[];
  selectedColumns: string[];
  previewLoading: boolean;
  isExecuting: boolean;
  onExecute: () => void;
}

// Helper functions for download functionality
const generateCSVFromEncodedData = (data: unknown[][], columns: string[]): string => {
  if (!data || data.length === 0) return '';

  // Create CSV header
  const header = columns.map(col => `"${String(col).replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) {
        return '""';
      }
      const cellStr = String(cell).replace(/"/g, '""');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr}"`;
      }
      return cellStr;
    }).join(',')
  );

  return [header, ...rows].join('\n');
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function Result({
  executionResult,
  encodedData,
  allColumns,
  datasetId,
  selectedMethods,
  selectedColumns,
  previewLoading,
  isExecuting,
  onExecute,
}: ResultProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  if (!executionResult) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 py-16">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
            <Eye className="h-6 w-6 text-violet-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Results Yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            Execute encoding to see the results and preview
          </p>
          <button
            onClick={onExecute}
            disabled={isExecuting || selectedMethods.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            Execute Encoding
          </button>
        </div>
      </div>
    );
  }

  // Extract mappings and dataset analysis
  const mappings = executionResult?.mappings || {};
  const datasetAnalysis = executionResult?.datasetAnalysis;

  return (
    <div className="space-y-6">
      {/* Dataset Analysis */}
      {datasetAnalysis && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-3xl border border-blue-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                📊 Dataset Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">Dataset Type:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold capitalize">
                    {datasetAnalysis.dataset_type}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Categorical:</span>
                    <span className="ml-2 text-blue-900 font-semibold">{datasetAnalysis.categorical_columns?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Numerical:</span>
                    <span className="ml-2 text-blue-900 font-semibold">{datasetAnalysis.numerical_columns?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Mixed:</span>
                    <span className="ml-2 text-blue-900 font-semibold">{datasetAnalysis.mixed_columns?.length || 0}</span>
                  </div>
                </div>
                {datasetAnalysis.mixed_columns && datasetAnalysis.mixed_columns.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-600 mb-2">Mixed columns (may need encoding):</p>
                    <div className="flex flex-wrap gap-2">
                      {datasetAnalysis.mixed_columns.slice(0, 5).map((col: any) => (
                        <span key={col.column} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {col.column}
                        </span>
                      ))}
                      {datasetAnalysis.mixed_columns.length > 5 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          +{datasetAnalysis.mixed_columns.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encoding Mappings - Commented out as per user request */}
      {/* {Object.keys(mappings).length > 0 && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50/30 rounded-3xl border border-purple-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-3">
                🔢 Encoding Mappings
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                Categorical values and their corresponding encoded numerical values:
              </p>
              <div className="space-y-4">
                {Object.entries(mappings).map(([columnName, columnMapping]) => (
                  <div key={columnName} className="bg-white rounded-xl border border-purple-100 p-4">
                    <h4 className="font-semibold text-purple-900 mb-3 text-sm">
                      Column: <span className="text-purple-700">{columnName}</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-purple-50">
                            <TableHead className="text-purple-700 font-semibold">Categorical Value</TableHead>
                            <TableHead className="text-purple-700 font-semibold">Encoded Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(columnMapping)
                            .sort(([, a], [, b]) => (a as number) - (b as number))
                            .map(([category, encoded]) => (
                              <TableRow key={category}>
                                <TableCell className="font-medium text-slate-700">{category}</TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-mono font-semibold">
                                    {encoded}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Success Message */}
      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-3xl border border-green-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-1">
                ✨ Encoding Applied Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Your categorical encoding has been executed
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 hover:shadow-sm transition-all duration-200 text-sm">
                  <Download className="h-4 w-4" /> Download Dataset
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50/30 to-white">
                <DialogHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-slate-900 mb-2">
                    Download Encoded Dataset
                  </DialogTitle>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Download your encoded dataset with categorical variables transformed into numerical format
                  </p>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6 text-left transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-0.5"
                      onClick={async () => {
                        try {
                          if (!encodedData) {
                            toast.error('No encoded data available');
                            return;
                          }

                          const allColumnNames = [...allColumns, ...(encodedData?.newColumns || [])];
                          const csvContent = generateCSVFromEncodedData(encodedData.encoded, allColumnNames);
                          downloadCSV(csvContent, `Dataset_${datasetId || 'unknown'}_encoded.csv`);
                          toast.success('Dataset downloaded as CSV successfully');
                        } catch (error) {
                          console.error('Error downloading CSV:', error);
                          toast.error('Failed to download CSV');
                        }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-base mb-1 group-hover:text-emerald-900 transition-colors">
                            Download as CSV
                          </div>
                          <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                            Comma-separated values format, compatible with most data tools
                          </div>
                        </div>
                        <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          <ArrowRight className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </button>

                    <button
                      className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-left transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-0.5"
                      onClick={async () => {
                        try {
                          if (!encodedData) {
                            toast.error('No encoded data available');
                            return;
                          }
                          toast.success('Dataset downloaded as Excel successfully');
                        } catch (error) {
                          console.error('Error downloading Excel:', error);
                          toast.error('Failed to download Excel');
                        }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                          <FileCode className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-base mb-1 group-hover:text-blue-900 transition-colors">
                            Download as Excel
                          </div>
                          <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                            Microsoft Excel spreadsheet format with multiple sheets support
                          </div>
                        </div>
                        <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          <ArrowRight className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span>Ready for download • {encodedData?.encoded?.length || 0} rows processed</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button
              onClick={async () => {
                try {
                  const reportData = {
                    dataset: {
                      id: datasetId,
                      name: `Dataset_${datasetId || 'unknown'}`
                    },
                    selectedMethods,
                    selectedColumns,
                    config: {},
                    executionResult: {
                      executed: true,
                      executedAt: executionResult?.timestamp,
                      newColumns: encodedData?.newColumns || executionResult?.newColumns,
                      original: encodedData?.original,
                      encoded: encodedData?.encoded
                    }
                  };

                  downloadCategoricalEncodingReportAsHTML(reportData);
                  toast.success('Report downloaded successfully');
                } catch (error) {
                  console.error('Error downloading report:', error);
                  toast.error('Failed to download report');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 hover:shadow-sm transition-all duration-200 text-sm"
            >
              <FileText className="h-4 w-4" /> Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border-2 border-indigo-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Encoding Methods Applied
          </h4>
          <div className="flex flex-wrap gap-2">
            {executionResult.methods.map((m: string) => {
              const method = ENCODING_METHODS.find(method => method.value === m);
              return (
                <span key={m} className="text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                  {method && <method.icon className="h-3 w-3" />}
                  {method?.label || m}
                </span>
              );
            })}
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border-2 border-purple-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            Columns Processed
          </h4>
          <div className="flex flex-wrap gap-2">
            {executionResult.columns.map((col: string) => (
              <span key={col} className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Preview */}
      {encodedData && encodedData.encoded.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-green-200 overflow-hidden">
          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50/30 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Dataset Preview</h2>
                  <p className="text-sm text-slate-500">Processed dataset with encoded columns</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                  {encodedData.encoded.length} rows
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                  {allColumns.length} columns
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-green-50">
                <TableRow>
                  <TableHead className="text-green-700 font-semibold text-center w-16 bg-green-50 border-r-2 border-green-200">
                    Row
                  </TableHead>
                  {allColumns.map((col) => {
                    const isNewColumn = encodedData.newColumns.includes(col);
                    return (
                      <TableHead key={col} className={`font-semibold ${isNewColumn ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 bg-slate-50'} border-r border-green-100`}>
                        {col}
                        {isNewColumn && <span className="ml-1 text-xs text-emerald-600">🆕</span>}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {encodedData.encoded.slice(0, 10).map((row, rowIdx) => (
                  <TableRow key={rowIdx} className="hover:bg-green-25">
                    <TableCell className="text-center font-medium text-slate-600 bg-slate-50 border-r-2 border-green-200">
                      {rowIdx + 1}
                    </TableCell>
                    {allColumns.map((col, colIdx) => {
                      const columnIndex = allColumns.indexOf(col);
                      const cellValue = row[columnIndex];
                      const isNewColumn = encodedData.newColumns.includes(col);

                      return (
                        <TableCell
                          key={col}
                          className={`text-sm ${isNewColumn ? 'bg-emerald-25 text-emerald-900 font-medium' : 'text-slate-700'} border-r border-green-100`}
                        >
                          {cellValue !== null && cellValue !== undefined ? String(cellValue) : 'null'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {encodedData.encoded.length > 10 && (
            <div className="p-3 bg-green-50 border-t border-green-100 text-center">
              <p className="text-xs text-green-600">
                Showing first 10 rows of {encodedData.encoded.length} total rows
              </p>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Comparison Table */}
      {encodedData && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Side-by-Side Comparison</h2>
                  <p className="text-sm text-slate-500">Original dataset (left) vs Encoded dataset (right)</p>
                </div>
              </div>
              {encodedData.newColumns.length > 0 && (
                <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
                  +{encodedData.newColumns.length} new column{encodedData.newColumns.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <div className="p-5">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-3" />
                <p className="text-sm text-slate-500">Loading encoded data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {encodedData.newColumns.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-600" />
                      New Columns Created ({encodedData.newColumns.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {encodedData.newColumns.map((col) => (
                        <span key={col} className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10">
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-slate-600 font-semibold text-center w-16 sticky left-0 z-20 bg-slate-50 border-r-2 border-slate-200">
                            Row
                          </TableHead>
                          {/* Original Dataset Columns */}
                          <TableHead colSpan={(encodedData.originalColumns || allColumns).length} className="text-center font-bold text-amber-700 bg-amber-100 border-r-2 border-amber-300">
                            📋 Original Dataset
                          </TableHead>
                          {/* Divider */}
                          <TableHead className="bg-slate-200 w-2 border-l-2 border-r-2 border-slate-300"></TableHead>
                          {/* Encoded Dataset Columns */}
                          <TableHead colSpan={allColumns.length} className="text-center font-bold text-emerald-700 bg-emerald-100">
                            🔢 Encoded Dataset
                          </TableHead>
                        </TableRow>
                        <TableRow className="bg-slate-50">
                          <TableHead className="sticky left-0 z-20 bg-slate-50 border-r-2 border-slate-200"></TableHead>
                          {/* Original column headers */}
                          {(encodedData.originalColumns || allColumns).map((col) => (
                            <TableHead key={`orig-header-${col}`} className="font-semibold text-amber-700 bg-amber-50 border-r border-amber-200">
                              {col}
                            </TableHead>
                          ))}
                          <TableHead className="bg-slate-200 border-l-2 border-r-2 border-slate-300"></TableHead>
                          {/* Encoded column headers */}
                          {allColumns.map((col) => {
                            const isEncodedColumn = executionResult?.columns?.includes(col);
                            return (
                              <TableHead key={`enc-header-${col}`} className={`font-semibold ${isEncodedColumn ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-50'}`}>
                                {col}
                                {isEncodedColumn && <span className="ml-1 text-xs">🔢</span>}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {encodedData.encoded
                          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                          .map((row, rowIdx) => {
                          const actualRowIdx = (currentPage - 1) * pageSize + rowIdx;
                          const originalRow = encodedData.original[actualRowIdx] || [];
                          const originalCols = encodedData.originalColumns || allColumns;
                          const mappings = executionResult?.mappings || {};
                          
                          // Create a map of column name to index for original data
                          const originalColIndexMap = new Map<string, number>();
                          originalCols.forEach((col, idx) => {
                            originalColIndexMap.set(col, idx);
                          });
                          
                          return (
                            <TableRow key={actualRowIdx} className="hover:bg-slate-50">
                              <TableCell className="font-medium text-center text-slate-500 bg-slate-50/50 sticky left-0 z-10 border-r-2 border-slate-200">
                                {actualRowIdx + 1}
                              </TableCell>
                              
                              {/* Original Dataset Values - Show TRUE original values before encoding */}
                              {originalCols.map((col, colIdx) => {
                                // Get the original value using the correct index from original row
                                const originalValueIndex = originalColIndexMap.get(col) ?? colIdx;
                                const originalValue = originalValueIndex < originalRow.length && originalRow[originalValueIndex] !== null && originalRow[originalValueIndex] !== undefined
                                  ? originalRow[originalValueIndex]
                                  : null;
                                
                                // Format for display - preserve original type
                                let displayValue = '-';
                                if (originalValue !== null && originalValue !== undefined) {
                                  // Preserve the original value as-is (categorical as string, numerical as number)
                                  displayValue = String(originalValue);
                                }
                                
                                return (
                                  <TableCell key={`orig-${col}-${rowIdx}`} className="text-slate-700 bg-amber-50/30 border-r border-amber-200">
                                    {displayValue}
                                  </TableCell>
                                );
                              })}
                              
                              {/* Divider */}
                              <TableCell className="bg-slate-200 border-l-2 border-r-2 border-slate-300"></TableCell>
                              
                              {/* Encoded Dataset Values */}
                              {allColumns.map((col, colIdx) => {
                                const isEncodedColumn = executionResult?.columns?.includes(col);
                                const encodedValue = colIdx < row.length && row[colIdx] !== null && row[colIdx] !== undefined
                                  ? row[colIdx]
                                  : null;
                                
                                // Check if value changed (categorical → numerical)
                                const originalValue = colIdx < originalRow.length ? originalRow[colIdx] : null;
                                const valueChanged = isEncodedColumn && originalValue !== null && encodedValue !== null && 
                                  String(originalValue) !== String(encodedValue);
                                
                                // Determine if original was categorical (string) and now is numerical
                                const wasCategorical = isEncodedColumn && originalValue !== null && 
                                  typeof originalValue === 'string' && isNaN(Number(originalValue));
                                const isNowNumerical = isEncodedColumn && encodedValue !== null && 
                                  typeof encodedValue === 'number';
                                
                                const displayValue = encodedValue !== null ? String(encodedValue) : '-';
                                
                                return (
                                  <TableCell 
                                    key={`enc-${col}-${rowIdx}`} 
                                    className={`${
                                      isEncodedColumn && valueChanged && wasCategorical && isNowNumerical
                                        ? 'font-mono text-sm font-semibold text-emerald-700 bg-emerald-100 border-2 border-emerald-300'
                                        : isEncodedColumn
                                        ? 'font-mono text-sm text-emerald-700 bg-emerald-50/30'
                                        : 'text-slate-700 bg-slate-50/30'
                                    }`}
                                    title={valueChanged && wasCategorical && isNowNumerical ? `Encoded: ${originalValue} → ${encodedValue}` : ''}
                                  >
                                    {displayValue}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <DataPagination
                      totalItems={encodedData.encoded.length}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                      }}
                      pageSizeOptions={[25, 50, 100, 200]}
                      itemLabel="rows"
                      className="border-0 pt-0"
                    />
                  </div>
                </div>
                
                {/* Legend */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Legend</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></div>
                      <span className="text-slate-600">Original values (left side)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div>
                      <span className="text-slate-600">Encoded values (right side)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-300 rounded font-mono text-xs flex items-center justify-center">🔢</div>
                      <span className="text-slate-600">Categorical → Numerical (highlighted)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
