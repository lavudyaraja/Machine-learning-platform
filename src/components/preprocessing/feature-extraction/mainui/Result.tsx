"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Download,
  Layers,
  TrendingUp,
  BarChart3,
  Database,
  Table2,
  TableIcon,
  FileText
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

const extractionMethods = [
  { value: "pca", label: "Principal Component Analysis (PCA)", icon: "📊", description: "Reduces dimensionality while preserving maximum variance" },
  { value: "lda", label: "Linear Discriminant Analysis (LDA)", icon: "🎯", description: "Maximizes class separability for classification tasks" },
  { value: "ica", label: "Independent Component Analysis (ICA)", icon: "🔀", description: "Separates multivariate signals into independent components" },
  { value: "svd", label: "Singular Value Decomposition (SVD)", icon: "🔢", description: "Decomposes matrix into singular vectors and values" },
  { value: "factor_analysis", label: "Factor Analysis", icon: "🔍", description: "Identifies underlying latent factors in data" },
];

interface ResultProps {
  selectedMethods: string[];
  selectedColumns: string[];
  config: FeatureExtractionConfig;
  executionResult: {
    methods: string[];
    columns: string[];
    executed: boolean;
    executedAt?: string;
    transformedData?: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
    originalData?: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
    metrics?: {
      originalRows: number;
      originalColumns: number;
      processedRows: number;
      processedColumns: number;
      extractedComponents: string[];
      varianceExplained: number;
      explainedVarianceRatio: number[];
      method: string;
    };
  } | null;
  isExecuting: boolean;
  datasetId?: string;
  targetColumn?: string;
  processedDatasetFromFeatureSelector?: {
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  };
}


export default function Result({
  selectedMethods,
  selectedColumns,
  config,
  executionResult,
  isExecuting,
  datasetId,
  targetColumn,
  processedDatasetFromFeatureSelector,
}: ResultProps) {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [originalDatasetData, setOriginalDatasetData] = useState<{
    columns: string[];
    rows: unknown[][];
    totalRows: number;
  }>({ columns: [], rows: [], totalRows: 0 });
  const [transformedDatasetData, setTransformedDatasetData] = useState<{
    columns: string[];
    rows: unknown[][];
    totalRows: number;
  }>({ columns: [], rows: [], totalRows: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch transformed dataset after execution
  useEffect(() => {
    const fetchTransformedData = async () => {
      if (!executionResult?.executed || !executionResult.transformedData) {
        return;
      }

      setPreviewLoading(true);
      try {
        // Use the transformed data from execution result
        setTransformedDatasetData(executionResult.transformedData);
      } catch (error) {
        console.error("Error loading transformed dataset:", error);
        toast.error("Failed to load transformed dataset");
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchTransformedData();
  }, [executionResult?.executed, executionResult?.transformedData]);

  // Fetch original dataset for display
  useEffect(() => {
    const fetchOriginalDataset = async () => {
      if (!datasetId) return;

      try {
        // Use original data from execution result if available, otherwise fetch
        if (executionResult?.originalData) {
          setOriginalDatasetData(executionResult.originalData);
        } else {
          const response = await api.get<{
            preview?: {
              columns: string[];
              rows: unknown[][];
              totalRows: number;
            }
          }>(
            `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=500&preview=true`
          );

          if (response.preview) {
            setOriginalDatasetData({
              columns: response.preview.columns,
              rows: response.preview.rows,
              totalRows: response.preview.totalRows
            });
          }
        }
      } catch (error) {
        console.error("Error fetching original dataset:", error);
        setOriginalDatasetData({ columns: [], rows: [], totalRows: 0 });
      }
    };

    fetchOriginalDataset();
  }, [datasetId, executionResult?.originalData]);


  const exportResults = (format: string) => {
    if (!executionResult?.transformedData) {
      toast.error("No transformed data available to export");
      return;
    }

    const { columns, rows } = executionResult.transformedData;

    if (format === 'excel') {
      // Generate Excel file
      const XLSX = require('xlsx');
      const data = [
        columns,
        ...rows.map(row => row.map(v => {
          const num = parseFloat(String(v));
          return isNaN(num) ? v : parseFloat(num.toFixed(6));
        }))
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Feature Extraction Results');

      XLSX.writeFile(wb, `feature-extraction-results.xlsx`);
      toast.success("Excel file exported successfully!");
    } else if (format === 'csv') {
      // Generate CSV file
      const csvContent = [
        columns.join(","),
        ...rows.map(row => row.map(v => String(v)).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feature-extraction-results.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV file exported successfully!");
    }
  };

  const generateReport = (format: string) => {
    if (format === 'html') {
      // Generate HTML report
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Feature Extraction Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 24px; }
            .content { padding: 24px; }
            .section { margin-bottom: 32px; }
            .method-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
            .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Feature Extraction Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <div class="section">
                <h2>Configuration Summary</h2>
                <div class="stats-grid">
                  <div class="stat-card">
                    <h3>Methods Applied</h3>
                    <p>${executionResult?.methods.length || 0} method(s)</p>
                  </div>
                  <div class="stat-card">
                    <h3>Features Used</h3>
                    <p>${executionResult?.columns.length || 'all numeric'} column(s)</p>
                  </div>
                  <div class="stat-card">
                    <h3>Components</h3>
                    <p>${config.nComponents || 2}</p>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>Extraction Results</h2>
                ${executionResult?.transformedData ? `
                  <div class="method-card">
                    <h3>${extractionMethods.find(m => m.value === executionResult.methods[0])?.label || executionResult.methods[0]}</h3>
                    <p>${extractionMethods.find(m => m.value === executionResult.methods[0])?.description || ''}</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Row</th>
                          ${executionResult.transformedData.columns.map((name: string) => `<th>${name}</th>`).join('')}
                        </tr>
                      </thead>
                      <tbody>
                        ${executionResult.transformedData.rows.slice(0, 10).map((row: unknown[], idx: number) => `
                          <tr>
                            <td>${idx + 1}</td>
                            ${row.map((value: unknown) => `<td>${String(value)}</td>`).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    ${executionResult.transformedData.rows.length > 10 ? `<p><em>Showing first 10 rows of ${executionResult.transformedData.rows.length} total rows</em></p>` : ''}
                  </div>
                ` : '<p>No results available</p>'}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feature-extraction-report.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("HTML report downloaded successfully!");
    } else if (format === 'pdf') {
      // Simple PDF generation using print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const htmlContent = `
          <html>
            <head>
              <title>Feature Extraction Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .section { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                th { background: #f5f5f5; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Feature Extraction Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="section">
                <h2>Configuration Summary</h2>
                <p><strong>Methods Applied:</strong> ${executionResult?.methods.length || 0}</p>
                <p><strong>Features Used:</strong> ${executionResult?.columns.length || 'all numeric'}</p>
                <p><strong>Components:</strong> ${config.nComponents || 2}</p>
              </div>
              <div class="section">
                <h2>Results Preview</h2>
                ${executionResult?.transformedData ? `
                  <h3>${extractionMethods.find(m => m.value === executionResult.methods[0])?.label || executionResult.methods[0]}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Row</th>
                        ${executionResult.transformedData.columns.map((name: string) => `<th>${name}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${executionResult.transformedData.rows.slice(0, 5).map((row: unknown[], idx: number) => `
                        <tr>
                          <td>${idx + 1}</td>
                          ${row.map((value: unknown) => `<td>${String(value)}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p>No results available</p>'}
              </div>
            </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
        toast.success("PDF report opened in print dialog!");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Review & Execute Feature Extraction</h2>
        <p className="text-slate-500">
          Review your configuration and execute the feature extraction process
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Configuration Summary</h3>
            <p className="text-sm text-slate-500">Review your extraction settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-medium text-slate-500 mb-1">Methods</p>
            <p className="text-sm font-semibold text-slate-900">
              {selectedMethods.map((m) => extractionMethods.find((method) => method.value === m)?.label).join(", ")}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-medium text-slate-500 mb-1">Features</p>
            <p className="text-sm font-semibold text-slate-900">
              {selectedColumns.length > 0 ? `${selectedColumns.length} selected` : "All numeric columns"}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-medium text-slate-500 mb-1">Components</p>
            <p className="text-sm font-semibold text-slate-900">
              {config.nComponents || 2}
            </p>
          </div>
        </div>
      </div>

      

      {/* Execution Results */}
      {executionResult?.executed && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-md">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">
                  Feature Extraction Completed Successfully
                </h3>
                <p className="text-sm text-emerald-700 font-medium">
                  Applied {executionResult.methods.length} extraction method(s) to {executionResult.columns.length > 0 ? `${executionResult.columns.length} selected` : "all numeric"} column(s)
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

          {/* Results Display */}
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-500">Processing results...</p>
              </div>
            </div>
          ) : executionResult?.transformedData ? (
            (() => {
              const method = executionResult.methods[0];
              const methodInfo = extractionMethods.find((m) => m.value === method);
              const metrics = executionResult.metrics;
              
              return (
                <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden">
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{methodInfo?.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{methodInfo?.label}</h3>
                          <p className="text-sm text-slate-500">{methodInfo?.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Variance Explained */}
                    {metrics?.explainedVarianceRatio && metrics.explainedVarianceRatio.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-slate-600" />
                          Explained Variance Ratio
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {metrics.explainedVarianceRatio.map((variance: number, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100"
                            >
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                {metrics.extractedComponents[idx] || `Component ${idx + 1}`}
                              </p>
                              <p className="text-2xl font-bold text-blue-600">
                                {(variance * 100).toFixed(1)}%
                              </p>
                              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                  style={{ width: `${variance * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {metrics.varianceExplained && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm font-medium text-slate-700">
                              Cumulative Variance: <span className="text-lg font-bold text-green-600">
                                {(metrics.varianceExplained * 100).toFixed(2)}%
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="h-px bg-slate-100" />

                    {/* Dataset Comparison */}
                    {executionResult.transformedData.rows.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Database className="h-4 w-4 text-slate-600" />
                          Dataset Comparison
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Original Dataset */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                              <span className="text-sm font-medium text-gray-700">Original Dataset</span>
                            </div>
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                              <div className="overflow-auto max-h-[400px] max-w-full scrollbar-hide">
                                <Table>
                                  <TableHeader className="sticky top-0 z-10">
                                    <TableRow className="bg-gray-50">
                                      {originalDatasetData.columns.map((col: string) => (
                                        <TableHead key={col} className="text-xs font-semibold text-gray-700 whitespace-nowrap px-2 py-2 min-w-[100px]">
                                          {col}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {originalDatasetData.rows.map((row: unknown[], rowIdx: number) => (
                                      <TableRow key={rowIdx} className="hover:bg-gray-50">
                                        {row.map((cell: unknown, cellIdx: number) => (
                                          <TableCell key={cellIdx} className="text-xs px-2 py-1 whitespace-nowrap min-w-[100px]">
                                            {String(cell ?? '')}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>

                          {/* Transformed Dataset */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-medium text-blue-700">Transformed Dataset</span>
                            </div>
                            <div className="border border-blue-200 rounded-xl overflow-hidden bg-white">
                              <div className="overflow-auto max-h-[400px] max-w-full scrollbar-hide">
                                <Table>
                                  <TableHeader className="sticky top-0 z-10">
                                    <TableRow className="bg-blue-50">
                                      <TableHead className="text-xs font-semibold text-blue-700 px-2 py-2 min-w-[80px]">Row</TableHead>
                                      {executionResult.transformedData.columns.map((name: string) => (
                                        <TableHead key={name} className="text-xs font-semibold text-blue-700 px-2 py-2 min-w-[100px]">
                                          {name}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {executionResult.transformedData.rows.map((row: unknown[], rowIdx: number) => (
                                      <TableRow key={rowIdx} className="hover:bg-blue-50/50">
                                        <TableCell className="font-medium text-xs text-center text-blue-600 bg-blue-50/30 px-2 py-1 min-w-[80px]">
                                          {rowIdx + 1}
                                        </TableCell>
                                        {row.map((value: unknown, colIdx: number) => {
                                          const numValue = parseFloat(String(value));
                                          return (
                                            <TableCell key={colIdx} className="font-mono text-xs text-blue-700 px-2 py-1 min-w-[100px]">
                                              {isNaN(numValue) ? String(value) : numValue.toFixed(4)}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No results available</p>
            </div>
          )}
        </div>
      )}


      {/* Dataset Download Modal */}
      <Dialog open={showDatasetModal} onOpenChange={setShowDatasetModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <TableIcon className="h-5 w-5 text-green-600" />
              Download Dataset
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Choose the format for your processed dataset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <button
              onClick={() => {
                exportResults('excel');
                setShowDatasetModal(false);
              }}
              className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <TableIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-900">Excel (.xlsx)</p>
                  <p className="text-sm text-green-700">Spreadsheet format with multiple sheets</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                exportResults('csv');
                setShowDatasetModal(false);
              }}
              className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-amber-900">CSV (.csv)</p>
                  <p className="text-sm text-amber-700">Comma-separated values format</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Download Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              Download Report
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Choose the format for your feature extraction report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <button
              onClick={() => {
                generateReport('html');
                setShowReportModal(false);
              }}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-900">HTML Report</p>
                  <p className="text-sm text-blue-700">Interactive web-based report</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                generateReport('pdf');
                setShowReportModal(false);
              }}
              className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-purple-900">PDF Report</p>
                  <p className="text-sm text-purple-700">Printable document format</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
