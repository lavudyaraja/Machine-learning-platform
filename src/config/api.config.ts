// API endpoints & settings

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
  // Remove trailing slash from base and leading slash from endpoint if both exist
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
};

export const API_ENDPOINTS = {
  // Jobs
  jobs: buildApiUrl("/jobs"),
  jobsById: (id: string) => buildApiUrl(`/jobs/${encodeURIComponent(id)}`),

  // Upload
  upload: buildApiUrl("/upload"),

  // Datasets
  datasets: buildApiUrl("/datasets"),
  datasetsById: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}`),
  datasetPreview: (id: string, page?: number, pageSize?: number) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set("page", page.toString());
    if (pageSize !== undefined) params.set("page_size", pageSize.toString());
    const queryString = params.toString();
    return buildApiUrl(`/datasets/${encodeURIComponent(id)}/preview${queryString ? `?${queryString}` : ""}`);
  },
  datasetDownload: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}/download`),
  datasetDuplicate: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}/duplicate`),
  datasetValidate: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}/validate`),
  datasetValidations: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}/validations`),
  datasetValidationDetail: (id: string, validationId: string | number) =>
    buildApiUrl(`/datasets/${encodeURIComponent(id)}/validations/${validationId}`),
  datasetData: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}/data`),
  datasetPreprocessingSteps: (id: string) => buildApiUrl(`/datasets/${encodeURIComponent(id)}/preprocessing`),
  datasetPreprocessingStepDetail: (id: string, stepId: string | number) =>
    buildApiUrl(`/datasets/${encodeURIComponent(id)}/preprocessing/${stepId}`),

  // Models
  models: buildApiUrl("/models"),
  modelsById: (id: string) => buildApiUrl(`/models/${encodeURIComponent(id)}`),

  // Preprocessing
  preprocessing: {
    dataCleaning: buildApiUrl("/preprocess/data-cleaning"),
    featureSelection: buildApiUrl("/preprocess/feature-selection"),
    missingValues: buildApiUrl("/preprocess/missing-values"),
    categoricalEncoding: buildApiUrl("/preprocess/categorical-encoding"),
    featureScaling: buildApiUrl("/preprocess/feature-scaling"),
    featureExtraction: buildApiUrl("/preprocess/feature-extraction"),
    datasetSplitting: buildApiUrl("/preprocess/dataset-splitting"),
    steps: buildApiUrl("/preprocess/steps"),
    stepsForDataset: (datasetId: string) => buildApiUrl(`/preprocess/steps/${encodeURIComponent(datasetId)}`),
  },

  // Model Selection & Training
  modelSelection: buildApiUrl("/model-selection"),
  training: buildApiUrl("/training"),
  trainingJob: (jobId: string) => buildApiUrl(`/training/${encodeURIComponent(jobId)}`),
  pauseJob: (jobId: string) => buildApiUrl(`/training/${encodeURIComponent(jobId)}/pause`),
  resumeJob: (jobId: string) => buildApiUrl(`/training/${encodeURIComponent(jobId)}/resume`),
  stopJob: (jobId: string) => buildApiUrl(`/training/${encodeURIComponent(jobId)}/stop`),
};

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

// Helper function for fetch with retry logic
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.retries
): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Don't retry on client errors (4xx), only on server errors (5xx) or network errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // Server error, will retry if attempts remain
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on AbortError (timeout)
      if (lastError.name === 'AbortError') {
        throw new Error(`Request timeout after ${API_CONFIG.timeout}ms`);
      }
    }
    
    // Wait before retrying (except on last attempt)
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (attempt + 1)));
    }
  }
  
  throw lastError || new Error('Request failed after retries');
};