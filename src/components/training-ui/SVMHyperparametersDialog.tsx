'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SVMHyperparametersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SVMHyperparametersDialog({
  open,
  onOpenChange,
}: SVMHyperparametersDialogProps) {
  // Default SVM hyperparameter values (read-only display)
  const svmParams = {
    c: 1.0,
    kernel: 'rbf',
    gamma: 'scale',
    degree: 3,
    coef0: 0.0,
    shrinking: true,
    probability: false,
    tol: 0.001,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            SVM Hyperparameters
          </DialogTitle>
          <DialogDescription>
            Current hyperparameter values for Support Vector Machine model
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
                {svmParams.c}
              </div>
            </div>

            {/* Kernel */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Kernel
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.kernel.toUpperCase()}
              </div>
            </div>

            {/* Gamma */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Gamma
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.gamma}
              </div>
            </div>

            {/* Degree */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Degree (for polynomial)
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.degree}
              </div>
            </div>

            {/* Coef0 */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Coef0
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.coef0}
              </div>
            </div>

            {/* Shrinking */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Shrinking
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.shrinking ? 'True' : 'False'}
              </div>
            </div>

            {/* Probability */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Probability
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.probability ? 'True' : 'False'}
              </div>
            </div>

            {/* Tolerance */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                Tolerance
              </div>
              <div className="text-lg font-bold text-slate-900">
                {svmParams.tol}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
