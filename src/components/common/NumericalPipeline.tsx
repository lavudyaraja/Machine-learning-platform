"use client";

import React from 'react';
import { 
  Database,
  Sparkles,
  Brain, 
  CheckCircle, 
  TrendingUp, 
  Target,
  FileSearch,
  Settings,
  Filter,
  Gauge,
  GitBranch,
  Cpu
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const NumericalPipeline = () => {
  const workflowNodes = [
    { 
      id: 0, 
      name: 'Data Collection', 
      icon: Database, 
      color: 'bg-blue-500'
    },
    { 
      id: 1, 
      name: 'Data Understanding (EDA)', 
      icon: FileSearch, 
      color: 'bg-purple-500'
    },
    { 
      id: 2, 
      name: 'Data Cleaning', 
      icon: Sparkles, 
      color: 'bg-emerald-500'
    },
    { 
      id: 3, 
      name: 'Feature Selection', 
      icon: Filter, 
      color: 'bg-orange-500'
    },
    { 
      id: 4, 
      name: 'Feature Scaling', 
      icon: Gauge, 
      color: 'bg-pink-500'
    },
    { 
      id: 5, 
      name: 'Data Splitting', 
      icon: GitBranch, 
      color: 'bg-indigo-500'
    },
    { 
      id: 6, 
      name: 'Model Selection', 
      icon: Cpu, 
      color: 'bg-cyan-500'
    },
    { 
      id: 7, 
      name: 'Model Training', 
      icon: Brain, 
      color: 'bg-teal-500'
    },
    { 
      id: 8, 
      name: 'Model Evaluation', 
      icon: TrendingUp, 
      color: 'bg-rose-500'
    },
    { 
      id: 9, 
      name: 'Hyperparameter Tuning', 
      icon: Settings, 
      color: 'bg-amber-500'
    },
    { 
      id: 10, 
      name: 'Model Deployment', 
      icon: Target, 
      color: 'bg-white'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Numerical Pipeline Workflow</h1>
          <p className="text-xs sm:text-sm text-slate-600">Complete workflow for numerical dataset processing from collection to deployment</p>
        </div>

        {/* Workflow Canvas */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="relative w-full overflow-hidden">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {workflowNodes.map((node, index) => {
                  const Icon = node.icon;
                  const isColored = node.color !== 'bg-white';
                  
                  return (
                    <React.Fragment key={node.id}>
                      {/* Node */}
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={cn(
                            "relative flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-200",
                            "border-slate-300",
                            isColored 
                              ? `${node.color} border-slate-300` 
                              : "bg-white border-slate-300"
                          )}
                        >
                          <Icon className={cn(
                            "size-7 mb-1 transition-colors",
                            isColored ? "text-white" : "text-slate-600"
                          )} />
                          {index < 2 && (
                            <CheckCircle className="absolute -top-1 -right-1 size-5 text-white bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <span className="mt-2 text-[10px] font-medium text-center max-w-[90px] leading-tight text-slate-600">
                          {node.name}
                        </span>
                      </div>

                      {/* Wave Connector */}
                      {index < workflowNodes.length - 1 && (
                        <div className="relative flex items-center justify-center" style={{ width: '50px', height: '80px' }}>
                          <svg
                            width="50"
                            height="80"
                            viewBox="0 0 50 80"
                            className="absolute inset-0"
                            preserveAspectRatio="none"
                            style={{ overflow: 'visible' }}
                          >
                            {/* Wave path - smooth sine wave */}
                            <path
                              d="M 0 40 Q 12.5 25, 25 40 T 50 40"
                              fill="none"
                              stroke="#94a3b8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 0 40 Q 12.5 55, 25 40 T 50 40"
                              fill="none"
                              stroke="#94a3b8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NumericalPipeline;
