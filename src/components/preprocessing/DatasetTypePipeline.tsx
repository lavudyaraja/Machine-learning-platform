"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Database, 
  Hash, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Play,
  Circle
} from "lucide-react";
import { analyzeDatasetType, getRecommendedPreprocessingSteps, DatasetType } from "@/utils/datasetUtils";

interface DatasetTypePipelineProps {
  datasetId: string;
  onStartPreprocessing?: (step: string) => void;
  onPipelineSelect?: (pipelineType: 'categorical' | 'numerical') => void;
}

export default function DatasetTypePipeline({ datasetId, onStartPreprocessing, onPipelineSelect }: DatasetTypePipelineProps) {
  const [datasetType, setDatasetType] = useState<DatasetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<'categorical' | 'numerical' | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const isAnalyzing = useRef(false);

  useEffect(() => {
    const analyzeDataset = async () => {
      if (!datasetId || isAnalyzing.current) {
        return;
      }

      isAnalyzing.current = true;
      
      try {
        setLoading(true);
        setError(null);
        const type = await analyzeDatasetType(datasetId);
        if (type) {
          setDatasetType(type);
          if (type.isCategorical) {
            setSelectedPipeline('categorical');
          } else if (type.isNumerical) {
            setSelectedPipeline('numerical');
          } else if (type.isMixed) {
            setSelectedPipeline('numerical');
          }
        } else {
          setError("Could not analyze dataset type");
        }
      } catch (err) {
        setError("Failed to analyze dataset");
        console.error("Error analyzing dataset:", err);
      } finally {
        setLoading(false);
        isAnalyzing.current = false;
      }
    };

    analyzeDataset();
  }, [datasetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600 font-medium">Analyzing dataset structure...</p>
        </div>
      </div>
    );
  }

  if (error || !datasetType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-2 border-rose-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <AlertCircle className="h-6 w-6" />
            <h3 className="font-bold text-lg">Analysis Failed</h3>
          </div>
          <p className="text-sm text-slate-600">{error || "Failed to analyze dataset type"}</p>
        </div>
      </div>
    );
  }

  const getPipelineType = () => {
    if (datasetType.isCategorical) return "Categorical Data Pipeline";
    if (datasetType.isNumerical) return "Numerical Data Pipeline";
    return "Mixed Data Pipeline";
  };

  const getCompletePipelineSteps = (pipelineType: 'categorical' | 'numerical') => {
    if (pipelineType === 'categorical') {
      return [
        {
          step: "missing-values",
          title: "Missing Value Handling",
          description: "Handle missing data with appropriate imputation or removal strategies",
          icon: Database,
          category: "Data Cleaning",
          color: "from-blue-500/10 to-cyan-500/10",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          techniques: ["Mean/Median/Mode Imputation", "Forward Fill", "Backward Fill", "Drop Rows"]
        },
        {
          step: "data-cleaning",
          title: "Data Cleaning",
          description: "Clean and preprocess categorical data for better analysis",
          icon: Sparkles,
          category: "Data Cleaning",
          color: "from-emerald-500/10 to-teal-500/10",
          borderColor: "border-emerald-200",
          iconColor: "text-emerald-600",
          techniques: ["Remove Duplicates", "Handle Outliers", "Data Validation", "Format Correction"]
        },
        {
          step: "categorical-encoding",
          title: "Categorical Encoding",
          description: "Convert categorical variables to numerical format for ML algorithms",
          icon: Hash,
          category: "Feature Engineering",
          color: "from-purple-500/10 to-fuchsia-500/10",
          borderColor: "border-purple-200",
          iconColor: "text-purple-600",
          techniques: ["Label Encoding", "One-Hot Encoding", "Ordinal Encoding", "Target Encoding", "Frequency Encoding", "Binary Encoding"]
        },
        {
          step: "dataset-splitting",
          title: "Dataset Splitting",
          description: "Split data into training and testing sets",
          icon: ArrowRight,
          category: "Data Preparation",
          color: "from-orange-500/10 to-amber-500/10",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          techniques: ["Train-Test Split", "Cross-Validation", "Stratified Sampling"]
        }
      ];
    } else {
      return [
        {
          step: "missing-values",
          title: "Missing Value Handling",
          description: "Handle missing data with appropriate imputation or removal strategies",
          icon: Database,
          category: "Data Cleaning",
          color: "from-blue-500/10 to-cyan-500/10",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          techniques: ["Mean/Median Imputation", "Interpolation", "Forward Fill", "Drop Rows"]
        },
        {
          step: "data-cleaning",
          title: "Data Cleaning",
          description: "Clean and preprocess numerical data for better analysis",
          icon: Sparkles,
          category: "Data Cleaning",
          color: "from-emerald-500/10 to-teal-500/10",
          borderColor: "border-emerald-200",
          iconColor: "text-emerald-600",
          techniques: ["Remove Duplicates", "Handle Outliers", "Data Validation", "Normalization"]
        },
        {
          step: "feature-scaling",
          title: "Feature Scaling",
          description: "Normalize numerical features to consistent scales",
          icon: BarChart3,
          category: "Feature Engineering",
          color: "from-indigo-500/10 to-blue-500/10",
          borderColor: "border-indigo-200",
          iconColor: "text-indigo-600",
          techniques: ["Standard Scaling", "Min-Max Scaling", "Robust Scaling", "MaxAbs Scaling", "Quantile Transformation"]
        },
        {
          step: "feature-selection",
          title: "Feature Selection",
          description: "Select the most relevant features for model training",
          icon: Layers,
          category: "Feature Engineering",
          color: "from-violet-500/10 to-purple-500/10",
          borderColor: "border-violet-200",
          iconColor: "text-violet-600",
          techniques: ["Correlation Analysis", "Chi-Square Test", "Recursive Feature Elimination", "LASSO Regression", "Tree-based Selection"]
        },
        {
          step: "feature-extraction",
          title: "Feature Extraction",
          description: "Extract new features from existing numerical data",
          icon: Layers,
          category: "Feature Engineering",
          color: "from-fuchsia-500/10 to-pink-500/10",
          borderColor: "border-fuchsia-200",
          iconColor: "text-fuchsia-600",
          techniques: ["PCA", "LDA", "Feature Crosses", "Polynomial Features", "Interaction Terms"]
        },
        {
          step: "dataset-splitting",
          title: "Dataset Splitting",
          description: "Split data into training and testing sets",
          icon: ArrowRight,
          category: "Data Preparation",
          color: "from-orange-500/10 to-amber-500/10",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          techniques: ["Train-Test Split", "Cross-Validation", "Time Series Split"]
        }
      ];
    }
  };

  const handlePipelineSelect = (type: 'categorical' | 'numerical') => {
    setSelectedPipeline(type);
    onPipelineSelect?.(type);
    setExpandedStep(null);
  };

  const handleStartPreprocessing = () => {
    // Scroll to the preprocessing layout
    const element = document.getElementById('PreprocessingWizards');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 pb-8 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Dataset Analysis & Pipeline</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Your dataset has been analyzed. Choose the optimal preprocessing pipeline for your data type.
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/preprocessing-layout">
              <Button
                onClick={() => {
                  // Use hash navigation for better browser support
                  window.location.hash = '#preprocessing-layout';
                  
                  // Also scroll to ensure it works
                  setTimeout(() => {
                    const element = document.getElementById('preprocessing-layout');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      // Focus the element for accessibility
                      element.focus({ preventScroll: true });
                    }
                  }, 100);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Preprocessing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dataset Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{datasetType.totalColumns}</div>
            <div className="text-sm text-slate-600 font-medium">Total Columns</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-900 mb-1">{datasetType.categoricalColumns.length}</div>
            <div className="text-sm text-purple-600 font-medium">Categorical Columns</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-1">{datasetType.numericalColumns.length}</div>
            <div className="text-sm text-blue-600 font-medium">Numerical Columns</div>
          </div>
        </div>

        {/* Pipeline Selection */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Pipeline</h2>
            <p className="text-sm text-slate-600">Select the preprocessing workflow that matches your dataset</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Categorical Pipeline */}
            <button
              onClick={() => handlePipelineSelect('categorical')}
              className={`relative p-8 rounded-2xl border-2 transition-all text-left ${
                selectedPipeline === 'categorical'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10'
                  : 'border-purple-200 bg-white hover:border-purple-300'
              }`}
            >
              {selectedPipeline === 'categorical' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedPipeline === 'categorical' ? 'bg-purple-600' : 'bg-purple-100'
                }`}>
                  <Hash className={`w-7 h-7 ${
                    selectedPipeline === 'categorical' ? 'text-white' : 'text-purple-600'
                  }`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Categorical Pipeline</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Optimized for datasets with categorical features, text labels, and discrete values
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-2 border-t border-purple-200/50">
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-purple-600">4</span> Steps
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-purple-600">15+</span> Techniques
                  </div>
                </div>
              </div>
            </button>

            {/* Numerical Pipeline */}
            <button
              onClick={() => handlePipelineSelect('numerical')}
              className={`relative p-8 rounded-2xl border-2 transition-all text-left ${
                selectedPipeline === 'numerical'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                  : 'border-blue-200 bg-white hover:border-blue-300'
              }`}
            >
              {selectedPipeline === 'numerical' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedPipeline === 'numerical' ? 'bg-blue-600' : 'bg-blue-100'
                }`}>
                  <BarChart3 className={`w-7 h-7 ${
                    selectedPipeline === 'numerical' ? 'text-white' : 'text-blue-600'
                  }`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Numerical Pipeline</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Optimized for datasets with numerical features, continuous values, and quantitative data
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-2 border-t border-blue-200/50">
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-blue-600">6</span> Steps
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-blue-600">20+</span> Techniques
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Pipeline Steps */}
        {selectedPipeline && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {selectedPipeline === 'categorical' ? 'Categorical' : 'Numerical'} Pipeline Steps
              </h2>
              <p className="text-sm text-slate-600">
                Complete preprocessing workflow with all available techniques
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-4">
              {getCompletePipelineSteps(selectedPipeline).map((stepData, index) => {
                const StepIcon = stepData.icon;
                const isExpanded = expandedStep === stepData.step;
                
                return (
                  <div
                    key={stepData.step}
                    className={`bg-gradient-to-br ${stepData.color} border ${stepData.borderColor} rounded-2xl overflow-hidden transition-all`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-bold text-slate-700">
                          {index + 1}
                        </div>
                        
                        <div className={`flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center ${stepData.iconColor}`}>
                          <StepIcon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{stepData.title}</h3>
                            <Badge className="bg-white/80 text-slate-700 border-0 text-xs">
                              {stepData.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-4">{stepData.description}</p>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedStep(isExpanded ? null : stepData.step)}
                              className="bg-white border-slate-300 hover:bg-slate-50"
                            >
                              {isExpanded ? 'Hide' : 'View'} Techniques
                              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </Button>
                            
                            <Button
                              size="sm"
                              onClick={() => {
                                // Use hash navigation for better browser support
                                window.location.hash = '#preprocessing-layout';
                                
                                // Scroll to preprocessing layout and trigger step selection
                                setTimeout(() => {
                                  const element = document.getElementById('preprocessing-layout');
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    // After scrolling, trigger the step selection
                                    setTimeout(() => {
                                      onStartPreprocessing?.(stepData.step);
                                    }, 500);
                                  }
                                }, 100);
                              }}
                              className={`${stepData.iconColor.replace('text-', 'bg-')} hover:opacity-90 text-white border-0`}
                            >
                              Start Step
                              <Play className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                            Available Techniques
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stepData.techniques.map((technique, techIndex) => (
                              <div
                                key={techIndex}
                                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-slate-300 transition-colors"
                              >
                                <Circle className={`w-2 h-2 ${stepData.iconColor} fill-current`} />
                                <span className="text-sm font-medium text-slate-700">{technique}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Banner */}
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    Pipeline Optimized for Your Data
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    This {selectedPipeline} pipeline is specifically tailored for your {getPipelineType().toLowerCase()} 
                    to ensure the best preprocessing results and model performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}