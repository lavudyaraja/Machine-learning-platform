"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ValidationReport } from "@/types/validation";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";

// Constants
const VALIDATION_CATEGORIES = [
  "File Level", "Structure", "Data Types", "Missing Data", 
  "Duplicates", "Target Variable", "Class Distribution",
  "Feature Quality", "Value Integrity", "Data Leakage", "Consistency"
];

const PROGRESS_INTERVAL_MS = 500;
const PAUSE_CHECK_INTERVAL_MS = 100;
const TIMER_INTERVAL_MS = 1000;

// Types
export interface UseValidationState {
  report: ValidationReport | null;
  loading: boolean;
  error: string | null;
  currentStep: string;
  progress: number;
  currentColumn: string;
  currentRow: number;
  totalRows: number;
  totalColumns: number;
  validatedColumns: string[];
  validatedRows: number[];
  columnChecks: Record<string, { status: "checking" | "done" | "pending"; currentCheck: string }>;
  isCancelled: boolean;
  isPaused: boolean;
  elapsedTime: number;
  finalTime: number | null;
}

export interface UseValidationReturn extends UseValidationState {
  pauseValidation: () => void;
  cancelValidation: () => void;
  runValidation: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

// Helper functions
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

const getToastMessage = (report: ValidationReport): { type: 'success' | 'warning'; message: string } => {
  if (report.blockingIssuesCount === 0 && report.warningIssuesCount === 0) {
    return { type: 'success', message: "Validation completed - All checks passed!" };
  }
  if (report.blockingIssuesCount > 0) {
    return { type: 'warning', message: `Validation completed - ${report.blockingIssuesCount} blocking issue(s) found` };
  }
  return { type: 'success', message: `Validation completed - ${report.warningIssuesCount} warning(s) found` };
};

export function useValidation(datasetId: string, targetColumn?: string): UseValidationReturn {
  // State management
  const [state, setState] = useState<UseValidationState>({
    report: null,
    loading: false,
    error: null,
    currentStep: "",
    progress: 0,
    currentColumn: "",
    currentRow: 0,
    totalRows: 0,
    totalColumns: 0,
    validatedColumns: [],
    validatedRows: [],
    columnChecks: {},
    isCancelled: false,
    isPaused: false,
    elapsedTime: 0,
    finalTime: null,
  });

  // Refs
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Timer management
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      if (!pauseRef.current && startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS);
        setState(prev => ({ ...prev, elapsedTime: elapsed }));
      }
    }, TIMER_INTERVAL_MS);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (startTimeRef.current) {
      const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS);
      setState(prev => ({ ...prev, finalTime: finalElapsed, elapsedTime: finalElapsed }));
    }
  }, []);

  // Pause/Resume validation
  const pauseValidation = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    const isPaused = pauseRef.current;
    
    setState(prev => ({
      ...prev,
      isPaused,
      currentStep: isPaused ? "Validation paused" : "Validation resumed..."
    }));
    
    toast.info(isPaused ? "Validation paused" : "Validation resumed");
  }, []);

  // Cancel validation
  const cancelValidation = useCallback(() => {
    cancelRef.current = true;
    pauseRef.current = false;
    
    setState(prev => ({
      ...prev,
      isCancelled: true,
      isPaused: false,
      loading: false,
      currentStep: "Validation cancelled"
    }));
    
    stopTimer();
    toast.info("Validation cancelled");
  }, [stopTimer]);

  // Wait if paused helper
  const waitIfPaused = useCallback(async () => {
    while (pauseRef.current && !cancelRef.current) {
      await new Promise(resolve => setTimeout(resolve, PAUSE_CHECK_INTERVAL_MS));
    }
  }, []);

  // Reset validation state
  const resetState = useCallback(() => {
    setState({
      report: null,
      loading: true,
      error: null,
      currentStep: "Initializing validation...",
      progress: 0,
      currentColumn: "",
      currentRow: 0,
      totalRows: 0,
      totalColumns: 0,
      validatedColumns: [],
      validatedRows: [],
      columnChecks: {},
      isCancelled: false,
      isPaused: false,
      elapsedTime: 0,
      finalTime: null,
    });
    
    cancelRef.current = false;
    pauseRef.current = false;
  }, []);

  // Fetch dataset info
  const fetchDatasetInfo = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, currentStep: "Loading dataset information...", progress: 10 }));
      
      const datasetResponse = await api.get<any>(API_ENDPOINTS.datasetsById(datasetId));
      const dataset = datasetResponse?.data || datasetResponse;
      
      if (dataset) {
        const columnNames = dataset.preview?.columns || 
                          dataset.columnsInfo?.map((col: any) => col?.name || col).filter(Boolean) || 
                          [];
        
        const initialChecks: Record<string, { status: "checking" | "done" | "pending"; currentCheck: string }> = {};
        columnNames.forEach((colName: string) => {
          initialChecks[colName] = { status: "pending", currentCheck: "" };
        });
        
        setState(prev => ({
          ...prev,
          totalRows: dataset.rows || 0,
          totalColumns: dataset.columns || 0,
          columnChecks: initialChecks
        }));
      }
    } catch (err) {
      console.warn("Could not fetch dataset info:", err);
    }
  }, [datasetId]);

  // Simulate progress
  const simulateProgress = useCallback((onComplete: () => void) => {
    const interval = setInterval(() => {
      if (!pauseRef.current && !cancelRef.current) {
        setState(prev => {
          if (prev.progress < 85) {
            const categoryIndex = Math.floor((prev.progress - 20) / 6);
            if (categoryIndex < VALIDATION_CATEGORIES.length) {
              return {
                ...prev,
                progress: prev.progress + 1,
                currentStep: `Validating ${VALIDATION_CATEGORIES[categoryIndex]}...`
              };
            }
          }
          return prev;
        });
      }
    }, PROGRESS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Simulate column-by-column validation progress
  const simulateColumnProgress = useCallback((columnNames: string[], onComplete: () => void) => {
    let currentColumnIndex = 0;
    const totalColumns = columnNames.length;
    
    const processNextColumn = () => {
      if (cancelRef.current || currentColumnIndex >= totalColumns) {
        onComplete();
        return;
      }
      
      if (pauseRef.current) {
        setTimeout(processNextColumn, PAUSE_CHECK_INTERVAL_MS);
        return;
      }
      
      const columnName = columnNames[currentColumnIndex];
      
      // Mark previous column as done if exists
      if (currentColumnIndex > 0) {
        const prevColumn = columnNames[currentColumnIndex - 1];
        setState(prev => ({
          ...prev,
          columnChecks: {
            ...prev.columnChecks,
            [prevColumn]: { status: "done" as const, currentCheck: "Done" }
          }
        }));
      }
      
      // Mark current column as checking
      setState(prev => ({
        ...prev,
        currentColumn: columnName,
        columnChecks: {
          ...prev.columnChecks,
          [columnName]: { status: "checking" as const, currentCheck: "Validating..." }
        }
      }));
      
      currentColumnIndex++;
      
      // Calculate progress: 20% (initial) + 70% (columns) + 10% (final processing)
      const columnProgress = 20 + Math.floor((currentColumnIndex / totalColumns) * 70);
      setState(prev => ({
        ...prev,
        progress: columnProgress,
        currentStep: `Validating column ${currentColumnIndex} of ${totalColumns}: ${columnName}`
      }));
      
      // Process next column after a short delay
      setTimeout(processNextColumn, 300);
    };
    
    processNextColumn();
  }, []);

  // Run validation
  const runValidation = useCallback(async () => {
    resetState();
    startTimer();

    try {
      // Initial setup
      setState(prev => ({ ...prev, currentStep: "Preparing validation...", progress: 5 }));
      
      if (cancelRef.current) return;
      await waitIfPaused();
      
      // Fetch dataset info
      await fetchDatasetInfo();
      
      if (cancelRef.current) return;
      await waitIfPaused();
      
      // Get column names for progress simulation from current state
      let columnNames: string[] = [];
      await new Promise<void>((resolve) => {
        setState(prev => {
          columnNames = Object.keys(prev.columnChecks);
          resolve();
          return prev;
        });
      });
      
      // Start validation
      setState(prev => ({ ...prev, currentStep: "Running validation checks...", progress: 20 }));
      
      // Simulate category progress
      const clearProgress = simulateProgress(() => {});
      
      // Start column-by-column progress simulation
      let columnProgressComplete = false;
      simulateColumnProgress(columnNames, () => {
        columnProgressComplete = true;
      });
      
      // Call validation API
      const validationReport = await api.post<ValidationReport>(
        `${API_ENDPOINTS.datasetsById(datasetId)}/validate`,
        { targetColumn }
      );
      
      clearProgress();
      
      if (cancelRef.current) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      
      // Wait for column progress to complete or finish remaining columns
      // Give it some time to process columns, but don't wait too long
      const maxWaitTime = Math.max(3000, columnNames.length * 400); // At least 3 seconds or 400ms per column
      const startWait = Date.now();
      while (!columnProgressComplete && !cancelRef.current && (Date.now() - startWait) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Mark all remaining columns as done
      setState(prev => {
        const updatedChecks = { ...prev.columnChecks };
        Object.keys(updatedChecks).forEach(colName => {
          if (updatedChecks[colName].status !== "done") {
            updatedChecks[colName] = { status: "done" as const, currentCheck: "Done" };
          }
        });
        return {
          ...prev,
          progress: 90,
          currentStep: "Processing results...",
          columnChecks: updatedChecks
        };
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (cancelRef.current) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      
      // Complete
      setState(prev => ({ ...prev, progress: 100, currentStep: "Validation completed - Done!" }));
      stopTimer();
      
      // Validate and set report
      if (validationReport && typeof validationReport === 'object' && 'checks' in validationReport) {
        setState(prev => ({ ...prev, report: validationReport }));
        
        setTimeout(() => {
          setState(prev => ({ ...prev, loading: false }));
          const { type, message } = getToastMessage(validationReport);
          type === 'success' ? toast.success(message) : toast.warning(message);
        }, 100);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: "Invalid response format from validation service"
        }));
        toast.error("Validation failed - Invalid response");
      }
    } catch (err) {
      stopTimer();
      
      const errorMessage = err instanceof Error ? err.message : 
                          typeof err === "string" ? err : 
                          "Failed to run validation";
      
      console.error("Validation error:", err);
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        progress: 0,
        currentStep: ""
      }));
      
      toast.error(`Validation failed: ${errorMessage}`);
    }
  }, [datasetId, targetColumn, resetState, startTimer, stopTimer, waitIfPaused, fetchDatasetInfo, simulateProgress, simulateColumnProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    pauseValidation,
    cancelValidation,
    runValidation,
    formatTime,
  };
}