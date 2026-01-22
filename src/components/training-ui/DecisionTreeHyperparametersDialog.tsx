'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DecisionTreeHyperparametersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DecisionTreeHyperparametersDialog({
  open,
  onOpenChange,
}: DecisionTreeHyperparametersDialogProps) {
  // Default Decision Tree hyperparameter values (read-only display)
  const dtParams = {
    maxDepth: 'None',
    minSamplesSplit: 2,
    minSamplesLeaf: 1,
    maxFeatures: 'None',
    criterion: 'gini',
    splitter: 'best',
    randomState: 42,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            Decision Tree Hyperparameters
          </DialogTitle>
          <DialogDescription>
            Current hyperparameter values for Decision Tree model
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Max Depth */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Max Depth
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.maxDepth}
              </div>
            </div>

            {/* Min Samples Split */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Min Samples Split
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.minSamplesSplit}
              </div>
            </div>

            {/* Min Samples Leaf */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Min Samples Leaf
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.minSamplesLeaf}
              </div>
            </div>

            {/* Max Features */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Max Features
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.maxFeatures}
              </div>
            </div>

            {/* Criterion */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Criterion
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.criterion}
              </div>
            </div>

            {/* Splitter */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Splitter
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.splitter}
              </div>
            </div>

            {/* Random State */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Random State
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dtParams.randomState}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
