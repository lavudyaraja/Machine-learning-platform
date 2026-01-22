"use client";

import React, { useState } from 'react';
import { 
  Database, Sparkles, Brain, CheckCircle, TrendingUp, 
  Target, FileSearch, Settings, Filter, Gauge, GitBranch, Cpu, ArrowRight
} from 'lucide-react';

const NumericalPipeline = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { id: "01", name: 'Data Collection', icon: Database, detail: 'Extracting raw numerical features from SQL/NoSQL databases.' },
    { id: "02", name: 'EDA', icon: FileSearch, detail: 'Statistical profiling: Mean, Median, Skewness, and Kurtosis analysis.' },
    { id: "03", name: 'Data Cleaning', icon: Sparkles, detail: 'Imputation of missing values and Z-score outlier detection.' },
    { id: "04", name: 'Feature Selection', icon: Filter, detail: 'Recursive Feature Elimination and Correlation Matrix filtering.' },
    { id: "05", name: 'Feature Scaling', icon: Gauge, detail: 'Standardization (μ=0, σ=1) and Min-Max Normalization.' },
    { id: "06", name: 'Data Splitting', icon: GitBranch, detail: 'Stratified Shuffle Split: 80% Train, 20% Hold-out set.' },
    { id: "07", name: 'Model Selection', icon: Cpu, detail: 'Algorithm benchmarking: Linear vs Non-linear estimators.' },
    { id: "08", name: 'Model Training', icon: Brain, detail: 'Gradient Descent optimization and Loss Function convergence.' },
    { id: "09", name: 'Model Evaluation', icon: TrendingUp, detail: 'Metric Validation: R-squared, RMSE, and Cross-validation scores.' },
    { id: "10", name: 'Hyper-Tuning', icon: Settings, detail: 'Automated Grid Search and Bayesian Optimization.' },
    { id: "11", name: 'Deployment', icon: Target, detail: 'API Integration and real-time inference monitoring.' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-mono text-slate-900">
      {/* Top Professional Utility Bar */}
      <div className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Numerical_Engine_v2.0.sys</span>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Auth: Internal_Access_Only
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: The Pipeline Path */}
        <div className="w-1/3 border-r border-slate-200 overflow-y-auto p-12 custom-scrollbar">
          <div className="relative">
            {/* The Vertical Connector line */}
            <div className="absolute left-[21px] top-4 bottom-4 w-[1px] bg-slate-200"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className="relative flex items-center gap-6 cursor-pointer group"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Step Node */}
                  <div className={`relative z-10 size-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    activeStep === index ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900'
                  }`}>
                    <step.icon size={18} strokeWidth={activeStep === index ? 2.5 : 1.5} />
                  </div>

                  {/* Step Label */}
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors ${
                      activeStep === index ? 'text-blue-600' : 'text-slate-400'
                    }`}>Step {step.id}</span>
                    <h3 className={`text-sm font-bold uppercase tracking-widest transition-all ${
                      activeStep === index ? 'translate-x-1' : ''
                    }`}>{step.name}</h3>
                  </div>

                  {/* Direction Arrow (Only for Active) */}
                  {activeStep === index && (
                    <div className="ml-auto animate-pulse">
                      <ArrowRight size={16} className="text-slate-900" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Technical Preview Workspace */}
        <div className="flex-1 bg-slate-50 p-16 flex flex-col justify-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-block px-3 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Process Node Information
            </div>
            <h2 className="text-6xl font-light tracking-tighter mb-8 italic">
              {steps[activeStep].name}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed font-sans mb-12">
              {steps[activeStep].detail}
            </p>
            
            <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Status</span>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1 italic">Verified_Pass</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Latency</span>
                <p className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-widest">0.0024ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NumericalPipeline;