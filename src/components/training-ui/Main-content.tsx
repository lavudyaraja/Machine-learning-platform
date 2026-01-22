'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckpointGallery } from './CheckpointGallery';
import { LearningCurves } from './LearningCurves';
import { SystemLogs } from './LogsPanel';
import { ResourceUtilization } from './ResourceUsage';
import { useTrainingWebSocket } from '@/hooks/useTrainingWebSocket';
import { useTraining } from '@/hooks/useTraining';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api.config';
import { api } from '@/lib/api';

// Model type IDs for hyperparameter defaults
const MODEL_TYPE_IDS = {
  KNN: ['knn-classifier', 'knn-regressor', 'k-nearest-neighbors', 'k-nearest-neighbors-classifier', 'k-nearest-neighbors-regressor'],
  RANDOM_FOREST: ['random-forest-classifier', 'random-forest-regressor'],
  SVM: ['svm-classifier', 'svm-rbf', 'svr', 'support-vector-machine', 'support-vector-machine-classifier'],
};

interface TrainingJob {
  jobId: string | null;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  modelName: string;
  metrics: {
    accuracy?: number;
    loss?: number;
    valLoss?: number;
    valAccuracy?: number;
    mse?: number;
    r2_score?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    mae?: number;
  };
  trainingHistory: Array<{
    epoch: number;
    loss: number;
    valLoss?: number;
    accuracy?: number;
    valAccuracy?: number;
  }>;
  checkpoints: Array<{
    epoch: number;
    loss: number;
    timestamp: string;
  }>;
  logs: Array<{
    time: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
  }>;
  resourceUsage: Array<{
    timestamp: number;
    gpu: number;
    ram: number;
  }>;
  totalEpochs?: number;
  startTime?: number;
  elapsedTime?: number;
}

interface MainContentProps {
  sidebarOpen: boolean;
  activeModelId?: string | null;
  loadedModels?: Array<{ id: string; name: string; icon?: string }>;
  datasetId?: string | null;
  targetColumn?: string;
  hyperparameters?: Record<string, any>;
}

// Format training time
function formatTrainingTime(elapsedTime?: number, startTime?: number): string {
  let totalMs = 0;
  if (elapsedTime !== undefined) {
    totalMs = elapsedTime;
  } else if (startTime) {
    totalMs = Date.now() - startTime;
  }
  
  if (totalMs === 0) return '0s';
  
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function MainContent({ 
  sidebarOpen, 
  activeModelId,
  loadedModels = [],
  datasetId,
  targetColumn,
  hyperparameters = {}
}: MainContentProps) {
  const searchParams = useSearchParams();
  const { startTraining, getJobStatus, pauseJob, resumeJob, stopJob } = useTraining();
  
  // Get datasetId from props or searchParams as fallback
  const originalDatasetId = datasetId || searchParams.get('datasetId');
  
  // Check for processed dataset ID from preprocessing pipeline
  const [effectiveDatasetId, setEffectiveDatasetId] = useState<string | null>(originalDatasetId);
  
  useEffect(() => {
    if (!originalDatasetId) {
      setEffectiveDatasetId(null);
      return;
    }

    // Use original dataset ID directly (backend handles processed datasets)
    console.log(`[Training] Using dataset ID: ${originalDatasetId}`);
    setEffectiveDatasetId(originalDatasetId);
  }, [originalDatasetId]);
  
  // Debug: Log props
  useEffect(() => {
    console.log('MainContent: Props and state:', {
      datasetId,
      effectiveDatasetId,
      targetColumn,
      activeModelId,
      loadedModelsCount: loadedModels.length,
      searchParamsDatasetId: searchParams.get('datasetId')
    });
  }, [datasetId, effectiveDatasetId, targetColumn, activeModelId, loadedModels.length, searchParams]);
  
  const [trainingJob, setTrainingJob] = useState<TrainingJob>({
    jobId: null,
    status: 'idle',
    progress: 0,
    modelName: '',
    metrics: {},
    trainingHistory: [],
    checkpoints: [],
    logs: [],
    resourceUsage: [],
    totalEpochs: 0,
    startTime: undefined,
    elapsedTime: undefined,
  });

  const [datasetColumns, setDatasetColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string>('');
  const [epochs, setEpochs] = useState<string>('auto');
  const [batchSize, setBatchSize] = useState<string>('auto');
  
  const activeModel = useMemo(() => {
    if (!activeModelId) return null;
    return loadedModels.find(m => m.id === activeModelId);
  }, [activeModelId, loadedModels]);

  // Initialize selectedTargetColumn from prop
  useEffect(() => {
    if (targetColumn) {
      setSelectedTargetColumn(targetColumn);
    }
  }, [targetColumn]);

  // Fetch dataset columns when datasetId is available
  useEffect(() => {
    const fetchColumns = async () => {
      const idToUse = effectiveDatasetId;
      
      if (!idToUse) {
        console.log('MainContent: No datasetId provided');
        setDatasetColumns([]);
        setSelectedTargetColumn('');
        return;
      }

      console.log('MainContent: Fetching columns for datasetId:', idToUse);
      setLoadingColumns(true);
      try {
        const url = `${API_ENDPOINTS.datasetsById(idToUse)}?page=1&pageSize=1&preview=true`;
        console.log('MainContent: Fetching from URL:', url);
        
        const data = await api.get<{ preview?: { columns: string[] } }>(url);
        console.log('MainContent: Response data:', data);
        
        if (data.preview?.columns && Array.isArray(data.preview.columns)) {
          console.log('MainContent: Found columns:', data.preview.columns);
          const columns = data.preview.columns;
          setDatasetColumns(columns);
          
          // Auto-select target column if not set
          setSelectedTargetColumn(prev => {
            // Don't override if already set
            if (prev) {
              console.log('MainContent: Keeping existing target column:', prev);
              return prev;
            }
            
            // Try common target column names
            const commonTargets = ['target', 'label', 'y', 'class', 'outcome', 'result'];
            const foundTarget = columns.find((col: string) => 
              commonTargets.includes(col.toLowerCase())
            );
            if (foundTarget) {
              console.log('MainContent: Auto-selected target column:', foundTarget);
              return foundTarget;
            } else if (columns.length > 0) {
              // Default to last column
              const lastColumn = columns[columns.length - 1];
              console.log('MainContent: Auto-selected last column:', lastColumn);
              return lastColumn;
            }
            return prev;
          });
        } else {
          console.warn('MainContent: No columns found in response:', data);
          setDatasetColumns([]);
          toast.warning('Dataset columns not found in response');
        }
      } catch (error) {
        console.error('MainContent: Error fetching dataset columns:', error);
        toast.error(`Failed to load dataset columns: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDatasetColumns([]);
      } finally {
        setLoadingColumns(false);
      }
    };

    fetchColumns();
  }, [effectiveDatasetId ?? '']); // Use effectiveDatasetId and nullish coalescing to ensure dependency array size is constant

  // Connect WebSocket for real-time updates
  const { connected, update, error: wsError } = useTrainingWebSocket(trainingJob.jobId);

  // Handle WebSocket updates
  useEffect(() => {
    if (!update) {
      return;
    }

    // Get update ID to track if we've processed this update
    const updateId = (update as any)._updateId;
    const updateTimestamp = (update as any)._timestamp;
    
    console.log(`🔄 Processing WebSocket update #${updateId} (${update.type}):`, {
      epoch: update.epoch,
      progress: update.progress,
      historyLength: update.training_history?.length || 0,
      timestamp: updateTimestamp
    });

    if (update.type === 'progress') {
      setTrainingJob(prev => {
        const newEpoch = update.epoch;
        
        // Use training_history from backend if available (more reliable)
        let updatedHistory: typeof prev.trainingHistory;
        if (update.training_history && Array.isArray(update.training_history) && update.training_history.length > 0) {
          // Convert backend format to frontend format
          updatedHistory = update.training_history.map((entry: any) => {
            const mapped = {
              epoch: entry.epoch || 0,
              loss: entry.trainLoss !== undefined ? entry.trainLoss : (entry.loss !== undefined ? entry.loss : 0),
              valLoss: entry.valLoss !== undefined ? entry.valLoss : (entry.trainLoss !== undefined ? entry.trainLoss : (entry.loss !== undefined ? entry.loss : 0)),
              accuracy: entry.trainAccuracy !== undefined ? entry.trainAccuracy : (entry.accuracy !== undefined ? entry.accuracy : undefined),
              valAccuracy: entry.valAccuracy !== undefined ? entry.valAccuracy : (entry.trainAccuracy !== undefined ? entry.trainAccuracy : (entry.accuracy !== undefined ? entry.accuracy : undefined)),
            };
            return mapped;
          });
          // Sort by epoch to ensure sequential order
          updatedHistory.sort((a, b) => a.epoch - b.epoch);
          
          // Log epoch sequence to detect jumps
          const epochs = updatedHistory.map(h => h.epoch);
          const missingEpochs: number[] = [];
          if (epochs.length > 0) {
            const minEpoch = Math.min(...epochs);
            const maxEpoch = Math.max(...epochs);
            for (let i = minEpoch; i <= maxEpoch; i++) {
              if (!epochs.includes(i)) {
                missingEpochs.push(i);
              }
            }
          }
          
          if (missingEpochs.length > 0) {
            console.warn('⚠️ Missing epochs detected:', missingEpochs);
          }
          
          console.log(`📊 Updated history: ${updatedHistory.length} epochs (${epochs[0]} to ${epochs[epochs.length - 1]})`);
        } else if (newEpoch) {
          // Fallback: build incrementally from individual updates
          const existingEpoch = prev.trainingHistory.find(h => h.epoch === newEpoch);
          
          if (existingEpoch) {
            // Update existing epoch
            updatedHistory = prev.trainingHistory.map(h => 
              h.epoch === newEpoch 
                ? {
                    epoch: newEpoch,
                    loss: update.metrics?.trainLoss !== undefined ? update.metrics.trainLoss : (update.metrics?.loss !== undefined ? update.metrics.loss : h.loss),
                    valLoss: update.metrics?.valLoss !== undefined ? update.metrics.valLoss : (update.metrics?.loss !== undefined ? update.metrics.loss : h.valLoss),
                    accuracy: update.metrics?.trainAccuracy !== undefined ? update.metrics.trainAccuracy : (update.metrics?.accuracy !== undefined ? update.metrics.accuracy : h.accuracy),
                    valAccuracy: update.metrics?.valAccuracy !== undefined ? update.metrics.valAccuracy : (update.metrics?.accuracy !== undefined ? update.metrics.accuracy : h.valAccuracy),
                  }
                : h
            );
          } else {
            // Add new epoch
            updatedHistory = [
              ...prev.trainingHistory,
              {
                epoch: newEpoch,
                loss: update.metrics?.trainLoss !== undefined ? update.metrics.trainLoss : (update.metrics?.loss !== undefined ? update.metrics.loss : 0),
                valLoss: update.metrics?.valLoss !== undefined ? update.metrics.valLoss : (update.metrics?.loss !== undefined ? update.metrics.loss : 0),
                accuracy: update.metrics?.trainAccuracy !== undefined ? update.metrics.trainAccuracy : (update.metrics?.accuracy !== undefined ? update.metrics.accuracy : undefined),
                valAccuracy: update.metrics?.valAccuracy !== undefined ? update.metrics.valAccuracy : (update.metrics?.accuracy !== undefined ? update.metrics.accuracy : undefined),
              }
            ];
            // Sort by epoch to ensure sequential order
            updatedHistory.sort((a, b) => a.epoch - b.epoch);
          }
          console.log('📊 Incremental update - Epoch:', newEpoch, 'History length:', updatedHistory.length);
        } else {
          updatedHistory = prev.trainingHistory;
        }

        // Create checkpoint if it's a milestone epoch
        let checkpoints = [...prev.checkpoints];
        if (newEpoch && (newEpoch % 5 === 0 || newEpoch === 1)) {
          const checkpointExists = checkpoints.some(c => c.epoch === newEpoch);
          if (!checkpointExists) {
            checkpoints.push({
              epoch: newEpoch,
              loss: update.metrics?.valLoss || update.metrics?.loss || 0,
              timestamp: new Date().toISOString(),
            });
            // Keep last 10 checkpoints
            checkpoints = checkpoints.slice(-10);
          }
        }

        // Update resource usage
        let updatedResourceUsage = [...prev.resourceUsage];
        if (update.resource_usage) {
          updatedResourceUsage.push({
            timestamp: update.resource_usage.timestamp || Date.now(),
            gpu: update.resource_usage.gpu || 0,
            ram: update.resource_usage.ram || 0,
          });
          // Keep last 50 resource usage entries
          updatedResourceUsage = updatedResourceUsage.slice(-50);
        }

        // Set start time on first epoch
        const startTime = prev.startTime || (newEpoch === 1 ? Date.now() : prev.startTime);
        
        return {
          ...prev,
          progress: update.progress || 0,
          status: 'running',
          metrics: update.metrics || prev.metrics,
          trainingHistory: updatedHistory,
          checkpoints,
          resourceUsage: updatedResourceUsage,
          totalEpochs: update.total_epochs || prev.totalEpochs || 0,
          startTime: startTime,
          elapsedTime: update.elapsed_time ? update.elapsed_time * 1000 : prev.elapsedTime, // Convert to milliseconds
        };
      });

      // Add detailed log entry with metrics
      if (update.message) {
        const metricsMsg = update.metrics 
          ? ` | Loss: ${update.metrics.loss?.toFixed(4) || 'N/A'} | Accuracy: ${(update.metrics.accuracy ? update.metrics.accuracy * 100 : 0)?.toFixed(2) || 'N/A'}%`
          : '';
        addLog('INFO', `${update.message}${metricsMsg}`);
      }
    } else if (update.type === 'complete') {
      console.log('✅ Training completed! Results:', update.results);
      
      setTrainingJob(prev => {
        // Use training_history from results if available
        let finalHistory = prev.trainingHistory;
        if (update.results?.training_history && Array.isArray(update.results.training_history)) {
          finalHistory = update.results.training_history.map((entry: any) => ({
            epoch: entry.epoch || 0,
            loss: entry.trainLoss || entry.loss || 0,
            valLoss: entry.valLoss || entry.trainLoss || entry.loss || 0,
            accuracy: entry.trainAccuracy || entry.accuracy || undefined,
            valAccuracy: entry.valAccuracy || entry.trainAccuracy || entry.accuracy || undefined,
          }));
          // Sort by epoch
          finalHistory.sort((a, b) => a.epoch - b.epoch);
          console.log('📊 Final training history:', finalHistory);
        }
        
        // Extract metrics from results - backend sends metrics directly in results object
        const finalMetrics: any = {};
        if (update.results) {
          // Classification metrics
          if (update.results.accuracy !== undefined) {
            finalMetrics.accuracy = update.results.accuracy;
            finalMetrics.valAccuracy = update.results.accuracy;
          }
          if (update.results.precision !== undefined) finalMetrics.precision = update.results.precision;
          if (update.results.recall !== undefined) finalMetrics.recall = update.results.recall;
          if (update.results.f1 !== undefined) finalMetrics.f1 = update.results.f1;
          
          // Regression metrics
          if (update.results.mse !== undefined) {
            finalMetrics.mse = update.results.mse;
            finalMetrics.loss = update.results.mse;
            finalMetrics.valLoss = update.results.mse;
          }
          if (update.results.mae !== undefined) finalMetrics.mae = update.results.mae;
          if (update.results.r2_score !== undefined) finalMetrics.r2_score = update.results.r2_score;
        }
        
        console.log('📊 Final metrics:', finalMetrics);
        
        return {
          ...prev,
          status: 'completed',
          progress: 100,
          metrics: Object.keys(finalMetrics).length > 0 ? finalMetrics : prev.metrics,
          trainingHistory: finalHistory,
          elapsedTime: update.elapsed_time ? update.elapsed_time * 1000 : prev.elapsedTime,
        };
      });
      
      const timeMsg = update.elapsed_time ? ` in ${formatTrainingTime(update.elapsed_time * 1000)}` : '';
      const accuracyMsg = update.results?.accuracy 
        ? ` - Accuracy: ${(update.results.accuracy * 100).toFixed(2)}%` 
        : '';
      addLog('INFO', `Training completed successfully${timeMsg}${accuracyMsg}`);
      toast.success(`Training completed${timeMsg}${accuracyMsg}!`);
    } else if (update.type === 'error') {
      const errorMsg = update.error || 'Training failed';
      const isCancelled = errorMsg.toLowerCase().includes('cancelled');
      setTrainingJob(prev => ({
        ...prev,
        status: isCancelled ? 'cancelled' : 'failed',
      }));
      addLog('ERROR', errorMsg);
      toast.error(errorMsg);
    } else if (update.type === 'status') {
      const newStatus = update.status as any;
      setTrainingJob(prev => {
        const wasPaused = prev.status === 'paused';
        if (newStatus === 'paused') {
          addLog('INFO', update.message || 'Training paused');
        } else if (newStatus === 'running' && wasPaused) {
          addLog('INFO', update.message || 'Training resumed');
        }
        return {
          ...prev,
          status: newStatus || prev.status,
          message: update.message,
        };
      });
    }
  }, [update]);

  // Add log entry
  const addLog = (level: 'INFO' | 'WARN' | 'ERROR', message: string) => {
    const time = new Date().toLocaleTimeString();
    setTrainingJob(prev => ({
      ...prev,
      logs: [
        ...prev.logs.slice(-99), // Keep last 100 logs
        { time, level, message }
      ],
    }));
  };

  // Start training
  const handleStartTraining = async () => {
    if (!activeModel || !effectiveDatasetId || !selectedTargetColumn) {
      toast.error('Please select a model, dataset, and target column');
      return;
    }

    try {
      addLog('INFO', `Starting training for ${activeModel.name}...`);
      
      // Calculate epochs and batch_size
      const epochsValue = epochs === 'auto' ? null : parseInt(epochs, 10);
      const batchSizeValue = batchSize === 'auto' ? null : parseInt(batchSize, 10);
      
      // Get hyperparameters for the active model
      const modelHyperparameters = hyperparameters.modelId === activeModel.id 
        ? { ...hyperparameters }
        : {};
      
      // Remove modelId from hyperparameters before sending
      const { modelId, ...cleanHyperparameters } = modelHyperparameters;
      
      const job = await startTraining({
        datasetId: effectiveDatasetId,
        modelId: activeModel.id,
        targetColumn: selectedTargetColumn,
        taskType: 'classification', // TODO: Get from dataset metadata
        hyperparameters: {
          epochs: epochsValue,
          batch_size: batchSizeValue,
          ...cleanHyperparameters,
          // Default values if not set
          ...(activeModel.id === 'random_forest' && !cleanHyperparameters.n_estimators ? { n_estimators: 100 } : {}),
          ...(activeModel.id === 'svm' && !cleanHyperparameters.C ? { C: 1.0, kernel: 'rbf' } : {}),
          ...(MODEL_TYPE_IDS.KNN.includes(activeModel.id.toLowerCase()) && !cleanHyperparameters.kValue ? { 
            kValue: 5,
            distanceMetric: 'euclidean',
            weightFunction: 'distance',
            algorithm: 'auto',
            minkowskiP: 2
          } : {}),
        },
      });

      setTrainingJob(prev => ({
        ...prev,
        jobId: job.jobId,
        status: 'running',
        modelName: activeModel.name,
        progress: 0,
      }));

      addLog('INFO', `Training job created: ${job.jobId}`);
      toast.success('Training started!');
    } catch (error: any) {
      addLog('ERROR', error.message || 'Failed to start training');
      toast.error(error.message || 'Failed to start training');
    }
  };

  // Pause/Resume training
  const handlePauseResume = async () => {
    if (!trainingJob.jobId) {
      toast.error('No active training job');
      return;
    }

    try {
      if (trainingJob.status === 'running') {
        addLog('INFO', 'Pausing training...');
        await pauseJob(trainingJob.jobId);
        // Status will be updated via WebSocket
        addLog('INFO', 'Training paused');
        toast.success('Training paused');
      } else if (trainingJob.status === 'paused') {
        addLog('INFO', 'Resuming training...');
        await resumeJob(trainingJob.jobId);
        // Status will be updated via WebSocket
        addLog('INFO', 'Training resumed');
        toast.success('Training resumed');
      } else {
        toast.warning(`Cannot pause/resume. Current status: ${trainingJob.status}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to pause/resume training';
      addLog('ERROR', errorMsg);
      toast.error(errorMsg);
    }
  };

  // Stop training
  const handleStop = async () => {
    if (!trainingJob.jobId) return;

    try {
      await stopJob(trainingJob.jobId);
      setTrainingJob(prev => ({
        ...prev,
        status: 'cancelled',
      }));
      addLog('INFO', 'Training cancelled');
      toast.success('Training cancelled');
    } catch (error: any) {
      addLog('ERROR', error.message || 'Failed to stop training');
      toast.error(error.message || 'Failed to stop training');
    }
  };

  // Poll job status if WebSocket is not connected
  useEffect(() => {
    if (!trainingJob.jobId || connected) return;

    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(trainingJob.jobId!);
        setTrainingJob(prev => ({
          ...prev,
          status: status.status as any,
          progress: status.progress || 0,
          metrics: status.metrics || prev.metrics,
        }));
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [trainingJob.jobId, connected, getJobStatus]);

  // Update resource usage (mock for now, can be replaced with real API)
  useEffect(() => {
    if (trainingJob.status !== 'running') return;

    const interval = setInterval(() => {
      setTrainingJob(prev => ({
        ...prev,
        resourceUsage: [
          ...prev.resourceUsage.slice(-29), // Keep last 30 data points
          {
            timestamp: Date.now(),
            gpu: Math.random() * 30 + 50, // Mock GPU usage 50-80%
            ram: Math.random() * 20 + 30, // Mock RAM usage 30-50GB
          }
        ],
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [trainingJob.status]);

  const getStatusColor = () => {
    switch (trainingJob.status) {
      case 'running':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (trainingJob.status) {
      case 'running':
        return 'Live';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Idle';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 h-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-500 text-xs font-semibold uppercase">
            Active Job
          </span>
          {trainingJob.jobId && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 text-xs font-bold uppercase">
                {trainingJob.jobId}
              </span>
            </>
          )}
          {activeModel && (
            <>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 text-xs font-bold uppercase">
                {activeModel.name}
          </span>
            </>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
              Training Report
            </h1>
            {trainingJob.status !== 'idle' && (
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor()}`}>
                <span className={`size-2 rounded-full ${
                  trainingJob.status === 'running' ? 'bg-green-500 animate-pulse' :
                  trainingJob.status === 'paused' ? 'bg-yellow-500' :
                  trainingJob.status === 'completed' ? 'bg-blue-500' :
                  trainingJob.status === 'cancelled' ? 'bg-gray-500' :
                  'bg-red-500'
                }`}></span>
                {getStatusText()}
            </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleStartTraining}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!activeModel || !effectiveDatasetId || !selectedTargetColumn || trainingJob.status !== 'idle'}
            >
              <Play className="w-4 h-4 mr-2" />
              <span>Start Training</span>
            </Button>
            <Button 
              onClick={handlePauseResume}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={trainingJob.status !== 'running' && trainingJob.status !== 'paused'}
            >
              {trainingJob.status === 'paused' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  <span>Pause</span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleStop}
              variant="destructive"
              disabled={trainingJob.status === 'idle' || trainingJob.status === 'completed' || trainingJob.status === 'failed' || trainingJob.status === 'cancelled'}
            >
              <Square className="w-4 h-4 mr-2" />
              <span>Stop</span>
            </Button>
          </div>
        </div>
        {(trainingJob.status === 'running' || trainingJob.status === 'paused') && (
          <div className="mt-4 space-y-3">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Overall Progress:</span>
                <span className="text-sm font-bold text-slate-900">{trainingJob.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${trainingJob.progress}%` }}
                />
              </div>
            </div>
            
            {/* Epoch Progress */}
            {trainingJob.totalEpochs && trainingJob.totalEpochs > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Epoch Progress:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {trainingJob.trainingHistory.length > 0 
                      ? trainingJob.trainingHistory[trainingJob.trainingHistory.length - 1].epoch 
                      : 0} / {trainingJob.totalEpochs}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${trainingJob.totalEpochs > 0 
                        ? ((trainingJob.trainingHistory.length > 0 
                            ? trainingJob.trainingHistory[trainingJob.trainingHistory.length - 1].epoch 
                            : 0) / trainingJob.totalEpochs) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Status Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span>Status: <span className="font-bold text-blue-600">{trainingJob.status.toUpperCase()}</span></span>
              {trainingJob.totalEpochs && trainingJob.totalEpochs > 0 && (
                <>
                  <span>•</span>
                  <span>Total Epochs: <span className="font-bold">{trainingJob.totalEpochs}</span></span>
                </>
              )}
              {(trainingJob.elapsedTime !== undefined || trainingJob.startTime) && (
                <>
                  <span>•</span>
                  <span>Time: <span className="font-bold text-green-600">
                    {formatTrainingTime(trainingJob.elapsedTime, trainingJob.startTime)}
                  </span></span>
                </>
              )}
            </div>
          </div>
        )}
        {trainingJob.status === 'idle' && (
          <div className="mt-4 space-y-3">
            {effectiveDatasetId && (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-xs font-semibold text-slate-700 min-w-[100px]">
                    Target Column:
                  </label>
                  {loadingColumns ? (
                    <div className="w-64 px-3 py-2 text-sm text-slate-400 border border-slate-200 rounded-md bg-slate-50">
                      Loading columns...
                    </div>
                  ) : datasetColumns.length > 0 ? (
                    <Select
                      value={selectedTargetColumn || undefined}
                      onValueChange={(value) => {
                        console.log('Target column changed to:', value);
                        setSelectedTargetColumn(value);
                        toast.success(`Target column selected: ${value}`);
                      }}
                      disabled={!effectiveDatasetId || loadingColumns}
                    >
                      <SelectTrigger className="w-64 bg-white border-slate-200">
                        <SelectValue placeholder="Select target column" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasetColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="w-64 px-3 py-2 text-sm text-slate-400 border border-slate-200 rounded-md bg-slate-50">
                      No columns available
                    </div>
                  )}
                  {selectedTargetColumn && (
                    <span className="text-xs text-slate-500 font-medium">
                      Selected: {selectedTargetColumn}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-xs font-semibold text-slate-700 min-w-[100px]">
                    Epochs:
                  </label>
                  <Select
                    value={epochs}
                    onValueChange={(value) => {
                      setEpochs(value);
                      toast.success(`Epochs set to: ${value === 'auto' ? 'Auto' : value}`);
                    }}
                    disabled={!effectiveDatasetId}
                  >
                    <SelectTrigger className="w-48 bg-white border-slate-200">
                      <SelectValue placeholder="Select epochs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      {[5, 10, 20, 50, 100, 200, 500].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className="text-xs font-semibold text-slate-700 min-w-[100px]">
                    Batch Size:
                  </label>
                  <Select
                    value={batchSize}
                    onValueChange={(value) => {
                      setBatchSize(value);
                      toast.success(`Batch size set to: ${value === 'auto' ? 'Auto' : value}`);
                    }}
                    disabled={!effectiveDatasetId}
                  >
                    <SelectTrigger className="w-48 bg-white border-slate-200">
                      <SelectValue placeholder="Select batch size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      {[16, 32, 64, 128, 256, 512].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {trainingJob.status !== 'idle' ? (
        <>
          <CheckpointGallery 
            checkpoints={trainingJob.checkpoints}
            trainingHistory={trainingJob.trainingHistory}
          />
          <LearningCurves 
            trainingHistory={trainingJob.trainingHistory}
            metrics={trainingJob.metrics}
            currentEpoch={trainingJob.trainingHistory.length > 0 ? trainingJob.trainingHistory[trainingJob.trainingHistory.length - 1].epoch : 0}
            totalEpochs={trainingJob.totalEpochs || 0}
          />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <SystemLogs 
              logs={trainingJob.logs}
              metrics={trainingJob.metrics}
              currentEpoch={trainingJob.trainingHistory.length > 0 ? trainingJob.trainingHistory[trainingJob.trainingHistory.length - 1].epoch : 0}
              totalEpochs={trainingJob.totalEpochs || 0}
              onClear={() => setTrainingJob(prev => ({ ...prev, logs: [] }))}
            />
            <ResourceUtilization 
              resourceUsage={trainingJob.resourceUsage}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
          <div className="text-center">
            <p className="text-slate-500 text-lg mb-2">No active training job</p>
            <p className="text-slate-400 text-sm">
              {!activeModel ? 'Select a model to start training' :
               !effectiveDatasetId ? 'Dataset ID is required' :
               !selectedTargetColumn ? 'Select target column to start training' :
               'Click "Start Training" to begin'}
            </p>
          </div>
      </div>
      )}
    </main>
  );
}
