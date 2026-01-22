'use client';

import { FolderKanban, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Checkpoint {
  epoch: number;
  loss: number;
  timestamp?: string;
}

interface CheckpointGalleryProps {
  checkpoints?: Checkpoint[];
  trainingHistory?: Array<{
    epoch: number;
    loss: number;
    valLoss?: number;
  }>;
}

export function CheckpointGallery({ checkpoints = [], trainingHistory = [] }: CheckpointGalleryProps) {
  // Generate checkpoints from training history if not provided
  const displayCheckpoints = checkpoints.length > 0 
    ? checkpoints 
    : trainingHistory
        .filter((_, index) => index % 5 === 0 || index === trainingHistory.length - 1) // Every 5th epoch or last
        .slice(-6) // Last 6 checkpoints
        .map((item, index) => ({
          epoch: item.epoch,
          loss: item.valLoss || item.loss,
          timestamp: new Date().toISOString(),
        }));

  if (displayCheckpoints.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            Checkpoint Gallery
          </h3>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-400 text-sm">No checkpoints available yet</p>
        </div>
      </div>
    );
  }

  // Find the checkpoint with minimum loss (best model)
  const bestCheckpoint = displayCheckpoints.reduce((best, current) => 
    current.loss < best.loss ? current : best
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
          <FolderKanban className="w-5 h-5 text-blue-600" />
          Checkpoint Gallery
        </h3>
        {displayCheckpoints.length > 6 && (
          <Button variant="link" className="text-blue-600 text-xs font-bold p-0 h-auto">
            View All Checkpoints
          </Button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-4">
        {displayCheckpoints.map((checkpoint) => {
          const isActive = checkpoint.epoch === bestCheckpoint.epoch;
          return (
            <div
              key={checkpoint.epoch}
              className={`group relative rounded-lg border bg-white p-2 hover:border-blue-600 transition-all cursor-pointer ${
                isActive ? 'border-blue-600' : 'border-slate-200'
              }`}
            >
              <div
                className={`aspect-square rounded-md bg-slate-100 flex items-center justify-center mb-2 overflow-hidden ${
                  isActive ? 'border-2 border-blue-600/20' : ''
                }`}
              >
                <div
                  className={`text-[10px] font-mono ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  EPOCH {String(checkpoint.epoch).padStart(2, '0')}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-900">
                  Loss: {checkpoint.loss.toFixed(4)}
                </span>
                <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
