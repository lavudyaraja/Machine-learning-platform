"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Info, ArrowRight, Brain, Split, BookOpen, CheckCircle2, 
  AlertCircle, Layers, Target, TrendingUp, Settings, BarChart3, 
  Play, Loader2, Database
} from "lucide-react";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import { datasetSplittingData } from "./datasetSplittingData";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { toast } from "sonner";
import Link from "next/link";

export interface DatasetSplittingConfig {
  method: "train_test" | "train_val" | "train_val_test" | "stratified";
  trainSize?: number;
  validationSize?: number;
  testSize?: number;
  randomState?: number;
  shuffle?: boolean;
  stratifyColumn?: string;
}

interface DatasetSplitterProps {
  datasetId?: string;
  targetColumn?: string;
  onConfigChange?: (config: DatasetSplittingConfig) => void;
  initialConfig?: DatasetSplittingConfig;
  onProcessedDatasetReady?: (trainDatasetId: string, trainData: {
    columns: string[];
    rows: unknown[][];
    totalRows: number;
  }) => void;
}

interface SplitResult {
  trainData: unknown[][];
  validationData?: unknown[][];
  testData: unknown[][];
  trainSize: number;
  validationSize?: number;
  testSize: number;
  totalRows: number;
  columns: string[];
}

export default function DatasetSplitter({
  datasetId,
  targetColumn,
  onConfigChange,
  initialConfig,
  onProcessedDatasetReady,
}: DatasetSplitterProps) {
  const [config, setConfig] = useState<DatasetSplittingConfig>(
    initialConfig || {
      method: "train_val_test",
      trainSize: 0.7,
      validationSize: 0.15,
      testSize: 0.15,
      randomState: 42,
      shuffle: true,
      stratifyColumn: targetColumn,
    }
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSplitType, setSelectedSplitType] = useState<"train_test" | "train_val" | "train_val_test" | "stratified">("train_val_test");

  const handleMethodChange = (method: "train_test" | "train_val" | "train_val_test" | "stratified") => {
    setSelectedSplitType(method);
    let newConfig = { ...config, method };
    
    // Auto-adjust sizes based on split type
    if (method === "train_test") {
      newConfig = { ...newConfig, trainSize: 0.7, validationSize: 0, testSize: 0.3 };
    } else if (method === "train_val") {
      newConfig = { ...newConfig, trainSize: 0.8, validationSize: 0.2, testSize: 0 };
    } else if (method === "train_val_test") {
      newConfig = { ...newConfig, trainSize: 0.7, validationSize: 0.15, testSize: 0.15 };
    } else if (method === "stratified") {
      newConfig = { ...newConfig, trainSize: 0.7, validationSize: 0.15, testSize: 0.15, stratifyColumn: targetColumn };
    }
    
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleSizeChange = (field: "trainSize" | "validationSize" | "testSize", value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      const newConfig = { ...config, [field]: numValue };
      setConfig(newConfig);
      onConfigChange?.(newConfig);
    }
  };

  const handleRandomStateChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const newConfig = { ...config, randomState: numValue };
      setConfig(newConfig);
      onConfigChange?.(newConfig);
    }
  };

  const handleShuffleChange = (checked: boolean) => {
    const newConfig = { ...config, shuffle: checked };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleExecute = async () => {
    if (!datasetId) {
      toast.error("No dataset available");
      return;
    }

    const totalSize = (config.trainSize || 0) + (config.validationSize || 0) + (config.testSize || 0);
    if (totalSize < 0.99 || totalSize > 1.01) {
      toast.error("Split sizes must sum to 1.0");
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Map frontend method names to backend method names
      const methodMapping: Record<string, string> = {
        'train_test': 'random',
        'train_val': 'random',
        'train_val_test': 'random',
        'stratified': 'stratified',
      };

      const backendMethod = methodMapping[config.method] || config.method;

      // Calculate test size and validation size based on split type
      let testSize = config.testSize || 0.3;
      let validationSize = config.validationSize || 0;

      if (config.method === "train_test") {
        testSize = config.testSize || 0.3;
        validationSize = 0;
      } else if (config.method === "train_val") {
        testSize = 0;
        validationSize = config.validationSize || 0.2;
      } else if (config.method === "train_val_test") {
        testSize = config.testSize || 0.15;
        validationSize = config.validationSize || 0.15;
      } else if (config.method === "stratified") {
        testSize = config.testSize || 0.15;
        validationSize = config.validationSize || 0.15;
      }

      // Prepare request config
      const splittingConfig: any = {
        method: backendMethod,
        testSize: testSize,
        validationSize: validationSize > 0 ? validationSize : undefined,
        randomState: config.randomState || 42,
        shuffle: config.shuffle !== false,
      };

      // Add method-specific parameters
      if (config.method === "stratified" && config.stratifyColumn) {
        splittingConfig.stratifyColumn = config.stratifyColumn;
      } else if (config.method === "stratified" && targetColumn) {
        splittingConfig.stratifyColumn = targetColumn;
      }

      // Call API
      const response: any = await api.post(API_ENDPOINTS.preprocessing.datasetSplitting, {
        dataset_id: datasetId,
        method: splittingConfig.method,
        test_size: splittingConfig.testSize,
        validation_size: splittingConfig.validationSize,
        random_state: splittingConfig.randomState,
        shuffle: splittingConfig.shuffle,
        stratify_column: splittingConfig.stratifyColumn,
      });

      if (!response.success) {
        const errorMsg = response.error || response.message || "Dataset splitting failed";
        throw new Error(errorMsg);
      }

      // Process response
      const splits = response.processedData?.splits || [];
      const metrics = response.metrics || {};

      // Find train, validation, and test splits
      const trainSplit = splits.find((s: any) => s.splitType === 'train');
      const validationSplit = splits.find((s: any) => s.splitType === 'validation');
      const testSplit = splits.find((s: any) => s.splitType === 'test');

      // Validate that we have at least train and test splits
      if (!trainSplit) {
        throw new Error("Invalid response: missing train split. Response: " + JSON.stringify(response, null, 2));
      }
      
      // For train_val split, test might not exist
      if (!testSplit && config.method !== 'train_val') {
        throw new Error("Invalid response: missing test split. Response: " + JSON.stringify(response, null, 2));
      }

      setSplitResult({
        trainData: trainSplit.data?.rows || [],
        validationData: validationSplit?.data?.rows || [],
        testData: testSplit?.data?.rows || [],
        trainSize: metrics.trainRows || trainSplit.data?.totalRows || 0,
        validationSize: metrics.validationRows || validationSplit?.data?.totalRows || 0,
        testSize: metrics.testRows || testSplit?.data?.totalRows || 0,
        totalRows: metrics.originalRows || 0,
        columns: trainSplit.data?.columns || [],
      });

      toast.success(response.message || "Dataset split successfully!");

      // Notify parent component about train split dataset (for training)
      if (trainSplit?.datasetId && trainSplit?.data && onProcessedDatasetReady) {
        onProcessedDatasetReady(trainSplit.datasetId, {
          columns: trainSplit.data.columns || [],
          rows: trainSplit.data.rows || [],
          totalRows: trainSplit.data.totalRows || 0,
        });
        console.log(`[DatasetSplitter] Train split dataset ID: ${trainSplit.datasetId} ready for training`);
      }

    } catch (err: any) {
      console.error("Error splitting dataset:", err);
      const errorMessage = err?.message || err?.error || "Failed to split dataset. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const totalSize = (config.trainSize || 0) + (config.validationSize || 0) + (config.testSize || 0);
  const isValidSplit = totalSize <= 1.01 && totalSize >= 0.99;

  const {
    tooltipOpen,
    selectedMethodForTooltip,
    copiedCode: tooltipCopiedCode,
    handleOpenTooltip,
    handleCloseTooltip,
    handleCopyCode: handleTooltipCopyCode,
    getCategoryColor,
    getImpactColor,
    getMethodInfo,
  } = useMethodTooltip<MethodInfo>(datasetSplittingData);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Split className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dataset Splitting</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Divide your data into training, validation, and test sets for model development
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Educational Overview */}
      <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Understanding Dataset Splitting</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 bg-white rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900">🎯 Training Set</h4>
            </div>
            <p className="text-sm text-slate-600">
              Used to train your model. The model learns patterns and relationships from this data.
              Typically 60-80% of total data.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900">📊 Validation Set</h4>
            </div>
            <p className="text-sm text-slate-600">
              Used to tune hyperparameters and prevent overfitting during training.
              Typically 10-20% of total data.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-900">✅ Test Set</h4>
            </div>
            <p className="text-sm text-slate-600">
              Used only once to evaluate final model performance. Simulates real-world data.
              Typically 10-20% of total data.
            </p>
          </div>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Why Split Data?</h4>
              <p className="text-sm text-amber-700">
                Splitting prevents <strong>overfitting</strong> by ensuring your model's performance is evaluated on 
                unseen data, giving you a realistic estimate of how it will perform in production.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Step 1: Split Strategy */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Layers className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Step 1: Choose Split Strategy</h2>
                <p className="text-sm text-slate-500">Select the splitting method based on your dataset and task</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {/* Train-Test Split */}
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedSplitType === "train_test"
                  ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-400 ring-offset-2"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
              }`}
              onClick={() => handleMethodChange("train_test")}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Split className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900">Train–Test Split</h4>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">Simple</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Two-way: Training (70%) + Test (30%)
                  </p>
                </div>
                {selectedSplitType === "train_test" && (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>

            {/* Train-Val Split */}
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedSplitType === "train_val"
                  ? "bg-purple-50/50 border-purple-200 ring-2 ring-purple-400 ring-offset-2"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
              }`}
              onClick={() => handleMethodChange("train_val")}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Layers className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900">Train–Validation Split</h4>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">Tuning</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Two-way: Training (80%) + Validation (20%)
                  </p>
                </div>
                {selectedSplitType === "train_val" && (
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                )}
              </div>
            </div>

            {/* Train-Val-Test Split */}
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedSplitType === "train_val_test"
                  ? "bg-green-50/50 border-green-200 ring-2 ring-green-400 ring-offset-2"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
              }`}
              onClick={() => handleMethodChange("train_val_test")}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900">Train–Validation–Test Split</h4>
                    <span className="text-xs font-medium text-white bg-green-600 px-2 py-0.5 rounded-lg">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Three-way: Train (70%) + Val (15%) + Test (15%)
                  </p>
                </div>
                {selectedSplitType === "train_val_test" && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>

            {/* Stratified Split */}
            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedSplitType === "stratified"
                  ? "bg-orange-50/50 border-orange-200 ring-2 ring-orange-400 ring-offset-2"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
              }`}
              onClick={() => handleMethodChange("stratified")}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900">Stratified Split</h4>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">Classification</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Maintains class distribution across splits
                  </p>
                </div>
                {selectedSplitType === "stratified" && (
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Configure Splits */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Settings className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Step 2: Configure Split Sizes</h2>
                <p className="text-sm text-slate-500">Adjust proportions (values between 0 and 1, must sum to 1.0)</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-6">
            {/* Split Size Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="train-size" className="text-sm font-medium text-slate-700">Training Set</Label>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{((config.trainSize || 0) * 100).toFixed(0)}%</span>
                </div>
                <Input
                  id="train-size"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.trainSize || 0.7}
                  onChange={(e) => handleSizeChange("trainSize", e.target.value)}
                  className="font-mono rounded-xl border-slate-200"
                />
              </div>

              {selectedSplitType !== "train_test" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validation-size" className="text-sm font-medium text-slate-700">Validation Set</Label>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{((config.validationSize || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <Input
                    id="validation-size"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.validationSize || 0.15}
                    onChange={(e) => handleSizeChange("validationSize", e.target.value)}
                    className="font-mono rounded-xl border-slate-200"
                  />
                </div>
              )}

              {(selectedSplitType === "train_test" || selectedSplitType === "train_val_test" || selectedSplitType === "stratified") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="test-size" className="text-sm font-medium text-slate-700">Test Set</Label>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{((config.testSize || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <Input
                    id="test-size"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.testSize || 0.15}
                    onChange={(e) => handleSizeChange("testSize", e.target.value)}
                    className="font-mono rounded-xl border-slate-200"
                  />
                </div>
              )}
            </div>

            {!isValidSplit && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">
                    Split sizes must sum to 1.0. Current sum: {totalSize.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="h-px bg-slate-100" />

            {/* Advanced Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="random-state" className="text-sm font-medium text-slate-700">Random State</Label>
                <Input
                  id="random-state"
                  type="number"
                  value={config.randomState || 42}
                  onChange={(e) => handleRandomStateChange(e.target.value)}
                  className="font-mono rounded-xl border-slate-200"
                />
                <p className="text-xs text-slate-500">
                  Seed for reproducibility (same seed = same split)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffle"
                  checked={config.shuffle !== false}
                  onCheckedChange={handleShuffleChange}
                />
                <Label htmlFor="shuffle" className="text-sm font-normal text-slate-600 cursor-pointer">
                  Shuffle data before splitting
                </Label>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={!isValidSplit || isExecuting || !datasetId}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Executing Split...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Execute Split
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {splitResult && (
        <div className="bg-white rounded-2xl border-2 border-green-200">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-t-2xl border-b border-green-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-900">
                  Dataset Split Successfully!
                </h2>
                <p className="text-sm text-green-700 mt-1">
                  Your dataset has been divided into training, validation, and test sets
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {splitResult.totalRows.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Total Rows</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {splitResult.trainSize.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      Training ({((splitResult.trainSize / splitResult.totalRows) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>

              {splitResult.validationSize !== undefined && splitResult.validationSize > 0 && (
                <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {splitResult.validationSize.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Validation ({((splitResult.validationSize / splitResult.totalRows) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {splitResult.testSize.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      Test ({((splitResult.testSize / splitResult.totalRows) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Summary Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Split Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-600">Dataset</TableHead>
                      <TableHead className="text-right text-slate-600">Rows</TableHead>
                      <TableHead className="text-right text-slate-600">Percentage</TableHead>
                      <TableHead className="text-right text-slate-600">Columns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Training Set</TableCell>
                      <TableCell className="text-right font-mono text-slate-700">{splitResult.trainSize.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {((splitResult.trainSize / splitResult.totalRows) * 100).toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-700">{splitResult.columns.length}</TableCell>
                    </TableRow>
                    {splitResult.validationSize !== undefined && splitResult.validationSize > 0 && (
                      <TableRow>
                        <TableCell className="font-medium text-slate-900">Validation Set</TableCell>
                        <TableCell className="text-right font-mono text-slate-700">{splitResult.validationSize.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            {((splitResult.validationSize / splitResult.totalRows) * 100).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-700">{splitResult.columns.length}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Test Set</TableCell>
                      <TableCell className="text-right font-mono text-slate-700">{splitResult.testSize.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {((splitResult.testSize / splitResult.totalRows) * 100).toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-700">{splitResult.columns.length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Configuration Used */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Configuration Used</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">Method: {config.method.replace(/_/g, "-")}</span>
                    <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">Random State: {config.randomState}</span>
                    <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">Shuffle: {config.shuffle ? "Yes" : "No"}</span>
                    {config.method === "stratified" && config.stratifyColumn && (
                      <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">Stratify: {config.stratifyColumn}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Step: Model Selection */}
            {datasetId && (
              <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-3xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Ready for Model Selection</h3>
                      <p className="text-sm text-slate-500">
                        Continue to select and configure your machine learning models
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/datasets/${datasetId}/deployment?step=model-selection`}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                    Go to Model Selection
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Method Tooltip Dialog */}
      <MethodTooltipDialog
        open={tooltipOpen}
        onOpenChange={handleCloseTooltip}
        methodId={selectedMethodForTooltip}
        getCategoryColor={getCategoryColor}
        getImpactColor={getImpactColor}
        getMethodInfo={getMethodInfo}
        copiedCode={tooltipCopiedCode}
        onCopyCode={handleTooltipCopyCode}
        showFormula={true}
        showIcon={true}
        impactLabel="Impact"
      />
      </div>
    </div>
  );
}
