'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Info, TrendingUp, Sliders } from 'lucide-react';

interface KNNParams {
  kValue: number;
  distanceMetric: string;
  weightFunction: string;
  minkowskiP: number;
  algorithm: string;
  featureScaling: string;
  trainTestSplit: number;
  crossValidation: number;
  leafSize: number;
  outlierDetection: boolean;
  dimensionalityReduction: string;
  nComponents: number;
  handleImbalanced: boolean;
  samplingMethod: string;
  earlyStop: boolean;
  maxIterations: number;
}

interface KNNHyperparametersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (params: KNNParams) => void;
  initialParams?: Partial<KNNParams>;
}

export default function KNNHyperparametersDialog({
  open,
  onOpenChange,
  onSave,
  initialParams,
}: KNNHyperparametersDialogProps) {
  const [params, setParams] = useState<KNNParams>({
    kValue: 5,
    distanceMetric: 'euclidean',
    weightFunction: 'distance',
    minkowskiP: 2,
    algorithm: 'auto',
    featureScaling: 'standardization',
    trainTestSplit: 80,
    crossValidation: 5,
    leafSize: 30,
    outlierDetection: false,
    dimensionalityReduction: 'none',
    nComponents: 2,
    handleImbalanced: false,
    samplingMethod: 'none',
    earlyStop: false,
    maxIterations: 100,
    ...initialParams,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialParams) {
      setParams((prev) => ({ ...prev, ...initialParams }));
    }
  }, [initialParams]);

  const validateParams = () => {
    const newErrors: Record<string, string> = {};

    if (params.kValue < 1) {
      newErrors.kValue = 'K must be at least 1';
    }
    if (params.kValue % 2 === 0) {
      newErrors.kValue = 'K should be odd to avoid ties';
    }
    if (params.minkowskiP < 1) {
      newErrors.minkowskiP = 'Minkowski p must be at least 1';
    }
    if (params.trainTestSplit < 50 || params.trainTestSplit > 95) {
      newErrors.trainTestSplit = 'Split should be between 50-95%';
    }
    if (params.leafSize < 1) {
      newErrors.leafSize = 'Leaf size must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateParams()) {
      onSave?.(params);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setParams({
      kValue: 5,
      distanceMetric: 'euclidean',
      weightFunction: 'distance',
      minkowskiP: 2,
      algorithm: 'auto',
      featureScaling: 'standardization',
      trainTestSplit: 80,
      crossValidation: 5,
      leafSize: 30,
      outlierDetection: false,
      dimensionalityReduction: 'none',
      nComponents: 2,
      handleImbalanced: false,
      samplingMethod: 'none',
      earlyStop: false,
      maxIterations: 100,
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            KNN Hyperparameters Configuration
          </DialogTitle>
          <DialogDescription>
            Configure all hyperparameters for K-Nearest Neighbors algorithm
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="core" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="preprocessing">Preprocessing</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Core Parameters */}
          <TabsContent value="core" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* K Value */}
              <div className="space-y-3">
                <Label htmlFor="kValue" className="text-sm font-semibold">
                  Number of Neighbors (K)
                </Label>
                <div className="space-y-2">
                  <Slider
                    id="kValue"
                    min={1}
                    max={50}
                    step={1}
                    value={[params.kValue]}
                    onValueChange={(val) =>
                      setParams({ ...params, kValue: val[0] })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <Input
                      type="number"
                      value={params.kValue}
                      onChange={(e) =>
                        setParams({ ...params, kValue: parseInt(e.target.value) || 1 })
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-slate-500">Recommended: 3-15</span>
                  </div>
                </div>
                {errors.kValue && (
                  <p className="text-xs text-red-500">{errors.kValue}</p>
                )}
                <p className="text-xs text-slate-500">
                  <Info className="w-3 h-3 inline mr-1" />
                  Use odd numbers to avoid ties in classification
                </p>
              </div>

              {/* Weight Function */}
              <div className="space-y-3">
                <Label htmlFor="weightFunction" className="text-sm font-semibold">
                  Weight Function
                </Label>
                <Select
                  value={params.weightFunction}
                  onValueChange={(val) =>
                    setParams({ ...params, weightFunction: val })
                  }
                >
                  <SelectTrigger id="weightFunction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniform">Uniform</SelectItem>
                    <SelectItem value="distance">Distance-weighted</SelectItem>
                    <SelectItem value="gaussian">Gaussian</SelectItem>
                    <SelectItem value="rank">Rank-based</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Distance-weighted gives more importance to closer neighbors
                </p>
              </div>

              {/* Algorithm */}
              <div className="space-y-3">
                <Label htmlFor="algorithm" className="text-sm font-semibold">
                  Search Algorithm
                </Label>
                <Select
                  value={params.algorithm}
                  onValueChange={(val) => setParams({ ...params, algorithm: val })}
                >
                  <SelectTrigger id="algorithm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                    <SelectItem value="ball_tree">Ball Tree</SelectItem>
                    <SelectItem value="kd_tree">KD Tree</SelectItem>
                    <SelectItem value="brute">Brute Force</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Auto selects the best algorithm based on data
                </p>
              </div>

              {/* Leaf Size */}
              <div className="space-y-3">
                <Label htmlFor="leafSize" className="text-sm font-semibold">
                  Leaf Size (for tree algorithms)
                </Label>
                <Input
                  id="leafSize"
                  type="number"
                  value={params.leafSize}
                  onChange={(e) =>
                    setParams({ ...params, leafSize: parseInt(e.target.value) || 30 })
                  }
                  min={1}
                />
                {errors.leafSize && (
                  <p className="text-xs text-red-500">{errors.leafSize}</p>
                )}
                <p className="text-xs text-slate-500">
                  Affects memory vs speed trade-off (default: 30)
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Distance Parameters */}
          <TabsContent value="distance" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Distance Metric */}
              <div className="space-y-3">
                <Label htmlFor="distanceMetric" className="text-sm font-semibold">
                  Distance Metric
                </Label>
                <Select
                  value={params.distanceMetric}
                  onValueChange={(val) =>
                    setParams({ ...params, distanceMetric: val })
                  }
                >
                  <SelectTrigger id="distanceMetric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="euclidean">Euclidean (L2)</SelectItem>
                    <SelectItem value="manhattan">Manhattan (L1)</SelectItem>
                    <SelectItem value="minkowski">Minkowski</SelectItem>
                    <SelectItem value="chebyshev">Chebyshev (L∞)</SelectItem>
                    <SelectItem value="cosine">Cosine Similarity</SelectItem>
                    <SelectItem value="hamming">Hamming</SelectItem>
                    <SelectItem value="jaccard">Jaccard</SelectItem>
                    <SelectItem value="mahalanobis">Mahalanobis</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Euclidean is most common for continuous features
                </p>
              </div>

              {/* Minkowski P */}
              <div className="space-y-3">
                <Label htmlFor="minkowskiP" className="text-sm font-semibold">
                  Minkowski Parameter (p)
                </Label>
                <div className="space-y-2">
                  <Slider
                    id="minkowskiP"
                    min={1}
                    max={10}
                    step={0.5}
                    value={[params.minkowskiP]}
                    onValueChange={(val) =>
                      setParams({ ...params, minkowskiP: val[0] })
                    }
                    disabled={params.distanceMetric !== 'minkowski'}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={params.minkowskiP}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        minkowskiP: parseFloat(e.target.value) || 2,
                      })
                    }
                    disabled={params.distanceMetric !== 'minkowski'}
                    className="w-20"
                    step={0.5}
                  />
                </div>
                {errors.minkowskiP && (
                  <p className="text-xs text-red-500">{errors.minkowskiP}</p>
                )}
                <p className="text-xs text-slate-500">
                  p=1: Manhattan, p=2: Euclidean, p=∞: Chebyshev
                </p>
              </div>
            </div>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Distance Metric Guide:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <strong>Euclidean:</strong> Best for continuous, scaled features</li>
                  <li>• <strong>Manhattan:</strong> Good for high-dimensional data, robust to outliers</li>
                  <li>• <strong>Cosine:</strong> Ideal for text/document similarity</li>
                  <li>• <strong>Hamming:</strong> For categorical/binary features</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Preprocessing */}
          <TabsContent value="preprocessing" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Feature Scaling */}
              <div className="space-y-3">
                <Label htmlFor="featureScaling" className="text-sm font-semibold">
                  Feature Scaling Method
                </Label>
                <Select
                  value={params.featureScaling}
                  onValueChange={(val) =>
                    setParams({ ...params, featureScaling: val })
                  }
                >
                  <SelectTrigger id="featureScaling">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="standardization">Standardization (Z-score)</SelectItem>
                    <SelectItem value="minmax">Min-Max Normalization</SelectItem>
                    <SelectItem value="robust">Robust Scaler</SelectItem>
                    <SelectItem value="maxabs">Max Abs Scaler</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Critical for KNN - always scale features!
                </p>
              </div>

              {/* Train-Test Split */}
              <div className="space-y-3">
                <Label htmlFor="trainTestSplit" className="text-sm font-semibold">
                  Training Set Ratio (%)
                </Label>
                <div className="space-y-2">
                  <Slider
                    id="trainTestSplit"
                    min={50}
                    max={95}
                    step={5}
                    value={[params.trainTestSplit]}
                    onValueChange={(val) =>
                      setParams({ ...params, trainTestSplit: val[0] })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{params.trainTestSplit}% Train</span>
                    <span className="text-slate-500">
                      {100 - params.trainTestSplit}% Test
                    </span>
                  </div>
                </div>
                {errors.trainTestSplit && (
                  <p className="text-xs text-red-500">{errors.trainTestSplit}</p>
                )}
              </div>

              {/* Cross Validation */}
              <div className="space-y-3">
                <Label htmlFor="crossValidation" className="text-sm font-semibold">
                  Cross-Validation Folds
                </Label>
                <Select
                  value={params.crossValidation.toString()}
                  onValueChange={(val) =>
                    setParams({ ...params, crossValidation: parseInt(val) })
                  }
                >
                  <SelectTrigger id="crossValidation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3-Fold</SelectItem>
                    <SelectItem value="5">5-Fold (Recommended)</SelectItem>
                    <SelectItem value="10">10-Fold</SelectItem>
                    <SelectItem value="0">Leave-One-Out</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Used for optimal K selection and model validation
                </p>
              </div>

              {/* Dimensionality Reduction */}
              <div className="space-y-3">
                <Label htmlFor="dimReduction" className="text-sm font-semibold">
                  Dimensionality Reduction
                </Label>
                <Select
                  value={params.dimensionalityReduction}
                  onValueChange={(val) =>
                    setParams({ ...params, dimensionalityReduction: val })
                  }
                >
                  <SelectTrigger id="dimReduction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="pca">PCA</SelectItem>
                    <SelectItem value="lda">LDA</SelectItem>
                    <SelectItem value="tsne">t-SNE</SelectItem>
                    <SelectItem value="umap">UMAP</SelectItem>
                  </SelectContent>
                </Select>
                {params.dimensionalityReduction !== 'none' && (
                  <Input
                    type="number"
                    placeholder="Number of components"
                    value={params.nComponents}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        nComponents: parseInt(e.target.value) || 2,
                      })
                    }
                    min={1}
                  />
                )}
                <p className="text-xs text-slate-500">
                  Helps combat curse of dimensionality
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Outlier Detection */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="outlierDetection" className="text-sm font-semibold">
                    Outlier Detection
                  </Label>
                  <p className="text-xs text-slate-500">
                    Remove outliers before training using LOF or Isolation Forest
                  </p>
                </div>
                <Switch
                  id="outlierDetection"
                  checked={params.outlierDetection}
                  onCheckedChange={(checked) =>
                    setParams({ ...params, outlierDetection: checked })
                  }
                />
              </div>

              {/* Imbalanced Data Handling */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="handleImbalanced" className="text-sm font-semibold">
                      Handle Imbalanced Classes
                    </Label>
                    <p className="text-xs text-slate-500">
                      Apply sampling techniques for imbalanced datasets
                    </p>
                  </div>
                  <Switch
                    id="handleImbalanced"
                    checked={params.handleImbalanced}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, handleImbalanced: checked })
                    }
                  />
                </div>

                {params.handleImbalanced && (
                  <Select
                    value={params.samplingMethod}
                    onValueChange={(val) =>
                      setParams({ ...params, samplingMethod: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sampling method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="smote">SMOTE (Oversampling)</SelectItem>
                      <SelectItem value="adasyn">ADASYN</SelectItem>
                      <SelectItem value="undersample">Random Undersampling</SelectItem>
                      <SelectItem value="combined">Combined (SMOTE + ENN)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Early Stopping */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="earlyStop" className="text-sm font-semibold">
                      Early Stopping (for iterative methods)
                    </Label>
                    <p className="text-xs text-slate-500">
                      Stop training if validation accuracy doesn't improve
                    </p>
                  </div>
                  <Switch
                    id="earlyStop"
                    checked={params.earlyStop}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, earlyStop: checked })
                    }
                  />
                </div>

                {params.earlyStop && (
                  <div className="pl-4">
                    <Label htmlFor="maxIterations" className="text-xs">
                      Max Iterations
                    </Label>
                    <Input
                      id="maxIterations"
                      type="number"
                      value={params.maxIterations}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          maxIterations: parseInt(e.target.value) || 100,
                        })
                      }
                      min={1}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            <Alert>
              <Sliders className="h-4 w-4" />
              <AlertDescription>
                <strong>Advanced Tips:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Enable outlier detection for noisy datasets</li>
                  <li>• Use SMOTE for highly imbalanced classification</li>
                  <li>• Consider dimensionality reduction for 10+ features</li>
                  <li>• Larger K values → smoother decision boundaries</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}