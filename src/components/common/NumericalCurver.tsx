"use client";

import React from 'react';
import { 
  Database, Sparkles, Brain, CheckCircle, TrendingUp, 
  Target, FileSearch, Settings, Filter, Gauge, GitBranch, Cpu 
} from 'lucide-react';

const NumericalPipeline = () => {
  const steps = [
    { id: 1, name: 'Data Collection', icon: Database, color: '#000000' },
    { id: 2, name: 'EDA', icon: FileSearch, color: '#000000' },
    { id: 3, name: 'Data Cleaning', icon: Sparkles, color: '#000000' },
    { id: 4, name: 'Feature Selection', icon: Filter, color: '#000000' },
    { id: 5, name: 'Feature Scaling', icon: Gauge, color: '#000000' },
    { id: 6, name: 'Data Splitting', icon: GitBranch, color: '#000000' },
    { id: 7, name: 'Model Selection', icon: Cpu, color: '#000000' },
    { id: 8, name: 'Model Training', icon: Brain, color: '#000000' },
    { id: 9, name: 'Model Evaluation', icon: TrendingUp, color: '#000000' },
    { id: 10, name: 'Hyper-Tuning', icon: Settings, color: '#000000' },
    { id: 11, name: 'Deployment', icon: Target, color: '#2563eb' },
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-10 font-sans text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Minimalist Header */}
        <div className="mb-32">
          <h1 className="text-sm font-black tracking-[0.4em] uppercase text-slate-400 mb-2">Workflow Architecture</h1>
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-light tracking-tighter">Numerical <span className="font-bold">Execution Path</span></h2>
            <div className="h-px flex-1 bg-slate-100 mt-4"></div>
          </div>
        </div>

        {/* The Path Flow */}
        <div className="relative">
          {/* Main Flow Line (The Thread) */}
          <svg className="absolute top-0 left-0 w-full h-[600px] pointer-events-none" preserveAspectRatio="none">
            <path 
              d="M 0 50 Q 250 50, 400 250 T 800 450 T 1200 450" 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12 relative z-10">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group flex items-start gap-6">
                {/* Step Marker */}
                <div className="flex flex-col items-center">
                  <div className="size-12 rounded-full border border-slate-900 flex items-center justify-center bg-white group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                    <step.icon size={20} strokeWidth={1.5} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-12 bg-slate-200 mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 italic">0{step.id}</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      {step.name}
                    </h3>
                  </div>
                  <div className="w-12 h-[1px] bg-slate-900 transition-all duration-500 group-hover:w-full"></div>
                  
                  {/* Subtle info text - pure professional look */}
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                    Systematic processing of numerical vectors for optimized output.
                  </p>
                </div>

                {/* Arrow Connector for Flow */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-16 left-6 hidden lg:block opacity-20">
                    <div className="w-[2px] h-8 bg-slate-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Professional Footer Bar */}
        <div className="mt-40 pt-10 border-t border-slate-900 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em]">
          <span>© 2025 Data Intelligence Unit</span>
          <div className="flex gap-8">
            <span className="text-blue-600">Phase: Production Ready</span>
            <span className="text-slate-300">Security: Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumericalPipeline;