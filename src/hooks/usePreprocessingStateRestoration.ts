import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import { ExecutionResult } from "@/components/preprocessing/missing-value-handling/types";

export interface PreprocessingStep {
  id: number;
  dataset_id: string;
  step_type: string;
  step_name: string;
  config: any;
  output_path: string | null;
  status: string;
  created_at: string | null;
}

export function usePreprocessingStateRestoration(
  datasetId: string | undefined,
  stepType: string,
  onStateRestored: (step: PreprocessingStep, config: any, result: ExecutionResult) => void
) {
  const [isRestoring, setIsRestoring] = useState(false);
  const hasRestoredRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const restorePreviousState = async () => {
      if (!datasetId) return;

      // Validate dataset ID format
      if (typeof datasetId !== 'string' || datasetId.trim() === '') {
        console.warn(`[${stepType}] Invalid dataset ID provided for state restoration`);
        return;
      }

      // Create a unique key for this datasetId + stepType combination
      const restoreKey = `${datasetId}-${stepType}`;
      
      // Skip if we've already restored for this combination or are currently fetching
      if (hasRestoredRef.current === restoreKey || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsRestoring(true);
      
      try {
        console.log(`[${stepType}] Attempting to restore state for dataset: ${datasetId}`);
        
        // Validate dataset exists before trying to fetch preprocessing steps
        try {
          await api.get(API_ENDPOINTS.datasetsById(datasetId));
        } catch (validationError) {
          console.warn(`[${stepType}] Dataset ${datasetId} not found, skipping state restoration`);
          hasRestoredRef.current = restoreKey;
          return;
        }
        
        // Fetch preprocessing steps for this dataset
        const steps = await api.get<PreprocessingStep[]>(API_ENDPOINTS.datasetPreprocessingSteps(datasetId));

        // Find the latest step of the specified type that is completed
        const latestStep = steps
          .filter(step => step.step_type === stepType && step.status === "completed")
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA; // Sort descending (newest first)
          })[0];

        if (latestStep) {
          console.log(`[${stepType}] Found previous execution, restoring state:`, latestStep);
          
          // Create execution result from step
          const stepConfig = latestStep.config || {};
          const method = stepConfig.method || stepConfig.selectedMethods || [];
          const methodsArray = Array.isArray(method) ? method : [method].filter(Boolean);
          
          const executionResult: ExecutionResult = {
            methods: methodsArray,
            columns: stepConfig.columns || [],
            executed: true,
            executedAt: latestStep.created_at || new Date().toISOString(),
            droppedRows: stepConfig.droppedRows,
            droppedColumns: Array.isArray(stepConfig.droppedColumns) ? stepConfig.droppedColumns.length : stepConfig.droppedColumns || 0,
            constantValueUsed: stepConfig.constant_value,
          };

          // Call the restoration callback
          onStateRestored(latestStep, stepConfig, executionResult);

          // Mark as restored to prevent repeated calls
          hasRestoredRef.current = restoreKey;

          // Show a toast to inform user that result was restored
          toast.success(`Previous ${stepType.replace('_', ' ')} processing result restored`, {
            duration: 3000,
          });
        } else {
          console.log(`[${stepType}] No previous execution found for this dataset`);
          // Mark as checked even if no result found
          hasRestoredRef.current = restoreKey;
        }
      } catch (error) {
        console.error(`[${stepType}] Error restoring previous preprocessing result:`, error);
        // Don't show error to user - it's okay if there's no previous result
        // Mark as checked to prevent infinite retries
        hasRestoredRef.current = restoreKey;
      } finally {
        setIsRestoring(false);
        isFetchingRef.current = false;
      }
    };

    restorePreviousState();
  }, [datasetId, stepType]); // Removed onStateRestored from dependencies

  return { isRestoring };
}
