import { useState, useEffect, useRef } from "react";
import { validateDatasetId, analyzeDatasetType, getRecommendedPreprocessingSteps, clearInvalidDatasetState } from "@/utils/datasetUtils";
import {
  CheckCircle2,
  Database,
  Sparkles,
  Layers,
  Scale,
  Filter,
  Boxes,
  Split,
  ArrowRight,
  ArrowLeft,
  Circle
} from "lucide-react";
import MissingValueHandler from "./missing-value-handling/MissingValueHandler";
import DataCleaner from "./data-cleaning/DataCleaner";
import CategoricalEncoder from "./categorical-encoding/CategoricalEncoder";
import FeatureScaler from "./feature-scaling/FeatureScaler";
import FeatureSelector from "./feature-selection/FeatureSelector";
import FeatureExtractor from "./feature-extraction/FeatureExtractor";
import DatasetSplitter from "./dataset-splitting/DatasetSplitter";

interface PreprocessingPipelineProps {
  datasetId?: string;
  datasetName?: string;
  columns?: string[];
  rowCount?: number;
  missingValuePercentage?: number;
  currentStep?: string;
  onStepChange?: (step: string) => void;
}

const STEPS = [
  {
    id: "missing-values",
    name: "Missing Values",
    description: "Handle missing data with imputation strategies",
    icon: Database,
    color: "blue",
  },
  {
    id: "data-cleaning",
    name: "Data Cleaning",
    description: "Remove duplicates and outliers",
    icon: Sparkles,
    color: "purple",
  },
  {
    id: "categorical-encoding",
    name: "Categorical Encoding",
    description: "Convert categories to numeric values",
    icon: Layers,
    color: "pink",
  },
  {
    id: "feature-scaling",
    name: "Feature Scaling",
    description: "Normalize numerical features",
    icon: Scale,
    color: "orange",
  },
  {
    id: "feature-selection",
    name: "Feature Selection",
    description: "Select most relevant features",
    icon: Filter,
    color: "green",
  },
  {
    id: "feature-extraction",
    name: "Feature Extraction",
    description: "Apply dimensionality reduction",
    icon: Boxes,
    color: "cyan",
  },
  {
    id: "dataset-splitting",
    name: "Dataset Splitting",
    description: "Create train/test splits",
    icon: Split,
    color: "indigo",
  },
];

const getColorClasses = (color: string, isActive: boolean, isCompleted: boolean) => {
  if (isCompleted) {
    return {
      bg: "bg-green-500",
      text: "text-white",
      border: "border-green-500",
      glow: "shadow-green-500/50"
    };
  }
  
  if (isActive) {
    const colors = {
      blue: { bg: "bg-blue-500", text: "text-white", border: "border-blue-500", glow: "shadow-blue-500/50" },
      purple: { bg: "bg-purple-500", text: "text-white", border: "border-purple-500", glow: "shadow-purple-500/50" },
      pink: { bg: "bg-pink-500", text: "text-white", border: "border-pink-500", glow: "shadow-pink-500/50" },
      orange: { bg: "bg-orange-500", text: "text-white", border: "border-orange-500", glow: "shadow-orange-500/50" },
      green: { bg: "bg-green-500", text: "text-white", border: "border-green-500", glow: "shadow-green-500/50" },
      cyan: { bg: "bg-cyan-500", text: "text-white", border: "border-cyan-500", glow: "shadow-cyan-500/50" },
      indigo: { bg: "bg-indigo-500", text: "text-white", border: "border-indigo-500", glow: "shadow-indigo-500/50" },
    };
    return colors[color as keyof typeof colors];
  }
  
  return {
    bg: "bg-slate-200",
    text: "text-slate-500",
    border: "border-slate-300",
    glow: ""
  };
};

// Storage key for preprocessing state
const getStorageKey = (datasetId: string) => `preprocessing_state_${datasetId}`;

interface PersistedPreprocessingState {
  completedSteps: string[];
  processedColumns: string[];
  processedDatasetId?: string;
  stepResults: Record<string, any>;
}

export default function PreprocessingPipeline({
  datasetId,
  datasetName = "Dataset",
  columns = [],
  rowCount,
  missingValuePercentage,
  currentStep: externalCurrentStep,
  onStepChange: externalOnStepChange
}: PreprocessingPipelineProps) {
  console.log(`[PreprocessingLayout] Component initialized with datasetId: ${datasetId}, datasetName: ${datasetName}`);
  
  const storageKey = datasetId ? getStorageKey(datasetId) : null;
  const isValidating = useRef(false);
  const isSaving = useRef(false);
  
  // Load persisted state from localStorage
  const loadPersistedState = (): PersistedPreprocessingState | null => {
    if (!storageKey || typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading persisted preprocessing state:', error);
    }
    return null;
  };

  // Save state to localStorage
  const savePersistedState = (state: Partial<PersistedPreprocessingState>) => {
    if (!storageKey || typeof window === 'undefined' || isSaving.current) return;
    
    isSaving.current = true;
    try {
      const current = loadPersistedState() || {
        completedSteps: [],
        processedColumns: columns,
        processedDatasetId: datasetId,
        stepResults: {}
      };
      const updated = { ...current, ...state };
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving persisted preprocessing state:', error);
    } finally {
      // Use setTimeout to reset the flag to prevent immediate re-saves
      setTimeout(() => {
        isSaving.current = false;
      }, 100);
    }
  };

  // Clear persisted state
  const clearPersistedState = () => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing persisted preprocessing state:', error);
    }
  };

  // Initialize state from persisted data or defaults
  const persistedState = loadPersistedState();
  const [internalCurrentStep, setInternalCurrentStep] = useState("missing-values");

  // Use external currentStep if provided, otherwise use internal state
  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalCurrentStep;
  const setCurrentStep = externalOnStepChange || setInternalCurrentStep;

  // Handle external step changes and scroll to the step
  useEffect(() => {
    if (externalCurrentStep !== undefined && externalCurrentStep !== internalCurrentStep) {
      // Update internal state to match external
      setInternalCurrentStep(externalCurrentStep);
      
      // Scroll to the step in the sidebar
      setTimeout(() => {
        const stepElement = document.getElementById(`step-${externalCurrentStep}`);
        if (stepElement) {
          stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [externalCurrentStep]);
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    persistedState?.completedSteps || []
  );
  const [processedColumns, setProcessedColumns] = useState<string[]>(
    persistedState?.processedColumns || columns
  );
  const [processedDatasetId, setProcessedDatasetId] = useState<string | undefined>(
    persistedState?.processedDatasetId || datasetId
  );
  const [stepResults, setStepResults] = useState<Record<string, any>>(
    persistedState?.stepResults || {}
  );
  // Store processed dataset data for passing to next steps
  const [processedDatasetFromDataCleaning, setProcessedDatasetFromDataCleaning] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);

  // Clear state when dataset changes - removed validation to prevent infinite loops
  const prevDatasetIdRef = useRef<string | undefined>(datasetId);
  
  useEffect(() => {
    // Only initialize if datasetId actually changed
    if (datasetId && datasetId !== prevDatasetIdRef.current && !isValidating.current) {
      prevDatasetIdRef.current = datasetId;
      isValidating.current = true;
      
      // Initialize state without validation (validation happens in useDatasetDetail hook)
      const initializeState = () => {
        try {
          // Clear old state if dataset changed
          const oldStorageKey = Object.keys(localStorage)
            .find(key => key.startsWith('preprocessing_state_') && key !== getStorageKey(datasetId));
          if (oldStorageKey) {
            localStorage.removeItem(oldStorageKey);
          }
          
          // Reset to initial state for new dataset
          const persisted = loadPersistedState();
          if (persisted) {
            setCompletedSteps(persisted.completedSteps);
            setProcessedColumns(persisted.processedColumns || columns);
            setProcessedDatasetId(persisted.processedDatasetId || datasetId);
            setStepResults(persisted.stepResults || {});
          } else {
            // New dataset - reset everything
            setCompletedSteps([]);
            setProcessedColumns(columns);
            setProcessedDatasetId(datasetId);
            setStepResults({});
          }
        } catch (error) {
          console.error('Error initializing preprocessing state:', error);
          // Clear cached data on error
          clearPersistedState();
        } finally {
          isValidating.current = false;
        }
      };

      initializeState();
    }
  }, [datasetId]);

  // Save state whenever it changes - use refs to prevent unnecessary saves
  const prevStateRef = useRef<{
    completedSteps: string[];
    processedColumns: string[];
    processedDatasetId?: string;
    stepResults: Record<string, any>;
  }>({
    completedSteps: [],
    processedColumns: [],
    stepResults: {}
  });

  useEffect(() => {
    if (!datasetId) return;

    // Only save if state actually changed
    const hasChanged = 
      JSON.stringify(prevStateRef.current.completedSteps) !== JSON.stringify(completedSteps) ||
      JSON.stringify(prevStateRef.current.processedColumns) !== JSON.stringify(processedColumns) ||
      prevStateRef.current.processedDatasetId !== processedDatasetId ||
      JSON.stringify(prevStateRef.current.stepResults) !== JSON.stringify(stepResults);

    if (hasChanged) {
      prevStateRef.current = {
        completedSteps,
        processedColumns,
        processedDatasetId,
        stepResults
      };
      savePersistedState({
        completedSteps,
        processedColumns,
        processedDatasetId,
        stepResults
      });
    }
  }, [completedSteps, processedColumns, processedDatasetId, stepResults, datasetId]);

  // Custom callback functions to update processed data
  const handleMissingValuesProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    console.log('Missing values processed, updated columns:', processedData.columns);
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    // Mark this step as completed
    if (!completedSteps.includes('missing-values')) {
      setCompletedSteps([...completedSteps, 'missing-values']);
    }
  };

  const handleDataCleaningProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    console.log('Data cleaning processed, updated columns:', processedData.columns);
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    // Store processed dataset for next steps
    setProcessedDatasetFromDataCleaning({
      datasetId: processedDatasetId,
      data: processedData
    });
    // Mark this step as completed
    if (!completedSteps.includes('data-cleaning')) {
      setCompletedSteps([...completedSteps, 'data-cleaning']);
    }
  };

  const handleCategoricalEncodingProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    if (!completedSteps.includes('categorical-encoding')) {
      setCompletedSteps([...completedSteps, 'categorical-encoding']);
    }
  };

  const handleFeatureScalingProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    if (!completedSteps.includes('feature-scaling')) {
      setCompletedSteps([...completedSteps, 'feature-scaling']);
    }
  };

  const handleFeatureSelectionProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    if (!completedSteps.includes('feature-selection')) {
      setCompletedSteps([...completedSteps, 'feature-selection']);
    }
  };

  const handleFeatureExtractionProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    if (!completedSteps.includes('feature-extraction')) {
      setCompletedSteps([...completedSteps, 'feature-extraction']);
    }
  };

  const handleDatasetSplittingProcessed = (processedDatasetId: string, processedData: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
    setProcessedColumns(processedData.columns);
    setProcessedDatasetId(processedDatasetId);
    if (!completedSteps.includes('dataset-splitting')) {
      setCompletedSteps([...completedSteps, 'dataset-splitting']);
    }
  };

  // Navigation handlers that ensure data flow between steps
  const handleNavigateToDataCleaning = () => {
    // When moving to data cleaning, ensure we have the latest columns
    setCurrentStep("data-cleaning");
  };

  const handleNavigateToCategoricalEncoding = () => {
    // When moving to categorical encoding, ensure we have the latest columns
    setCurrentStep("categorical-encoding");
  };

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const currentStepData = STEPS[currentIndex];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentIndex < STEPS.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);

  // Prevent body scroll when component is mounted
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Cleanup on unmount
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, []);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Pipeline Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Preprocessing Pipeline
          </h1>
          <p className="text-sm text-slate-600">
            {datasetName}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {completedSteps.length} of {STEPS.length} steps completed
          </p>
        </div>

        {/* Fixed Pipeline - Scrollable Steps */}
        <div className="flex-1 overflow-hidden p-6 min-h-0">
          <div className="relative h-full">
            {/* Pipeline Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />

            {/* Steps */}
            <div className="relative space-y-4 h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = isStepCompleted(step.id);
                const colors = getColorClasses(step.color, isActive, isCompleted);

                  return (
                  <div key={step.id} id={`step-${step.id}`} className="relative">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full ${colors.bg} ${
                              isActive ? `shadow-lg ${colors.glow}` : ""
                            } flex items-center justify-center transition-all duration-300 border-4 border-white`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className={`w-6 h-6 ${colors.text}`} />
                            ) : (
                              <StepIcon className={`w-6 h-6 ${colors.text}`} />
                            )}
                            </div>
                          {isActive && (
                            <div className={`absolute inset-0 rounded-full ${colors.bg} animate-ping opacity-20`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-semibold ${
                                isActive ? "text-slate-900" : "text-slate-700"
                              } group-hover:text-slate-900 transition-colors`}
                            >
                              {step.name}
                            </h3>
                            {isCompleted && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Done
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                            {step.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Step {index + 1} of {STEPS.length}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Dataset Info Footer */}
        <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Dataset Information
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {rowCount ? rowCount.toLocaleString() : 'N/A'}
              </p>
              <p className="text-xs text-slate-600">Rows</p>
                </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{columns.length}</p>
              <p className="text-xs text-slate-600">Columns</p>
            </div>
            {/* <div>
              <p className="text-2xl font-bold text-orange-600">
                {missingValuePercentage !== undefined ? `${missingValuePercentage.toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-xs text-slate-600">Missing</p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-8 min-h-0">
            <div className="max-w-6xl mx-auto">
              {/* Component Content */}
              {currentStep === "missing-values" && (
                <MissingValueHandler
                  datasetId={processedDatasetId}
                  columns={processedColumns}
                  onConfigChange={(config) => console.log('Missing values config:', config)}
                  initialConfig={{ method: "mean" }}
                  validationResults={{}}
                  onProcessedDatasetReady={(id, data) => {
                    handleMissingValuesProcessed(id, data);
                  }}
                  onNext={handleNavigateToDataCleaning}
                  onPrev={() => {
                    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
                    if (currentIndex > 0) {
                      setCurrentStep(STEPS[currentIndex - 1].id);
                    }
                  }}
                  showNavigation={true}
                />
              )}

              {currentStep === "data-cleaning" && (
                <DataCleaner
                  datasetId={processedDatasetId}
                  columns={processedColumns}
                  targetColumn=""
                  onConfigChange={(config) => console.log('Data cleaning config:', config)}
                  initialConfig={{}}
                  persistedResult={stepResults['data-cleaning']}
                  onProcessedDatasetReady={(id, data) => {
                    handleDataCleaningProcessed(id, data);
                  }}
                  onExecutionResultChange={(result) => {
                    if (result) {
                      setStepResults(prev => ({
                        ...prev,
                        'data-cleaning': result
                      }));
                    }
                  }}
                  onNext={handleNavigateToCategoricalEncoding}
                  onPrev={() => setCurrentStep("missing-values")}
                  showNavigation={true}
                />
              )}

              {currentStep === "categorical-encoding" && (
                <CategoricalEncoder
                  datasetId={processedDatasetId}
                  columns={processedColumns}
                  targetColumn=""
                  onConfigChange={(config) => console.log('Categorical encoding config:', config)}
                  initialConfig={{ method: "label" }}
                  onProcessedDatasetReady={handleCategoricalEncodingProcessed}
                  processedDatasetFromDataCleaner={processedDatasetFromDataCleaning || undefined}
                  onNext={() => setCurrentStep("feature-scaling")}
                  onPrev={() => setCurrentStep("data-cleaning")}
                  showNavigation={true}
                />
              )}

              {currentStep === "feature-scaling" && (
                <FeatureScaler
                  datasetId={processedDatasetId}
                  columns={processedColumns}
                  onConfigChange={(config) => console.log('Feature scaling config:', config)}
                  initialConfig={{ method: "standard" }}
                  onProcessedDatasetReady={(id: string, data: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
                    handleFeatureScalingProcessed(id, data);
                  }}
                />
              )}

              {currentStep === "feature-selection" && (
                <FeatureSelector
                  datasetId={processedDatasetId}
                  datasetName={datasetName}
                  columns={processedColumns}
                  targetColumn=""
                  onConfigChange={(config) => console.log('Feature selection config:', config)}
                  initialConfig={{}}
                  onProcessedDatasetReady={(id: string, data: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
                    handleFeatureSelectionProcessed(id, data);
                  }}
                />
              )}

              {currentStep === "feature-extraction" && (
                <FeatureExtractor
                  datasetId={processedDatasetId}
                  columns={processedColumns}
                  targetColumn=""
                  onConfigChange={(config) => console.log('Feature extraction config:', config)}
                  initialConfig={{}}
                  onProcessedDatasetReady={(id: string, data: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
                    handleFeatureExtractionProcessed(id, data);
                  }}
                />
              )}

              {currentStep === "dataset-splitting" && (
                <DatasetSplitter
                  datasetId={processedDatasetId}
                  targetColumn=""
                  onConfigChange={(config) => console.log('Dataset splitting config:', config)}
                  initialConfig={{ method: "train_test" }}
                  onProcessedDatasetReady={(id: string, data: { columns: string[]; rows: unknown[][]; totalRows: number }) => {
                    handleDatasetSplittingProcessed(id, data);
                  }}
                />
              )}
            </div>
          </div>

          {/* Bottom Navigation Bar */}
        <div className="border-t border-slate-200 bg-white">
          <div className="px-8 py-5">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm font-medium text-slate-900">
                  Step {currentIndex + 1} of {STEPS.length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentStepData.name}
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === STEPS.length - 1}
                className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 disabled:hover:bg-slate-900 shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}