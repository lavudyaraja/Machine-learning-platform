"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, Sparkles, Zap, ChevronRight, Download, FileText, FileSpreadsheet,
  FileCode, GitCompare, Info, AlertCircle, Loader2
} from "lucide-react";
import { cleaningMethods } from "./dataCleaningMethods";
import { useDatasetDetail } from "@/hooks/useDataset";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  downloadReportAsPDF, downloadReportAsCSV, downloadReportAsHTML, downloadReportAsExcel,
  downloadDatasetAsCSV, downloadDatasetAsExcel
} from "./downloadReport";

// Types
interface PipelineResult {
  success: boolean;
  rowsProcessed?: number;
  rowsAffected?: number;
  columnsAffected?: string[];
  errors?: string[];
  metadata?: Record<string, any>;
}

interface DataPreview {
  columns: string[];
  rows: unknown[][];
  totalRows: number;
}

interface ExecutionResult {
  methods: string[];
  columns: string[];
  executed: boolean;
  executedAt?: string;
  pipelineResults?: Record<string, PipelineResult>;
  finalData?: DataPreview;
  originalData?: DataPreview;
}

interface ResultProps {
  selectedMethods: string[];
  selectedColumns: string[];
  config: any;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  datasetId?: string;
  onBack: () => void;
  onExecute: () => void;
}

// Constants
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

// Helper Functions
const cleanCellValue = (cellValue: unknown): string => {
  if (cellValue === null || cellValue === undefined || cellValue === "") return "-";
  return String(cellValue).replace(/^"""|"""$/g, "").replace(/^"|"$/g, "").trim();
};

const getOptimalPageSize = (rowCount: number): number => {
  if (rowCount <= 50) return Math.max(10, Math.min(25, Math.ceil(rowCount / 2)));
  if (rowCount <= 200) return 25;
  if (rowCount <= 1000) return 50;
  return 100;
};

// Sub-Components
const SummaryCards = ({ 
  selectedMethods, 
  selectedColumns 
}: { 
  selectedMethods: string[]; 
  selectedColumns: string[];
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Selected Methods</h3>
      </div>
      <Badge variant="secondary" className="mb-2">{selectedMethods.length}</Badge>
      <p className="text-sm text-blue-700">
        {selectedMethods.map(m => cleaningMethods.find(method => method.value === m)?.label)
          .slice(0, 2).join(", ")}
        {selectedMethods.length > 2 && `, +${selectedMethods.length - 2} more`}
      </p>
    </div>

    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">Target Columns</h3>
      </div>
      <Badge variant="secondary" className="mb-2">
        {selectedColumns.length > 0 ? selectedColumns.length : "All"}
      </Badge>
      <p className="text-sm text-purple-700">
        {selectedColumns.length > 0 ? "Specific columns" : "All dataset columns"}
      </p>
    </div>
  </div>
);

const ExecutionBanner = ({
  executionResult,
  onDownloadReport,
  onDownloadDataset
}: {
  executionResult: ExecutionResult;
  onDownloadReport: () => void;
  onDownloadDataset: () => void;
}) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      <CheckCircle2 className="h-6 w-6 text-green-600" />
      <div>
        <h3 className="font-semibold text-green-900 text-lg">Pipeline Executed Successfully!</h3>
        <p className="text-sm text-green-700">
          Applied {executionResult.methods.length} cleaning methods to your dataset
        </p>
      </div>
    </div>
    <div className="flex gap-3">
      <Button onClick={onDownloadReport} className="flex-1 gap-2" variant="outline">
        <Download className="h-4 w-4" />
        Download Report
      </Button>
      <Button onClick={onDownloadDataset} className="flex-1 gap-2">
        <Download className="h-4 w-4" />
        Download Dataset
      </Button>
    </div>
  </div>
);

const PaginationControls = ({
  page,
  pageSize,
  totalRows,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange
}: {
  page: number;
  pageSize: number;
  totalRows: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => (
  <div className="flex items-center justify-center">
    <DataPagination
      currentPage={page}
      totalItems={totalRows}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  </div>
);

const DataTable = ({
  columns,
  rows,
  startIndex,
  originalColumns,
  showNewBadge = false
}: {
  columns: string[];
  rows: unknown[][];
  startIndex: number;
  originalColumns?: string[];
  showNewBadge?: boolean;
}) => (
  <div className="border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 bg-slate-50">Row</TableHead>
            {columns.map(col => {
              const isNew = showNewBadge && originalColumns && !originalColumns.includes(col);
              return (
                <TableHead key={col} className={isNew ? "bg-green-50" : "bg-slate-50"}>
                  <div className="flex items-center gap-2">
                    {col}
                    {isNew && <Badge variant="secondary" className="text-xs">New</Badge>}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="font-mono text-xs text-slate-500">
                {startIndex + rowIndex + 1}
              </TableCell>
              {columns.map((col, cellIndex) => {
                const isNew = showNewBadge && originalColumns && !originalColumns.includes(col);
                const displayValue = cleanCellValue(row[cellIndex]);
                return (
                  <TableCell
                    key={`${rowIndex}-${cellIndex}`}
                    className={`max-w-xs truncate ${isNew ? "bg-green-50" : ""}`}
                    title={displayValue}
                  >
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

const DownloadDialog = ({
  open,
  onOpenChange,
  type,
  onDownload
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "report" | "dataset";
  onDownload: {
    csv: () => void;
    excel: () => void;
    pdf?: () => void;
    html?: () => void;
  };
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Download {type === "report" ? "Report" : "Cleaned Dataset"}</DialogTitle>
        <DialogDescription>
          Choose a format to download your {type === "report" ? "comprehensive data cleaning report" : "processed dataset"}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Button 
          onClick={onDownload.csv} 
          variant="outline" 
          className="w-full h-auto flex items-start justify-start p-4 gap-3 hover:bg-slate-50 transition-colors"
        >
          <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex-col items-start text-left">
            <span className="font-semibold text-sm block mb-1">Download as CSV</span>
            <p className="text-xs text-slate-600">
              Spreadsheet compatible format for data analysis tools
            </p>
          </div>
        </Button>
        <Button 
          onClick={onDownload.excel} 
          variant="outline" 
          className="w-full h-auto flex items-start justify-start p-4 gap-3 hover:bg-slate-50 transition-colors"
        >
          <FileSpreadsheet className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex-col items-start text-left">
            <span className="font-semibold text-sm block mb-1">Download as Excel</span>
            <p className="text-xs text-slate-600">
              Microsoft Excel format with proper formatting
            </p>
          </div>
        </Button>
        {type === "report" && onDownload.pdf && (
          <Button 
            onClick={onDownload.pdf} 
            variant="outline" 
            className="w-full h-auto flex items-start justify-start p-4 gap-3 hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex-col items-start text-left">
              <span className="font-semibold text-sm block mb-1">Download as PDF</span>
              <p className="text-xs text-slate-600">
                Professional print-ready format with charts
              </p>
            </div>
          </Button>
        )}
        {type === "report" && onDownload.html && (
          <Button 
            onClick={onDownload.html} 
            variant="outline" 
            className="w-full h-auto flex items-start justify-start p-4 gap-3 hover:bg-slate-50 transition-colors"
          >
            <FileCode className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex-col items-start text-left">
              <span className="font-semibold text-sm block mb-1">Download as HTML</span>
              <p className="text-xs text-slate-600">
                Interactive web format for browsers
              </p>
            </div>
          </Button>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

// Main Component
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
  // State
  const [reportDownloadOpen, setReportDownloadOpen] = useState(false);
  const [datasetDownloadOpen, setDatasetDownloadOpen] = useState(false);
  const [originalPage, setOriginalPage] = useState(1);
  const [originalPageSize, setOriginalPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [cleanedPage, setCleanedPage] = useState(1);
  const [cleanedPageSize, setCleanedPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [comparisonPage, setComparisonPage] = useState(1);
  const [comparisonPageSize, setComparisonPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [previewTab, setPreviewTab] = useState<"original" | "cleaned" | "comparison">("comparison");

  const { dataset } = useDatasetDetail(datasetId || "");

  // Reset on execution
  useEffect(() => {
    if (executionResult?.executedAt) {
      setOriginalPage(1);
      setCleanedPage(1);
      setComparisonPage(1);
    }
  }, [executionResult?.executedAt]);

  // Auto-adjust page sizes
  useEffect(() => {
    if (executionResult?.originalData && executionResult?.finalData) {
      const maxRows = Math.max(
        executionResult.originalData.totalRows,
        executionResult.finalData.totalRows
      );
      const optimal = getOptimalPageSize(maxRows);
      setOriginalPageSize(optimal);
      setCleanedPageSize(optimal);
      setComparisonPageSize(optimal);
    }
  }, [executionResult?.originalData?.totalRows, executionResult?.finalData?.totalRows]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!executionResult?.originalData || !executionResult?.finalData) return null;

    const { originalData, finalData } = executionResult;

    // Original pagination
    const originalTotalPages = Math.ceil(originalData.totalRows / originalPageSize);
    const originalStartIndex = (originalPage - 1) * originalPageSize;
    const originalEndIndex = Math.min(originalStartIndex + originalPageSize, originalData.rows.length);
    const originalPaginatedRows = originalData.rows.slice(originalStartIndex, originalEndIndex);

    // Cleaned pagination
    const cleanedTotalPages = Math.ceil(finalData.totalRows / cleanedPageSize);
    const cleanedStartIndex = (cleanedPage - 1) * cleanedPageSize;
    const cleanedEndIndex = Math.min(cleanedStartIndex + cleanedPageSize, finalData.rows.length);
    const cleanedPaginatedRows = finalData.rows.slice(cleanedStartIndex, cleanedEndIndex);

    // Comparison pagination
    const maxRows = Math.max(originalData.totalRows, finalData.totalRows);
    const comparisonTotalPages = Math.ceil(maxRows / comparisonPageSize);
    const comparisonStartIndex = (comparisonPage - 1) * comparisonPageSize;
    const comparisonEndIndex = Math.min(comparisonStartIndex + comparisonPageSize, maxRows);

    return {
      original: {
        columns: originalData.columns,
        rows: originalPaginatedRows,
        totalPages: originalTotalPages,
        startIndex: originalStartIndex,
        endIndex: originalEndIndex,
        totalRows: originalData.totalRows,
      },
      cleaned: {
        columns: finalData.columns, // Use cleaned columns
        rows: cleanedPaginatedRows, // Use cleaned rows (from finalData)
        totalPages: cleanedTotalPages,
        startIndex: cleanedStartIndex,
        endIndex: cleanedEndIndex,
        totalRows: finalData.totalRows, // Use cleaned total rows
      },
      comparison: {
        originalColumns: originalData.columns,
        cleanedColumns: finalData.columns,
        originalRows: originalData.rows.slice(comparisonStartIndex, Math.min(comparisonEndIndex, originalData.rows.length)),
        cleanedRows: finalData.rows.slice(comparisonStartIndex, Math.min(comparisonEndIndex, finalData.rows.length)),
        totalPages: comparisonTotalPages,
        startIndex: comparisonStartIndex,
        endIndex: comparisonEndIndex,
        maxRows,
      },
    };
  }, [executionResult, originalPage, originalPageSize, cleanedPage, cleanedPageSize, comparisonPage, comparisonPageSize]);

  // Download handlers
  const downloadHandlers = useMemo(() => ({
    report: {
      pdf: () => downloadReportAsPDF({ executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog: () => setReportDownloadOpen(false) }),
      csv: () => downloadReportAsCSV({ executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog: () => setReportDownloadOpen(false) }),
      html: () => downloadReportAsHTML({ executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog: () => setReportDownloadOpen(false) }),
      excel: () => downloadReportAsExcel({ executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog: () => setReportDownloadOpen(false) }),
    },
    dataset: {
      csv: () => downloadDatasetAsCSV({ datasetId, executionResult, dataset, onCloseDialog: () => setDatasetDownloadOpen(false) }),
      excel: () => downloadDatasetAsExcel({ datasetId, executionResult, dataset, onCloseDialog: () => setDatasetDownloadOpen(false) }),
    },
  }), [executionResult, dataset, datasetId, selectedMethods, selectedColumns, config]);

  return (
    <div className="space-y-6">
      <SummaryCards selectedMethods={selectedMethods} selectedColumns={selectedColumns} />

      {executionResult?.executed && (
        <>
          <ExecutionBanner
            executionResult={executionResult}
            onDownloadReport={() => setReportDownloadOpen(true)}
            onDownloadDataset={() => setDatasetDownloadOpen(true)}
          />

          {/* Method Execution Results */}
          {executionResult.pipelineResults && Object.keys(executionResult.pipelineResults).length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Method Execution Results</h3>
              <div className="space-y-3">
                {Object.entries(executionResult.pipelineResults).map(([methodName, result]: [string, any]) => {
                  const methodInfo = cleaningMethods.find(m => m.value === methodName);
                  const methodLabel = methodInfo?.label || methodName;
                  
                  return (
                    <div
                      key={methodName}
                      className={`p-4 rounded-lg border ${
                        result.success === false
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.success === false ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          <span className="font-medium">{methodLabel}</span>
                        </div>
                        <Badge variant={result.success === false ? "destructive" : "default"}>
                          {result.success === false ? "Failed" : "Success"}
                        </Badge>
                      </div>
                      
                      {result.success !== false && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                          {result.rowsProcessed !== undefined && (
                            <div>
                              <span className="text-slate-600">Rows Processed:</span>
                              <span className="font-semibold ml-2">{result.rowsProcessed.toLocaleString()}</span>
                            </div>
                          )}
                          {result.rowsAffected !== undefined && result.rowsAffected > 0 && (
                            <div>
                              <span className="text-slate-600">Rows Affected:</span>
                              <span className="font-semibold ml-2 text-blue-600">{result.rowsAffected.toLocaleString()}</span>
                            </div>
                          )}
                          {result.columnsAffected && result.columnsAffected.length > 0 && (
                            <div>
                              <span className="text-slate-600">Columns:</span>
                              <span className="font-semibold ml-2">{result.columnsAffected.length}</span>
                            </div>
                          )}
                          {result.metadata && Object.keys(result.metadata).length > 0 && (
                            <div>
                              <span className="text-slate-600">Has Metadata:</span>
                              <span className="font-semibold ml-2 text-green-600">Yes</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {result.success === false && result.error && (
                        <div className="mt-2 text-sm text-red-700">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      
                      {result.metadata && Object.keys(result.metadata).length > 0 && (
                        <details className="mt-3">
                          <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">
                            View Metadata
                          </summary>
                          <pre className="mt-2 p-3 bg-slate-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {paginatedData && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Dataset Preview</h3>
                  <p className="text-sm text-slate-600">View your data before and after cleaning</p>
                </div>
              </div>

              <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="comparison">
                    <GitCompare className="h-4 w-4 mr-2" />
                    Side-by-Side
                  </TabsTrigger>
                  <TabsTrigger value="original">Original Dataset</TabsTrigger>
                  <TabsTrigger value="cleaned">Cleaned Dataset</TabsTrigger>
                </TabsList>

                <TabsContent value="original" className="space-y-4">
                  <DataTable
                    columns={paginatedData.original.columns}
                    rows={paginatedData.original.rows}
                    startIndex={paginatedData.original.startIndex}
                  />
                  <PaginationControls
                    page={originalPage}
                    pageSize={originalPageSize}
                    totalRows={paginatedData.original.totalRows}
                    startIndex={paginatedData.original.startIndex}
                    endIndex={paginatedData.original.endIndex}
                    onPageChange={setOriginalPage}
                    onPageSizeChange={(size) => { setOriginalPageSize(size); setOriginalPage(1); }}
                  />
                </TabsContent>

                <TabsContent value="cleaned" className="space-y-4">
                  <DataTable
                    columns={paginatedData.cleaned.columns}
                    rows={paginatedData.cleaned.rows}
                    startIndex={paginatedData.cleaned.startIndex}
                    originalColumns={paginatedData.original.columns}
                    showNewBadge={true}
                  />
                  <PaginationControls
                    page={cleanedPage}
                    pageSize={cleanedPageSize}
                    totalRows={paginatedData.cleaned.totalRows}
                    startIndex={paginatedData.cleaned.startIndex}
                    endIndex={paginatedData.cleaned.endIndex}
                    onPageChange={setCleanedPage}
                    onPageSizeChange={(size) => { setCleanedPageSize(size); setCleanedPage(1); }}
                  />
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-slate-100 p-3 border-b">
                        <h5 className="font-medium text-sm">Original ({paginatedData.comparison.originalColumns.length} cols)</h5>
                      </div>
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <DataTable
                          columns={paginatedData.comparison.originalColumns}
                          rows={paginatedData.comparison.originalRows}
                          startIndex={paginatedData.comparison.startIndex}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-100 p-3 border-b">
                        <h5 className="font-medium text-sm">Cleaned ({paginatedData.comparison.cleanedColumns.length} cols)</h5>
                      </div>
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <DataTable
                          columns={paginatedData.comparison.cleanedColumns}
                          rows={paginatedData.comparison.cleanedRows}
                          startIndex={paginatedData.comparison.startIndex}
                          originalColumns={paginatedData.comparison.originalColumns}
                          showNewBadge={true}
                        />
                      </div>
                    </div>
                  </div>
                  <PaginationControls
                    page={comparisonPage}
                    pageSize={comparisonPageSize}
                    totalRows={paginatedData.comparison.maxRows}
                    startIndex={paginatedData.comparison.startIndex}
                    endIndex={paginatedData.comparison.endIndex}
                    onPageChange={setComparisonPage}
                    onPageSizeChange={(size) => { setComparisonPageSize(size); setComparisonPage(1); }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">Back to Configuration</Button>
        <Button onClick={onExecute} disabled={isExecuting} className="flex-1 gap-2">
          {isExecuting ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : <><Zap className="h-4 w-4" />Execute Pipeline</>}
        </Button>
      </div>

      <DownloadDialog
        open={reportDownloadOpen}
        onOpenChange={setReportDownloadOpen}
        type="report"
        onDownload={downloadHandlers.report}
      />

      <DownloadDialog
        open={datasetDownloadOpen}
        onOpenChange={setDatasetDownloadOpen}
        type="dataset"
        onDownload={downloadHandlers.dataset}
      />
    </div>
  );
}