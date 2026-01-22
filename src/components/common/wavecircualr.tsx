"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, Sparkles, Brain, TrendingUp, 
  Target, FileSearch, Settings, Filter, Gauge, GitBranch, Cpu, Play, Pause 
} from 'lucide-react';

const NumericalPipeline = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { id: 1, name: 'Data Collection', icon: Database, desc: 'Gather raw datasets' },
    { id: 2, name: 'EDA', icon: FileSearch, desc: 'Explore & analyze' },
    { id: 3, name: 'Data Cleaning', icon: Sparkles, desc: 'Remove noise' },
    { id: 4, name: 'Feature Selection', icon: Filter, desc: 'Pick key features' },
    { id: 5, name: 'Feature Scaling', icon: Gauge, desc: 'Normalize values' },
    { id: 6, name: 'Data Splitting', icon: GitBranch, desc: 'Train/test split' },
    { id: 7, name: 'Model Selection', icon: Cpu, desc: 'Choose algorithm' },
    { id: 8, name: 'Model Training', icon: Brain, desc: 'Learn patterns' },
    { id: 9, name: 'Evaluation', icon: TrendingUp, desc: 'Measure accuracy' },
    { id: 10, name: 'Hyperparameter Tuning', icon: Settings, desc: 'Optimize params' },
    { id: 11, name: 'Deployment', icon: Target, desc: 'Production ready' },
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setActiveStep(prev => {
          const next = (prev + 1) % steps.length;
          setProgress(0);
          return next;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, steps.length]);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 100));
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isPlaying, activeStep]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Header Section */}
      <div className="w-full max-w-7xl mb-16 flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            Machine Learning Pipeline
          </h1>
          <p className="text-slate-500 mt-2 text-lg">End-to-end numerical workflow visualization</p>
        </div>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="size-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
      </div>

      {/* Main Pipeline Container */}
      <div className="w-full max-w-7xl relative z-10">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
              style={{ width: `${((activeStep + progress / 100) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps Container */}
        <div className="relative">
          
          {/* Connection Line */}
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-slate-200" />
          
          {/* Steps */}
          <div className="flex justify-between relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              const isCompleted = index < activeStep;
              const isFuture = index > activeStep;

              return (
                <div 
                  key={step.id}
                  className="flex flex-col items-center cursor-pointer group"
                  style={{ width: `${100 / steps.length}%` }}
                  onClick={() => setActiveStep(index)}
                >
                  {/* Icon Container */}
                  <div className="relative mb-4">
                    
                    {/* Pulse Animation for Active */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                    )}
                    
                    {/* Main Circle */}
                    <div 
                      className={`size-32 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30 scale-110' 
                          : isCompleted
                          ? 'bg-slate-900 shadow-lg'
                          : 'bg-slate-100 shadow-md'
                      } ${!isActive && 'group-hover:scale-105 group-hover:shadow-xl'}`}
                    >
                      <Icon 
                        size={40} 
                        className={`transition-colors ${
                          isActive || isCompleted ? 'text-white' : 'text-slate-400'
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Step Number Badge */}
                    <div 
                      className={`absolute -top-2 -right-2 size-8 rounded-full flex items-center justify-center text-xs font-bold z-20 ${
                        isActive || isCompleted
                          ? 'bg-white text-slate-900 shadow-lg'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step.id}
                    </div>
                  </div>

                  {/* Step Info */}
                  <div className="text-center">
                    <h3 
                      className={`text-sm font-bold mb-1 transition-colors ${
                        isActive 
                          ? 'text-slate-900' 
                          : isCompleted
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.name}
                    </h3>
                    <p 
                      className={`text-xs transition-opacity ${
                        isActive 
                          ? 'text-slate-600 opacity-100' 
                          : 'text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {/* Progress Indicator for Active Step */}
                  {isActive && (
                    <div className="mt-4 w-full max-w-[120px]">
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Step Details Card */}
        <div className="mt-16 bg-slate-50 rounded-3xl p-8 border border-slate-200">
          <div className="flex items-start gap-6">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {React.createElement(steps[activeStep].icon, { 
                size: 32, 
                className: 'text-white' 
              })}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Step {activeStep + 1} of {steps.length}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-500">
                  {isPlaying ? 'In Progress' : 'Paused'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {steps[activeStep].name}
              </h2>
              <p className="text-slate-600">
                {steps[activeStep].desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="w-full max-w-7xl mt-12 flex gap-6 relative z-10">
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="text-3xl font-black text-blue-900 mb-1">{activeStep + 1}</div>
          <div className="text-sm text-blue-600 font-medium">Current Step</div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="text-3xl font-black text-purple-900 mb-1">{Math.round(((activeStep + 1) / steps.length) * 100)}%</div>
          <div className="text-sm text-purple-600 font-medium">Completion</div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
          <div className="text-3xl font-black text-pink-900 mb-1">{steps.length}</div>
          <div className="text-sm text-pink-600 font-medium">Total Steps</div>
        </div>
      </div>
    </div>
  );
};

export default NumericalPipeline;