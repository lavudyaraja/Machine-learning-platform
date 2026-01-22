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
import { TreePine, Settings, Layers, Zap, Info, AlertCircle } from 'lucide-react';

interface RandomForestParams {
  nEstimators: number;
  maxDepth: number | null;
  minSamplesSplit: number;
  minSamplesLeaf: number;
  maxFeatures: string;
  maxFeaturesValue: number | null;
  criterion: string;
  bootstrap: boolean;
  oobScore: boolean;
  maxSamples: number | null;
  randomState: number | null;
  nJobs: number;
  verbose: number;
  warmStart: boolean;
  maxLeafNodes: number | null;
  minImpurityDecrease: number;
  classWeight: string;
  ccpAlpha: number;
  minWeightFractionLeaf: number;
  featureImportance: boolean;
  crossValidation: number;
  trainTestSplit: number;
  handleImbalanced: boolean;
  samplingMethod: string;
}

interface RandomForestHyperparametersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (params: RandomForestParams) => void;
  initialParams?: Partial<RandomForestParams>;
}

export default function RandomForestHyperparametersDialog({
  open,
  onOpenChange,
  onSave,
  initialParams,
}: RandomForestHyperparametersDialogProps) {
  const [params, setParams] = useState<RandomForestParams>({
    nEstimators: 100,
    maxDepth: null,
    minSamplesSplit: 2,
    minSamplesLeaf: 1,
    maxFeatures: 'sqrt',
    maxFeaturesValue: null,
    criterion: 'gini',
    bootstrap: true,
    oobScore: false,
    maxSamples: null,
    randomState: 42,
    nJobs: -1,
    verbose: 0,
    warmStart: false,
    maxLeafNodes: null,
    minImpurityDecrease: 0.0,
    classWeight: 'none',
    ccpAlpha: 0.0,
    minWeightFractionLeaf: 0.0,
    featureImportance: true,
    crossValidation: 5,
    trainTestSplit: 80,
    handleImbalanced: false,
    samplingMethod: 'none',
    ...initialParams,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useMaxDepth, setUseMaxDepth] = useState(false);
  const [useMaxLeafNodes, setUseMaxLeafNodes] = useState(false);
  const [useMaxSamples, setUseMaxSamples] = useState(false);
  const [useRandomState, setUseRandomState] = useState(true);

  useEffect(() => {
    if (initialParams) {
      setParams((prev) => ({ ...prev, ...initialParams }));
    }
  }, [initialParams]);

  const validateParams = () => {
    const newErrors: Record<string, string> = {};

    if (params.nEstimators < 1) {
      newErrors.nEstimators = 'Number of trees must be at least 1';
    }
    if (params.nEstimators > 1000) {
      newErrors.nEstimators = 'Too many trees may cause memory issues (max recommended: 1000)';
    }
    if (useMaxDepth && params.maxDepth && params.maxDepth < 1) {
      newErrors.maxDepth = 'Max depth must be at least 1';
    }
    if (params.minSamplesSplit < 2) {
      newErrors.minSamplesSplit = 'Min samples split must be at least 2';
    }
    if (params.minSamplesLeaf < 1) {
      newErrors.minSamplesLeaf = 'Min samples leaf must be at least 1';
    }
    if (params.ccpAlpha < 0) {
      newErrors.ccpAlpha = 'Alpha must be non-negative';
    }
    if (params.minImpurityDecrease < 0) {
      newErrors.minImpurityDecrease = 'Min impurity decrease must be non-negative';
    }
    if (params.oobScore && !params.bootstrap) {
      newErrors.oobScore = 'OOB score requires bootstrap to be enabled';
    }
    if (params.trainTestSplit < 50 || params.trainTestSplit > 95) {
      newErrors.trainTestSplit = 'Split should be between 50-95%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateParams()) {
      const finalParams = {
        ...params,
        maxDepth: useMaxDepth ? params.maxDepth : null,
        maxLeafNodes: useMaxLeafNodes ? params.maxLeafNodes : null,
        maxSamples: useMaxSamples ? params.maxSamples : null,
        randomState: useRandomState ? params.randomState : null,
      };
      onSave?.(finalParams);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setParams({
      nEstimators: 100,
      maxDepth: null,
      minSamplesSplit: 2,
      minSamplesLeaf: 1,
      maxFeatures: 'sqrt',
      maxFeaturesValue: null,
      criterion: 'gini',
      bootstrap: true,
      oobScore: false,
      maxSamples: null,
      randomState: 42,
      nJobs: -1,
      verbose: 0,
      warmStart: false,
      maxLeafNodes: null,
      minImpurityDecrease: 0.0,
      classWeight: 'none',
      ccpAlpha: 0.0,
      minWeightFractionLeaf: 0.0,
      featureImportance: true,
      crossValidation: 5,
      trainTestSplit: 80,
      handleImbalanced: false,
      samplingMethod: 'none',
    });
    setUseMaxDepth(false);
    setUseMaxLeafNodes(false);
    setUseMaxSamples(false);
    setUseRandomState(true);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <TreePine className="w-6 h-6 text-green-600" />
            Random Forest Hyperparameters Configuration
          </DialogTitle>
          <DialogDescription>
            Configure all hyperparameters for Random Forest ensemble algorithm
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="core" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="tree">Tree Control</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Core Parameters */}
          <TabsContent value="core" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Number of Estimators */}
              <div className="space-y-3">
                <Label htmlFor="nEstimators" className="text-sm font-semibold">
                  Number of Trees (n_estimators)
                </Label>
                <div className="space-y-2">
                  <Slider
                    id="nEstimators"
                    min={10}
                    max={500}
                    step={10}
                    value={[params.nEstimators]}
                    onValueChange={(val) =>
                      setParams({ ...params, nEstimators: val[0] })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <Input
                      type="number"
                      value={params.nEstimators}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          nEstimators: parseInt(e.target.value) || 100,
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-xs text-slate-500">Default: 100</span>
                  </div>
                </div>
                {errors.nEstimators && (
                  <p className="text-xs text-red-500">{errors.nEstimators}</p>
                )}
                <p className="text-xs text-slate-500">
                  <Info className="w-3 h-3 inline mr-1" />
                  More trees = better performance but slower training
                </p>
              </div>

              {/* Criterion */}
              <div className="space-y-3">
                <Label htmlFor="criterion" className="text-sm font-semibold">
                  Split Criterion
                </Label>
                <Select
                  value={params.criterion}
                  onValueChange={(val) => setParams({ ...params, criterion: val })}
                >
                  <SelectTrigger id="criterion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gini">Gini Impurity</SelectItem>
                    <SelectItem value="entropy">Entropy (Information Gain)</SelectItem>
                    <SelectItem value="log_loss">Log Loss</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Gini is faster; Entropy may be more accurate
                </p>
              </div>

              {/* Bootstrap */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-1">
                    <Label htmlFor="bootstrap" className="text-sm font-semibold">
                      Bootstrap Sampling
                    </Label>
                    <p className="text-xs text-slate-500">
                      Sample with replacement for each tree
                    </p>
                  </div>
                  <Switch
                    id="bootstrap"
                    checked={params.bootstrap}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, bootstrap: checked })
                    }
                  />
                </div>
              </div>

              {/* OOB Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-1">
                    <Label htmlFor="oobScore" className="text-sm font-semibold">
                      Out-of-Bag Score
                    </Label>
                    <p className="text-xs text-slate-500">
                      Estimate generalization accuracy
                    </p>
                  </div>
                  <Switch
                    id="oobScore"
                    checked={params.oobScore}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, oobScore: checked })
                    }
                    disabled={!params.bootstrap}
                  />
                </div>
                {errors.oobScore && (
                  <p className="text-xs text-red-500">{errors.oobScore}</p>
                )}
              </div>

              {/* Random State */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id="useRandomState"
                    checked={useRandomState}
                    onCheckedChange={setUseRandomState}
                  />
                  <Label htmlFor="useRandomState" className="text-sm font-semibold">
                    Set Random State (Reproducibility)
                  </Label>
                </div>
                {useRandomState && (
                  <Input
                    type="number"
                    value={params.randomState || ''}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        randomState: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="e.g., 42"
                  />
                )}
                <p className="text-xs text-slate-500">
                  Set seed for reproducible results
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
            </div>

            <Alert>
              <Layers className="h-4 w-4" />
              <AlertDescription>
                <strong>Random Forest Basics:</strong> Ensemble of decision trees trained
                on random subsets of data and features. More trees typically improve
                performance up to a point of diminishing returns.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Tree Control */}
          <TabsContent value="tree" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Max Depth */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id="useMaxDepth"
                    checked={useMaxDepth}
                    onCheckedChange={setUseMaxDepth}
                  />
                  <Label htmlFor="useMaxDepth" className="text-sm font-semibold">
                    Limit Max Depth
                  </Label>
                </div>
                {useMaxDepth && (
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[params.maxDepth || 10]}
                      onValueChange={(val) =>
                        setParams({ ...params, maxDepth: val[0] })
                      }
                      className="w-full"
                    />
                    <Input
                      type="number"
                      value={params.maxDepth || ''}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          maxDepth: parseInt(e.target.value) || null,
                        })
                      }
                      placeholder="Unlimited"
                    />
                  </div>
                )}
                {errors.maxDepth && (
                  <p className="text-xs text-red-500">{errors.maxDepth}</p>
                )}
                <p className="text-xs text-slate-500">
                  Limits tree depth to prevent overfitting
                </p>
              </div>

              {/* Max Leaf Nodes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id="useMaxLeafNodes"
                    checked={useMaxLeafNodes}
                    onCheckedChange={setUseMaxLeafNodes}
                  />
                  <Label htmlFor="useMaxLeafNodes" className="text-sm font-semibold">
                    Limit Max Leaf Nodes
                  </Label>
                </div>
                {useMaxLeafNodes && (
                  <Input
                    type="number"
                    value={params.maxLeafNodes || ''}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        maxLeafNodes: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="Unlimited"
                    min={2}
                  />
                )}
                <p className="text-xs text-slate-500">
                  Alternative way to control tree complexity
                </p>
              </div>

              {/* Min Samples Split */}
              <div className="space-y-3">
                <Label htmlFor="minSamplesSplit" className="text-sm font-semibold">
                  Min Samples Split
                </Label>
                <div className="space-y-2">
                  <Slider
                    id="minSamplesSplit"
                    min={2}
                    max={20}
                    step={1}
                    value={[params.minSamplesSplit]}
                    onValueChange={(val) =>
                      setParams({ ...params, minSamplesSplit: val[0] })
                    }
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={params.minSamplesSplit}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        minSamplesSplit: parseInt(e.target.value) || 2,
                      })
                    }
                    min={2}
                    className="w-24"
                  />
                </div>
                {errors.minSamplesSplit && (
                  <p className="text-xs text-red-500">{errors.minSamplesSplit}</p>
                )}
                <p className="text-xs text-slate-500">
                  Minimum samples required to split a node
                </p>
              </div>

              {/* Min Samples Leaf */}
              <div className="space-y-3">
                <Label htmlFor="minSamplesLeaf" className="text-sm font-semibold">
                  Min Samples Leaf
                </Label>
                <div className="space-y-2">
                  <Slider
                    id="minSamplesLeaf"
                    min={1}
                    max={20}
                    step={1}
                    value={[params.minSamplesLeaf]}
                    onValueChange={(val) =>
                      setParams({ ...params, minSamplesLeaf: val[0] })
                    }
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={params.minSamplesLeaf}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        minSamplesLeaf: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    className="w-24"
                  />
                </div>
                {errors.minSamplesLeaf && (
                  <p className="text-xs text-red-500">{errors.minSamplesLeaf}</p>
                )}
                <p className="text-xs text-slate-500">
                  Minimum samples required at a leaf node
                </p>
              </div>

              {/* Min Impurity Decrease */}
              <div className="space-y-3">
                <Label htmlFor="minImpurityDecrease" className="text-sm font-semibold">
                  Min Impurity Decrease
                </Label>
                <Input
                  id="minImpurityDecrease"
                  type="number"
                  value={params.minImpurityDecrease}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      minImpurityDecrease: parseFloat(e.target.value) || 0.0,
                    })
                  }
                  step={0.001}
                  min={0}
                />
                {errors.minImpurityDecrease && (
                  <p className="text-xs text-red-500">{errors.minImpurityDecrease}</p>
                )}
                <p className="text-xs text-slate-500">
                  Minimum impurity decrease required for split
                </p>
              </div>

              {/* CCP Alpha (Pruning) */}
              <div className="space-y-3">
                <Label htmlFor="ccpAlpha" className="text-sm font-semibold">
                  CCP Alpha (Pruning Parameter)
                </Label>
                <Input
                  id="ccpAlpha"
                  type="number"
                  value={params.ccpAlpha}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      ccpAlpha: parseFloat(e.target.value) || 0.0,
                    })
                  }
                  step={0.001}
                  min={0}
                />
                {errors.ccpAlpha && (
                  <p className="text-xs text-red-500">{errors.ccpAlpha}</p>
                )}
                <p className="text-xs text-slate-500">
                  Cost complexity pruning parameter (0 = no pruning)
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tree Control Tips:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Increase min_samples_split/leaf to prevent overfitting</li>
                  <li>• Use max_depth for shallow trees (faster training)</li>
                  <li>• CCP alpha provides post-pruning for better generalization</li>
                  <li>• Lower values = more complex trees (may overfit)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Max Features */}
              <div className="space-y-3">
                <Label htmlFor="maxFeatures" className="text-sm font-semibold">
                  Max Features per Split
                </Label>
                <Select
                  value={params.maxFeatures}
                  onValueChange={(val) => setParams({ ...params, maxFeatures: val })}
                >
                  <SelectTrigger id="maxFeatures">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqrt">sqrt (√n_features)</SelectItem>
                    <SelectItem value="log2">log2 (log₂n_features)</SelectItem>
                    <SelectItem value="none">All Features</SelectItem>
                    <SelectItem value="custom">Custom Number</SelectItem>
                    <SelectItem value="float">Custom Fraction</SelectItem>
                  </SelectContent>
                </Select>
                {(params.maxFeatures === 'custom' || params.maxFeatures === 'float') && (
                  <Input
                    type="number"
                    placeholder={
                      params.maxFeatures === 'custom' ? 'Number of features' : '0.0 - 1.0'
                    }
                    value={params.maxFeaturesValue || ''}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        maxFeaturesValue: parseFloat(e.target.value) || null,
                      })
                    }
                    step={params.maxFeatures === 'float' ? 0.1 : 1}
                    min={params.maxFeatures === 'float' ? 0.1 : 1}
                    max={params.maxFeatures === 'float' ? 1.0 : undefined}
                  />
                )}
                <p className="text-xs text-slate-500">
                  <Info className="w-3 h-3 inline mr-1" />
                  Controls randomness and prevents overfitting
                </p>
              </div>

              {/* Feature Importance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-1">
                    <Label htmlFor="featureImportance" className="text-sm font-semibold">
                      Compute Feature Importance
                    </Label>
                    <p className="text-xs text-slate-500">
                      Calculate feature importance scores
                    </p>
                  </div>
                  <Switch
                    id="featureImportance"
                    checked={params.featureImportance}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, featureImportance: checked })
                    }
                  />
                </div>
              </div>

              {/* Max Samples */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id="useMaxSamples"
                    checked={useMaxSamples}
                    onCheckedChange={setUseMaxSamples}
                  />
                  <Label htmlFor="useMaxSamples" className="text-sm font-semibold">
                    Limit Max Samples per Tree
                  </Label>
                </div>
                {useMaxSamples && (
                  <div className="space-y-2">
                    <Slider
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={[params.maxSamples || 0.8]}
                      onValueChange={(val) =>
                        setParams({ ...params, maxSamples: val[0] })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">
                        {((params.maxSamples || 1.0) * 100).toFixed(0)}% of samples
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Fraction of samples to draw for each tree (requires bootstrap)
                </p>
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
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  For hyperparameter tuning and validation
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Feature Selection Impact:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <strong>sqrt:</strong> Best for classification (default)</li>
                  <li>• <strong>log2:</strong> More diversity, slower training</li>
                  <li>• <strong>All features:</strong> Less randomness, may overfit</li>
                  <li>• Lower values → more randomness, better generalization</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Class Weight */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="classWeight" className="text-sm font-semibold">
                    Class Weight Strategy
                  </Label>
                  <Select
                    value={params.classWeight}
                    onValueChange={(val) =>
                      setParams({ ...params, classWeight: val })
                    }
                  >
                    <SelectTrigger id="classWeight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="balanced_subsample">Balanced Subsample</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Automatically adjust weights for imbalanced classes
                  </p>
                </div>

                {/* Min Weight Fraction Leaf */}
                <div className="space-y-3">
                  <Label htmlFor="minWeightFraction" className="text-sm font-semibold">
                    Min Weight Fraction Leaf
                  </Label>
                  <Input
                    id="minWeightFraction"
                    type="number"
                    value={params.minWeightFractionLeaf}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        minWeightFractionLeaf: parseFloat(e.target.value) || 0.0,
                      })
                    }
                    step={0.01}
                    min={0}
                    max={0.5}
                  />
                  <p className="text-xs text-slate-500">
                    Minimum weighted fraction of samples at leaf (0.0 - 0.5)
                  </p>
                </div>
              </div>

              {/* Imbalanced Data Handling */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="handleImbalanced" className="text-sm font-semibold">
                      Additional Imbalanced Data Handling
                    </Label>
                    <p className="text-xs text-slate-500">
                      Apply sampling techniques before training
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

              {/* Performance Settings */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Performance Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* N Jobs */}
                  <div className="space-y-2">
                    <Label htmlFor="nJobs" className="text-sm">
                      Parallel Jobs (n_jobs)
                    </Label>
                    <Select
                      value={params.nJobs.toString()}
                      onValueChange={(val) =>
                        setParams({ ...params, nJobs: parseInt(val) })
                      }
                    >
                      <SelectTrigger id="nJobs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">All CPUs (-1)</SelectItem>
                        <SelectItem value="1">Single CPU (1)</SelectItem>
                        <SelectItem value="2">2 CPUs</SelectItem>
                        <SelectItem value="4">4 CPUs</SelectItem>
                        <SelectItem value="8">8 CPUs</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      -1 uses all available CPU cores
                    </p>
                  </div>

                  {/* Verbose */}
                  <div className="space-y-2">
                    <Label htmlFor="verbose" className="text-sm">
                      Verbosity Level
                    </Label>
                    <Select
                      value={params.verbose.toString()}
                      onValueChange={(val) =>
                        setParams({ ...params, verbose: parseInt(val) })
                      }
                    >
                      <SelectTrigger id="verbose">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Silent (0)</SelectItem>
                        <SelectItem value="1">Progress (1)</SelectItem>
                        <SelectItem value="2">Detailed (2)</SelectItem>
                        <SelectItem value="3">Debug (3)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Controls training output messages
                    </p>
                  </div>
                </div>

                {/* Warm Start */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="warmStart" className="text-sm font-semibold">
                      Warm Start
                    </Label>
                    <p className="text-xs text-slate-500">
                      Reuse previous solution for incremental learning
                    </p>
                  </div>
                  <Switch
                    id="warmStart"
                    checked={params.warmStart}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, warmStart: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Advanced Configuration Tips:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Use <strong>balanced</strong> class weights for imbalanced datasets</li>
                  <li>• Set <strong>n_jobs=-1</strong> for faster training on multi-core systems</li>
                  <li>• Enable <strong>warm_start</strong> for iterative model improvement</li>
                  <li>• Combine class weights with sampling for extreme imbalance</li>
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
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}