import { featureSelectionData } from "./data/featureSelectionData";

// Type definitions
export interface FeatureSelectionReportData {
  dataset?: {
    id?: string;
    name?: string;
    filename?: string;
    rows?: number;
    columns?: number;
  };
  selectedMethods: string[];
  selectedColumns: string[];
  config: any;
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
}

/**
 * Calculate all statistics for feature selection
 */
function calculateFeatureSelectionStatistics(data: FeatureSelectionReportData) {
  const originalColumns = data.executionResult?.originalData?.columns.length || data.dataset?.columns || 0;
  const selectedColumns = data.executionResult?.selectedFeatures.length || 0;
  const removedColumns = data.executionResult?.removedFeatures.length || 0;

  return {
    totalMethodsAvailable: featureSelectionData.length,
    totalMethodsSelected: data.selectedMethods.length,
    methodSelectionPercentage: ((data.selectedMethods.length / featureSelectionData.length) * 100).toFixed(1),
    totalColumnsAvailable: data.executionResult?.originalData?.columns.length || data.dataset?.columns || 0,
    totalColumnsSelected: data.selectedColumns.length,
    originalColumns,
    selectedColumns,
    removedColumns,
    retentionRate: originalColumns > 0 ? ((selectedColumns / originalColumns) * 100).toFixed(1) : 0,
    reductionRate: originalColumns > 0 ? ((removedColumns / originalColumns) * 100).toFixed(1) : 0,
  };
}

/**
 * Get method details with metadata
 */
function getFeatureSelectionMethodDetails(selectedMethods: string[]) {
  return selectedMethods.map(method => {
    const methodInfo = featureSelectionData.find(m => m.id === method);
    return {
      id: method,
      label: methodInfo?.label || method,
      category: methodInfo?.category || "Unknown",
      impact: methodInfo?.impact || "medium",
      description: methodInfo?.definition || "",
    };
  });
}

/**
 * Generate comprehensive HTML report for feature selection
 */
export function generateFeatureSelectionHTMLReport(data: FeatureSelectionReportData): string {
  const now = new Date();
  const reportTime = now.toLocaleString();
  const executionTime = data.executionResult?.timestamp
    ? new Date(data.executionResult.timestamp).toLocaleString()
    : "Not executed";

  // Calculate statistics
  const stats = calculateFeatureSelectionStatistics(data);
  const methodDetails = getFeatureSelectionMethodDetails(data.selectedMethods);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feature Selection Report - ${data.dataset?.name || 'Dataset'}</title>
  <style>
    ${getFeatureSelectionEnhancedStyles()}
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-content">
      <div class="header-title">
        <span class="icon">🎯</span>
        <h1>Feature Selection Report</h1>
      </div>
      <div class="header-meta">
        <div class="meta-item">
          <span class="meta-label">Generated:</span>
          <span class="meta-value">${reportTime}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Dataset:</span>
          <span class="meta-value">${data.dataset?.name || 'Unknown'}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="nav-bar">
    <a href="#overview" class="nav-link active">Overview</a>
    <a href="#methods" class="nav-link">Methods</a>
    <a href="#columns" class="nav-link">Columns</a>
    <a href="#configuration" class="nav-link">Configuration</a>
    <a href="#results" class="nav-link">Results</a>
    <a href="#data-preview" class="nav-link">Data Preview</a>
  </nav>

  <!-- Main Content -->
  <div class="container">
    <!-- Quick Stats Overview -->
    <section id="overview" class="section">
      <div class="section-header">
        <h2>📈 Feature Selection Statistics</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        <div class="stats-grid">
          ${generateFeatureSelectionStatsCards(stats)}
        </div>
      </div>
    </section>

    <!-- Dataset Information -->
    <section id="dataset" class="section">
      <div class="section-header">
        <h2>📁 Dataset Information</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        <div class="info-grid">
          ${generateFeatureSelectionDatasetInfo(data, stats)}
        </div>
      </div>
    </section>

    <!-- Method Selection -->
    <section id="methods" class="section">
      <div class="section-header">
        <h2>🔧 Selected Methods</h2>
        <div class="section-actions">
          <input type="text" placeholder="Search methods..." class="search-box" oninput="filterTable(this, 'methods-table')">
          <button class="btn-collapse" onclick="toggleSection(this)">−</button>
        </div>
      </div>
      <div class="section-content">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">Available Methods:</span>
            <span class="stat-value">${stats.totalMethodsAvailable}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Selected:</span>
            <span class="stat-value highlight">${stats.totalMethodsSelected}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Coverage:</span>
            <span class="stat-value">${stats.methodSelectionPercentage}%</span>
          </div>
        </div>

        <div class="table-wrapper">
          <table id="methods-table" class="data-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Category</th>
                <th>Impact Level</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${methodDetails.map(m => `
                <tr>
                  <td><strong>${m.label}</strong></td>
                  <td><span class="badge badge-${m.category.toLowerCase()}">${m.category}</span></td>
                  <td><span class="badge badge-${m.impact}">${m.impact.toUpperCase()}</span></td>
                  <td>${m.description.substring(0, 100)}${m.description.length > 100 ? '...' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Column Selection -->
    <section id="columns" class="section">
      <div class="section-header">
        <h2>📋 Column Selection</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">Total Columns:</span>
            <span class="stat-value">${stats.totalColumnsAvailable}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Selected for Processing:</span>
            <span class="stat-value highlight">${stats.totalColumnsSelected > 0 ? stats.totalColumnsSelected : 'All'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Type:</span>
            <span class="stat-value">${stats.totalColumnsSelected > 0 ? 'Specific' : 'All Columns'}</span>
          </div>
        </div>

        ${data.selectedColumns.length > 0 ? `
          <div class="chip-container">
            ${data.selectedColumns.map(col => `<span class="chip">${col}</span>`).join('')}
          </div>
        ` : '<div class="info-message">All columns were selected for feature selection processing</div>'}
      </div>
    </section>

    <!-- Configuration Details -->
    <section id="configuration" class="section">
      <div class="section-header">
        <h2>⚙️ Configuration Details</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        ${generateFeatureSelectionConfiguration(data.config)}
      </div>
    </section>

    <!-- Results Summary -->
    <section id="results" class="section">
      <div class="section-header">
        <h2>📊 Feature Selection Results</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        ${generateFeatureSelectionResults(data, stats)}
      </div>
    </section>

    <!-- Data Preview -->
    ${data.executionResult?.originalData && data.executionResult?.processedData ? `
      <section id="data-preview" class="section">
        <div class="section-header">
          <h2>👁️ Data Preview</h2>
          <div class="section-actions">
            <button class="btn-secondary" onclick="switchPreview('original')">Original</button>
            <button class="btn-secondary" onclick="switchPreview('selected')">Selected</button>
            <button class="btn-secondary" onclick="switchPreview('comparison')">Side by Side</button>
            <button class="btn-collapse" onclick="toggleSection(this)">−</button>
          </div>
        </div>
        <div class="section-content">
          ${generateFeatureSelectionDataPreview(data)}
        </div>
      </section>
    ` : ''}
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <p>Generated by Feature Selection Pipeline</p>
      <p>Report Time: ${reportTime}</p>
    </div>
  </footer>

  <script>
    ${getFeatureSelectionInteractiveScripts()}
  </script>
</body>
</html>
  `;
}

/**
 * Generate stats cards HTML for feature selection
 */
function generateFeatureSelectionStatsCards(stats: any): string {
  return `
    <div class="stat-card">
      <span class="stat-label">Original Features</span>
      <span class="stat-value">${stats.originalColumns}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Selected Features</span>
      <span class="stat-value">${stats.selectedColumns}</span>
      <span class="stat-change positive">
        ${stats.retentionRate}% retention
      </span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Removed Features</span>
      <span class="stat-value">${stats.removedColumns}</span>
      <span class="stat-change negative">
        ${stats.reductionRate}% reduction
      </span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Methods Applied</span>
      <span class="stat-value">${stats.totalMethodsSelected}</span>
    </div>
  `;
}

/**
 * Generate dataset info HTML for feature selection
 */
function generateFeatureSelectionDatasetInfo(data: FeatureSelectionReportData, stats: any): string {
  return `
    <div class="info-item">
      <span class="info-label">Dataset Name:</span>
      <span class="info-value">${data.dataset?.name || data.dataset?.filename || 'Unknown'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Dataset ID:</span>
      <span class="info-value">${data.dataset?.id || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Methods Applied:</span>
      <span class="info-value">${stats.totalMethodsSelected}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Execution Status:</span>
      <span class="info-value">${data.executionResult ? '✓ Completed' : '✗ Not Executed'}</span>
    </div>
  `;
}

/**
 * Generate configuration section HTML for feature selection
 */
function generateFeatureSelectionConfiguration(config: any): string {
  const configItems = [];

  if (config.varianceThreshold !== undefined) {
    configItems.push(['Variance Threshold', config.varianceThreshold]);
  }
  if (config.correlationThreshold !== undefined) {
    configItems.push(['Correlation Threshold', config.correlationThreshold]);
  }
  if (config.nFeatures !== undefined) {
    configItems.push(['Number of Features', config.nFeatures]);
  }
  if (config.alpha !== undefined) {
    configItems.push(['Alpha (Lasso)', config.alpha]);
  }
  if (config.targetColumn) {
    configItems.push(['Target Column', config.targetColumn]);
  }

  return `
    <div class="config-grid">
      ${configItems.map(([label, value]) => `
        <div class="config-item">
          <span class="config-label">${label}:</span>
          <span class="config-value">${value}</span>
        </div>
      `).join('')}
      ${configItems.length === 0 ? '<div class="info-message">No specific configuration parameters were set</div>' : ''}
    </div>
  `;
}

/**
 * Generate results section HTML for feature selection
 */
function generateFeatureSelectionResults(data: FeatureSelectionReportData, stats: any): string {
  return `
    <div class="results-summary">
      <div class="summary-grid">
        <div class="summary-card">
          <h3>Feature Selection Summary</h3>
          <div class="metric">
            <span class="metric-label">Original Features:</span>
            <span class="metric-value">${stats.originalColumns}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Features Selected:</span>
            <span class="metric-value highlight">${stats.selectedColumns}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Features Removed:</span>
            <span class="metric-value">${stats.removedColumns}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Retention Rate:</span>
            <span class="metric-value">${stats.retentionRate}%</span>
          </div>
        </div>

        <div class="summary-card">
          <h3>Selected Features</h3>
          ${stats.selectedColumns > 0 ? `
            <div class="feature-list">
              ${data.executionResult?.selectedFeatures.slice(0, 10).map((feature, idx) => `
                <div class="feature-item">
                  <span class="feature-number">${idx + 1}.</span>
                  <span class="feature-name">${feature}</span>
                </div>
              `).join('')}
              ${data.executionResult!.selectedFeatures.length > 10 ? `
                <div class="feature-item">
                  <span class="feature-note">... and ${data.executionResult!.selectedFeatures.length - 10} more</span>
                </div>
              ` : ''}
            </div>
          ` : '<div class="info-message">No features were selected</div>'}
        </div>

        <div class="summary-card">
          <h3>Removed Features</h3>
          ${stats.removedColumns > 0 ? `
            <div class="feature-list">
              ${data.executionResult?.removedFeatures.slice(0, 10).map((feature, idx) => `
                <div class="feature-item">
                  <span class="feature-number">${idx + 1}.</span>
                  <span class="feature-name">${feature}</span>
                </div>
              `).join('')}
              ${data.executionResult!.removedFeatures.length > 10 ? `
                <div class="feature-item">
                  <span class="feature-note">... and ${data.executionResult!.removedFeatures.length - 10} more</span>
                </div>
              ` : ''}
            </div>
          ` : '<div class="info-message">No features were removed</div>'}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate data preview HTML for feature selection
 */
function generateFeatureSelectionDataPreview(data: FeatureSelectionReportData): string {
  const originalData = data.executionResult?.originalData;
  const processedData = data.executionResult?.processedData;


  if (!originalData || !processedData) return '<p class="info-message">No data available for preview</p>';

  const formatCell = (cell: any) => {
    const value = cell === null || cell === undefined || cell === "" ? "-" : String(cell);
    return value.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
  };

  const generateTable = (tableData: any, title: string, highlight: boolean = false) => {
    console.log('Debug - generateTable called with:', { title, tableData });

    let tableRows = '';

    if (tableData.rows && tableData.rows.length > 0) {
      for (let rowIndex = 0; rowIndex < tableData.rows.length; rowIndex++) {
        const row = tableData.rows[rowIndex];
        console.log('Debug - Processing row:', rowIndex, row);

        let rowCells = '';
        if (Array.isArray(row) && row.length > 0) {
          for (let idx = 0; idx < row.length; idx++) {
            const cell = row[idx];
            const col = tableData.columns[idx];
            const isRemoved = highlight && !processedData?.columns.includes(col);
            const isSelected = highlight && processedData?.columns.includes(col);
            let style = '';
            if (isRemoved) style = 'background: #fef2f2;';
            else if (isSelected) style = 'background: #f0fdf4;';
            rowCells += `<td style="${style}">${formatCell(cell)}</td>`;
          }
        } else {
          rowCells = `<td colspan="${tableData.columns.length}">Invalid row data</td>`;
        }

        tableRows += `<tr>${rowCells}</tr>`;
      }
    } else {
      tableRows = `<tr><td colspan="${tableData.columns.length}">No data available</td></tr>`;
    }

    let headerCells = '';
    for (let i = 0; i < tableData.columns.length; i++) {
      const col = tableData.columns[i];
      const isRemoved = highlight && !processedData?.columns.includes(col);
      const isSelected = highlight && processedData?.columns.includes(col);
      let style = '';
      if (isRemoved) style = 'background: #fee2e2; color: #dc2626;';
      else if (isSelected) style = 'background: #d1fae5; color: #047857;';
      headerCells += `<th style="${style}">${col} ${isRemoved ? '✗' : isSelected ? '✓' : ''}</th>`;
    }

    const tableHTML = `
    <div style="margin-bottom: 2rem;">
      <h3 style="margin-bottom: 1rem; color: var(--text);">${title}</h3>
      <div class="table-wrapper" style="max-height: 500px; overflow: auto;">
        <table class="data-table">
          <thead>
            <tr>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      ${tableData.rows && tableData.rows.length > 0 ? `
        <p style="margin-top: 1rem; color: var(--text-light); font-size: 0.9rem;">
          Showing ${tableData.rows.length.toLocaleString()} rows of ${tableData.totalRows.toLocaleString()} total rows
        </p>
      ` : ''}
    </div>
  `;

    console.log('Debug - Generated table HTML length:', tableHTML.length);
    return tableHTML;
  };

  return `
    <div id="original-preview" class="preview-panel">
      ${generateTable(originalData, 'Original Dataset')}
    </div>

    <div id="selected-preview" class="preview-panel">
      ${generateTable(processedData, 'Selected Features Dataset')}
    </div>

    <div id="comparison-preview" class="preview-panel">
      <div class="comparison-grid">
        <div class="comparison-panel">
          <div class="comparison-header">Original Dataset</div>
          <div class="comparison-content">
            ${generateTable(originalData, '', false)}
          </div>
        </div>
        <div class="comparison-panel">
          <div class="comparison-header">Selected Features Dataset</div>
          <div class="comparison-content">
            ${generateTable(processedData, '', true)}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Enhanced CSS Styles for Feature Selection Report
 */
function getFeatureSelectionEnhancedStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: #4f46e5;
      --primary-light: #6366f1;
      --primary-dark: #4338ca;
      --secondary: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      --text: #1f2937;
      --text-light: #6b7280;
      --bg: #ffffff;
      --bg-secondary: #f9fafb;
      --bg-tertiary: #f3f4f6;
      --border: #e5e7eb;
      --border-light: #f3f4f6;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg-secondary);
      overflow-x: hidden;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 2rem 0;
      border-bottom: 3px solid var(--primary-dark);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .header-title .icon {
      font-size: 2.5rem;
    }

    .header-title h1 {
      font-size: 2rem;
      font-weight: 600;
    }

    .header-meta {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      gap: 0.5rem;
    }

    .meta-label {
      opacity: 0.8;
    }

    .meta-value {
      font-weight: 500;
    }

    /* Navigation */
    .nav-bar {
      background: white;
      border-bottom: 2px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0 2rem;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }

    .nav-link {
      padding: 1rem 1.5rem;
      color: var(--text-light);
      text-decoration: none;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
      font-weight: 500;
    }

    .nav-link:hover {
      color: var(--primary);
      background: var(--bg-secondary);
    }

    .nav-link.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    /* Container */
    .container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    /* Section */
    .section {
      background: white;
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border);
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text);
    }

    .section-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .section-content {
      padding: 2rem;
    }

    .section-content.collapsed {
      display: none;
    }

    /* Buttons */
    .btn-collapse {
      background: white;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: bold;
      transition: all 0.2s;
      min-width: 40px;
    }

    .btn-collapse:hover {
      background: var(--bg-secondary);
      border-color: var(--primary);
      color: var(--primary);
    }

    .btn-secondary {
      background: white;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    /* Search Box */
    .search-box {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      font-size: 0.9rem;
      min-width: 200px;
      transition: border-color 0.2s;
    }

    .search-box:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1.5rem;
      transition: border-color 0.2s;
    }

    .stat-card:hover {
      border-color: var(--primary);
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
    }

    .stat-change {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .stat-change.positive {
      background: #d1fae5;
      color: #047857;
    }

    .stat-change.negative {
      background: #fee2e2;
      color: #dc2626;
    }

    .stat-change.neutral {
      background: var(--bg-tertiary);
      color: var(--text-light);
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 4px;
    }

    .info-label {
      color: var(--text-light);
      font-weight: 500;
    }

    .info-value {
      font-weight: 600;
      color: var(--text);
    }

    /* Stats Row */
    .stats-row {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 6px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stat-item .stat-label {
      font-size: 0.9rem;
      color: var(--text-light);
      margin: 0;
    }

    .stat-item .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
    }

    .stat-item .stat-value.highlight {
      color: var(--primary);
    }

    /* Table */
    .table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 6px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .data-table thead {
      background: var(--bg-tertiary);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .data-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 2px solid var(--border);
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-light);
    }

    .data-table tbody tr:hover {
      background: var(--bg-secondary);
    }

    .data-table tbody tr.hidden {
      display: none;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-filter {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-wrapper {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-embedded {
      background: #e9d5ff;
      color: #6b21a8;
    }

    .badge-low {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-medium {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-high {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Chips */
    .chip-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .chip {
      background: var(--primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Configuration */
    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .config-item {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 4px;
    }

    .config-label {
      color: var(--text-light);
      font-weight: 500;
    }

    .config-value {
      font-weight: 600;
      color: var(--text);
    }

    /* Results Summary */
    .results-summary {
      margin-bottom: 2rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .summary-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1.5rem;
    }

    .summary-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-light);
    }

    .metric:last-child {
      border-bottom: none;
    }

    .metric-label {
      color: var(--text-light);
      font-weight: 500;
    }

    .metric-value {
      font-weight: 600;
      color: var(--text);
    }

    .metric-value.highlight {
      color: var(--primary);
    }

    .feature-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
      font-size: 0.9rem;
    }

    .feature-number {
      font-weight: 600;
      color: var(--primary);
      min-width: 2rem;
    }

    .feature-name {
      color: var(--text);
    }

    .feature-note {
      color: var(--text-light);
      font-style: italic;
    }

    /* Comparison View */
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .comparison-panel {
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .comparison-header {
      padding: 1rem;
      background: var(--bg-tertiary);
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid var(--border);
    }

    .comparison-content {
      max-height: 500px;
      overflow: auto;
    }

    .preview-panel {
      display: none;
    }

    .preview-panel.active {
      display: block;
    }

    /* Info Message */
    .info-message {
      padding: 1rem;
      background: var(--bg-secondary);
      border-left: 3px solid var(--primary);
      border-radius: 4px;
      color: var(--text);
    }

    /* Footer */
    .footer {
      background: var(--bg-tertiary);
      border-top: 2px solid var(--border);
      padding: 2rem;
      margin-top: 4rem;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      text-align: center;
      color: var(--text-light);
    }

    .footer-content p {
      margin: 0.25rem 0;
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
      }

      .nav-bar,
      .btn-collapse,
      .btn-secondary,
      .search-box {
        display: none !important;
      }

      .section {
        page-break-inside: avoid;
        border: 1px solid #000;
      }

      .section-content {
        display: block !important;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-content,
      .container {
        padding: 0 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .comparison-grid {
        grid-template-columns: 1fr;
      }

      .section-content {
        padding: 1rem;
      }

      .nav-bar {
        padding: 0 1rem;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}

/**
 * Interactive JavaScript Functions for Feature Selection Report
 */
function getFeatureSelectionInteractiveScripts(): string {
  return `
    // Toggle section collapse
    function toggleSection(button) {
      const content = button.closest('.section').querySelector('.section-content');
      const isCollapsed = content.classList.toggle('collapsed');
      button.textContent = isCollapsed ? '+' : '−';
    }

    // Filter table rows
    function filterTable(input, tableId) {
      const filter = input.value.toLowerCase();
      const table = document.getElementById(tableId);
      if (!table) return;

      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.classList.toggle('hidden', !text.includes(filter));
      });
    }

    // Switch data preview
    function switchPreview(view) {
      // Update buttons
      const buttons = document.querySelectorAll('#data-preview .btn-secondary');
      buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(view === 'comparison' ? 'side' : view)) {
          btn.classList.add('active');
        }
      });

      // Update panels
      const panels = document.querySelectorAll('.preview-panel');
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === view + '-preview') {
          panel.classList.add('active');
        }
      });
    }

    // Navigation link activation
    document.addEventListener('DOMContentLoaded', () => {
      const navLinks = document.querySelectorAll('.nav-link');

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          const targetId = link.getAttribute('href').substring(1);
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Set initial preview
      if (document.getElementById('original-preview')) {
        switchPreview('original');
      }
    });

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  `;
}

/**
 * Generate CSV Report for Feature Selection
 */
export function generateFeatureSelectionCSVReport(data: FeatureSelectionReportData): string {
  const now = new Date();
  const reportTime = now.toLocaleString();
  const executionTime = data.executionResult?.timestamp
    ? new Date(data.executionResult.timestamp).toLocaleString()
    : "Not executed";

  const stats = calculateFeatureSelectionStatistics(data);
  const methodDetails = getFeatureSelectionMethodDetails(data.selectedMethods);
  const csvRows: string[] = [];

  // Header
  csvRows.push('Feature Selection Report');
  csvRows.push(`Generated on,${reportTime}`);
  csvRows.push('');

  // Dataset Information
  csvRows.push('DATASET INFORMATION');
  csvRows.push(`Dataset Name,${data.dataset?.name || data.dataset?.filename || 'Unknown'}`);
  csvRows.push(`Dataset ID,${data.dataset?.id || 'N/A'}`);
  csvRows.push(`Original Features,${stats.originalColumns}`);
  csvRows.push(`Selected Features,${stats.selectedColumns}`);
  csvRows.push(`Removed Features,${stats.removedColumns}`);
  csvRows.push(`Retention Rate,${stats.retentionRate}%`);
  csvRows.push(`Reduction Rate,${stats.reductionRate}%`);
  csvRows.push('');

  // Method Selection
  csvRows.push('METHOD SELECTION');
  csvRows.push(`Total Methods Available,${stats.totalMethodsAvailable}`);
  csvRows.push(`Methods Selected,${stats.totalMethodsSelected}`);
  csvRows.push(`Selection Percentage,${stats.methodSelectionPercentage}%`);
  csvRows.push('');

  csvRows.push('Selected Methods,Category,Impact,Description');
  methodDetails.forEach(method => {
    csvRows.push(`"${method.label}","${method.category}","${method.impact}","${method.description.replace(/"/g, '""')}"`);
  });
  csvRows.push('');

  // Column Selection
  csvRows.push('COLUMN SELECTION');
  csvRows.push(`Total Columns Available,${stats.totalColumnsAvailable}`);
  csvRows.push(`Columns Selected,${stats.totalColumnsSelected > 0 ? stats.totalColumnsSelected : 'All'}`);
  if (data.selectedColumns.length > 0) {
    csvRows.push(`Selected Columns,"${data.selectedColumns.join('; ')}"`);
  }
  csvRows.push('');

  // Configuration
  csvRows.push('CONFIGURATION');
  if (data.config.varianceThreshold !== undefined) {
    csvRows.push(`Variance Threshold,${data.config.varianceThreshold}`);
  }
  if (data.config.correlationThreshold !== undefined) {
    csvRows.push(`Correlation Threshold,${data.config.correlationThreshold}`);
  }
  if (data.config.nFeatures !== undefined) {
    csvRows.push(`Number of Features,${data.config.nFeatures}`);
  }
  if (data.config.alpha !== undefined) {
    csvRows.push(`Alpha (Lasso),${data.config.alpha}`);
  }
  if (data.config.targetColumn) {
    csvRows.push(`Target Column,${data.config.targetColumn}`);
  }
  csvRows.push('');

  // Selected Features
  csvRows.push('SELECTED FEATURES');
  if (data.executionResult?.selectedFeatures.length) {
    data.executionResult.selectedFeatures.forEach((feature, idx) => {
      csvRows.push(`${idx + 1},${feature}`);
    });
  } else {
    csvRows.push('No features selected');
  }
  csvRows.push('');

  // Removed Features
  csvRows.push('REMOVED FEATURES');
  if (data.executionResult?.removedFeatures.length) {
    data.executionResult.removedFeatures.forEach((feature, idx) => {
      csvRows.push(`${idx + 1},${feature}`);
    });
  } else {
    csvRows.push('No features removed');
  }

  return csvRows.join('\n');
}

/**
 * Generate Excel Report for Feature Selection
 */
export async function generateFeatureSelectionExcelReport(data: FeatureSelectionReportData): Promise<Blob> {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    const now = new Date();
    const reportTime = now.toLocaleString();
    const executionTime = data.executionResult?.timestamp
      ? new Date(data.executionResult.timestamp).toLocaleString()
      : "Not executed";

    const stats = calculateFeatureSelectionStatistics(data);
    const methodDetails = getFeatureSelectionMethodDetails(data.selectedMethods);

    // Summary Sheet
    const summaryData = [
      ['Feature Selection Report'],
      ['Generated on', reportTime],
      [''],
      ['DATASET INFORMATION'],
      ['Dataset Name', data.dataset?.name || data.dataset?.filename || 'Unknown'],
      ['Dataset ID', data.dataset?.id || 'N/A'],
      ['Original Features', stats.originalColumns],
      ['Selected Features', stats.selectedColumns],
      ['Removed Features', stats.removedColumns],
      ['Retention Rate', stats.retentionRate + '%'],
      ['Reduction Rate', stats.reductionRate + '%'],
      [''],
      ['METHOD SELECTION'],
      ['Total Methods Available', stats.totalMethodsAvailable],
      ['Methods Selected', stats.totalMethodsSelected],
      ['Selection Percentage', stats.methodSelectionPercentage + '%'],
      [''],
      ['COLUMN SELECTION'],
      ['Total Columns Available', stats.totalColumnsAvailable],
      ['Columns Selected', stats.totalColumnsSelected > 0 ? stats.totalColumnsSelected : 'All'],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Methods Sheet
    const methodsData = [
      ['Method', 'Category', 'Impact', 'Description']
    ];
    methodDetails.forEach(method => {
      methodsData.push([method.label, method.category, method.impact, method.description]);
    });
    const methodsSheet = XLSX.utils.aoa_to_sheet(methodsData);
    XLSX.utils.book_append_sheet(workbook, methodsSheet, 'Methods');

    // Selected Features Sheet
    const selectedData = [
      ['Selected Features']
    ];
    if (data.executionResult?.selectedFeatures.length) {
      data.executionResult.selectedFeatures.forEach((feature, idx) => {
        selectedData.push([String(idx + 1), feature]);
      });
    }
    const selectedSheet = XLSX.utils.aoa_to_sheet(selectedData);
    XLSX.utils.book_append_sheet(workbook, selectedSheet, 'Selected Features');

    // Removed Features Sheet
    const removedData = [
      ['Removed Features']
    ];
    if (data.executionResult?.removedFeatures.length) {
      data.executionResult.removedFeatures.forEach((feature, idx) => {
        removedData.push([String(idx + 1), feature]);
      });
    }
    const removedSheet = XLSX.utils.aoa_to_sheet(removedData);
    XLSX.utils.book_append_sheet(workbook, removedSheet, 'Removed Features');

    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  } catch (error) {
    throw new Error('Failed to generate Excel report. XLSX library may not be available.');
  }
}

/**
 * Generate PDF Report for Feature Selection
 */
export function generateFeatureSelectionPDFReport(data: FeatureSelectionReportData): void {
  const htmlContent = generateFeatureSelectionHTMLReport(data);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    });
  } else {
    alert('Please allow pop-ups to generate PDF report');
  }
}
