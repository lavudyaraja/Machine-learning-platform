"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/ui/pagination";
import { CheckCircle2, Sparkles, Zap, ChevronRight, Loader2, ArrowRight, Scale, Download, Layers, FileText, Table as TableIcon } from "lucide-react";
import { scalingMethods } from "../data/scalingMethods";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateScalingHTMLReport, generateScalingPDFReport } from "./reportGenerator";

interface ResultProps {
  selectedMethods: string[];
  selectedColumns: string[];
  config: any;
  executionResult: {
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
  } | null;
  isExecuting: boolean;
  datasetId?: string;
  onBack: () => void;
  onExecute: () => void;
}

export default function Result({
  selectedMethods,
  selectedColumns,
  config,
  executionResult,
  isExecuting,
  datasetId,
  onBack,
  onExecute,
}: ResultProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const scaledData = executionResult?.scaledData;

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRows = scaledData?.rows.slice(startIndex, endIndex) || [];

  const exportAsCSV = () => {
    if (!scaledData) return;

    const csvContent = [
      scaledData.columns.join(","),
      ...scaledData.rows.map(row => row.map(cell =>
        cell === null || cell === undefined ? "" : String(cell)
      ).join(","))
    ].join("\r\n"); // Use \r\n for better Excel compatibility

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scaled_data_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
  };

  const exportAsPDF = () => {
    if (!executionResult) return;

    const reportData = {
      dataset: {
        id: datasetId,
        name: "Scaled Dataset"
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult
    };

    generateScalingPDFReport(reportData);
    setShowReportModal(false);
  };

  const exportAsExcel = () => {
    if (!scaledData) return;

    // Create Excel-compatible CSV with proper headers
    const csvContent = [
      scaledData.columns.join(","),
      ...scaledData.rows.map(row => row.map(cell =>
        cell === null || cell === undefined ? "" : String(cell)
      ).join(","))
    ].join("\r\n"); // Use \r\n for Excel compatibility

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scaled_data_${new Date().getTime()}.xls`; // .xls extension for Excel compatibility
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel file exported successfully!");
  };

  const exportAsHTML = () => {
    if (!executionResult) return;

    const reportData = {
      dataset: {
        id: datasetId,
        name: "Scaled Dataset"
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult
    };

    const htmlContent = generateScalingHTMLReport(reportData);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feature_scaling_report_${new Date().getTime()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowReportModal(false);
    toast.success("HTML report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Review Card */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review & Execute</h2>
              <p className="text-sm text-slate-600">Review your configuration and execute feature scaling</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6 text-center">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl border-2 border-cyan-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-cyan-500 rounded-lg">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-cyan-900">Selected Methods</span>
              </div>
              <div className="text-3xl font-bold text-cyan-900 mb-2">{selectedMethods.length}</div>
              <div className="text-xs text-cyan-700 font-medium truncate">
                {selectedMethods.map(methodId => {
                  const method = scalingMethods.find(m => m.value === methodId);
                  return method?.label;
                }).filter(Boolean).join(", ")}
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border-2 border-indigo-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-500 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-indigo-900">Columns</span>
              </div>
              <div className="text-3xl font-bold text-indigo-900 mb-2">
                {selectedColumns.length > 0 ? selectedColumns.length : "All"}
              </div>
              <div className="text-xs text-indigo-700 font-medium">
                {selectedColumns.length > 0 ? "Selected columns" : "All numeric columns"}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border-2 shadow-sm ${
              executionResult?.executed 
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200" 
                : "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${
                  executionResult?.executed ? "bg-emerald-500" : "bg-amber-500"
                }`}>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className={`text-xs font-semibold ${
                  executionResult?.executed ? "text-emerald-900" : "text-amber-900"
                }`}>Status</span>
              </div>
              <div className={`text-3xl font-bold mb-2 ${
                executionResult?.executed ? "text-emerald-900" : "text-amber-900"
              }`}>
                {executionResult?.executed ? "Completed" : "Ready"}
              </div>
              <div className={`text-xs font-medium ${
                executionResult?.executed ? "text-emerald-700" : "text-amber-700"
              }`}>
                {executionResult?.executedAt 
                  ? new Date(executionResult.executedAt).toLocaleString()
                  : "Click Execute to start"}
              </div>
            </div>
          </div>

          {/* Execute Button */}
          {!executionResult?.executed && (
            <button
              onClick={onExecute}
              disabled={isExecuting || selectedMethods.length === 0}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold hover:from-cyan-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Scaling in progress...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Execute Feature Scaling
                </>
              )}
            </button>
          )}

          {/* Success Message */}
          {executionResult?.executed && (
            <div className="p-6 bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-md">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">
                    Feature Scaling Completed Successfully
                  </h3>
                  <p className="text-sm text-emerald-700 font-medium">
                    Applied {executionResult.methods.length} scaling method(s) to {executionResult.columns.length} column(s)
                  </p>
                </div>
                <div className="flex flex-col-2 gap-2">
                  <button
                    onClick={() => setShowDatasetModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
                  >
                    <TableIcon className="h-4 w-4" />
                    Download as Dataset
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
                  >
                    <FileText className="h-4 w-4" />
                    Download as Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {executionResult?.executed && scaledData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Scaled Data Preview</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, scaledData.totalRows)} of {scaledData.totalRows} rows
                </p>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-slate-600 font-semibold">Row</TableHead>
                        {scaledData.columns.map((col, idx) => (
                          <TableHead key={idx} className="font-semibold text-slate-700">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRows.map((row, rowIdx) => {
                        const actualRowIdx = startIndex + rowIdx;
                        return (
                          <TableRow key={rowIdx} className="hover:bg-slate-50">
                            <TableCell className="font-medium text-center text-slate-500 bg-slate-50/50">
                              {actualRowIdx + 1}
                            </TableCell>
                            {row.map((cell, cellIdx) => (
                              <TableCell key={cellIdx} className="font-mono text-sm text-slate-700">
                                {cell === null || cell === undefined 
                                  ? <span className="text-slate-300">null</span>
                                  : typeof cell === 'number'
                                  ? cell.toFixed(6)
                                  : String(cell)}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                  <DataPagination
                    totalItems={scaledData.totalRows}
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
        {executionResult?.executed && (
          <button
            onClick={onExecute}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="h-4 w-4" />
            Re-execute
          </button>
        )}
      </div>

      {/* Dataset Download Modal */}
      <Dialog open={showDatasetModal} onOpenChange={setShowDatasetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Download as Dataset
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Choose your preferred dataset format to download the scaled data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {/* CSV Option */}
            <button
              onClick={() => {
                exportAsCSV();
                setShowDatasetModal(false);
              }}
              className="w-full p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                  <TableIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-0.5">CSV Format</h4>
                  <p className="text-xs text-green-700">Download as comma-separated values</p>
                </div>
                <Download className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Excel Option */}
            <button
              onClick={() => {
                exportAsExcel();
                setShowDatasetModal(false);
              }}
              className="w-full p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <TableIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-0.5">Excel Format</h4>
                  <p className="text-xs text-blue-700">Download as Excel spreadsheet</p>
                </div>
                <Download className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Download Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Download as Report
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Choose your preferred report format to download the scaling results
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {/* PDF Option */}
            <button
              onClick={() => {
                exportAsPDF();
                setShowReportModal(false);
              }}
              className="w-full p-4 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-0.5">PDF Format</h4>
                  <p className="text-xs text-red-700">Download as PDF report</p>
                </div>
                <Download className="h-5 w-5 text-red-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* HTML Option */}
            <button
              onClick={() => {
                exportAsHTML();
                setShowReportModal(false);
              }}
              className="w-full p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-indigo-900 mb-0.5">HTML Format</h4>
                  <p className="text-xs text-indigo-700">Download as HTML report (printable)</p>
                </div>
                <Download className="h-5 w-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

