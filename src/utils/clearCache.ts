/**
 * Utility functions to clear cached data and force fresh state
 */

export function clearAllPreprocessingState() {
  if (typeof window === 'undefined') return;
  
  console.log('[ClearCache] Clearing all preprocessing state...');
  
  // Clear all localStorage
  const keys = Object.keys(localStorage);
  console.log(`[ClearCache] Found ${keys.length} localStorage keys to check`);
  
  keys.forEach(key => {
    console.log(`[ClearCache] Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage as well
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    console.log(`[ClearCache] Removing session key: ${key}`);
    sessionStorage.removeItem(key);
  });
  
  console.log('[ClearCache] All cache cleared successfully');
}

export function clearDatasetSpecificState(datasetId: string) {
  if (typeof window === 'undefined') return;
  
  console.log(`[ClearCache] Clearing state for dataset: ${datasetId}`);
  
  // Clear specific dataset state
  const storageKey = `preprocessing_state_${datasetId}`;
  if (localStorage.getItem(storageKey)) {
    localStorage.removeItem(storageKey);
    console.log(`[ClearCache] Removed: ${storageKey}`);
  }
  
  // Clear any other dataset-specific keys
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(datasetId)) {
      localStorage.removeItem(key);
      console.log(`[ClearCache] Removed related key: ${key}`);
    }
  });
}

export function getAllCachedDatasetIds(): string[] {
  if (typeof window === 'undefined') return [];
  
  const keys = Object.keys(localStorage);
  const datasetIds = new Set<string>();
  
  keys.forEach(key => {
    if (key.startsWith('preprocessing_state_')) {
      const datasetId = key.replace('preprocessing_state_', '');
      datasetIds.add(datasetId);
    }
  });
  
  return Array.from(datasetIds);
}

export function debugCacheState() {
  if (typeof window === 'undefined') return;
  
  console.log('[ClearCache] Current cache state:');
  
  const keys = Object.keys(localStorage);
  const preprocessingKeys = keys.filter(key => key.startsWith('preprocessing_state_'));
  
  console.log(`[ClearCache] Total localStorage keys: ${keys.length}`);
  console.log(`[ClearCache] Preprocessing keys: ${preprocessingKeys.length}`);
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`[ClearCache] ${key}:`, parsed);
      } else {
        console.log(`[ClearCache] ${key}: (empty)`);
      }
    } catch (error) {
      console.log(`[ClearCache] ${key}: (invalid data - ${error})`);
    }
  });
  
  return getAllCachedDatasetIds();
}

export function forceClearAndReload() {
  console.log('[ClearCache] Force clearing all cache and reloading...');
  
  // Clear everything
  clearAllPreprocessingState();
  
  // Clear any URL hash or params that might contain old dataset IDs
  if (window.location.hash) {
    window.location.hash = '';
  }
  
  // Force reload - the reload method doesn't accept parameters in modern browsers
  window.location.reload();
}
