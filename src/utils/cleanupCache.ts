/**
 * Production-ready utility to clean up invalid cached dataset data
 */

export function clearInvalidPreprocessingData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Get all localStorage keys related to preprocessing
    const keysToRemove: string[] = [];
    
    // Find all preprocessing state keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('preprocessing_state_')) {
        keysToRemove.push(key);
      }
    }

    // Remove invalid keys
    keysToRemove.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          // If the data has a datasetId, validate it still exists
          if (parsed.processedDatasetId) {
            // We'll validate this asynchronously
            console.log(`Found cached data for dataset ${parsed.processedDatasetId}`);
          }
        }
      } catch (error) {
        // Remove corrupted data
        localStorage.removeItem(key);
        console.log(`Removed corrupted cache key: ${key}`);
      }
    });

    console.log(`Cleaned up ${keysToRemove.length} preprocessing cache entries`);
  } catch (error) {
    console.error('Error cleaning up preprocessing data:', error);
  }
}

export async function validateDatasetExists(datasetId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/datasets/${datasetId}`);
    return response.ok;
  } catch (error) {
    console.error(`Error validating dataset ${datasetId}:`, error);
    return false;
  }
}

export async function cleanupInvalidDatasets(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];
    
    // Find all preprocessing state keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('preprocessing_state_')) {
        keysToRemove.push(key);
      }
    }

    // Check each cached dataset
    for (const key of keysToRemove) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.processedDatasetId) {
            const isValid = await validateDatasetExists(parsed.processedDatasetId);
            if (!isValid) {
              localStorage.removeItem(key);
              console.log(`Removed invalid dataset cache: ${parsed.processedDatasetId}`);
            }
          }
        }
      } catch (error) {
        localStorage.removeItem(key);
        console.log(`Removed corrupted cache key: ${key}`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}
