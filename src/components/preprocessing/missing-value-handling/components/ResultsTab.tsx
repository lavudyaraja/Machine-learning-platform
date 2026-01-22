import React, { useState } from "react";
import {
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Database,
  Info,
  AlertCircle,
  FileText,
  HardDrive,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExecutionResult {
  methods: string[];
  columns: string[];
  droppedRows?: number;
  droppedColumns?: number;
  constantValueUsed?: string | number;
}

interface StatisticsData {
  mean: Record<string, number>;
  median: Record<string, number>;
  mode: Record<string, number | string>;
  std: Record<string, number>;
  variance: Record<string, number>;
  q1: Record<string, number>;
  q2: Record<string, number>;
  q3: Record<string, number>;
}

export default function ResultsTab({
  executionResult,
  allRows,
  allColumns,
  currentPage,
  pageSize,
  meanResults,
  medianResults,
  modeResults,
  stdResults,
  varianceResults,
  q1Results,
  q2Results,
  q3Results,
  onPageChange,
  onPageSizeChange
}: any) {
  const [activeTab, setActiveTab] = useState<'overview' | 'dataset' | 'statistics'>('overview');
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

  const statistics: StatisticsData = {
    mean: meanResults || {},
    median: medianResults || {},
    mode: modeResults || {},
    std: stdResults || {},
    variance: varianceResults || {},
    q1: q1Results || {},
    q2: q2Results || {},
    q3: q3Results || {}
  };

  const toggleStatsExpand = (column: string) => {
    setExpandedStats(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const hasStatistics = Object.keys(statistics.mean).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800 font-['Inter','system-ui','-apple-system','sans-serif'] p-8">
      <div className="max-w-full mx-auto">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 mb-2 font-medium tracking-wide">
              <CheckCircle2 className="w-5 h-5" />
              <span>COMPLETED</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-wide">
              Data Processing Results
            </h1>
            <p className="text-gray-600 mt-2 text-base leading-relaxed">
              Review your processed dataset and statistical distributions below.
            </p>
          </div>

          <div className="flex gap-3 mt-6 md:mt-0">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 hover:shadow-sm transition-all duration-200">
                  <FileText className="w-4 h-4" /> Download Report
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Download Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Choose the format for your missing value handling report:</p>
                  <div className="space-y-2 flex flex-col items-center">
                    <Button
                      variant="outline"
                      className="w-48 justify-center"
                      onClick={async () => {
                        try {
                          const { downloadReportAsCSV } = await import('../utils/reportDownload');
                          downloadReportAsCSV({
                            datasetName: 'Processed Dataset',
                            executionResult,
                            statistics,
                            missingValuesInfo: {}
                          });
                          toast.success('Report downloaded as CSV successfully');
                        } catch (error) {
                          console.error('Error downloading CSV report:', error);
                          toast.error('Failed to download CSV report');
                        }
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download as CSV
                    </Button>
                    <Button
                      variant="outline"
                      className="w-48 justify-center"
                      onClick={async () => {
                        try {
                          const { downloadReportAsExcel } = await import('../utils/reportDownload');
                          downloadReportAsExcel({
                            datasetName: 'Processed Dataset',
                            executionResult,
                            statistics,
                            missingValuesInfo: {}
                          });
                          toast.success('Report downloaded as Excel successfully');
                        } catch (error) {
                          console.error('Error downloading Excel report:', error);
                          toast.error('Failed to download Excel report');
                        }
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download as Excel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 hover:shadow-sm transition-all duration-200">
                  <HardDrive className="w-4 h-4" /> Download Dataset
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Download Dataset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Download your processed dataset with imputed missing values:</p>
                  <div className="space-y-2 flex flex-col items-center">
                    <Button variant="outline" className="w-48 justify-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Download as Excel
                    </Button>
                    <Button variant="outline" className="w-48 justify-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Download as CSV
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Methods Applied', val: executionResult.methods.length, icon: FileText, color: 'text-blue-500' },
            { label: 'Columns Processed', val: allColumns.length, icon: Database, color: 'text-purple-500' },
            { label: 'Rows Retained', val: allRows.length.toLocaleString(), icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Statistics Columns', val: Object.keys(statistics.mean).length, icon: Sparkles, color: 'text-orange-500' }
          ].map((item, i) => (
            <div key={i} className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <div>
                <span className="text-2xl font-semibold block text-gray-900">{item.val}</span>
                <span className="text-gray-500 text-xs uppercase font-medium tracking-wide">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          {['overview', 'dataset', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-medium uppercase tracking-wide transition-all duration-200 ${
                activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <main>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-400" /> Transformation Log
                </h3>
                <div className="space-y-4">
                  {executionResult.droppedRows !== undefined && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Row Reduction</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Dropped {executionResult.droppedRows} rows due to missing critical values.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">Methods Applied</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {executionResult.methods.map((m: string) => m.toUpperCase()).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gray-400" /> Processed Columns
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allColumns.slice(0, 12).map((col: string) => (
                    <span key={col} className="px-3 py-1 bg-white border border-gray-300 text-xs font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                      {col}
                    </span>
                  ))}
                  {allColumns.length > 12 && (
                    <span className="px-3 py-1 text-xs font-medium text-gray-500">
                      +{allColumns.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" /> Statistical Summary
              </h3>
              
              {hasStatistics ? (
                <div className="space-y-4">
                  {Object.keys(statistics.mean).map((column) => (
                    <div key={column} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleStatsExpand(column)}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{column}</span>
                        {expandedStats[column] ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedStats[column] && (
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {statistics.mean[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mean</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.mean[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.median[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Median</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.median[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.std[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Std Dev</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.std[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.variance[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Variance</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.variance[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.q1[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Q1 (25%)</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.q1[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.q2[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Q2 (50%)</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.q2[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.q3[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Q3 (75%)</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {statistics.q3[column].toFixed(2)}
                              </p>
                            </div>
                          )}
                          {statistics.mode[column] !== undefined && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mode</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {typeof statistics.mode[column] === 'number' 
                                  ? statistics.mode[column].toFixed(2)
                                  : statistics.mode[column]
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No statistics available for this dataset</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dataset' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-in fade-in duration-500 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    <strong>{allRows.length.toLocaleString()}</strong> total rows, <strong>{executionResult.columns.length}</strong> columns
                  </span>
                  <span>
                    Page <strong>{currentPage}</strong> of <strong>{Math.ceil(allRows.length / pageSize)}</strong>
                  </span>
                </div>
              </div>

              <div className="overflow-auto max-h-96 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-600 border-b border-gray-200">
                      <th className="px-6 py-4 border-r border-gray-200 w-12 text-center">#</th>
                      {executionResult.columns.map((col: string) => (
                        <th key={col} className="px-6 py-4 border-r border-gray-200 whitespace-nowrap min-w-[120px]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {allRows.length > 0 ? (
                      allRows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 border-r border-gray-200 text-center font-medium text-gray-400 bg-gray-50/50">
                            {(currentPage - 1) * pageSize + rowIndex + 1}
                          </td>
                          {executionResult.columns.map((col: string, colIndex: number) => (
                            <td key={col} className="px-6 py-4 border-r border-gray-100 font-mono text-gray-700 whitespace-nowrap min-w-[120px]">
                              {row[colIndex] !== null && row[colIndex] !== undefined ? (
                                typeof row[colIndex] === 'number' ? row[colIndex].toFixed(2) : String(row[colIndex])
                              ) : (
                                <span className="text-red-400 italic font-medium">null</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={executionResult.columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{allRows.length}</span> total rows
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="page-size" className="text-sm text-gray-600">Rows per page:</label>
                      <select
                        id="page-size"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPageChange(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟪
                    </button>

                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(allRows.length / pageSize);
                        const pages = [];
                        let startPage = Math.max(1, currentPage - 2);
                        let endPage = Math.min(totalPages, startPage + 4);

                        if (endPage - startPage < 4) {
                          startPage = Math.max(1, endPage - 4);
                        }

                        if (startPage > 1) {
                          pages.push(
                            <span key="start-ellipsis" className="px-2 py-1 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => onPageChange(i)}
                              className={`px-3 py-1 text-sm border rounded ${
                                currentPage === i
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        if (endPage < totalPages) {
                          pages.push(
                            <span key="end-ellipsis" className="px-2 py-1 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <button
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === Math.ceil(allRows.length / pageSize)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => onPageChange(Math.ceil(allRows.length / pageSize))}
                      disabled={currentPage === Math.ceil(allRows.length / pageSize)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟫
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, allRows.length)}</strong> to{' '}
                    <strong>{Math.min(currentPage * pageSize, allRows.length)}</strong> of{' '}
                    <strong>{allRows.length}</strong> rows
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Go to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={Math.ceil(allRows.length / pageSize)}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Number(e.target.value);
                        const totalPages = Math.ceil(allRows.length / pageSize);
                        if (page >= 1 && page <= totalPages) {
                          onPageChange(page);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}