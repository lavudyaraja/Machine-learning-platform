"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, ChevronRight, Info as InfoIcon, Sliders } from "lucide-react";
import { useState } from "react";
import type { FeatureScalingConfig } from "../FeatureScaler";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import { scalingData } from "../data/scalingData";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

interface ConfigureProps {
  selectedMethods: string[];
  config: FeatureScalingConfig;
  onConfigChange: (config: FeatureScalingConfig) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Configure({
  selectedMethods,
  config,
  onConfigChange,
  onBack,
  onNext,
}: ConfigureProps) {
  const [withMean, setWithMean] = useState<boolean>(config.withMean !== false);
  const [withStd, setWithStd] = useState<boolean>(config.withStd !== false);
  const [minRange, setMinRange] = useState<string>((config.featureRange?.[0] ?? 0).toString());
  const [maxRange, setMaxRange] = useState<string>((config.featureRange?.[1] ?? 1).toString());
  const [clip, setClip] = useState<boolean>(config.clip ?? false);

  const {
    tooltipOpen,
    selectedMethodForTooltip,
    copiedCode,
    handleOpenTooltip,
    handleCloseTooltip,
    handleCopyCode,
    getCategoryColor,
    getImpactColor,
    getMethodInfo,
  } = useMethodTooltip<MethodInfo>(scalingData);

  const handleConfigUpdate = (updates: Partial<FeatureScalingConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
  };

  const handleWithMeanChange = (checked: boolean) => {
    setWithMean(checked);
    handleConfigUpdate({ withMean: checked });
  };

  const handleWithStdChange = (checked: boolean) => {
    setWithStd(checked);
    handleConfigUpdate({ withStd: checked });
  };

  const handleRangeChange = (type: "min" | "max", value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    if (type === "min") {
      setMinRange(value);
      handleConfigUpdate({ featureRange: [numValue, Number(maxRange) || 1] });
    } else {
      setMaxRange(value);
      handleConfigUpdate({ featureRange: [Number(minRange) || 0, numValue] });
    }
  };

  const handleClipChange = (checked: boolean) => {
    setClip(checked);
    handleConfigUpdate({ clip: checked });
  };

  return (
    <div className="space-y-6">
      {/* Configure Card */}
      <div className="bg-white rounded-2xl border border-slate-200 hover:border-cyan-200 transition-colors shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 border border-cyan-100 rounded-xl">
              <Sliders className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Configure Scaling Methods</h2>
              <p className="text-sm text-slate-600">Set parameters for selected scaling methods</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {selectedMethods.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No Methods Selected</h3>
              <p className="text-sm text-slate-500">Go back and select scaling methods first</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Standardization Configuration */}
              {selectedMethods.includes("standard") && (
                <div className="rounded-xl border-2 border-cyan-100 hover:border-cyan-200 transition-colors overflow-hidden bg-white shadow-sm">
                  <div className="p-4 bg-cyan-50/30 border-b border-cyan-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-bold text-cyan-900 block">
                          Standardization (Z-score Scaling)
                        </Label>
                        <p className="text-sm text-cyan-700 mt-0.5 font-medium">
                          Formula: z = (x - μ) / σ
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-cyan-100 transition-colors"
                        onClick={(e) => handleOpenTooltip("standard", e)}
                      >
                        <InfoIcon className="h-4 w-4 text-cyan-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 bg-white">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border-2 border-slate-200 hover:border-cyan-200 hover:bg-cyan-50/20 transition-all cursor-pointer">
                      <Checkbox
                        id="withMean"
                        checked={withMean}
                        onCheckedChange={handleWithMeanChange}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="withMean" className="text-sm font-semibold text-slate-900 cursor-pointer block">
                          Center to Zero (with_mean)
                        </Label>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Subtract the mean from each feature
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border-2 border-slate-200 hover:border-cyan-200 hover:bg-cyan-50/20 transition-all cursor-pointer">
                      <Checkbox
                        id="withStd"
                        checked={withStd}
                        onCheckedChange={handleWithStdChange}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="withStd" className="text-sm font-semibold text-slate-900 cursor-pointer block">
                          Scale to Unit Variance (with_std)
                        </Label>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Divide by standard deviation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Min-Max Scaling Configuration */}
              {selectedMethods.includes("minmax") && (
                <div className="rounded-xl border-2 border-indigo-100 hover:border-indigo-200 transition-colors overflow-hidden bg-white shadow-sm">
                  <div className="p-4 bg-indigo-50/30 border-b border-indigo-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-bold text-indigo-900 block">
                          Min-Max Scaling (Normalization)
                        </Label>
                        <p className="text-sm text-indigo-700 mt-0.5 font-medium">
                          Formula: X_scaled = (X - X_min) / (X_max - X_min)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-indigo-100 transition-colors"
                        onClick={(e) => handleOpenTooltip("minmax", e)}
                      >
                        <InfoIcon className="h-4 w-4 text-indigo-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4 bg-white">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                        Feature Range
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minRange" className="text-xs text-slate-600 mb-1.5 block font-medium">
                            Minimum Value
                          </Label>
                          <Input
                            id="minRange"
                            type="number"
                            value={minRange}
                            onChange={(e) => handleRangeChange("min", e.target.value)}
                            placeholder="0"
                            className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-400 hover:border-slate-300 transition-colors"
                            step="0.1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="maxRange" className="text-xs text-slate-600 mb-1.5 block font-medium">
                            Maximum Value
                          </Label>
                          <Input
                            id="maxRange"
                            type="number"
                            value={maxRange}
                            onChange={(e) => handleRangeChange("max", e.target.value)}
                            placeholder="1"
                            className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-400 hover:border-slate-300 transition-colors"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer">
                      <Checkbox
                        id="clip"
                        checked={clip}
                        onCheckedChange={handleClipChange}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="clip" className="text-sm font-semibold text-slate-900 cursor-pointer block">
                          Clip Values to Range
                        </Label>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Values outside the range will be set to min or max
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MaxAbs Scaling */}
              {selectedMethods.includes("maxabs") && (
                <div className="rounded-xl border-2 border-amber-100 hover:border-amber-200 transition-colors overflow-hidden bg-white shadow-sm">
                  <div className="p-4 bg-amber-50/30 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-bold text-amber-900 block">
                          MaxAbs Scaling
                        </Label>
                        <p className="text-sm text-amber-700 mt-0.5 font-medium">
                          Formula: X_scaled = X / max(|X|)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-100 transition-colors"
                        onClick={(e) => handleOpenTooltip("maxabs", e)}
                      >
                        <InfoIcon className="h-4 w-4 text-amber-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-slate-600">
                      No additional parameters required. Preserves sparsity and sign of original values.
                    </p>
                  </div>
                </div>
              )}

              {/* L1 Normalization */}
              {selectedMethods.includes("l1") && (
                <div className="rounded-xl border-2 border-violet-100 hover:border-violet-200 transition-colors overflow-hidden bg-white shadow-sm">
                  <div className="p-4 bg-violet-50/30 border-b border-violet-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-bold text-violet-900 block">
                          L1 Normalization
                        </Label>
                        <p className="text-sm text-violet-700 mt-0.5 font-medium">
                          Formula: X_normalized = X / sum(|X|)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-violet-100 transition-colors"
                        onClick={(e) => handleOpenTooltip("l1", e)}
                      >
                        <InfoIcon className="h-4 w-4 text-violet-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-slate-600">
                      No additional parameters required. Normalizes each sample so that the sum of absolute values equals 1.
                    </p>
                  </div>
                </div>
              )}

              {/* L2 Normalization */}
              {selectedMethods.includes("l2") && (
                <div className="rounded-xl border-2 border-rose-100 hover:border-rose-200 transition-colors overflow-hidden bg-white shadow-sm">
                  <div className="p-4 bg-rose-50/30 border-b border-rose-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-bold text-rose-900 block">
                          L2 Normalization
                        </Label>
                        <p className="text-sm text-rose-700 mt-0.5 font-medium">
                          Formula: X_normalized = X / sqrt(sum(X²))
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-rose-100 transition-colors"
                        onClick={(e) => handleOpenTooltip("l2", e)}
                      >
                        <InfoIcon className="h-4 w-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-slate-600">
                      No additional parameters required. Normalizes each sample so that the Euclidean length equals 1.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          Review & Execute
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Method Tooltip Dialog */}
      <MethodTooltipDialog
        open={tooltipOpen}
        onOpenChange={handleCloseTooltip}
        methodId={selectedMethodForTooltip}
        getCategoryColor={getCategoryColor}
        getImpactColor={getImpactColor}
        getMethodInfo={getMethodInfo}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        showFormula={true}
        showIcon={false}
      />
    </div>
  );
}

