'use client';

import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Log {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

interface SystemLogsProps {
  logs?: Log[];
  metrics?: {
    accuracy?: number;
    loss?: number;
    valLoss?: number;
    valAccuracy?: number;
    trainLoss?: number;
    trainAccuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    mse?: number;
    mae?: number;
    r2_score?: number;
  };
  currentEpoch?: number;
  totalEpochs?: number;
  onClear?: () => void;
}

export function SystemLogs({ logs = [], metrics = {}, currentEpoch = 0, totalEpochs = 0, onClear }: SystemLogsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400';
      case 'WARN':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-72">
      <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <span className="text-slate-300 text-[11px] font-bold tracking-widest uppercase">
            System Execution Logs
          </span>
        </div>
        {onClear && (
          <Button
            variant="ghost"
            onClick={onClear}
            className="text-[10px] text-slate-500 font-bold hover:text-white uppercase h-auto p-0"
          >
            Clear Logs
          </Button>
        )}
      </div>
      <div className="p-5 font-mono text-xs overflow-y-auto flex flex-col gap-1.5 text-slate-400 scrollbar-hide">
        {/* Real-time metrics display */}
        {(currentEpoch > 0 || Object.keys(metrics).length > 0) && (
          <div className="mb-3 pb-3 border-b border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Current Metrics</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {totalEpochs > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Epoch:</span>
                  <span className="text-blue-400 font-bold">{currentEpoch} / {totalEpochs}</span>
                </div>
              )}
              {metrics.trainLoss !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Train Loss:</span>
                  <span className="text-red-400 font-bold">{metrics.trainLoss.toFixed(4)}</span>
                </div>
              )}
              {metrics.trainAccuracy !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Train Accuracy:</span>
                  <span className="text-green-400 font-bold">{(metrics.trainAccuracy * 100).toFixed(2)}%</span>
                </div>
              )}
              {metrics.valLoss !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Val Loss:</span>
                  <span className="text-orange-400 font-bold">{metrics.valLoss.toFixed(4)}</span>
                </div>
              )}
              {metrics.valAccuracy !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Val Accuracy:</span>
                  <span className="text-yellow-400 font-bold">{(metrics.valAccuracy * 100).toFixed(2)}%</span>
                </div>
              )}
              {metrics.loss !== undefined && metrics.trainLoss === undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Loss:</span>
                  <span className="text-red-400 font-bold">{metrics.loss.toFixed(4)}</span>
                </div>
              )}
              {metrics.accuracy !== undefined && metrics.trainAccuracy === undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy:</span>
                  <span className="text-green-400 font-bold">{(metrics.accuracy * 100).toFixed(2)}%</span>
                </div>
              )}
              {metrics.precision !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Precision:</span>
                  <span className="text-purple-400 font-bold">{metrics.precision.toFixed(4)}</span>
                </div>
              )}
              {metrics.recall !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Recall:</span>
                  <span className="text-cyan-400 font-bold">{metrics.recall.toFixed(4)}</span>
                </div>
              )}
              {metrics.f1 !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">F1 Score:</span>
                  <span className="text-pink-400 font-bold">{metrics.f1.toFixed(4)}</span>
                </div>
              )}
              {metrics.mse !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">MSE:</span>
                  <span className="text-red-400 font-bold">{metrics.mse.toFixed(4)}</span>
                </div>
              )}
              {metrics.mae !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">MAE:</span>
                  <span className="text-orange-400 font-bold">{metrics.mae.toFixed(4)}</span>
                </div>
              )}
              {metrics.r2_score !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">R² Score:</span>
                  <span className="text-blue-400 font-bold">{metrics.r2_score.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No logs available</p>
        ) : (
          <>
            {logs.map((log, index) => (
              <p key={index}>
                <span className="text-slate-600">[{log.time}]</span>{' '}
                <span className={getLevelColor(log.level)}>{log.level}</span> {log.message}
              </p>
            ))}
            {logs.length > 0 && (
              <div className="h-4 w-2 bg-blue-600/80 animate-pulse mt-1"></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
