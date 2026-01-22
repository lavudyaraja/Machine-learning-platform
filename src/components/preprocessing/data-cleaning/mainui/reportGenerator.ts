import { cleaningMethods } from "./dataCleaningMethods";

// Type definitions
export interface ReportData {
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
  trackingInfo?: {
    methodsSelectedAt?: string;
    columnsSelectedAt?: string;
    configuredAt?: string;
    executedAt?: string;
    resultsReceivedAt?: string;
  };
}

interface StrategyInfo {
  numerical: string[];
  categorical: string[];
  common: string[];
}

/**
 * Extract and categorize all strategies from configuration
 */
function extractStrategies(config: any): StrategyInfo {
  const strategies: StrategyInfo = {
    numerical: [],
    categorical: [],
    common: []
  };

  const strategyMapping = {
    numerical: [
      { key: 'strategy', values: ['mean', 'median', 'constant', 'zero', 'interpolate'] },
      { key: 'logTransformMethod', prefix: 'Log Transform' },
      { key: 'outlierMethod', prefix: 'Outlier Detection' },
      { key: 'skewnessMethod', prefix: 'Skewness Correction' },
      { key: 'collinearityMethod', prefix: 'Collinearity Removal' },
      { key: 'noisyDataMethod', prefix: 'Noise Reduction' }
    ],
    categorical: [
      { key: 'categoricalStrategy', values: ['constant_category', 'most_frequent', 'missing_indicator'] },
      { key: 'textNormalizerMethod', prefix: 'Text Normalization' },
      { key: 'whitespaceTrimmerMethod', prefix: 'Whitespace Trimming' },
      { key: 'imbalanceHandlerMethod', prefix: 'Class Imbalance' },
      { key: 'consistencyFixerMethod', prefix: 'Consistency Fix' }
    ],
    common: [
      { key: 'strategy', values: ['mode', 'forward_fill', 'backward_fill', 'drop'] },
      { key: 'categoricalStrategy', values: ['mode', 'forward_fill_cat', 'backward_fill_cat', 'drop_rows_cat', 'drop_columns_cat'] },
      { key: 'duplicateRemoverMethod', prefix: 'Duplicate Removal' },
      { key: 'typeCorrectorMethod', prefix: 'Type Correction' },
      { key: 'nullColumnDropperMethod', prefix: 'Null Column Drop' },
      { key: 'validationCheckMethod', prefix: 'Validation' },
      { key: 'featurePrunerMethod', prefix: 'Feature Removal' },
      { key: 'dateTimeParserMethod', prefix: 'DateTime Parsing' },
      { key: 'unitConverterMethod', prefix: 'Unit Conversion' }
    ]
  };

  // Process each category
  Object.entries(strategyMapping).forEach(([category, mappings]) => {
    mappings.forEach(mapping => {
      const configValue = config[mapping.key];
      if (!configValue) return;

      const values = Array.isArray(configValue) ? configValue : [configValue];

      values.forEach((value: string) => {
        if (mapping.values && !mapping.values.includes(value)) return;

        const label = mapping.prefix
          ? `${mapping.prefix}: ${value}`
          : `Missing Values: ${value}`;

        strategies[category as keyof StrategyInfo].push(label);
      });
    });
  });

  return strategies;
}

/**
 * Generate comprehensive HTML report with enhanced UI
 */
export function generateHTMLReport(data: ReportData): string {
  const now = new Date();
  const reportTime = now.toLocaleString();
  const executionTime = data.executionResult?.executedAt
    ? new Date(data.executionResult.executedAt).toLocaleString()
    : "Not executed";

  // Calculate statistics
  const stats = calculateStatistics(data);
  const strategies = extractStrategies(data.config);
  const methodDetails = getMethodDetails(data.selectedMethods);
  const pipelineSummary = getPipelineSummary(data);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Cleaning Report - ${data.dataset?.name || 'Dataset'}</title>
  <style>
    ${getEnhancedStyles()}
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-content">
      <div class="header-title">
        <span class="icon">🧹</span>
        <h1>Data Cleaning Report</h1>
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
    <a href="#execution" class="nav-link">Execution</a>
    <a href="#results" class="nav-link">Results</a>
    <a href="#data-preview" class="nav-link">Data Preview</a>
  </nav>

  <!-- Main Content -->
  <div class="container">
    <!-- Quick Stats Overview -->
    <section id="overview" class="section">
      <div class="section-header">
        <h2>📈 Quick Statistics</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        <div class="stats-grid">
          ${generateStatsCards(stats)}
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
          ${generateDatasetInfo(data, stats)}
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
              </tr>
            </thead>
            <tbody>
              ${methodDetails.map(m => `
                <tr>
                  <td><strong>${m.label}</strong></td>
                  <td><span class="badge badge-${m.category.toLowerCase()}">${m.category}</span></td>
                  <td><span class="badge badge-${m.impact}">${m.impact.toUpperCase()}</span></td>
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
            <span class="stat-label">Selected:</span>
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
        ` : '<div class="info-message">All columns were selected for processing</div>'}
      </div>
    </section>

    <!-- Configuration Details -->
    <section id="configuration" class="section">
      <div class="section-header">
        <h2>⚙️ Configuration Details</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        ${generateConfigurationSection(strategies, data.config)}
      </div>
    </section>

    <!-- Execution Timeline -->
    <section id="execution" class="section">
      <div class="section-header">
        <h2>⏱️ Execution Timeline</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        ${generateExecutionTimeline(data, reportTime, executionTime)}
      </div>
    </section>

    <!-- Pipeline Results -->
    ${pipelineSummary.length > 0 ? `
      <section id="pipeline" class="section">
        <div class="section-header">
          <h2>✅ Pipeline Results</h2>
          <div class="section-actions">
            <input type="text" placeholder="Search results..." class="search-box" oninput="filterTable(this, 'pipeline-table')">
            <button class="btn-collapse" onclick="toggleSection(this)">−</button>
          </div>
        </div>
        <div class="section-content">
          <div class="table-wrapper">
            <table id="pipeline-table" class="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Rows Affected</th>
                  <th>Columns Affected</th>
                </tr>
              </thead>
              <tbody>
                ${pipelineSummary.map(r => `
                  <tr>
                    <td><strong>${r.method}</strong></td>
                    <td><span class="badge ${r.success ? 'badge-success' : 'badge-error'}">${r.success ? 'Success' : 'Failed'}</span></td>
                    <td>${r.rowsAffected.toLocaleString()}</td>
                    <td>${r.columnsAffected}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Final Results -->
    <section id="results" class="section">
      <div class="section-header">
        <h2>📊 Final Results</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        ${generateFinalResults(stats, data)}
      </div>
    </section>

    <!-- Data Preview -->
    ${data.executionResult?.originalData && data.executionResult?.finalData ? `
      <section id="data-preview" class="section">
        <div class="section-header">
          <h2>👁️ Data Preview</h2>
          <div class="section-actions">
            <button class="btn-secondary" onclick="switchPreview('original')">Original</button>
            <button class="btn-secondary" onclick="switchPreview('cleaned')">Cleaned</button>
            <button class="btn-secondary" onclick="switchPreview('comparison')">Side by Side</button>
            <button class="btn-collapse" onclick="toggleSection(this)">−</button>
          </div>
        </div>
        <div class="section-content">
          ${generateDataPreview(data)}
        </div>
      </section>
    ` : ''}
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <p>Generated by Data Cleaning Pipeline</p>
      <p>Report Time: ${reportTime}</p>
    </div>
  </footer>

  <script>
    ${getInteractiveScripts()}
  </script>
</body>
</html>
  `;
}

/**
 * Calculate all statistics
 */
function calculateStatistics(data: ReportData) {
  const originalRows = data.executionResult?.originalData?.totalRows || 0;
  const finalRows = data.executionResult?.finalData?.totalRows || 0;
  const originalColumns = data.executionResult?.originalData?.columns.length || 0;
  const finalColumns = data.executionResult?.finalData?.columns.length || 0;

  return {
    totalMethodsAvailable: cleaningMethods.length,
    totalMethodsSelected: data.selectedMethods.length,
    methodSelectionPercentage: ((data.selectedMethods.length / cleaningMethods.length) * 100).toFixed(1),
    totalColumnsAvailable: data.executionResult?.originalData?.columns.length || data.dataset?.columns || 0,
    totalColumnsSelected: data.selectedColumns.length,
    originalRows,
    finalRows,
    rowsChanged: originalRows - finalRows,
    rowsChangePercent: originalRows > 0 ? (((originalRows - finalRows) / originalRows) * 100).toFixed(1) : 0,
    originalColumns,
    finalColumns,
    columnsChanged: finalColumns - originalColumns,
    columnsChangePercent: originalColumns > 0 ? (((finalColumns - originalColumns) / originalColumns) * 100).toFixed(1) : 0
  };
}

/**
 * Get method details with metadata
 */
function getMethodDetails(selectedMethods: string[]) {
  return selectedMethods.map(method => {
    const methodInfo = cleaningMethods.find(m => m.value === method);
    return {
      value: method,
      label: methodInfo?.label || method,
      category: methodInfo?.category || "Unknown",
      impact: methodInfo?.impact || "medium"
    };
  });
}

/**
 * Get pipeline execution summary
 */
function getPipelineSummary(data: ReportData) {
  const summary: Array<{method: string; success: boolean; rowsAffected: number; columnsAffected: number}> = [];

  if (data.executionResult?.pipelineResults) {
    Object.entries(data.executionResult.pipelineResults).forEach(([method, result]) => {
      const methodInfo = cleaningMethods.find(m => m.value === method);
      summary.push({
        method: methodInfo?.label || method,
        success: result.success || false,
        rowsAffected: result.rowsAffected || 0,
        columnsAffected: result.columnsAffected?.length || 0
      });
    });
  }

  return summary;
}

/**
 * Generate stats cards HTML
 */
function generateStatsCards(stats: any): string {
  return `
    <div class="stat-card">
      <span class="stat-label">Original Rows</span>
      <span class="stat-value">${stats.originalRows.toLocaleString()}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Final Rows</span>
      <span class="stat-value">${stats.finalRows.toLocaleString()}</span>
      <span class="stat-change ${stats.rowsChanged > 0 ? 'negative' : stats.rowsChanged < 0 ? 'positive' : 'neutral'}">
        ${stats.rowsChanged > 0 ? '−' : stats.rowsChanged < 0 ? '+' : ''}${Math.abs(stats.rowsChanged).toLocaleString()}
        (${stats.rowsChanged > 0 ? '−' : stats.rowsChanged < 0 ? '+' : ''}${Math.abs(parseFloat(stats.rowsChangePercent))}%)
      </span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Original Columns</span>
      <span class="stat-value">${stats.originalColumns}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Final Columns</span>
      <span class="stat-value">${stats.finalColumns}</span>
      <span class="stat-change ${stats.columnsChanged < 0 ? 'negative' : stats.columnsChanged > 0 ? 'positive' : 'neutral'}">
        ${stats.columnsChanged > 0 ? '+' : ''}${stats.columnsChanged}
        ${stats.columnsChanged !== 0 ? `(${stats.columnsChanged > 0 ? '+' : ''}${stats.columnsChangePercent}%)` : ''}
      </span>
    </div>
  `;
}

/**
 * Generate dataset info HTML
 */
function generateDatasetInfo(data: ReportData, stats: any): string {
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
      <span class="info-value">${data.executionResult?.executed ? '✓ Completed' : '✗ Not Executed'}</span>
    </div>
  `;
}

/**
 * Generate configuration section HTML
 */
function generateConfigurationSection(strategies: StrategyInfo, config: any): string {
  const totalStrategies = strategies.numerical.length + strategies.categorical.length + strategies.common.length;

  return `
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">Total Strategies:</span>
        <span class="stat-value highlight">${totalStrategies}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Numerical:</span>
        <span class="stat-value">${strategies.numerical.length}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Categorical:</span>
        <span class="stat-value">${strategies.categorical.length}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Common:</span>
        <span class="stat-value">${strategies.common.length}</span>
      </div>
    </div>

    <div class="strategy-grid">
      <div class="strategy-card">
        <h3>📊 Numerical Strategies (${strategies.numerical.length})</h3>
        ${strategies.numerical.length > 0 ? `
          <ul class="strategy-list">
            ${strategies.numerical.map(s => `<li>${s}</li>`).join('')}
          </ul>
        ` : '<p class="info-message">No numerical strategies configured</p>'}
      </div>

      <div class="strategy-card">
        <h3>📝 Categorical Strategies (${strategies.categorical.length})</h3>
        ${strategies.categorical.length > 0 ? `
          <ul class="strategy-list">
            ${strategies.categorical.map(s => `<li>${s}</li>`).join('')}
          </ul>
        ` : '<p class="info-message">No categorical strategies configured</p>'}
      </div>

      <div class="strategy-card">
        <h3>🔧 Common Strategies (${strategies.common.length})</h3>
        ${strategies.common.length > 0 ? `
          <ul class="strategy-list">
            ${strategies.common.map(s => `<li>${s}</li>`).join('')}
          </ul>
        ` : '<p class="info-message">No common strategies configured</p>'}
      </div>
    </div>
  `;
}

/**
 * Generate execution timeline HTML
 */
function generateExecutionTimeline(data: ReportData, reportTime: string, executionTime: string): string {
  return `
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-label">Methods Selected</div>
        <div class="timeline-value">${data.trackingInfo?.methodsSelectedAt || 'Not tracked'}</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-label">Columns Selected</div>
        <div class="timeline-value">${data.trackingInfo?.columnsSelectedAt || 'Not tracked'}</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-label">Configuration Completed</div>
        <div class="timeline-value">${data.trackingInfo?.configuredAt || 'Not tracked'}</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-label">Execution Started</div>
        <div class="timeline-value">${executionTime}</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-label">Results Received</div>
        <div class="timeline-value">${data.trackingInfo?.resultsReceivedAt || executionTime}</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-label">Report Generated</div>
        <div class="timeline-value">${reportTime}</div>
      </div>
    </div>
  `;
}

/**
 * Generate final results HTML
 */
function generateFinalResults(stats: any, data: ReportData): string {
  const newColumns = data.executionResult?.finalData?.columns.filter(
    col => !data.executionResult?.originalData?.columns.includes(col)
  ) || [];

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Final Dataset Rows</span>
        <span class="stat-value">${stats.finalRows.toLocaleString()}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Final Dataset Columns</span>
        <span class="stat-value">${stats.finalColumns}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Rows Removed</span>
        <span class="stat-value">${stats.rowsChanged > 0 ? stats.rowsChanged.toLocaleString() : 0}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Columns Added</span>
        <span class="stat-value">${stats.columnsChanged > 0 ? stats.columnsChanged : 0}</span>
      </div>
    </div>

    ${newColumns.length > 0 ? `
      <div style="margin-top: 2rem;">
        <h3 style="margin-bottom: 1rem; color: var(--text);">New Columns Created</h3>
        <div class="chip-container">
          ${newColumns.map(col => `<span class="chip">${col}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

/**
 * Generate data preview HTML
 */
function generateDataPreview(data: ReportData): string {
  const originalData = data.executionResult?.originalData;
  const finalData = data.executionResult?.finalData;

  if (!originalData || !finalData) return '<p class="info-message">No data available for preview</p>';

  const formatCell = (cell: any) => {
    const value = cell === null || cell === undefined || cell === "" ? "-" : String(cell);
    return value.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
  };

  const generateTable = (tableData: any, title: string, highlight: boolean = false) => `
    <div style="margin-bottom: 2rem;">
      <h3 style="margin-bottom: 1rem; color: var(--text);">${title}</h3>
      <div class="table-wrapper" style="max-height: 500px; overflow: auto;">
        <table class="data-table">
          <thead>
            <tr>
              ${tableData.columns.map((col: string) => {
                const isNew = highlight && !originalData?.columns.includes(col);
                return `<th style="${isNew ? 'background: var(--secondary); color: white;' : ''}">${col} ${isNew ? '★' : ''}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableData.rows.slice(0, 100).map((row: any[]) => `
              <tr>
                ${row.map((cell, idx) => {
                  const col = tableData.columns[idx];
                  const isNew = highlight && !originalData?.columns.includes(col);
                  return `<td style="${isNew ? 'background: #d1fae5;' : ''}">${formatCell(cell)}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${tableData.rows.length > 100 ? `
        <p style="margin-top: 1rem; color: var(--text-light); font-size: 0.9rem;">
          Showing first 100 rows of ${tableData.totalRows.toLocaleString()} total rows
        </p>
      ` : ''}
    </div>
  `;

  return `
    <div id="original-preview" class="preview-panel">
      ${generateTable(originalData, 'Original Dataset')}
    </div>

    <div id="cleaned-preview" class="preview-panel">
      ${generateTable(finalData, 'Cleaned Dataset', true)}
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
          <div class="comparison-header">Cleaned Dataset</div>
          <div class="comparison-content">
            ${generateTable(finalData, '', true)}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Enhanced CSS Styles - Clean, Professional, No Glows/Shadows
 */
function getEnhancedStyles(): string {
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
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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

    .badge-numerical {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-categorical {
      background: #e9d5ff;
      color: #6b21a8;
    }

    .badge-common {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-success {
      background: #d1fae5;
      color: #047857;
    }

    .badge-error {
      background: #fee2e2;
      color: #dc2626;
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

    /* Timeline */
    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 0.5rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border);
    }

    .timeline-item {
      position: relative;
      padding: 1rem 0;
      padding-left: 2rem;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.5rem;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      border: 3px solid white;
      outline: 2px solid var(--primary);
    }

    .timeline-label {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .timeline-value {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    /* Info Message */
    .info-message {
      padding: 1rem;
      background: var(--bg-secondary);
      border-left: 3px solid var(--primary);
      border-radius: 4px;
      color: var(--text);
    }

    /* Strategy Grid */
    .strategy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .strategy-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1.5rem;
    }

    .strategy-card h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .strategy-list {
      list-style: none;
    }

    .strategy-list li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-light);
    }

    .strategy-list li:last-child {
      border-bottom: none;
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
    }
  `;
}

/**
 * Interactive JavaScript Functions
 */
function getInteractiveScripts(): string {
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
 * Generate CSV Report
 */
export function generateCSVReport(data: ReportData): string {
  const now = new Date();
  const reportTime = now.toLocaleString();
  const executionTime = data.executionResult?.executedAt
    ? new Date(data.executionResult.executedAt).toLocaleString()
    : "Not executed";

  const stats = calculateStatistics(data);
  const strategies = extractStrategies(data.config);
  const csvRows: string[] = [];

  // Header
  csvRows.push('Data Cleaning Report');
  csvRows.push(`Generated on,${reportTime}`);
  csvRows.push('');

  // Dataset Information
  csvRows.push('DATASET INFORMATION');
  csvRows.push(`Dataset Name,${data.dataset?.name || data.dataset?.filename || 'Unknown'}`);
  csvRows.push(`Dataset ID,${data.dataset?.id || 'N/A'}`);
  csvRows.push(`Original Rows,${stats.originalRows}`);
  csvRows.push(`Original Columns,${stats.originalColumns}`);
  csvRows.push(`Final Rows,${stats.finalRows}`);
  csvRows.push(`Final Columns,${stats.finalColumns}`);
  csvRows.push(`Rows Changed,${stats.rowsChanged}`);
  csvRows.push(`Columns Changed,${stats.columnsChanged}`);
  csvRows.push('');

  // Method Selection
  csvRows.push('METHOD SELECTION');
  csvRows.push(`Total Methods Available,${stats.totalMethodsAvailable}`);
  csvRows.push(`Methods Selected,${stats.totalMethodsSelected}`);
  csvRows.push(`Selection Percentage,${stats.methodSelectionPercentage}%`);
  csvRows.push('');

  csvRows.push('Selected Methods,Category,Impact');

  const methodDetails = getMethodDetails(data.selectedMethods);
  methodDetails.forEach(method => {
    csvRows.push(`"${method.label}","${method.category}","${method.impact}"`);
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

  // Strategies
  csvRows.push('CONFIGURATION STRATEGIES');
  csvRows.push(`Numerical Strategies,${strategies.numerical.length}`);
  csvRows.push(`Categorical Strategies,${strategies.categorical.length}`);
  csvRows.push(`Common Strategies,${strategies.common.length}`);
  csvRows.push('');

  if (strategies.numerical.length > 0) {
    csvRows.push('Numerical Strategies');
    strategies.numerical.forEach(s => csvRows.push(`"${s}"`));
    csvRows.push('');
  }

  if (strategies.categorical.length > 0) {
    csvRows.push('Categorical Strategies');
    strategies.categorical.forEach(s => csvRows.push(`"${s}"`));
    csvRows.push('');
  }

  if (strategies.common.length > 0) {
    csvRows.push('Common Strategies');
    strategies.common.forEach(s => csvRows.push(`"${s}"`));
    csvRows.push('');
  }

  // Execution Tracking
  csvRows.push('EXECUTION TIMELINE');
  csvRows.push('Event,Timestamp');
  csvRows.push(`Methods Selected,${data.trackingInfo?.methodsSelectedAt || 'Not tracked'}`);
  csvRows.push(`Columns Selected,${data.trackingInfo?.columnsSelectedAt || 'Not tracked'}`);
  csvRows.push(`Configuration Completed,${data.trackingInfo?.configuredAt || 'Not tracked'}`);
  csvRows.push(`Execution Started,${executionTime}`);
  csvRows.push(`Results Received,${data.trackingInfo?.resultsReceivedAt || executionTime}`);
  csvRows.push(`Report Generated,${reportTime}`);
  csvRows.push('');

  // Pipeline Results
  if (data.executionResult?.pipelineResults) {
    csvRows.push('PIPELINE RESULTS');
    csvRows.push('Method,Status,Rows Affected,Columns Affected');

    const pipelineSummary = getPipelineSummary(data);
    pipelineSummary.forEach(result => {
      csvRows.push(`"${result.method}","${result.success ? 'Success' : 'Failed'}",${result.rowsAffected},${result.columnsAffected}`);
    });
    csvRows.push('');
  }

  // Column Headers
  if (data.executionResult?.originalData && data.executionResult?.finalData) {
    csvRows.push('COLUMN HEADERS');
    csvRows.push('Original Columns');
    data.executionResult.originalData.columns.forEach(col => csvRows.push(`"${col}"`));
    csvRows.push('');

    csvRows.push('Final Columns');
    data.executionResult.finalData.columns.forEach(col => {
      const isNew = !data.executionResult?.originalData?.columns.includes(col);
      csvRows.push(`"${col}"${isNew ? ' (New)' : ''}`);
    });
  }

  return csvRows.join('\n');
}

/**
 * Generate Excel Report
 */
export async function generateExcelReport(data: ReportData): Promise<Blob> {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    const now = new Date();
    const reportTime = now.toLocaleString();
    const executionTime = data.executionResult?.executedAt
      ? new Date(data.executionResult.executedAt).toLocaleString()
      : "Not executed";

    const stats = calculateStatistics(data);
    const strategies = extractStrategies(data.config);
    const methodDetails = getMethodDetails(data.selectedMethods);

    // Summary Sheet
    const summaryData = [
      ['Data Cleaning Report'],
      ['Generated on', reportTime],
      [''],
      ['DATASET INFORMATION'],
      ['Dataset Name', data.dataset?.name || data.dataset?.filename || 'Unknown'],
      ['Dataset ID', data.dataset?.id || 'N/A'],
      ['Original Rows', stats.originalRows],
      ['Original Columns', stats.originalColumns],
      ['Final Rows', stats.finalRows],
      ['Final Columns', stats.finalColumns],
      ['Rows Changed', stats.rowsChanged],
      ['Columns Changed', stats.columnsChanged],
      [''],
      ['METHOD SELECTION'],
      ['Total Methods Available', stats.totalMethodsAvailable],
      ['Methods Selected', stats.totalMethodsSelected],
      ['Selection Percentage', stats.methodSelectionPercentage + '%'],
      [''],
      ['COLUMN SELECTION'],
      ['Total Columns Available', stats.totalColumnsAvailable],
      ['Columns Selected', stats.totalColumnsSelected > 0 ? stats.totalColumnsSelected : 'All'],
      [''],
      ['STRATEGIES SUMMARY'],
      ['Numerical Strategies', strategies.numerical.length],
      ['Categorical Strategies', strategies.categorical.length],
      ['Common Strategies', strategies.common.length],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Methods Sheet
    const methodsData = [
      ['Method', 'Category', 'Impact']
    ];
    methodDetails.forEach(method => {
      methodsData.push([method.label, method.category, method.impact]);
    });
    const methodsSheet = XLSX.utils.aoa_to_sheet(methodsData);
    XLSX.utils.book_append_sheet(workbook, methodsSheet, 'Methods');

    // Strategies Sheet
    const strategiesData = [
      ['Type', 'Strategy']
    ];
    strategies.numerical.forEach(s => strategiesData.push(['Numerical', s]));
    strategies.categorical.forEach(s => strategiesData.push(['Categorical', s]));
    strategies.common.forEach(s => strategiesData.push(['Common', s]));
    const strategiesSheet = XLSX.utils.aoa_to_sheet(strategiesData);
    XLSX.utils.book_append_sheet(workbook, strategiesSheet, 'Strategies');

    // Execution Timeline Sheet
    const timelineData = [
      ['Event', 'Timestamp'],
      ['Methods Selected', data.trackingInfo?.methodsSelectedAt || 'Not tracked'],
      ['Columns Selected', data.trackingInfo?.columnsSelectedAt || 'Not tracked'],
      ['Configuration Completed', data.trackingInfo?.configuredAt || 'Not tracked'],
      ['Execution Started', executionTime],
      ['Results Received', data.trackingInfo?.resultsReceivedAt || executionTime],
      ['Report Generated', reportTime],
    ];
    const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
    XLSX.utils.book_append_sheet(workbook, timelineSheet, 'Timeline');

    // Pipeline Results Sheet
    if (data.executionResult?.pipelineResults) {
      const pipelineSummary = getPipelineSummary(data);
      const resultsData = [
        ['Method', 'Status', 'Rows Affected', 'Columns Affected']
      ];
      pipelineSummary.forEach(result => {
        resultsData.push([
          result.method,
          result.success ? 'Success' : 'Failed',
          String(result.rowsAffected),
          String(result.columnsAffected)
        ]);
      });
      const resultsSheet = XLSX.utils.aoa_to_sheet(resultsData);
      XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Pipeline Results');
    }

    // Column Headers Sheet
    if (data.executionResult?.originalData && data.executionResult?.finalData) {
      const headersData = [
        ['Original Columns', 'Final Columns', 'Status']
      ];

      const maxLength = Math.max(
        data.executionResult.originalData.columns.length,
        data.executionResult.finalData.columns.length
      );

      for (let i = 0; i < maxLength; i++) {
        const originalCol = data.executionResult.originalData.columns[i] || '';
        const finalCol = data.executionResult.finalData.columns[i] || '';
        const isNew = finalCol && !data.executionResult.originalData.columns.includes(finalCol);
        headersData.push([originalCol, finalCol, isNew ? 'New' : 'Existing']);
      }

      const headersSheet = XLSX.utils.aoa_to_sheet(headersData);
      XLSX.utils.book_append_sheet(workbook, headersSheet, 'Column Headers');
    }

    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  } catch (error) {
    throw new Error('Failed to generate Excel report. XLSX library may not be available.');
  }
}

/**
 * Generate PDF Report
 */
export function generatePDFReport(data: ReportData): void {
  const htmlContent = generateHTMLReport(data);
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

