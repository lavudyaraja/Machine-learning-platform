'use client';

import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface LearningCurvesProps {
  trainingHistory?: Array<{
    epoch: number;
    loss: number;
    valLoss?: number;
    accuracy?: number;
    valAccuracy?: number;
  }>;
  metrics?: {
    accuracy?: number;
    loss?: number;
    valLoss?: number;
    valAccuracy?: number;
  };
  currentEpoch?: number;
  totalEpochs?: number;
}

export function LearningCurves({ trainingHistory = [], metrics = {}, currentEpoch = 0, totalEpochs = 0 }: LearningCurvesProps) {
  // Debug: Log training history (only when it changes significantly)
  const historyLength = trainingHistory.length;
  const lastEpoch = trainingHistory.length > 0 ? trainingHistory[trainingHistory.length - 1]?.epoch : 0;
  
  console.log(`📊 LearningCurves render - History: ${historyLength} entries, Last epoch: ${lastEpoch}, Total epochs: ${totalEpochs}`);
  
  // Generate SVG path from training history
  const generatePath = (data: number[], maxValue: number, minValue: number, height: number) => {
    if (data.length === 0) return '';
    
    // Handle edge case where all values are the same
    const range = maxValue - minValue;
    const effectiveRange = range > 0 ? range : 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * 400;
      const normalizedValue = (value - minValue) / effectiveRange;
      // Clamp normalized value between 0 and 1
      const clampedValue = Math.max(0, Math.min(1, normalizedValue));
      const y = height - (clampedValue * height);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const lossData = useMemo(() => {
    if (trainingHistory.length === 0) {
      // Show empty state
      return { train: [], val: [], max: 1, min: 0 };
    }
    
    const trainLoss = trainingHistory
      .map(h => h.loss)
      .filter(v => v !== undefined && v !== null && !isNaN(v) && isFinite(v));
    
    const valLoss = trainingHistory
      .map(h => h.valLoss !== undefined ? h.valLoss : h.loss)
      .filter(v => v !== undefined && v !== null && !isNaN(v) && isFinite(v));
    
    const allLosses = [...trainLoss, ...valLoss];
    
    // Ensure we have valid min/max values
    let maxLoss = 1;
    let minLoss = 0;
    
    if (allLosses.length > 0) {
      maxLoss = Math.max(...allLosses);
      minLoss = Math.min(...allLosses);
      
      // If all values are the same, add padding
      if (maxLoss === minLoss) {
        if (maxLoss === 0) {
          maxLoss = 0.1; // Default to 0.1 if all zeros
        } else {
          maxLoss = maxLoss * 1.1; // Add 10% padding
          minLoss = Math.max(0, minLoss * 0.9); // Subtract 10% padding, but not below 0
        }
      }
    }
    
    console.log('📊 Loss Data:', { trainLoss, valLoss, maxLoss, minLoss, allLosses });
    
    return {
      train: trainLoss,
      val: valLoss,
      max: maxLoss,
      min: minLoss,
    };
  }, [trainingHistory]);

  const accuracyData = useMemo(() => {
    if (trainingHistory.length === 0) {
      return { train: [], val: [], max: 100, min: 0 };
    }
    
    const trainAcc = trainingHistory
      .map(h => {
        const acc = h.accuracy;
        if (acc !== undefined && acc !== null && !isNaN(acc) && isFinite(acc)) {
          return acc * 100; // Convert to percentage
        }
        return undefined;
      })
      .filter((v): v is number => v !== undefined);
    
    const valAcc = trainingHistory
      .map(h => {
        const acc = h.valAccuracy !== undefined ? h.valAccuracy : h.accuracy;
        if (acc !== undefined && acc !== null && !isNaN(acc) && isFinite(acc)) {
          return acc * 100; // Convert to percentage
        }
        return undefined;
      })
      .filter((v): v is number => v !== undefined);
    
    const allAcc = [...trainAcc, ...valAcc];
    
    // Ensure we have valid min/max values
    let maxAcc = 100;
    let minAcc = 0;
    
    if (allAcc.length > 0) {
      maxAcc = Math.max(...allAcc);
      minAcc = Math.min(...allAcc);
      
      // Clamp to 0-100 range
      maxAcc = Math.min(Math.max(maxAcc, 0), 100);
      minAcc = Math.max(Math.min(minAcc, 100), 0);
      
      // If all values are the same, add padding
      if (maxAcc === minAcc) {
        if (maxAcc === 0) {
          maxAcc = 10; // Default to 10% if all zeros
        } else if (maxAcc === 100) {
          minAcc = 90; // Default to 90% if all 100%
        } else {
          maxAcc = Math.min(100, maxAcc + 5); // Add 5% padding
          minAcc = Math.max(0, minAcc - 5); // Subtract 5% padding
        }
      }
    }
    
    console.log('📊 Accuracy Data:', { trainAcc, valAcc, maxAcc, minAcc, allAcc });
    
    return {
      train: trainAcc,
      val: valAcc,
      max: maxAcc,
      min: minAcc,
    };
  }, [trainingHistory]);

  const lossPathTrain = generatePath(lossData.train, lossData.max, lossData.min, 200);
  const lossPathVal = generatePath(lossData.val, lossData.max, lossData.min, 200);
  const accPathTrain = generatePath(accuracyData.train, accuracyData.max, accuracyData.min, 200);
  const accPathVal = generatePath(accuracyData.val, accuracyData.max, accuracyData.min, 200);

  console.log('📊 Generated Paths:', {
    lossPathTrain: lossPathTrain.substring(0, 50) + '...',
    lossPathVal: lossPathVal.substring(0, 50) + '...',
    accPathTrain: accPathTrain.substring(0, 50) + '...',
    accPathVal: accPathVal.substring(0, 50) + '...',
  });

  const hasData = trainingHistory.length > 0 && (
    (lossData.train.length > 0 || lossData.val.length > 0) ||
    (accuracyData.train.length > 0 || accuracyData.val.length > 0)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="border-b border-slate-200 bg-slate-50/50 p-4 flex justify-between items-center">
        <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Learning Curves
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-600"></span>
            <span className="text-[11px] font-semibold text-slate-900">
              Training
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-orange-500"></span>
            <span className="text-[11px] font-semibold text-slate-900">
              Validation
            </span>
          </div>
        </div>
      </div>
      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">
            Loss Profile
          </p>
          <div className="h-64 relative border-b border-l border-slate-200">
            <div className="absolute inset-0 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            {hasData ? (
              <svg
                className="w-full h-full relative z-10"
                preserveAspectRatio="none"
                viewBox="0 0 400 200"
              >
                {lossPathTrain && lossPathTrain.length > 0 && (
                  <path
                    d={lossPathTrain}
                    fill="none"
                    stroke="#135bec"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {lossPathVal && lossPathVal.length > 0 && (
                  <path
                    d={lossPathVal}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {(!lossPathTrain || lossPathTrain.length === 0) && (!lossPathVal || lossPathVal.length === 0) && (
                  <text x="200" y="100" textAnchor="middle" className="text-slate-400 text-sm">
                    No loss data
                  </text>
                )}
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
            <span>E:0</span>
            <span>E:{totalEpochs > 0 ? Math.floor(totalEpochs / 2) : Math.floor(trainingHistory.length / 2)}</span>
            <span>E:{totalEpochs > 0 ? totalEpochs : trainingHistory.length || 0}</span>
          </div>
          {totalEpochs > 0 && (
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-blue-600">
                Epoch {currentEpoch} / {totalEpochs}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">
            Accuracy (%)
          </p>
          <div className="h-64 relative border-b border-l border-slate-200">
            <div className="absolute inset-0 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            {hasData ? (
              <svg
                className="w-full h-full relative z-10"
                preserveAspectRatio="none"
                viewBox="0 0 400 200"
              >
                {accPathTrain && accPathTrain.length > 0 && (
                  <path
                    d={accPathTrain}
                    fill="none"
                    stroke="#135bec"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {accPathVal && accPathVal.length > 0 && (
                  <path
                    d={accPathVal}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {(!accPathTrain || accPathTrain.length === 0) && (!accPathVal || accPathVal.length === 0) && (
                  <text x="200" y="100" textAnchor="middle" className="text-slate-400 text-sm">
                    No accuracy data
                  </text>
                )}
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
