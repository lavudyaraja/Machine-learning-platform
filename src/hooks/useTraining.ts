'use client';

import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';

interface TrainingRequest {
  datasetId: string;
  modelId: string;
  targetColumn: string;
  taskType: 'classification' | 'regression';
  hyperparameters?: Record<string, any>;
}

interface TrainingJob {
  jobId: string;
  taskId?: string;
  status: string;
  progress?: number;
  message?: string;
  metrics?: any;
  results?: any;
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

export function useTraining() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTraining = useCallback(async (request: TrainingRequest): Promise<TrainingJob> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.training, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        jobId: data.jobId,
        taskId: data.taskId,
        status: data.status,
        message: data.message,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start training';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobStatus = useCallback(async (jobId: string): Promise<TrainingJob> => {
    try {
      const response = await fetch(API_ENDPOINTS.trainingJob(jobId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        jobId: data.jobId,
        status: data.status,
        progress: data.progress,
        message: data.message,
        metrics: data.metrics,
        results: data.results,
        error: data.error,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get job status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const pauseJob = useCallback(async (jobId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.pauseJob(jobId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to pause job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeJob = useCallback(async (jobId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.resumeJob(jobId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resume job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopJob = useCallback(async (jobId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.stopJob(jobId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to stop job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    startTraining,
    getJobStatus,
    pauseJob,
    resumeJob,
    stopJob,
    loading,
    error,
  };
}
