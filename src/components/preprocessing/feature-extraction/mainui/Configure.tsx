"use client";

import { Settings, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PCAComponent from "../pca/PCAComponent";
import LDAComponent from "../lda/LDAComponent";
import ICAComponent from "../ica/ICAComponent";
import SVDComponent from "../svd/SVDComponent";
import FactorAnalysisComponent from "../factor-analysis/FactorAnalysisComponent";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

interface ConfigureProps {
  selectedMethods: string[];
  config: FeatureExtractionConfig;
  onConfigChange: (config: FeatureExtractionConfig) => void;
  availableColumns?: string[];
  targetColumn?: string;
}

export default function Configure({
  selectedMethods,
  config,
  onConfigChange,
  availableColumns = [],
  targetColumn,
}: ConfigureProps) {
  const handleConfigUpdate = (updates: Partial<FeatureExtractionConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Configure Extraction Parameters</h2>
        <p className="text-slate-500">
          Fine-tune the parameters for your selected extraction methods
        </p>
      </div>

      {/* Global Configuration */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-xl">
            <Settings className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Global Settings</h3>
            <p className="text-sm text-slate-500">Common parameters for all methods</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nComponents" className="text-sm font-medium text-slate-700">
              Number of Components
            </Label>
            <Input
              id="nComponents"
              type="number"
              min="1"
              max="50"
              value={config.nComponents || 2}
              onChange={(e) => handleConfigUpdate({ nComponents: parseInt(e.target.value) || 2 })}
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500">Number of components to extract (2-50)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="randomState" className="text-sm font-medium text-slate-700">
              Random State
            </Label>
            <Input
              id="randomState"
              type="number"
              value={config.randomState || 42}
              onChange={(e) => handleConfigUpdate({ randomState: parseInt(e.target.value) || 42 })}
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500">Seed for reproducibility</p>
          </div>
        </div>
      </div>

      {/* Method-Specific Configuration */}
      <div className="space-y-6">
        {selectedMethods.includes("pca") && (
          <PCAComponent
            config={config}
            onConfigChange={(updates) => handleConfigUpdate(updates)}
          />
        )}

        {selectedMethods.includes("lda") && (
          <LDAComponent
            config={config}
            targetColumn={targetColumn}
            columns={availableColumns}
            onConfigChange={(updates) => handleConfigUpdate(updates)}
          />
        )}

        {selectedMethods.includes("ica") && (
          <ICAComponent
            config={config}
            onConfigChange={(updates) => handleConfigUpdate(updates)}
          />
        )}

        {selectedMethods.includes("svd") && (
          <SVDComponent
            config={config}
            onConfigChange={(updates) => handleConfigUpdate(updates)}
          />
        )}

        {selectedMethods.includes("factor_analysis") && (
          <FactorAnalysisComponent
            config={config}
            onConfigChange={(updates) => handleConfigUpdate(updates)}
          />
        )}
      </div>

      {/* No Methods Selected */}
      {selectedMethods.length === 0 && (
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <Settings className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Methods Selected</h3>
          <p className="text-slate-600">
            Please go back and select at least one extraction method to configure.
          </p>
        </div>
      )}

    </div>
  );
}
