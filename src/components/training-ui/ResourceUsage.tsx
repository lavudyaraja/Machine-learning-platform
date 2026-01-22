'use client';

import { Activity } from 'lucide-react';
import { useMemo } from 'react';

interface ResourceUsageData {
  timestamp: number;
  gpu: number;
  ram: number;
}

interface ResourceUtilizationProps {
  resourceUsage?: ResourceUsageData[];
}

export function ResourceUtilization({ resourceUsage = [] }: ResourceUtilizationProps) {
  // Generate SVG path from resource usage data
  const generatePath = (data: number[], height: number) => {
    if (data.length === 0) return '';
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * 300;
      const y = height - (value / 100) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const gpuData = useMemo(() => {
    return resourceUsage.map(r => r.gpu);
  }, [resourceUsage]);

  const ramData = useMemo(() => {
    return resourceUsage.map(r => r.ram);
  }, [resourceUsage]);

  const gpuPath = generatePath(gpuData, 100);
  const ramPath = generatePath(ramData, 100);

  const currentGpu = resourceUsage.length > 0 ? resourceUsage[resourceUsage.length - 1].gpu : 0;
  const currentRam = resourceUsage.length > 0 ? resourceUsage[resourceUsage.length - 1].ram : 0;

  const hasData = resourceUsage.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-72">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-slate-900 text-[11px] font-bold tracking-widest uppercase">
            Resource Utilization
          </span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500"></span>
            <span className="text-[10px] font-bold text-slate-500">GPU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-slate-500">RAM</span>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1 border-b border-l border-slate-200 relative mb-2">
          <div className="absolute inset-0 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          {hasData ? (
            <svg
              className="w-full h-full relative z-10"
              preserveAspectRatio="none"
              viewBox="0 0 300 100"
            >
              {gpuPath && (
                <path
                  d={gpuPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              )}
              {ramPath && (
                <path
                  d={ramPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              No data available
            </div>
          )}
          {hasData && (
            <div className="absolute right-2 top-2 flex flex-col gap-1 z-20">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                GPU: {currentGpu.toFixed(0)}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                RAM: {currentRam.toFixed(1)}GB
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
          <span>-30m</span>
          <span>-15m</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}
