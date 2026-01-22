"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Sliders,
  Target,
  Hash,
  AlertCircle,
} from "lucide-react";

interface ConfigurationProps {
  config: {
    varianceThreshold: number;
    correlationThreshold: number;
    nFeatures: number;
    alpha: number;
    targetColumn: string;
  };
  onConfigChange: (config: any) => void;
  availableColumns?: string[];
  onBack?: () => void;
  onNext?: () => void;
}

const ConfigField = ({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  icon: Icon,
  helpText,
  min,
  max,
}: {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: string;
  step?: string;
  placeholder?: string;
  icon?: any;
  helpText?: string;
  min?: number;
  max?: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-gray-500" />}
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    </div>
    <Input
      type={type}
      step={step}
      value={value}
      onChange={(e) =>
        onChange(type === "number" ? Number(e.target.value) : e.target.value)
      }
      placeholder={placeholder}
      min={min}
      max={max}
      className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
    />
    {helpText && (
      <p className="text-xs text-gray-500 leading-relaxed">{helpText}</p>
    )}
  </div>
);

export default function Configuration({
  config,
  onConfigChange,
  availableColumns = [],
  onBack,
  onNext,
}: ConfigurationProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="border border-gray-300 rounded-xl shadow-sm bg-white overflow-hidden h-fit">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Configuration</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Adjust method parameters
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Basic Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Sliders className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-800">
              Basic Settings
            </h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-semibold text-gray-700">Target Column</Label>
            </div>
            <Select
              value={config.targetColumn || "none"}
              onValueChange={(value) =>
                onConfigChange({ ...config, targetColumn: value === "none" ? "" : value })
              }
            >
              <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all">
                <SelectValue placeholder="Select target column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 leading-relaxed">
              The column you want to predict (for supervised methods)
            </p>
          </div>

          <ConfigField
            label="Number of Features"
            value={config.nFeatures}
            onChange={(value) => onConfigChange({ ...config, nFeatures: value })}
            type="number"
            placeholder="10"
            icon={Hash}
            helpText="Maximum features to select (used by SelectKBest, RFE)"
            min={1}
          />
        </div>

        {/* Advanced Settings Toggle */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all h-10"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 mr-2" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-2" />
            )}
            <span className="font-medium">Advanced Parameters</span>
            {!showAdvanced && (
              <span className="ml-auto text-xs text-gray-500">
                3 parameters
              </span>
            )}
          </Button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  These parameters are method-specific and may not apply to all
                  selection methods
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ConfigField
                label="Variance Threshold"
                value={config.varianceThreshold}
                onChange={(value) =>
                  onConfigChange({ ...config, varianceThreshold: value })
                }
                type="number"
                step="0.01"
                placeholder="0.01"
                helpText="Remove features with variance below this value (0-1)"
                min={0}
                max={1}
              />

              <ConfigField
                label="Correlation Threshold"
                value={config.correlationThreshold}
                onChange={(value) =>
                  onConfigChange({ ...config, correlationThreshold: value })
                }
                type="number"
                step="0.01"
                placeholder="0.95"
                helpText="Remove features with correlation above this value (0-1)"
                min={0}
                max={1}
              />

              <ConfigField
                label="Alpha (Regularization)"
                value={config.alpha}
                onChange={(value) => onConfigChange({ ...config, alpha: value })}
                type="number"
                step="0.01"
                placeholder="0.01"
                helpText="Regularization strength for Lasso/Ridge/Elastic Net"
                min={0}
              />
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 space-y-2">
            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Current Configuration
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded px-2 py-1.5 border border-gray-200">
                <span className="text-gray-500">Features:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {config.nFeatures}
                </span>
              </div>
              <div className="bg-white rounded px-2 py-1.5 border border-gray-200">
                <span className="text-gray-500">Variance:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {config.varianceThreshold}
                </span>
              </div>
              <div className="bg-white rounded px-2 py-1.5 border border-gray-200">
                <span className="text-gray-500">Correlation:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {config.correlationThreshold}
                </span>
              </div>
              <div className="bg-white rounded px-2 py-1.5 border border-gray-200">
                <span className="text-gray-500">Alpha:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {config.alpha}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}