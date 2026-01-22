"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  X,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  Table2,
  FileText,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import {
  generateFeatureSelectionHTMLReport,
  generateFeatureSelectionCSVReport,
  generateFeatureSelectionExcelReport,
  generateFeatureSelectionPDFReport,
  type FeatureSelectionReportData,
} from "../reportGenerator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataPagination } from "@/components/ui/pagination";

interface ResultProps {
  executionResult: {
    selectedFeatures: string[];
    removedFeatures: string[];
    appliedMethods: string[];
    timestamp: string;
    originalData?: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
    processedData?: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null;
  selectedMethods: string[];
  selectedColumns: string[];
  config: any;
  datasetId?: string;
  datasetName?: string;
  onBack?: () => void;
  onExecute?: () => void;
  isExecuting?: boolean;
}

export default function Result({
  executionResult,
  selectedMethods,
  selectedColumns,
  config,
  datasetId,
  datasetName,
  onBack,
  onExecute,
  isExecuting,
}: ResultProps) {
  const [showResults, setShowResults] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  
  // Pagination state for original dataset
  const [originalPage, setOriginalPage] = useState(1);
  const [originalPageSize, setOriginalPageSize] = useState(50);
  
  // Pagination state for selected dataset
  const [selectedPage, setSelectedPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(50);

  if (!executionResult) return null;

  const originalDatasetData = executionResult.originalData || { columns: [], rows: [], totalRows: 0 };
  const selectedData = executionResult.processedData || { columns: [], rows: [], totalRows: 0 };
  
  // Calculate paginated data for original dataset
  const originalStartIndex = (originalPage - 1) * originalPageSize;
  const originalEndIndex = Math.min(originalStartIndex + originalPageSize, originalDatasetData.rows.length);
  const originalPaginatedRows = originalDatasetData.rows.slice(originalStartIndex, originalEndIndex);
  
  // Calculate paginated data for selected dataset
  const selectedStartIndex = (selectedPage - 1) * selectedPageSize;
  const selectedEndIndex = Math.min(selectedStartIndex + selectedPageSize, selectedData.rows.length);
  const selectedPaginatedRows = selectedData.rows.slice(selectedStartIndex, selectedEndIndex);


  const totalFeatures = executionResult.selectedFeatures.length + executionResult.removedFeatures.length;
  const retentionRate = totalFeatures > 0 
    ? ((executionResult.selectedFeatures.length / totalFeatures) * 100).toFixed(1)
    : 0;
  const reductionRate = totalFeatures > 0
    ? ((executionResult.removedFeatures.length / totalFeatures) * 100).toFixed(1)
    : 0;


  const downloadAsPDF = () => {
    const reportData: FeatureSelectionReportData = {
      dataset: {
        id: datasetId || "unknown-dataset",
        name: datasetName || "Unknown Dataset",
        rows: executionResult.originalData?.totalRows || 0,
        columns: executionResult.originalData?.columns.length || 0,
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
    };

    generateFeatureSelectionPDFReport(reportData);
    setReportModalOpen(false);
  };

  const downloadAsHTML = () => {
    const reportData: FeatureSelectionReportData = {
      dataset: {
        id: datasetId || "unknown-dataset",
        name: datasetName || "Unknown Dataset",
        rows: executionResult.originalData?.totalRows || 0,
        columns: executionResult.originalData?.columns.length || 0,
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
    };

    const htmlContent = generateFeatureSelectionHTMLReport(reportData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-selection-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setReportModalOpen(false);
  };

  const downloadAsExcel = async () => {
    const reportData: FeatureSelectionReportData = {
      dataset: {
        id: datasetId || "unknown-dataset",
        name: datasetName || "Unknown Dataset",
        rows: executionResult.originalData?.totalRows || 0,
        columns: executionResult.originalData?.columns.length || 0,
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
    };

    try {
      const blob = await generateFeatureSelectionExcelReport(reportData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feature-selection-results-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate Excel report:', error);
      // Fallback to CSV if Excel generation fails
      const csvContent = generateFeatureSelectionCSVReport(reportData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feature-selection-results-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setDatasetModalOpen(false);
  };

  const downloadAsCSV = () => {
    const reportData: FeatureSelectionReportData = {
      dataset: {
        id: datasetId || "unknown-dataset",
        name: datasetName || "Unknown Dataset",
        rows: executionResult.originalData?.totalRows || 0,
        columns: executionResult.originalData?.columns.length || 0,
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
    };

    const csvContent = generateFeatureSelectionCSVReport(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-selection-results-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDatasetModalOpen(false);
  };

  const downloadResults = () => {
    const data = {
      executionTimestamp: new Date().toISOString(),
      methods: selectedMethods,
      configuration: config,
      results: {
        totalFeatures,
        selectedFeatures: executionResult.selectedFeatures,
        removedFeatures: executionResult.removedFeatures,
        retentionRate: `${retentionRate}%`,
        reductionRate: `${reductionRate}%`,
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-selection-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <>
      {/* Results Card */}
      {showResults && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 via-emerald-100 to-teal-50 px-6 py-5 border-b-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Feature Selection Complete</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Analysis completed with {selectedMethods.length} method{selectedMethods.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download as Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        Download as Report
                      </DialogTitle>
                      <DialogDescription className="text-slate-600">
                        Choose your preferred report format to download the feature selection results
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {/* PDF Option */}
                      <button
                        onClick={() => {
                          downloadAsPDF();
                          setReportModalOpen(false);
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
                          downloadAsHTML();
                          setReportModalOpen(false);
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

                <Dialog open={datasetModalOpen} onOpenChange={setDatasetModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Download as Dataset
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Download className="h-5 w-5 text-green-600" />
                        Download as Dataset
                      </DialogTitle>
                      <DialogDescription className="text-slate-600">
                        Choose your preferred dataset format to download the feature selection results
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {/* Excel Option */}
                      <button
                        onClick={() => {
                          downloadAsExcel();
                          setDatasetModalOpen(false);
                        }}
                        className="w-full p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900 mb-0.5">Excel Format</h4>
                            <p className="text-xs text-green-700">Download as Excel spreadsheet (.xlsx)</p>
                          </div>
                          <Download className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      {/* CSV Option */}
                      <button
                        onClick={() => {
                          downloadAsCSV();
                          setDatasetModalOpen(false);
                        }}
                        className="w-full p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-900 mb-0.5">CSV Format</h4>
                            <p className="text-xs text-amber-700">Download as CSV file (.csv)</p>
                          </div>
                          <Download className="h-5 w-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalFeatures}</div>
                <div className="text-xs text-gray-500 mt-1">Features</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700 uppercase">Retained</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {executionResult.selectedFeatures.length}
                </div>
                <div className="text-xs text-emerald-600 mt-1">{retentionRate}% of total</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 uppercase">Removed</span>
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  {executionResult.removedFeatures.length}
                </div>
                <div className="text-xs text-amber-600 mt-1">{reductionRate}% reduced</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 uppercase">Methods</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{selectedMethods.length}</div>
                <div className="text-xs text-blue-600 mt-1">Applied</div>
              </div>
            </div>
          </div>

          {/* Feature Sections */}
          <div className="space-y-6">
            {/* Removed Features */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  Removed Features
                </h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  {executionResult.removedFeatures.length}
                </span>
              </div>

              {executionResult.removedFeatures.length > 0 ? (
                <div className="max-h-80 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {executionResult.removedFeatures.map((feat: string, idx: number) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-xs text-gray-800 font-medium flex-1 truncate" title={feat}>
                          {feat}
                        </span>
                        <X className="h-3 w-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No features removed</p>
                </div>
              )}
            </div>

            {/* Selected Features */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Selected Features
                </h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  {executionResult.selectedFeatures.length}
                </span>
              </div>

              {executionResult.selectedFeatures.length > 0 ? (
                <div className="max-h-80 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {executionResult.selectedFeatures.map((feat: string, idx: number) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-xs text-gray-800 font-medium flex-1 truncate" title={feat}>
                          {feat}
                        </span>
                        <Check className="h-3 w-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No features selected</p>
                </div>
              )}
            </div>

            {/* Original Dataset */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  Original Dataset
                </h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                  {originalDatasetData.rows.length} rows × {originalDatasetData.columns.length} columns
                </span>
              </div>

              {originalDatasetData.rows.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-auto max-h-[400px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="min-w-full inline-block">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            {originalDatasetData.columns.map((col: string) => (
                              <TableHead key={col} className="text-xs font-semibold text-gray-700 whitespace-nowrap px-3 py-2 border-r border-gray-200">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {originalPaginatedRows.length > 0 ? (
                            originalPaginatedRows.map((row: unknown[], rowIdx: number) => (
                              <TableRow key={originalStartIndex + rowIdx} className="hover:bg-gray-50">
                                {row.map((cell: unknown, cellIdx: number) => (
                                  <TableCell key={cellIdx} className="text-xs px-3 py-2 border-r border-gray-100 whitespace-nowrap">
                                    {String(cell ?? '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={originalDatasetData.columns.length} className="text-center py-8 text-gray-500 text-sm">
                                No data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="mt-4 px-4 pb-4 border-t pt-4">
                    <DataPagination
                      totalItems={originalDatasetData.totalRows || originalDatasetData.rows.length}
                      currentPage={originalPage}
                      pageSize={originalPageSize}
                      onPageChange={setOriginalPage}
                      onPageSizeChange={(newSize) => {
                        setOriginalPageSize(newSize);
                        setOriginalPage(1);
                      }}
                      pageSizeOptions={[25, 50, 100, 200]}
                      itemLabel="rows"
                      className="border-0 pt-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Table2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No original dataset available</p>
                </div>
              )}
            </div>

            {/* Selected Dataset */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Selected Dataset
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {selectedData.rows.length} rows × {selectedData.columns.length} columns
                </span>
              </div>

              {selectedData.rows.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-auto max-h-[400px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="min-w-full inline-block">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            {selectedData.columns.map((col: string) => (
                              <TableHead key={col} className="text-xs font-semibold text-gray-700 whitespace-nowrap px-3 py-2 border-r border-gray-200">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPaginatedRows.length > 0 ? (
                            selectedPaginatedRows.map((row: unknown[], rowIdx: number) => (
                              <TableRow key={selectedStartIndex + rowIdx} className="hover:bg-blue-50">
                                {row.map((cell: unknown, cellIdx: number) => (
                                  <TableCell key={cellIdx} className="text-xs px-3 py-2 border-r border-gray-100 whitespace-nowrap">
                                    {String(cell ?? '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={selectedData.columns.length} className="text-center py-8 text-gray-500 text-sm">
                                No data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="mt-4 px-4 pb-4 border-t pt-4">
                    <DataPagination
                      totalItems={selectedData.totalRows || selectedData.rows.length}
                      currentPage={selectedPage}
                      pageSize={selectedPageSize}
                      onPageChange={setSelectedPage}
                      onPageSizeChange={(newSize) => {
                        setSelectedPageSize(newSize);
                        setSelectedPage(1);
                      }}
                      pageSizeOptions={[25, 50, 100, 200]}
                      itemLabel="rows"
                      className="border-0 pt-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Table2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No selected dataset available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

</> 
   );
}