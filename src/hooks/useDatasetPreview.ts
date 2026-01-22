// Hook for fetching paginated dataset preview

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import type { DatasetPreview } from "@/types";

interface UseDatasetPreviewOptions {
  datasetId: string;
  pageSize?: number;
  enabled?: boolean;
}

export function useDatasetPreview({
  datasetId,
  pageSize = 50,
  enabled = true,
}: UseDatasetPreviewOptions) {
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPreview = useCallback(
    async (page: number) => {
      if (!enabled || !datasetId) return;

      setLoading(true);
      setError(null);
      try {
        // Use the new preview endpoint
        const url = API_ENDPOINTS.datasetPreview(datasetId, page, pageSize);
        const data = await api.get<DatasetPreview>(url);
        if (data) {
          setPreview(data);
          setCurrentPage(page);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch preview";
        setError(errorMessage);
        console.error("Error fetching dataset preview:", err);
      } finally {
        setLoading(false);
      }
    },
    [datasetId, pageSize, enabled]
  );

  useEffect(() => {
    if (enabled && datasetId) {
      fetchPreview(1);
    }
  }, [datasetId, enabled, fetchPreview]);

  const goToPage = useCallback(
    (page: number) => {
      if (preview && page >= 1 && page <= (preview.totalPages || 1)) {
        fetchPreview(page);
      }
    },
    [preview, fetchPreview]
  );

  const nextPage = useCallback(() => {
    if (preview && currentPage < (preview.totalPages || 1)) {
      goToPage(currentPage + 1);
    }
  }, [preview, currentPage, goToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  return {
    preview,
    loading,
    error,
    currentPage,
    goToPage,
    nextPage,
    previousPage,
    refetch: () => fetchPreview(currentPage),
  };
}

