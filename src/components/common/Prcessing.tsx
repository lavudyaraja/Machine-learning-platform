"use client";

import React, { useState } from 'react';
import { 
  Database, Sparkles, Brain, CheckCircle, TrendingUp, 
  Target, FileSearch, Settings, Filter, Gauge, GitBranch, Cpu, Play, Pause, ChevronRight
} from 'lucide-react';

const NumericalPipeline = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const steps = [
    { id: "01", name: 'Collection', icon: Database, desc: 'Raw data ingestion from various sources.' },
    { id: "02", name: 'EDA', icon: FileSearch, desc: 'Exploratory data analysis and profiling.' },
    { id: "03", name: 'Cleaning', icon: Sparkles, desc: 'Handling nulls and outlier removal.' },
    { id: "04", name: 'Selection', icon: Filter, desc: 'Identifying most impactful features.' },
    { id: "05", name: 'Scaling', icon: Gauge, desc: 'Normalizing numerical ranges (0-1).' },
    { id: "06", name: 'Splitting', icon: GitBranch, desc: 'Train/Test/Validation set creation.' },
    { id: "07", name: 'Selection', icon: Cpu, desc: 'Algorithm benchmarking and choice.' },
    { id: "08", name: 'Training', icon: Brain, desc: 'Fitting model to pre-processed data.' },
    { id: "09", name: 'Evaluation', icon: TrendingUp, desc: 'Metric scoring and error analysis.' },
    { id: "10", name: 'Tuning', icon: Settings, desc: 'Automated parameter optimization.' },
    { id: "11", name: 'Deploy', icon: Target, desc: 'Final production API deployment.' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-12 flex flex-col antialiased">
      
      {/* Precision Header */}
      <header className="mb-20 flex justify-between items-end border-b border-slate-900 pb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Horizontal <span className="text-blue-600 italic">Expand</span></h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 mt-2 uppercase italic">Interactive Numerical Architecture // v3.1</p>
        </div>
        <div className="text-[10px] font-mono font-black border border-slate-900 px-4 py-1">
          MODE: ACCORDION_HORIZONTAL
        </div>
      </header>

      {/* Interactive Sliding Grid */}
      <div className="flex h-[500px] w-full gap-2 transition-all duration-500 overflow-hidden border-t border-b border-slate-100 py-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            onMouseEnter={() => setHoveredIndex(index)}
            className={`relative flex-1 min-w-[60px] cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] border border-slate-200 group overflow-hidden ${
              hoveredIndex === index ? 'flex-[4] bg-slate-900 border-slate-900' : 'bg-white hover:bg-slate-50'
            }`}
          >
            {/* Step ID (Always Visible) */}
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold ${
              hoveredIndex === index ? 'text-blue-400' : 'text-slate-300'
            }`}>
              {step.id}
            </div>

            {/* Icon Content */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
              hoveredIndex === index ? 'opacity-100' : 'opacity-100'
            }`}>
              <step.icon 
                size={hoveredIndex === index ? 48 : 24} 
                strokeWidth={1.5} 
                className={`${hoveredIndex === index ? 'text-white mb-6' : 'text-slate-400'}`} 
              />
              
              {/* Expandable Text (Only on Hover) */}
              <div className={`mt-4 px-10 text-center transition-all duration-500 ${
                hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <h3 className="text-white text-xl font-black uppercase tracking-widest italic">{step.name}</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed uppercase tracking-tighter italic font-medium">
                  {step.desc}
                </p>
                <div className="mt-8 flex justify-center">
                   <ChevronRight className="text-blue-500 animate-pulse" size={24} />
                </div>
              </div>

              {/* Vertical Name (When Collapsed) */}
              <div className={`absolute bottom-10 transition-all duration-500 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-widest ${
                hoveredIndex === index ? 'opacity-0' : 'opacity-100 text-slate-400'
              }`}>
                {step.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative System Metrics (No Footer) */}
      <div className="mt-20 flex justify-between items-center opacity-30">
        <div className="flex gap-1">
          {[...Array(11)].map((_, i) => (
            <div key={i} className={`h-1 w-8 ${i <= hoveredIndex ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <span className="text-[10px] font-mono uppercase font-bold tracking-widest">Processing Node_{hoveredIndex + 1}</span>
      </div>
    </div>
  );
};

export default NumericalPipeline;