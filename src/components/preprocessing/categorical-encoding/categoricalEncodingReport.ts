// Type definitions matching the CategoricalEncoder component
interface ReportData {
  dataset?: {
    id?: string;
    name?: string;
    filename?: string;
  };
  selectedMethods: string[];
  selectedColumns: string[];
  config: any;
  executionResult: {
    executed: boolean;
    executedAt?: string;
    newColumns?: string[];
    original?: unknown[][];
    encoded?: unknown[][];
  } | null;
}

// Generate comprehensive HTML report following data cleaning report structure
export function generateCategoricalEncodingHTMLReport(data: ReportData): string {
  const now = new Date();
  const reportTime = now.toLocaleString();
  const executionTime = data.executionResult?.executedAt
    ? new Date(data.executionResult.executedAt).toLocaleString()
    : "Not executed";

  // Calculate statistics
  const stats = calculateCategoricalEncodingStatistics(data);
  const methodDetails = getCategoricalEncodingMethodDetails(data.selectedMethods);
  const pipelineSummary = getCategoricalEncodingPipelineSummary(data);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categorical Encoding Report - ${data.dataset?.name || 'Dataset'}</title>
    <style>
        ${getEnhancedStyles()}
    </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-content">
      <div class="header-title">
        <span class="icon">🔢</span>
        <h1>Categorical Encoding Report</h1>
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
    <a href="#preview" class="nav-link">Data Preview</a>
    <a href="#methods" class="nav-link">Methods</a>
    <a href="#columns" class="nav-link">Columns</a>
    <a href="#execution" class="nav-link">Execution</a>
    <a href="#results" class="nav-link">Results</a>
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
          ${generateCategoricalEncodingStatsCards(stats)}
        </div>
      </div>
    </section>

    <!-- Dataset Preview -->
    <section id="preview" class="section">
      <div class="section-header">
        <h2>👁️ Dataset Preview</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        ${generateCategoricalEncodingDatasetPreview(data)}
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
          ${generateCategoricalEncodingDatasetInfo(data, stats)}
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
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${methodDetails.map(m => `
                <tr>
                  <td><strong>${m.label}</strong></td>
                  <td><span class="badge badge-purple">Encoding</span></td>
                  <td>${m.description}</td>
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
        ` : '<div class="info-message">All columns were selected for encoding</div>'}
      </div>
    </section>

    <!-- Execution Timeline -->
    <section id="execution" class="section">
      <div class="section-header">
        <h2>⏱️ Execution Timeline</h2>
        <button class="btn-collapse" onclick="toggleSection(this)">−</button>
      </div>
      <div class="section-content">
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-label">Methods Selected</div>
            <div class="timeline-value">Completed</div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">Columns Selected</div>
            <div class="timeline-value">Completed</div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">Encoding Executed</div>
            <div class="timeline-value">${executionTime}</div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">Report Generated</div>
            <div class="timeline-value">${reportTime}</div>
          </div>
        </div>
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
                  <th>Columns Affected</th>
                </tr>
              </thead>
              <tbody>
                ${pipelineSummary.map(r => `
                  <tr>
                    <td><strong>${r.method}</strong></td>
                    <td><span class="badge ${r.success ? 'badge-success' : 'badge-error'}">${r.success ? 'Success' : 'Failed'}</span></td>
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
        ${generateCategoricalEncodingFinalResults(stats, data)}
      </div>
    </section>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <p>Generated by ML Preprocessing Pipeline</p>
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

// Generate PDF Report (using HTML print approach like data cleaning)
export const downloadCategoricalEncodingReportAsPDF = (data: ReportData): void => {
  const htmlContent = generateCategoricalEncodingHTMLReport(data);
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
};

// Generate HTML Report
export const downloadCategoricalEncodingReportAsHTML = (data: ReportData): void => {
  const htmlContent = generateCategoricalEncodingHTMLReport(data);

  // Create blob and URL
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // 1. Open in new window/tab for preview
  const newWindow = window.open(url, '_blank');

  // 2. Also download/save locally as HTML file
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${data.dataset?.name || 'dataset'}_categorical_encoding_report.html`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up the URL after a delay to allow both actions to complete
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);

  // Handle popup blocker
  if (!newWindow) {
    alert('Please allow pop-ups to view the report. The file has been downloaded to your downloads folder.');
  }
};

// Enhanced CSS Styles - Clean, Professional, No Glows/Shadows
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

    .badge-purple {
      background: #e9d5ff;
      color: #6b21a8;
    }

    .badge-success {
      background: #d1fae5;
      color: #047857;
    }

    .badge-error {
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

    /* Dataset Preview Styles */
    .preview-tabs {
      margin-top: 1rem;
    }

    .tab-buttons {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .tab-btn {
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--border);
      background: white;
      color: var(--text-light);
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      background: var(--bg-secondary);
      border-color: var(--primary);
    }

    .tab-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .preview-content {
      display: none;
    }

    .preview-content.active {
      display: block;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }

    .preview-header h3 {
      margin: 0;
      color: var(--text);
    }

    .preview-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .preview-stats .stat {
      background: var(--bg-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .table-container {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .table-scroll {
      max-height: 600px;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }

    .table-scroll::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .table-scroll::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: 4px;
    }

    .table-scroll::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }

    .table-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--primary);
    }

    .small-scroll {
      max-height: 400px;
    }

    .preview-table {
      font-size: 0.875rem;
      min-width: 100%;
    }

    .preview-table .row-number {
      background: var(--bg-tertiary);
      font-weight: 600;
      text-align: center;
      width: 3rem;
      border-right: 2px solid var(--border);
      position: sticky;
      left: 0;
      z-index: 10;
    }

    .sticky-header {
      position: sticky;
      top: 0;
      background: white;
      z-index: 20;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .sticky-header th {
      background: var(--bg-tertiary);
      border-bottom: 2px solid var(--border);
    }

    .preview-table .new-column {
      background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%);
      border-left: 3px solid #16a34a;
      font-weight: 600;
    }

    .preview-table td {
      border-bottom: 1px solid var(--border-light);
      padding: 0.5rem 0.75rem;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preview-table th {
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--border);
    }

    .new-column-cell {
      background: rgba(220, 252, 231, 0.5);
      font-weight: 500;
    }

    /* Pagination Styles */
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      border-radius: 0 0 8px 8px;
      font-size: 0.875rem;
    }

    .pagination-info {
      color: var(--text-light);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .page-btn:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      margin: 0 1rem;
      color: var(--text-light);
      font-weight: 500;
    }

    /* Comparison Styles */
    .comparison-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1rem;
      align-items: start;
      min-height: 500px;
    }

    .comparison-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .panel-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
    }

    .panel-stats {
      color: var(--text-light);
      font-size: 0.75rem;
    }

    .comparison-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-height: 120px;
    }

    .arrow-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .arrow-label {
      font-size: 0.875rem;
      color: var(--text-light);
      font-weight: 500;
      text-align: center;
    }

    .arrow-stats {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
      margin-top: 0.5rem;
      text-align: center;
    }

    .comparison-table {
      font-size: 0.75rem;
      width: 100%;
    }

    .comparison-table .row-number {
      width: 2.5rem;
      padding: 0.5rem;
      background: var(--bg-tertiary);
      border-right: 2px solid var(--border);
      position: sticky;
      left: 0;
      z-index: 5;
    }

    .comparison-table th {
      padding: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: left;
    }

    .comparison-table td {
      padding: 0.5rem;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-bottom: 1px solid var(--border-light);
    }

    .comparison-legend {
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%);
      border: 2px solid #16a34a;
      border-radius: 2px;
    }

    .legend-icon {
      font-size: 0.875rem;
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

      .section-content {
        padding: 1rem;
      }

      .nav-bar {
        padding: 0 1rem;
      }

      .comparison-container {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .comparison-arrow {
        display: none;
      }

      .tab-buttons {
        flex-wrap: wrap;
      }

      .tab-btn {
        flex: 1;
        min-width: 120px;
        font-size: 0.875rem;
      }

      .table-scroll {
        max-height: 300px;
      }

      .small-scroll {
        max-height: 250px;
      }

      .preview-table th,
      .preview-table td {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      .preview-table .row-number {
        width: 2rem;
        padding: 0.25rem;
      }
    }
  `;
}

// Interactive JavaScript Functions
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

    // Dataset preview tab switching
    function showPreviewTab(tabName) {
      // Hide all preview contents
      const contents = document.querySelectorAll('.preview-content');
      contents.forEach(content => content.classList.remove('active'));

      // Remove active class from all tab buttons
      const buttons = document.querySelectorAll('.tab-btn');
      buttons.forEach(button => button.classList.remove('active'));

      // Show selected tab content and activate button
      const selectedContent = document.getElementById(tabName + '-preview');
      const selectedButton = document.getElementById(tabName + '-tab');

      if (selectedContent) selectedContent.classList.add('active');
      if (selectedButton) selectedButton.classList.add('active');
    }

    // Enhanced scrolling and table interaction
    function scrollToTop(tableId) {
      const table = document.getElementById(tableId);
      if (table) {
        const scrollContainer = table.closest('.table-scroll');
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      }
    }

    // Add keyboard navigation for tables
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Home' && e.ctrlKey) {
        e.preventDefault();
        const activeTab = document.querySelector('.preview-content.active');
        if (activeTab) {
          const tableScroll = activeTab.querySelector('.table-scroll');
          if (tableScroll) tableScroll.scrollTop = 0;
        }
      }
    });

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

// Calculate all statistics for categorical encoding
function calculateCategoricalEncodingStatistics(data: ReportData) {
  const availableMethods = ['label', 'one_hot', 'ordinal', 'binary', 'frequency', 'count', 'target', 'hash', 'leave_one_out', 'woe'];

  return {
    totalMethodsAvailable: availableMethods.length,
    totalMethodsSelected: data.selectedMethods.length,
    methodSelectionPercentage: ((data.selectedMethods.length / availableMethods.length) * 100).toFixed(1),
    totalColumnsAvailable: data.executionResult?.newColumns?.length || data.selectedColumns.length || 0,
    totalColumnsSelected: data.selectedColumns.length,
    originalColumns: data.selectedColumns.length,
    encodedColumns: data.executionResult?.newColumns?.length || data.selectedColumns.length,
    columnsChanged: (data.executionResult?.newColumns?.length || 0) - data.selectedColumns.length,
    executionTime: data.executionResult?.executedAt ? new Date(data.executionResult.executedAt).getTime() - Date.now() : null
  };
}

// Get method details with metadata
function getCategoricalEncodingMethodDetails(selectedMethods: string[]) {
  return selectedMethods.map(method => {
    const methodInfo = {
      value: method,
      label: getEncodingMethodLabel(method),
      description: getEncodingMethodDescription(method)
    };
    return methodInfo;
  });
}

// Get pipeline execution summary
function getCategoricalEncodingPipelineSummary(data: ReportData) {
  const summary: Array<{method: string; success: boolean; columnsAffected: number}> = [];

  if (data.executionResult?.executed) {
    data.selectedMethods.forEach(method => {
      summary.push({
        method: getEncodingMethodLabel(method),
        success: true, // Assume success if execution completed
        columnsAffected: data.selectedColumns.length
      });
    });
  }

  return summary;
}

// Generate stats cards HTML
function generateCategoricalEncodingStatsCards(stats: any): string {
  return `
    <div class="stat-card">
      <span class="stat-label">Original Columns</span>
      <span class="stat-value">${stats.originalColumns}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Encoded Columns</span>
      <span class="stat-value">${stats.encodedColumns}</span>
      <span class="stat-change ${stats.columnsChanged > 0 ? 'positive' : stats.columnsChanged < 0 ? 'negative' : 'neutral'}">
        ${stats.columnsChanged > 0 ? '+' : ''}${stats.columnsChanged}
        ${stats.columnsChanged !== 0 ? ' new columns' : ''}
      </span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Methods Applied</span>
      <span class="stat-value">${stats.totalMethodsSelected}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Success Rate</span>
      <span class="stat-value">100%</span>
    </div>
  `;
}

// Generate dataset info HTML
function generateCategoricalEncodingDatasetInfo(data: ReportData, stats: any): string {
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

// Generate dataset preview HTML
function generateCategoricalEncodingDatasetPreview(data: ReportData): string {
  if (!data.executionResult?.original || !data.executionResult?.encoded) {
    return `
      <div class="info-message">
        <strong>Dataset Preview Not Available</strong><br>
        No dataset data was captured during encoding execution. The preview requires both original and encoded data to be available.
      </div>
    `;
  }

  const originalData = data.executionResult.original;
  const encodedData = data.executionResult.encoded;
  const allColumns = data.executionResult.newColumns || [];
  const selectedColumns = data.selectedColumns;

  // Pagination settings
  const rowsPerPage = 100;
  const totalRows = originalData.length;
  const totalColumns = allColumns.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return `
    <div class="preview-tabs">
      <div class="tab-buttons">
        <button onclick="showPreviewTab('original')" class="tab-btn active" id="original-tab">Before Encoding</button>
        <button onclick="showPreviewTab('encoded')" class="tab-btn" id="encoded-tab">After Encoding</button>
        <button onclick="showPreviewTab('comparison')" class="tab-btn" id="comparison-tab">Side-by-Side</button>
      </div>

      <!-- Original Dataset Preview -->
      <div id="original-preview" class="preview-content active">
        <div class="preview-header">
          <h3>📊 Before Encoding</h3>
          <div class="preview-stats">
            <span class="stat">${selectedColumns.length} categorical columns</span>
            <span class="stat">${totalRows} total rows</span>
            <span class="stat">${selectedColumns.length} columns shown</span>
          </div>
        </div>
        <div class="table-container">
          <div class="table-scroll">
            <table class="data-table preview-table">
              <thead class="sticky-header">
                <tr>
                  <th class="row-number">#</th>
                  ${selectedColumns.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${originalData.map((row, i) => `
                  <tr>
                    <td class="row-number">${i + 1}</td>
                    ${selectedColumns.map((col, colIndex) => {
                      const value = row && row[colIndex] !== undefined
                        ? String(row[colIndex] || '')
                        : '-';
                      return `<td title="${value}">${value}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Encoded Dataset Preview -->
      <div id="encoded-preview" class="preview-content">
        <div class="preview-header">
          <h3>🔢 After Encoding</h3>
          <div class="preview-stats">
            <span class="stat">${allColumns.length} total columns</span>
            <span class="stat">${allColumns.length - selectedColumns.length} new columns</span>
            <span class="stat">${totalRows} total rows</span>
          </div>
        </div>
        <div class="table-container">
          <div class="table-scroll">
            <table class="data-table preview-table">
              <thead class="sticky-header">
                <tr>
                  <th class="row-number">#</th>
                  ${allColumns.map(col => {
                    const isNew = !selectedColumns.includes(col);
                    return `<th class="${isNew ? 'new-column' : ''}">${col}${isNew ? ' <small>(New)</small>' : ''}</th>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                ${encodedData.map((row, i) => `
                  <tr>
                    <td class="row-number">${i + 1}</td>
                    ${allColumns.map((col, colIndex) => {
                      const value = row && row[colIndex] !== undefined
                        ? String(row[colIndex] || '0')
                        : '0';
                      return `<td title="${value}">${value}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Side-by-Side Comparison -->
      <div id="comparison-preview" class="preview-content">
        <div class="comparison-container">
          <!-- Original Side -->
          <div class="comparison-panel">
            <div class="panel-header">
              <h4>📊 Before Encoding</h4>
              <div class="panel-stats">
                <small>${selectedColumns.length} columns × ${totalRows} rows</small>
              </div>
            </div>
            <div class="table-scroll small-scroll">
              <table class="data-table comparison-table">
                <thead class="sticky-header">
                  <tr>
                    <th class="row-number">#</th>
                    ${selectedColumns.map(col => `<th>${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${originalData.slice(0, 100).map((row, i) => `
                    <tr>
                      <td class="row-number">${i + 1}</td>
                      ${selectedColumns.map((col, colIndex) => {
                        const value = row && row[colIndex] !== undefined
                          ? String(row[colIndex] || '')
                          : '-';
                        return `<td title="${value}">${value}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Arrow -->
          <div class="comparison-arrow">
            <div class="arrow-icon">🔄</div>
            <div class="arrow-label">Encoding Applied</div>
            <div class="arrow-stats">
              <small>${selectedColumns.length} → ${allColumns.length} columns</small>
            </div>
          </div>

          <!-- Encoded Side -->
          <div class="comparison-panel">
            <div class="panel-header">
              <h4>🔢 After Encoding</h4>
              <div class="panel-stats">
                <small>${allColumns.length} columns × ${totalRows} rows</small>
              </div>
            </div>
            <div class="table-scroll small-scroll">
              <table class="data-table comparison-table">
                <thead class="sticky-header">
                  <tr>
                    <th class="row-number">#</th>
                    ${allColumns.map(col => {
                      const isNew = !selectedColumns.includes(col);
                      return `<th class="${isNew ? 'new-column' : ''}">${col}${isNew ? ' ⭐' : ''}</th>`;
                    }).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${encodedData.slice(0, 100).map((row, i) => `
                    <tr>
                      <td class="row-number">${i + 1}</td>
                      ${allColumns.map((col, colIndex) => {
                        const value = row && row[colIndex] !== undefined
                          ? String(row[colIndex] || '0')
                          : '0';
                        const isNew = !selectedColumns.includes(col);
                        return `<td title="${value}" ${isNew ? 'class="new-column-cell"' : ''}>${value}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="comparison-legend">
          <div class="legend-item">
            <span class="legend-color new-column"></span>
            <span>New columns created by encoding</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">⭐</span>
            <span>Columns transformed to numerical values</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Generate final results HTML
function generateCategoricalEncodingFinalResults(stats: any, data: ReportData): string {
  const newColumns = data.executionResult?.newColumns?.filter(
    col => !data.selectedColumns.includes(col)
  ) || [];

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Columns Encoded</span>
        <span class="stat-value">${stats.originalColumns}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Output Columns</span>
        <span class="stat-value">${stats.encodedColumns}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Encoding Methods</span>
        <span class="stat-value">${stats.totalMethodsSelected}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Execution Status</span>
        <span class="stat-value">${data.executionResult?.executed ? 'Success' : 'Pending'}</span>
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

// Helper function to get method labels
function getEncodingMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    'label': 'Label Encoding',
    'one_hot': 'One-Hot Encoding',
    'ordinal': 'Ordinal Encoding',
    'binary': 'Binary Encoding',
    'frequency': 'Frequency Encoding',
    'count': 'Count Encoding',
    'target': 'Target Encoding',
    'hash': 'Hash Encoding',
    'leave_one_out': 'Leave-One-Out Encoding',
    'woe': 'Weight of Evidence'
  };
  return labels[method] || method;
}

// Helper function to get method descriptions
function getEncodingMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    'label': 'Assigns unique integers (0, 1, 2...) to each category. Simple and fast, but assumes ordinal relationships.',
    'one_hot': 'Creates separate binary columns (0/1) for each category. Eliminates ordinal assumptions but increases dimensionality.',
    'ordinal': 'Maps categories to integers based on their natural order. Preserves ordinal relationships.',
    'binary': 'Converts categories to binary code representation. Space-efficient encoding method.',
    'frequency': 'Replaces categories with their frequency counts in the dataset. Captures category importance.',
    'count': 'Similar to frequency encoding, replaces categories with total occurrence counts.',
    'target': 'Replaces each category with the mean of the target variable for that category. Supervised encoding.',
    'hash': 'Uses hashing function to convert categories to numerical values. Useful for high-cardinality features.',
    'leave_one_out': 'Target encoding variant that excludes the current row to prevent data leakage.',
    'woe': 'Weight of Evidence encoding based on the relationship with target variable. Commonly used in credit scoring.'
  };

  return descriptions[method] || 'Custom encoding method';
}
