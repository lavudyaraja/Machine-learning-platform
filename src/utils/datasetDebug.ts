import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";

export async function debugAvailableDatasets() {
  console.log('[DatasetDebug] Fetching available datasets from backend...');
  
  try {
    const datasets = await api.get<any[]>(API_ENDPOINTS.datasets);
    console.log('[DatasetDebug] Available datasets:', datasets);
    
    if (Array.isArray(datasets)) {
      datasets.forEach((dataset, index) => {
        console.log(`[DatasetDebug] ${index + 1}. ID: ${dataset.id}, Name: ${dataset.name || dataset.filename}`);
      });
      
      return {
        success: true,
        count: datasets.length,
        datasets: datasets.map(d => ({
          id: d.id,
          name: d.name || d.filename || 'Unknown',
          filename: d.filename,
          rows: d.rows,
          columns: d.columns
        }))
      };
    } else {
      console.warn('[DatasetDebug] Backend did not return an array:', datasets);
      return { success: false, error: 'Invalid response format' };
    }
  } catch (error) {
    console.error('[DatasetDebug] Error fetching datasets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
}

export async function testDatasetAccess(datasetId: string) {
  console.log(`[DatasetDebug] Testing access to dataset: ${datasetId}`);
  
  try {
    const dataset = await api.get<any>(API_ENDPOINTS.datasetsById(datasetId));
    console.log(`[DatasetDebug] Successfully accessed dataset ${datasetId}:`, dataset);
    return { success: true, dataset };
  } catch (error) {
    console.error(`[DatasetDebug] Error accessing dataset ${datasetId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      datasetId
    };
  }
}

export function getCurrentUrlDatasetId(): string | null {
  if (typeof window === 'undefined') return null;
  
  const url = window.location.pathname;
  const match = url.match(/\/datasets\/([^\/]+)/);
  
  if (match) {
    const datasetId = decodeURIComponent(match[1]);
    console.log(`[DatasetDebug] Current URL dataset ID: ${datasetId}`);
    return datasetId;
  }
  
  console.log('[DatasetDebug] No dataset ID found in current URL');
  return null;
}

export async function debugCurrentDatasetState() {
  console.log('[DatasetDebug] === Dataset State Debug ===');
  
  // Get current URL dataset ID
  const urlDatasetId = getCurrentUrlDatasetId();
  
  // Get available datasets
  const availableResult = await debugAvailableDatasets();
  
  if (urlDatasetId && availableResult.success && availableResult.datasets) {
    const exists = availableResult.datasets.some(d => d.id === urlDatasetId);
    console.log(`[DatasetDebug] Current dataset ${urlDatasetId} exists: ${exists}`);
    
    if (!exists) {
      console.log(`[DatasetDebug] Available dataset IDs:`, availableResult.datasets.map(d => d.id));
      console.log(`[DatasetDebug] This explains the 404 error!`);
    }
    
    // Test access to current dataset
    const accessResult = await testDatasetAccess(urlDatasetId);
    
    return {
      urlDatasetId,
      exists,
      availableDatasets: availableResult.datasets,
      accessTest: accessResult
    };
  }
  
  return {
    urlDatasetId,
    availableDatasets: availableResult.success && availableResult.datasets ? availableResult.datasets : [],
    error: availableResult.error
  };
}
