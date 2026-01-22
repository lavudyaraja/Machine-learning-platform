"use client";

import React from 'react';
import { 
  Database, Sparkles, Brain, CheckCircle, TrendingUp, 
  Target, FileSearch, Settings, Filter, Gauge, GitBranch, Cpu, ArrowRight, ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NumericalPipeline = () => {
  const steps = [
    { id: 1, name: 'Data Collection', icon: Database, color: '#2563eb' },
    { id: 2, name: 'EDA', icon: FileSearch, color: '#9333ea' },
    { id: 3, name: 'Data Cleaning', icon: Sparkles, color: '#10b981' },
    { id: 4, name: 'Feature Selection', icon: Filter, color: '#f59e0b' },
    { id: 5, name: 'Feature Scaling', icon: Gauge, color: '#db2777' },
    { id: 6, name: 'Data Splitting', icon: GitBranch, color: '#4f46e5' },
    { id: 7, name: 'Model Selection', icon: Cpu, color: '#0891b2' },
    { id: 8, name: 'Model Training', icon: Brain, color: '#0d9488' },
    { id: 9, name: 'Model Evaluation', icon: TrendingUp, color: '#e11d48' },
    { id: 10, name: 'Hyper-Tuning', icon: Settings, color: '#c026d3' },
    { id: 11, name: 'Deployment', icon: Target, color: '#1e293b' },
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="max-w-4xl w-full mb-20 text-left border-l-4 border-blue-600 pl-6">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          Numerical Data <span className="text-blue-600">Pipeline</span>
        </h1>
        <p className="text-slate-500 font-bold mt-2 tracking-widest uppercase text-xs">
          End-to-End Sequential Workflow Architecture
        </p>
      </div>

      <div className="relative max-w-5xl w-full">
        {/* The Staircase/Zig-Zag Layout */}
        <div className="flex flex-col space-y-4">
          {steps.map((step, index) => {
            // This creates the "Staircase" effect by shifting each step to the right
            const marginLeft = `${index * 40}px`;
            
            return (
              <div 
                key={step.id} 
                className="flex items-center group"
                style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth > 768 ? marginLeft : '0px' }}
              >
                {/* Step Number & Connector */}
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-md border-2 border-slate-900 flex items-center justify-center text-xs font-black text-slate-900 bg-white">
                    {step.id < 10 ? `0${step.id}` : step.id}
                  </div>
                  {index !== steps.length - 1 && (
                    <div className="w-0.5 h-12 bg-slate-200 group-hover:bg-slate-900 transition-colors" />
                  )}
                </div>

                {/* Step Card (Flat Design) */}
                <div className="flex items-center p-4 bg-white border-2 border-slate-200 rounded-tr-3xl rounded-bl-3xl w-full md:w-80 transition-all group-hover:border-slate-900 group-hover:bg-slate-50">
                  <div 
                    className="p-3 rounded-lg mr-4"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <step.icon size={24} style={{ color: step.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Process Step</span>
                    <h3 className="text-sm font-black text-slate-800 uppercase leading-none">
                      {step.name}
                    </h3>
                  </div>
                  
                  {/* Small Indicator Arrow inside card */}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={16} className="text-slate-900" />
                  </div>
                </div>

                {/* Diagonal Connector Line for Desktop */}
                {index !== steps.length - 1 && (
                   <div className="hidden md:block w-10 h-0.5 bg-slate-200 ml-2 rotate-45 transform origin-left" />
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Decorative Element */}
        <div className="absolute top-0 right-0 hidden lg:block opacity-10">
           <div className="text-[12rem] font-black leading-none select-none">DATA</div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-20 border-t-2 border-slate-100 pt-8 w-full max-w-4xl flex justify-between items-center">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Automated Pipeline System
        </div>
        <div className="flex gap-2">
            {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-200 rounded-full" />)}
        </div>
      </div>
    </div>
  );
};

export default NumericalPipeline;