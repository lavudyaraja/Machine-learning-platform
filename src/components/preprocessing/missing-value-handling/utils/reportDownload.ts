import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportData {
  datasetName?: string;
  executionResult: {
    methods: string[];
    columns: string[];
    executed: boolean;
    executedAt?: string;
    droppedRows?: number;
    droppedColumns?: number;
    constantValueUsed?: string | number;
  };
  statistics?: {
    mean?: Record<string, number>;
    median?: Record<string, number>;
    mode?: Record<string, number | string>;
    std?: Record<string, number>;
    variance?: Record<string, number>;
    q1?: Record<string, number>;
    q2?: Record<string, number>;
    q3?: Record<string, number>;
  };
  missingValuesInfo?: Record<string, { count: number; percentage: number }>;
}

interface DatasetExportData {
  columns: string[];
  rows: unknown[][];
  statistics?: {
    mean?: Record<string, number>;
    median?: Record<string, number>;
    mode?: Record<string, number | string>;
    std?: Record<string, number>;
    variance?: Record<string, number>;
    q1?: Record<string, number>;
    q2?: Record<string, number>;
    q3?: Record<string, number>;
  };
}

export function downloadReportAsPDF(data: ReportData): void {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('Missing Value Handling Report', 20, 20);

  // Dataset info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Dataset: ${data.datasetName || 'Unknown'}`, 20, 35);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);

  let yPosition = 60;

  // Execution Summary
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Execution Summary', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Methods Applied: ${data.executionResult.methods.join(', ')}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Columns Processed: ${data.executionResult.columns.join(', ')}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Execution Time: ${data.executionResult.executedAt || 'Unknown'}`, 20, yPosition);
  yPosition += 8;

  if (data.executionResult.droppedRows) {
    doc.text(`Rows Dropped: ${data.executionResult.droppedRows}`, 20, yPosition);
    yPosition += 8;
  }
  if (data.executionResult.droppedColumns) {
    doc.text(`Columns Dropped: ${data.executionResult.droppedColumns}`, 20, yPosition);
    yPosition += 8;
  }
  if (data.executionResult.constantValueUsed) {
    doc.text(`Constant Value Used: ${data.executionResult.constantValueUsed}`, 20, yPosition);
    yPosition += 8;
  }

  yPosition += 10;

  // Statistics Table
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Column Statistics', 20, yPosition);
    yPosition += 10;

    const statColumns = ['Column', 'Mean', 'Median', 'Mode', 'Std Dev', 'Variance', 'Q1', 'Q2', 'Q3'];
    const statData: (string | number)[][] = [];

    // Get all column names
    const allColumns = new Set<string>();
    Object.keys(data.statistics).forEach(stat => {
      const statData = data.statistics![stat as keyof typeof data.statistics] as Record<string, any>;
      Object.keys(statData).forEach(col => allColumns.add(col));
    });

    Array.from(allColumns).forEach(column => {
      const row = [column];
      statColumns.slice(1).forEach(stat => {
        const statKey = stat.toLowerCase().replace(' ', '').replace('dev', '');
        const statData = data.statistics![statKey as keyof typeof data.statistics] as Record<string, any>;
        row.push(statData?.[column] ?? 'N/A');
      });
      statData.push(row);
    });

    autoTable(doc, {
      startY: yPosition,
      head: [statColumns],
      body: statData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Missing Values Info
  if (data.missingValuesInfo && Object.keys(data.missingValuesInfo).length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Missing Values Summary', 20, yPosition);
    yPosition += 10;

    const missingData = Object.entries(data.missingValuesInfo).map(([column, info]) => [
      column,
      info.count.toString(),
      `${info.percentage.toFixed(2)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Column', 'Missing Count', 'Missing Percentage']],
      body: missingData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });
  }

  // Save the PDF
  doc.save(`missing_values_report_${timestamp}.pdf`);
}

export function downloadReportAsExcel(data: ReportData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Missing Value Handling Report'],
    ['Dataset', data.datasetName || 'Unknown'],
    ['Generated', new Date().toLocaleString()],
    [''],
    ['Execution Summary'],
    ['Methods Applied', data.executionResult.methods.join(', ')],
    ['Columns Processed', data.executionResult.columns.join(', ')],
    ['Execution Time', data.executionResult.executedAt || 'Unknown'],
    ...(data.executionResult.droppedRows ? [['Rows Dropped', data.executionResult.droppedRows]] : []),
    ...(data.executionResult.droppedColumns ? [['Columns Dropped', data.executionResult.droppedColumns]] : []),
    ...(data.executionResult.constantValueUsed ? [['Constant Value Used', data.executionResult.constantValueUsed]] : []),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Statistics sheet
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    const statHeaders = ['Column', 'Mean', 'Median', 'Mode', 'Std Dev', 'Variance', 'Q1', 'Q2', 'Q3'];
    const statData: (string | number)[][] = [statHeaders];

    const allColumns = new Set<string>();
    Object.keys(data.statistics).forEach(stat => {
      const statData = data.statistics![stat as keyof typeof data.statistics] as Record<string, any>;
      Object.keys(statData).forEach(col => allColumns.add(col));
    });

    Array.from(allColumns).forEach(column => {
      const row = [column];
      statHeaders.slice(1).forEach(stat => {
        const statKey = stat.toLowerCase().replace(' ', '').replace('dev', '');
        const statData = data.statistics![statKey as keyof typeof data.statistics] as Record<string, any>;
        row.push(statData?.[column] ?? 'N/A');
      });
      statData.push(row);
    });

    const wsStats = XLSX.utils.aoa_to_sheet(statData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistics');
  }

  // Missing Values sheet
  if (data.missingValuesInfo && Object.keys(data.missingValuesInfo).length > 0) {
    const missingHeaders = ['Column', 'Missing Count', 'Missing Percentage'];
    const missingData = [missingHeaders];

    Object.entries(data.missingValuesInfo).forEach(([column, info]) => {
      missingData.push([column, info.count.toString(), `${info.percentage.toFixed(2)}%`]);
    });

    const wsMissing = XLSX.utils.aoa_to_sheet(missingData);
    XLSX.utils.book_append_sheet(wb, wsMissing, 'Missing Values');
  }

  XLSX.writeFile(wb, `missing_values_report_${timestamp}.xlsx`);
}

export function downloadReportAsCSV(data: ReportData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (data.missingValuesInfo && Object.keys(data.missingValuesInfo).length > 0) {
    const csvContent = [
      'Column,Missing Count,Missing Percentage',
      ...Object.entries(data.missingValuesInfo).map(([column, info]) =>
        `${column},${info.count},${info.percentage.toFixed(2)}%`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `missing_values_report_${timestamp}.csv`;
    link.click();
  } else {
    // Fallback to basic report
    const csvContent = [
      'Report Type,Missing Value Handling Report',
      `Dataset,${data.datasetName || 'Unknown'}`,
      `Generated,${new Date().toLocaleString()}`,
      `Methods Applied,${data.executionResult.methods.join(', ')}`,
      `Columns Processed,${data.executionResult.columns.join(', ')}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `missing_values_report_${timestamp}.csv`;
    link.click();
  }
}

export function downloadDatasetAsCSV(data: DatasetExportData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Create CSV content
  const csvRows = [
    data.columns.join(','), // Header row
    ...data.rows.map(row => row.map(cell =>
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : String(cell)
    ).join(','))
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `processed_dataset_${timestamp}.csv`;
  link.click();
}

export function downloadDatasetAsExcel(data: DatasetExportData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const wb = XLSX.utils.book_new();

  // Main dataset sheet
  const wsData = XLSX.utils.aoa_to_sheet([data.columns, ...data.rows]);
  XLSX.utils.book_append_sheet(wb, wsData, 'Processed Dataset');

  // Statistics sheet if available
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    const statHeaders = ['Statistic', 'Value'];
    const statData: (string | number)[][] = [statHeaders];

    Object.entries(data.statistics).forEach(([stat, values]) => {
      if (values) {
        Object.entries(values).forEach(([column, value]) => {
          statData.push([`${stat} - ${column}`, value]);
        });
      }
    });

    const wsStats = XLSX.utils.aoa_to_sheet(statData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistics');
  }

  XLSX.writeFile(wb, `processed_dataset_${timestamp}.xlsx`);
}
