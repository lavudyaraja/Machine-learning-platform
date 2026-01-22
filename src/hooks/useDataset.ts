// Dataset operations

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import type { Dataset, DatasetPreview } from "@/types";

export function useDataset() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Dataset[]>(API_ENDPOINTS.datasets);
      // Ensure data is always an array
      setDatasets(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch datasets";
      setError(errorMessage);
      console.error("Error fetching datasets:", err);
      // Set empty array on error to prevent undefined issues
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const uploadDataset = async (file: File): Promise<Dataset> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const dataset = await api.post<Dataset>(API_ENDPOINTS.upload, formData);
      setDatasets((prev) => [dataset, ...prev]);
      return dataset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload dataset";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(API_ENDPOINTS.datasetsById(id));
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete dataset";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDataset = async (id: string, updates: Partial<Dataset>): Promise<Dataset> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.put<Dataset>(API_ENDPOINTS.datasetsById(id), updates);
      setDatasets((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update dataset";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadDataset = async (id: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(API_ENDPOINTS.datasetDownload(id));
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download dataset";
      setError(errorMessage);
      throw err;
    }
  };

  const duplicateDataset = async (id: string): Promise<Dataset> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.datasetDuplicate(id), {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Duplication failed");
      }
      const result = await response.json();
      const newDataset = result.data;
      setDatasets((prev) => [newDataset, ...prev]);
      return newDataset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to duplicate dataset";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    datasets,
    loading,
    error,
    uploadDataset,
    deleteDataset,
    updateDataset,
    downloadDataset,
    duplicateDataset,
    refetch: fetchDatasets,
  };
}

export function useDatasetDetail(id: string) {
  const [dataset, setDataset] = useState<(Dataset & { preview?: DatasetPreview }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchPreview = async (datasetId: string, page: number = 1, pageSize: number = 10) => {
    try {
      const previewUrl = API_ENDPOINTS.datasetPreview(datasetId, page, pageSize);
      const preview = await api.get<DatasetPreview>(previewUrl);
      return preview;
    } catch (err) {
      console.error("Error fetching dataset preview:", err);
      return null;
    }
  };

  useEffect(() => {
    // Only fetch if id changed and not already fetching
    if (!id || id === prevIdRef.current || isFetchingRef.current) {
      return;
    }

    // Validate ID format
    if (typeof id !== 'string' || id.trim() === '') {
      setError('Invalid dataset ID provided');
      return;
    }

    // Clear any cached preprocessing state for old datasets when switching
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('preprocessing_state_') && !key.includes(id)) {
          console.log(`[useDatasetDetail] Clearing old state for: ${key}`);
          localStorage.removeItem(key);
        }
      });
    }

    prevIdRef.current = id;
    isFetchingRef.current = true;

    const fetchDataset = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`[useDatasetDetail] Fetching dataset with ID: ${id}`);
        
        // Try to fetch dataset directly - if it fails, we'll handle the error
        const data = await api.get<Dataset & { preview?: DatasetPreview }>(
          API_ENDPOINTS.datasetsById(id)
        );
        
        // Validate the response data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid dataset data received');
        }

        if (!data.id) {
          throw new Error('Dataset ID is missing from response');
        }
        
        console.log(`[useDatasetDetail] Successfully fetched dataset: ${data.name} (ID: ${data.id})`);
        
        // Fetch preview data
        const preview = await fetchPreview(id, 1, 10);
        
        setDataset({
          ...data,
          preview: preview || undefined
        });
      } catch (err) {
        console.error(`[useDatasetDetail] Error fetching dataset ${id}:`, err);
        
        // Only validate and fetch all datasets if we get a 404 or similar error
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch dataset";
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          try {
            const availableDatasets = await api.get<Dataset[]>(API_ENDPOINTS.datasets);
            const availableIds = Array.isArray(availableDatasets) ? availableDatasets.map(d => d.id).join(', ') : 'None';
            const detailedError = `Dataset with ID "${id}" not found. Available datasets: ${availableIds}`;
            console.error(detailedError);
            setError(detailedError);
          } catch (validationErr) {
            setError(`Dataset with ID "${id}" not found. Please check the dataset ID and try again.`);
          }
        } else {
          setError(`Failed to load dataset: ${errorMessage}`);
        }
        setDataset(null);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchDataset();
  }, [id]);

  return { dataset, loading, error, fetchPreview };
}

