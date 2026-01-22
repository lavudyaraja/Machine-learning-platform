'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LogisticRegressionHyperparametersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogisticRegressionHyperparametersDialog({
  open,
  onOpenChange,
}: LogisticRegressionHyperparametersDialogProps) {
  // Default Logistic Regression hyperparameter values (read-only display)
  const lrParams = {
    c: 1.0,
    penalty: 'l2',
    solver: 'lbfgs',
    maxIter: 100,
    tol: 0.0001,
    multiClass: 'auto',
    randomState: 42,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Logistic Regression Hyperparameters
          </DialogTitle>
          <DialogDescription>
            Current hyperparameter values for Logistic Regression model
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            {/* C (Regularization) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                C (Regularization)
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.c}
              </div>
            </div>

            {/* Penalty */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Penalty
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.penalty.toUpperCase()}
              </div>
            </div>

            {/* Solver */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Solver
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.solver.toUpperCase()}
              </div>
            </div>

            {/* Max Iterations */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Max Iterations
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.maxIter}
              </div>
            </div>

            {/* Tolerance */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Tolerance
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.tol}
              </div>
            </div>

            {/* Multi Class */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Multi Class
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.multiClass}
              </div>
            </div>

            {/* Random State */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Random State
              </div>
              <div className="text-lg font-bold text-slate-900">
                {lrParams.randomState}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
