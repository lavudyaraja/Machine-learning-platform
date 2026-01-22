"use client";

import React from 'react';
import { 
  Database, Sparkles, Brain, CheckCircle, TrendingUp, 
  Target, FileSearch, Settings, Filter, Gauge, GitBranch, Cpu, MoveRight
} from 'lucide-react';

const NumericalPipeline = () => {
  const steps = [
    { id: 1, name: 'Collection', icon: Database, color: '#000000' },
    { id: 2, name: 'EDA', icon: FileSearch, color: '#000000' },
    { id: 3, name: 'Cleaning', icon: Sparkles, color: '#000000' },
    { id: 4, name: 'Selection', icon: Filter, color: '#000000' },
    { id: 5, name: 'Scaling', icon: Gauge, color: '#000000' },
    { id: 6, name: 'Splitting', icon: GitBranch, color: '#2563eb' }, // Highlighting a midpoint
    { id: 7, name: 'Model Pick', icon: Cpu, color: '#000000' },
    { id: 8, name: 'Training', icon: Brain, color: '#000000' },
    { id: 9, name: 'Evaluation', icon: TrendingUp, color: '#000000' },
    { id: 10, name: 'Tuning', icon: Settings, color: '#000000' },
    { id: 11, name: 'Deploy', icon: Target, color: '#10b981' }, // Final Success
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 font-sans overflow-x-auto">
      {/* Precision Header */}
      <div className="w-full max-w-7xl mb-24 flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-light tracking-tighter text-slate-900">
            Numerical <span className="font-bold">Intelligence Flow</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Engineered Pipeline // System-X</p>
        </div>
        <div className="flex gap-2">
          <div className="w-12 h-1 bg-slate-900"></div>
          <div className="w-4 h-1 bg-slate-200"></div>
        </div>
      </div>

      {/* Horizontal Connector Path Design */}
      <div className="relative flex items-center justify-center min-w-max px-20">
        
        {/* The Continuous Connector Line */}
        <div className="absolute h-[2px] bg-slate-100 left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>

        <div className="flex items-center gap-16 relative z-10">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              {/* Node Card */}
              <div className="flex flex-col items-center">
                
                {/* ID Number on top */}
                <span className="text-[9px] font-black text-slate-300 mb-4 tracking-widest group-hover:text-slate-900 transition-colors">
                  SEC_{step.id < 10 ? `0${step.id}` : step.id}
                </span>

                {/* Main Icon Circle - Zero Shadow, Flat Design */}
                <div className="size-20 rounded-none border-[1.5px] border-slate-900 bg-white flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500 group-hover:bg-slate-50">
                  <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">
                    <step.icon 
                      size={26} 
                      strokeWidth={1.2} 
                      style={{ color: step.color === '#000000' ? '#1e293b' : step.color }} 
                    />
                  </div>
                </div>

                {/* Name Label */}
                <div className="mt-8 text-center">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800 whitespace-nowrap">
                    {step.name}
                  </h3>
                  {/* Status Indicator Dot */}
                  <div 
                    className="w-1.5 h-1.5 rounded-full mx-auto mt-3" 
                    style={{ backgroundColor: step.color === '#000000' ? '#e2e8f0' : step.color }}
                  ></div>
                </div>
              </div>

              {/* Arrow Connector between steps */}
              {index < steps.length - 1 && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-slate-200">
                  <MoveRight size={20} strokeWidth={1} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technical Metadata Footer */}
      <div className="w-full max-w-7xl mt-32 flex justify-between text-[9px] font-bold text-slate-400 tracking-widest uppercase">
        <div className="flex gap-12 italic">
          <span>Vector Input: Verified</span>
          <span>Matrix Transformation: Active</span>
        </div>
        <div>
          Status: <span className="text-slate-900 italic">Optimization Complete_</span>
        </div>
      </div>
    </div>
  );
};

export default NumericalPipeline;