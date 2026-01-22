import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";

export interface DatasetType {
  isCategorical: boolean;
  isNumerical: boolean;
  isMixed: boolean;
  categoricalColumns: string[];
  numericalColumns: string[];
  totalColumns: number;
}

/**
 * Validates if a dataset exists and is accessible
 */
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

/**
 * Gets available datasets from the backend
 */
export async function getAvailableDatasets(): Promise<string[]> {
  try {
    const datasets = await api.get<{ id: string }[]>(API_ENDPOINTS.datasets);
    return Array.isArray(datasets) ? datasets.map(d => d.id) : [];
  } catch (error) {
    console.error("Error fetching available datasets:", error);
    return [];
  }
}

/**
 * Analyzes dataset to determine if it's categorical, numerical, or mixed
 */
export async function analyzeDatasetType(datasetId: string): Promise<DatasetType | null> {
  if (!datasetId) return null;
  
  try {
    // Get dataset info including column types using existing endpoint
    const datasetInfo = await api.get<{
      columnsInfo: Array<{ name: string; type: string }>;
    }>(API_ENDPOINTS.datasetsById(datasetId));
    
    if (!datasetInfo?.columnsInfo) {
      return null;
    }
    
    const categoricalColumns: string[] = [];
    const numericalColumns: string[] = [];
    
    datasetInfo.columnsInfo.forEach(column => {
      const type = column.type.toLowerCase();
      if (type.includes('int') || type.includes('float') || type.includes('double') || type.includes('decimal')) {
        numericalColumns.push(column.name);
      } else {
        categoricalColumns.push(column.name);
      }
    });
    
    const isCategorical = categoricalColumns.length > 0 && numericalColumns.length === 0;
    const isNumerical = numericalColumns.length > 0 && categoricalColumns.length === 0;
    const isMixed = categoricalColumns.length > 0 && numericalColumns.length > 0;
    
    return {
      isCategorical,
      isNumerical,
      isMixed,
      categoricalColumns,
      numericalColumns,
      totalColumns: datasetInfo.columnsInfo.length
    };
  } catch (error) {
    console.error("Error analyzing dataset type:", error);
    return null;
  }
}

/**
 * Gets recommended preprocessing steps based on dataset type
 */
export function getRecommendedPreprocessingSteps(datasetType: DatasetType): string[] {
  if (datasetType.isCategorical) {
    return [
      "missing-values",
      "categorical-encoding", 
      "dataset-splitting"
    ];
  } else if (datasetType.isNumerical) {
    return [
      "missing-values",
      "feature-scaling",
      "feature-selection",
      "dataset-splitting"
    ];
  } else if (datasetType.isMixed) {
    return [
      "missing-values",
      "categorical-encoding",
      "feature-scaling", 
      "feature-selection",
      "dataset-splitting"
    ];
  }
  
  return ["missing-values", "dataset-splitting"];
}

/**
 * Validates dataset and shows appropriate error messages
 */
export async function validateAndHandleDataset(datasetId: string, showToast: boolean = true): Promise<boolean> {
  if (!datasetId) {
    if (showToast) {
      toast.error("No dataset selected. Please upload a dataset first.");
    }
    return false;
  }
  
  const isValidDataset = await validateDatasetId(datasetId);
  if (!isValidDataset) {
    if (showToast) {
      toast.error(`Dataset ${datasetId} not found. It may have been deleted. Please upload a new dataset.`, {
        duration: 5000,
        action: {
          label: "Upload Dataset",
          onClick: () => {
            window.location.href = "/datasets";
          }
        }
      });
    }
    return false;
  }
  
  return true;
}

/**
 * Clears all preprocessing state for invalid datasets
 */
export function clearInvalidDatasetState(datasetId: string): void {
  if (!datasetId) return;
  
  try {
    // Clear localStorage entries for this dataset
    const storageKey = `preprocessing_state_${datasetId}`;
    localStorage.removeItem(storageKey);
    
    // Clear any other related entries
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(datasetId)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared state for invalid dataset: ${datasetId}`);
  } catch (error) {
    console.error("Error clearing dataset state:", error);
  }
}
