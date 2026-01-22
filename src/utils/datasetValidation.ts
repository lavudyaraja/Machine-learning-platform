import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";

export async function validateDatasetId(datasetId: string): Promise<boolean> {
  if (!datasetId) return false;
  
  try {
    const datasets = await api.get<{ id: string }[]>(API_ENDPOINTS.datasets);
    return Array.isArray(datasets) && datasets.some(d => d.id === datasetId);
  } catch (error) {
    console.error("Error validating dataset ID:", error);
    return false;
  }
}

export async function getAvailableDatasets(): Promise<string[]> {
  try {
    const datasets = await api.get<{ id: string }[]>(API_ENDPOINTS.datasets);
    return Array.isArray(datasets) ? datasets.map(d => d.id) : [];
  } catch (error) {
    console.error("Error fetching available datasets:", error);
    return [];
  }
}
