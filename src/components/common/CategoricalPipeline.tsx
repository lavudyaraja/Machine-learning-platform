import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Database, Filter, Sparkles, GitBranch, Target, Settings, Activity, BarChart3, CheckCircle2, Layers, Zap, TrendingUp, Play } from 'lucide-react';

export default function ProfessionalMLPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      icon: Database,
      title: "Data Collection",
      subtitle: "Upload & Import",
      description: "Load datasets from CSV, Excel, or databases",
      techniques: ["CSV/Excel Import", "Database Connection", "API Data Fetching"],
      tools: ["Pandas & NumPy", "SQLAlchemy", "Requests"],
      output: ["Raw DataFrame", "Data Statistics", "Column Types"]
    },
    {
      icon: Filter,
      title: "Data Preprocessing",
      subtitle: "Clean & Transform",
      description: "Handle missing values, outliers, and normalize data",
      techniques: ["Missing Value Imputation", "Outlier Detection", "Data Normalization"],
      tools: ["Pandas & NumPy", "Scikit-learn", "Feature-engine"],
      output: ["Clean Dataset", "No Missing Values", "Normalized Features"]
    },
    {
      icon: Sparkles,
      title: "Feature Engineering",
      subtitle: "Extract & Select",
      description: "Create new features and select relevant ones",
      techniques: ["Feature Extraction", "Feature Selection", "Dimensionality Reduction"],
      tools: ["Scikit-learn", "Feature-engine", "PCA/LDA"],
      output: ["Engineered Features", "Selected Features", "Reduced Dimensions"]
    },
    {
      icon: GitBranch,
      title: "Data Splitting",
      subtitle: "Train/Test Split",
      description: "Split data into training, validation, and test sets",
      techniques: ["Train-Test Split (80-20)", "K-Fold Cross Validation", "Stratified Sampling"],
      tools: ["Scikit-learn", "Train-test-split", "StratifiedKFold"],
      output: ["Training Set (80%)", "Test Set (20%)", "Validation Set"]
    },
    {
      icon: Target,
      title: "Model Selection",
      subtitle: "Algorithm Choice",
      description: "Choose appropriate ML algorithms for the task",
      techniques: ["Decision Trees", "Random Forest", "Neural Networks"],
      tools: ["Scikit-learn", "TensorFlow/PyTorch", "XGBoost/LightGBM"],
      output: ["Chosen Algorithms", "Model Pipeline", "Baseline Models"]
    },
    {
      icon: Brain,
      title: "Model Training",
      subtitle: "Fit & Learn",
      description: "Train models on the training dataset",
      techniques: ["Gradient Descent", "Backpropagation", "Batch Training"],
      tools: ["Scikit-learn", "TensorFlow/PyTorch", "Keras"],
      output: ["Trained Models", "Model Weights", "Training History"]
    },
    {
      icon: Settings,
      title: "Hyperparameter Tuning",
      subtitle: "Optimize Parameters",
      description: "Fine-tune model parameters using GridSearch/RandomSearch",
      techniques: ["Grid Search CV", "Random Search", "Bayesian Optimization"],
      tools: ["Scikit-learn", "Optuna", "Hyperopt"],
      output: ["Optimal Parameters", "Best Model", "CV Scores"]
    },
    {
      icon: Activity,
      title: "Model Evaluation",
      subtitle: "Performance Metrics",
      description: "Evaluate using accuracy, precision, recall, F1-score",
      techniques: ["Accuracy & Precision", "Recall & F1-Score", "ROC-AUC Analysis"],
      tools: ["Scikit-learn", "Matplotlib", "Classification Report"],
      output: ["Performance Metrics", "Evaluation Report", "Error Analysis"]
    },
    {
      icon: BarChart3,
      title: "Results Visualization",
      subtitle: "Charts & Graphs",
      description: "Visualize confusion matrix, ROC curve, feature importance",
      techniques: ["Confusion Matrix", "ROC Curves", "Feature Importance"],
      tools: ["Matplotlib/Seaborn", "Plotly", "Yellowbrick"],
      output: ["Visualization Charts", "Performance Graphs", "Insights Report"]
    },
    {
      icon: CheckCircle2,
      title: "Model Deployment",
      subtitle: "Production Ready",
      description: "Deploy model for predictions and monitoring",
      techniques: ["Model Serialization", "API Deployment", "Performance Monitoring"],
      tools: ["Flask/FastAPI", "Docker", "MLflow/TensorBoard"],
      output: ["Deployed API", "Prediction Service", "Monitoring Dashboard"]
    }
  ];

  const startAnimation = () => {
    setIsAnimating(true);
    setActiveStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(interval);
        setIsAnimating(false);
      } else {
        setActiveStep(step);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Brain className="size-7 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
              Machine Learning Pipeline
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            End-to-end workflow from data collection to model deployment
          </p>
          
          <button 
            onClick={startAnimation}
            disabled={isAnimating}
            className="mt-4 px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <Play className="size-5" />
            {isAnimating ? 'Running Pipeline...' : 'Run Pipeline Animation'}
          </button>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;
            
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => !isAnimating && setActiveStep(index)}
              >
                <Card className={`cursor-pointer transition-all duration-300 h-full ${
                  isActive 
                    ? 'border-2 border-slate-900 bg-slate-900 text-white' 
                    : isCompleted
                    ? 'border-2 border-green-600 bg-white'
                    : 'border-2 border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      
                      {/* Icon & Number */}
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg ${
                          isActive ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          <Icon className={`size-6 ${
                            isActive ? 'text-white' : 'text-slate-900'
                          }`} />
                        </div>
                        <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted 
                            ? 'bg-green-600 text-white' 
                            : isActive
                            ? 'bg-white text-slate-900'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <div>
                        <h3 className={`font-bold text-base ${
                          isActive ? 'text-white' : 'text-slate-900'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${
                          isActive ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {step.subtitle}
                        </p>
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
                
                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <div className="text-slate-300 text-xl">→</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Information Panel */}
        <Card className="border-2 border-slate-200 bg-white">
          <CardContent className="p-6 sm:p-8">
            
            {/* Step Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-slate-200">
              <div className="p-3 bg-slate-900 rounded-lg">
                {React.createElement(steps[activeStep].icon, { className: "size-8 text-white" })}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {steps[activeStep].title}
                </h2>
                <p className="text-slate-600 text-lg">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Key Techniques */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 mb-4">
                  <Layers className="size-5" />
                  <h3 className="font-bold text-lg">Key Techniques</h3>
                </div>
                <div className="space-y-2">
                  {steps[activeStep].techniques.map((technique, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <div className="size-1.5 bg-slate-400 rounded-full mt-2" />
                      <span className="text-sm">{technique}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools & Libraries */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 mb-4">
                  <Zap className="size-5" />
                  <h3 className="font-bold text-lg">Tools & Libraries</h3>
                </div>
                <div className="space-y-2">
                  {steps[activeStep].tools.map((tool, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <div className="size-1.5 bg-slate-400 rounded-full mt-2" />
                      <span className="text-sm">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Output */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 mb-4">
                  <TrendingUp className="size-5" />
                  <h3 className="font-bold text-lg">Expected Output</h3>
                </div>
                <div className="space-y-2">
                  {steps[activeStep].output.map((out, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <div className="size-1.5 bg-slate-400 rounded-full mt-2" />
                      <span className="text-sm">{out}</span>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        {/* <Card className="border-2 border-slate-200 bg-white">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Pipeline Progress</span>
                <span className="text-lg font-bold text-slate-900">
                  {Math.round(((activeStep + 1) / steps.length) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 transition-all duration-500 rounded-full"
                  style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 text-center">
                Step {activeStep + 1} of {steps.length}: {steps[activeStep].title}
              </p>
            </div>
          </CardContent>
        </Card> */}

      </div>
    </div>
  );
}