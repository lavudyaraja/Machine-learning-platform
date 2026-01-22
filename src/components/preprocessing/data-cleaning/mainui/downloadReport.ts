/**
 * Data Cleaning Download Report Module
 * 
 * Complete download functionality for:
 * - Reports (PDF, CSV, HTML, Excel)
 * - Datasets (CSV, Excel)
 * 
 * All download-related logic is centralized here for better maintainability.
 */

import { toast } from "sonner";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { generateHTMLReport, generateCSVReport, generateExcelReport, generatePDFReport } from "./reportGenerator";

export interface DownloadReportParams {
  executionResult: {
    methods: string[];
    columns: string[];
    executed: boolean;
    executedAt?: string;
    pipelineResults?: Record<string, any>;
    finalData?: {
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
  dataset: {
    id?: string;
    name?: string;
    filename?: string;
    rows?: number;
    columns?: number;
  } | null;
  datasetId?: string;
  selectedMethods: string[];
  selectedColumns: string[];
  config: any;
  onCloseDialog?: () => void;
}

/**
 * Download Report as PDF
 */
export async function downloadReportAsPDF(params: DownloadReportParams): Promise<void> {
  const { executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog } = params;

  if (!executionResult || !dataset) {
    toast.error('No results available to download');
    return;
  }

  try {
    const reportData = {
      dataset: {
        id: datasetId,
        name: dataset.name,
        filename: dataset.filename,
        rows: dataset.rows,
        columns: dataset.columns
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
      trackingInfo: {
        executedAt: executionResult.executedAt,
        resultsReceivedAt: executionResult.executedAt
      }
    };

    generatePDFReport(reportData);
    onCloseDialog?.();
    toast.success('PDF report ready for printing/saving');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report');
  }
}

/**
 * Download Report as CSV
 */
export async function downloadReportAsCSV(params: DownloadReportParams): Promise<void> {
  const { executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog } = params;

  if (!executionResult || !dataset) {
    toast.error('No results available to download');
    return;
  }

  try {
    const reportData = {
      dataset: {
        id: datasetId,
        name: dataset.name,
        filename: dataset.filename,
        rows: dataset.rows,
        columns: dataset.columns
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
      trackingInfo: {
        executedAt: executionResult.executedAt,
        resultsReceivedAt: executionResult.executedAt
      }
    };

    const csvContent = generateCSVReport(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    const reportName = `data-cleaning-report-${dataset.name || dataset.filename || 'dataset'}-${timestamp}`;
    a.download = `${reportName}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    onCloseDialog?.();
    toast.success('Report downloaded as CSV successfully');
  } catch (error) {
    console.error('Error downloading CSV:', error);
    toast.error('Failed to download CSV report');
  }
}

/**
 * Download Report as HTML
 */
export async function downloadReportAsHTML(params: DownloadReportParams): Promise<void> {
  const { executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog } = params;

  if (!executionResult || !dataset) {
    toast.error('No results available to download');
    return;
  }

  try {
    const reportData = {
      dataset: {
        id: datasetId,
        name: dataset.name,
        filename: dataset.filename,
        rows: dataset.rows,
        columns: dataset.columns
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
      trackingInfo: {
        executedAt: executionResult.executedAt,
        resultsReceivedAt: executionResult.executedAt
      }
    };

    const htmlContent = generateHTMLReport(reportData);
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    const reportName = `data-cleaning-report-${dataset.name || dataset.filename || 'dataset'}-${timestamp}`;
    a.download = `${reportName}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Also open in new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    onCloseDialog?.();
    toast.success('Report downloaded and opened as HTML');
  } catch (error) {
    console.error('Error generating HTML:', error);
    toast.error('Failed to generate HTML report');
  }
}

/**
 * Download Report as Excel
 */
export async function downloadReportAsExcel(params: DownloadReportParams): Promise<void> {
  const { executionResult, dataset, datasetId, selectedMethods, selectedColumns, config, onCloseDialog } = params;

  if (!executionResult || !dataset) {
    toast.error('No results available to download');
    return;
  }

  try {
    toast.loading('Generating Excel report...', { id: 'download-report-excel' });
    
    const reportData = {
      dataset: {
        id: datasetId,
        name: dataset.name,
        filename: dataset.filename,
        rows: dataset.rows,
        columns: dataset.columns
      },
      selectedMethods,
      selectedColumns,
      config,
      executionResult,
      trackingInfo: {
        executedAt: executionResult.executedAt,
        resultsReceivedAt: executionResult.executedAt
      }
    };

    const excelBlob = await generateExcelReport(reportData);
    const url = URL.createObjectURL(excelBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().split('T')[0];
    const reportName = `data-cleaning-report-${dataset.name || dataset.filename || 'dataset'}-${timestamp}`;
    link.setAttribute('download', `${reportName}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onCloseDialog?.();
    toast.success('Report downloaded as Excel successfully', { id: 'download-report-excel' });
  } catch (error) {
    console.error('Error downloading Excel:', error);
    toast.error('Failed to download Excel report. Trying CSV...', { id: 'download-report-excel' });
    // Fallback to CSV
    await downloadReportAsCSV(params);
  }
}

export interface DownloadDatasetParams {
  datasetId?: string;
  executionResult: {
    columns: string[];
    executed: boolean;
  } | null;
  dataset: {
    name?: string;
    filename?: string;
  } | null;
  onCloseDialog?: () => void;
}

/**
 * Download Dataset as CSV
 */
export async function downloadDatasetAsCSV(params: DownloadDatasetParams): Promise<void> {
  const { datasetId, executionResult, dataset, onCloseDialog } = params;

  if (!datasetId || !executionResult || !dataset) {
    toast.error('No dataset available to download');
    return;
  }

  try {
    toast.loading('Preparing dataset...', { id: 'download-dataset-csv' });
    
    const firstPage = await api.get<{ preview?: { totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number } }>(
      `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=10000&preview=true`
    );

    if (!firstPage.preview) {
      throw new Error('Failed to fetch dataset');
    }

    const { columns: datasetColumns, rows: firstRows, totalPages } = firstPage.preview;
    
    let allRowsData: unknown[][] = [...firstRows];
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        const pageData = await api.get<{ preview?: { rows: unknown[][] } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=${page}&pageSize=10000&preview=true`
        );
        if (pageData.preview?.rows) {
          allRowsData.push(...pageData.preview.rows);
        }
      }
    }

    const columnsToUse = executionResult.columns.length > 0 
      ? executionResult.columns 
      : datasetColumns;
    
    const csvRows = [
      columnsToUse.join(','),
      ...allRowsData.map(row => {
        const rowData = columnsToUse.map(colName => {
          const colIdx = datasetColumns.indexOf(colName);
          const cell = colIdx >= 0 ? row[colIdx] : null;
          const cellValue = String(cell ?? '').replace(/"/g, '""');
          return `"${cellValue}"`;
        });
        return rowData.join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name || dataset.filename || 'dataset'}_cleaned.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    onCloseDialog?.();
    toast.success('Dataset downloaded as CSV', { id: 'download-dataset-csv' });
  } catch (error) {
    console.error('Error downloading dataset:', error);
    toast.error('Failed to download dataset as CSV', { id: 'download-dataset-csv' });
  }
}

/**
 * Download Dataset as Excel
 */
export async function downloadDatasetAsExcel(params: DownloadDatasetParams): Promise<void> {
  const { datasetId, executionResult, dataset, onCloseDialog } = params;

  if (!datasetId || !executionResult || !dataset) {
    toast.error('No dataset available to download');
    return;
  }

  try {
    toast.loading('Preparing dataset...', { id: 'download-dataset-excel' });
    const XLSX = await import('xlsx').catch(() => null);
    
    if (!XLSX) {
      toast.info('Excel library not available. Downloading as CSV instead.', { id: 'download-dataset-excel' });
      await downloadDatasetAsCSV(params);
      return;
    }

    const firstPage = await api.get<{ preview?: { totalRows: number; columns: string[]; rows: unknown[][]; totalPages: number } }>(
      `${API_ENDPOINTS.datasetsById(datasetId)}?page=1&pageSize=10000&preview=true`
    );

    if (!firstPage.preview) {
      throw new Error('Failed to fetch dataset');
    }

    const { columns: datasetColumns, rows: firstRows, totalPages } = firstPage.preview;
    
    let allRowsData: unknown[][] = [...firstRows];
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        const pageData = await api.get<{ preview?: { rows: unknown[][] } }>(
          `${API_ENDPOINTS.datasetsById(datasetId)}?page=${page}&pageSize=10000&preview=true`
        );
        if (pageData.preview?.rows) {
          allRowsData.push(...pageData.preview.rows);
        }
      }
    }

    const columnsToUse = executionResult.columns.length > 0 
      ? executionResult.columns 
      : datasetColumns;

    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      columnsToUse,
      ...allRowsData.map(row => {
        return columnsToUse.map(colName => {
          const colIdx = datasetColumns.indexOf(colName);
          return colIdx >= 0 ? row[colIdx] : null;
        });
      })
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Dataset');
    XLSX.writeFile(workbook, `${dataset.name || dataset.filename || 'dataset'}_cleaned.xlsx`);
    
    onCloseDialog?.();
    toast.success('Dataset downloaded as Excel', { id: 'download-dataset-excel' });
  } catch (error) {
    console.error('Error downloading Excel:', error);
    toast.error('Failed to download Excel. Trying CSV...', { id: 'download-dataset-excel' });
    // Fallback to CSV
    await downloadDatasetAsCSV(params);
  }
}

