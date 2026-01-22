"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ChevronRight, InfoIcon } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import type { DataCleaningConfig } from "../DataCleaner";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import { dataCleaningData } from "./dataCleaningData";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

// Types
interface ConfigureProps {
  selectedMethods: string[];
  config: DataCleaningConfig;
  onConfigChange: (config: DataCleaningConfig) => void;
  onBack: () => void;
  onNext: () => void;
}

interface StrategyOption {
  id: string;
  title: string;
  description: string;
  value: string;
  configKey: keyof DataCleaningConfig;
  methodId?: string;
}

// Constants
const DEFAULT_CONSTANT_VALUE = "0";
const DEFAULT_CATEGORICAL_VALUE = "Unknown";

// Strategy configurations by method and tab
const STRATEGY_CONFIGS: Record<string, Record<string, StrategyOption[]>> = {
  handling_missing_values: {
    numerical: [
      { id: "mean", title: "Mean Imputation", description: "Fill missing values with column average", value: "mean", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "median", title: "Median Imputation", description: "Fill missing values with column median", value: "median", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "constant", title: "Constant Value", description: "Fill with a fixed number", value: "constant", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "zero", title: "Zero Fill", description: "Fill missing values with zero", value: "zero", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "interpolate", title: "Linear Interpolation", description: "Estimate using linear interpolation", value: "interpolate", configKey: "strategy", methodId: "handling_missing_values" },
    ],
    categorical: [
      { id: "constant_category", title: "Constant Category", description: 'Fill with fixed text (e.g., "Unknown")', value: "constant_category", configKey: "categoricalStrategy", methodId: "handling_missing_values" },
      { id: "most_frequent", title: "Most Frequent", description: "Fill with most common category", value: "most_frequent", configKey: "categoricalStrategy", methodId: "handling_missing_values" },
      { id: "missing_indicator", title: "Missing Indicator", description: 'Create "Missing" indicator', value: "missing_indicator", configKey: "categoricalStrategy", methodId: "handling_missing_values" },
    ],
    common: [
      { id: "mode", title: "Mode Imputation", description: "Fill with most frequent value", value: "mode", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "forward_fill", title: "Forward Fill", description: "Carry forward previous value", value: "forward_fill", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "backward_fill", title: "Backward Fill", description: "Carry backward next value", value: "backward_fill", configKey: "strategy", methodId: "handling_missing_values" },
      { id: "drop", title: "Drop Rows", description: "Remove rows with missing values", value: "drop", configKey: "strategy", methodId: "handling_missing_values" },
    ],
  },
  log_transformer: {
    numerical: [
      { id: "log", title: "Log Transform", description: "Apply log(x) transformation", value: "log", configKey: "logTransformMethod", methodId: "log_transformer" },
      { id: "log1p", title: "Log1p Transform", description: "Apply log(1+x) transformation", value: "log1p", configKey: "logTransformMethod", methodId: "log_transformer" },
    ],
  },
  handling_outliers: {
    numerical: [
      { id: "iqr", title: "IQR Method", description: "Detect outliers using Interquartile Range", value: "iqr", configKey: "outlierMethod", methodId: "handling_outliers" },
    ],
  },
  skewness_fixer: {
    numerical: [
      { id: "log", title: "Log Transform", description: "Fix skewness using log", value: "log", configKey: "skewnessMethod", methodId: "skewness_fixer" },
      { id: "sqrt", title: "Square Root", description: "Fix skewness using sqrt", value: "sqrt", configKey: "skewnessMethod", methodId: "skewness_fixer" },
    ],
  },
  collinearity_remover: {
    numerical: [
      { id: "correlation", title: "Correlation Threshold", description: "Remove highly correlated columns", value: "correlation", configKey: "collinearityMethod", methodId: "collinearity_remover" },
    ],
  },
  noisy_data_smoother: {
    numerical: [
      { id: "moving_average", title: "Moving Average", description: "Smooth using moving average", value: "moving_average", configKey: "noisyDataMethod", methodId: "noisy_data_smoother" },
      { id: "binning", title: "Binning", description: "Reduce noise using binning", value: "binning", configKey: "noisyDataMethod", methodId: "noisy_data_smoother" },
    ],
  },
  standardizing_text: {
    categorical: [
      { id: "lowercase", title: "Lowercase", description: "Convert all text to lowercase", value: "lowercase", configKey: "textNormalizerMethod", methodId: "standardizing_text" },
      { id: "uppercase", title: "Uppercase", description: "Convert all text to UPPERCASE", value: "uppercase", configKey: "textNormalizerMethod", methodId: "standardizing_text" },
    ],
  },
  whitespace_trimmer: {
    categorical: [
      { id: "trim", title: "Trim Whitespace", description: "Remove leading/trailing spaces", value: "trim", configKey: "whitespaceTrimmerMethod", methodId: "whitespace_trimmer" },
      { id: "normalize", title: "Normalize Spaces", description: "Remove extra spaces", value: "normalize", configKey: "whitespaceTrimmerMethod", methodId: "whitespace_trimmer" },
    ],
  },
  imbalance_handler: {
    categorical: [
      { id: "smote", title: "SMOTE", description: "Synthetic Minority Oversampling", value: "smote", configKey: "imbalanceHandlerMethod", methodId: "imbalance_handler" },
      { id: "undersample", title: "Undersampling", description: "Reduce majority class samples", value: "undersample", configKey: "imbalanceHandlerMethod", methodId: "imbalance_handler" },
    ],
  },
  fixing_inconsistent_data: {
    categorical: [
      { id: "standardize", title: "Standardize Format", description: "Apply consistent formatting", value: "standardize", configKey: "consistencyFixerMethod", methodId: "fixing_inconsistent_data" },
    ],
  },
  removing_duplicates: {
    common: [
      { id: "all", title: "Remove All Duplicates", description: "Remove all duplicate records", value: "all", configKey: "duplicateRemoverMethod", methodId: "removing_duplicates" },
    ],
  },
  correcting_data_types: {
    common: [
      { id: "auto", title: "Auto Detect", description: "Automatically detect data types", value: "auto", configKey: "typeCorrectorMethod", methodId: "correcting_data_types" },
    ],
  },
  null_column_dropper: {
    common: [
      { id: "threshold", title: "Threshold Based", description: "Drop columns with >90% nulls", value: "threshold", configKey: "nullColumnDropperMethod", methodId: "null_column_dropper" },
    ],
  },
};

// Strategy Card Component
const StrategyCard = ({ 
  isSelected, 
  onClick, 
  title, 
  description,
  methodId,
  onInfoClick
}: { 
  isSelected: boolean; 
  onClick: () => void; 
  title: string; 
  description: string;
  methodId?: string;
  onInfoClick?: (methodId: string, event: React.MouseEvent) => void;
}) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-lg border-2 transition-all text-left hover:border-blue-400 h-full flex flex-col relative cursor-pointer ${
      isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"
    }`}
  >
    {methodId && onInfoClick && (
      <div className="absolute top-2 right-2 z-10">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-blue-100"
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick(methodId, e);
          }}
        >
          <InfoIcon className="h-4 w-4 text-blue-600" />
        </Button>
      </div>
    )}
    <div className="flex items-start justify-between gap-3 flex-1">
      <div className="flex-1 min-w-0 pr-8">
        <h4 className="font-semibold text-sm text-slate-900 mb-1">{title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

export default function Configure({
  selectedMethods,
  config,
  onConfigChange,
  onBack,
  onNext,
}: ConfigureProps) {
  const [constantValue, setConstantValue] = useState<string>(
    config.constantValue?.toString() || DEFAULT_CONSTANT_VALUE
  );
  const [categoricalConstantValue, setCategoricalConstantValue] = useState<string>(
    config.categoricalConstantValue || DEFAULT_CATEGORICAL_VALUE
  );
  const [activeTab, setActiveTab] = useState<string>("numerical");

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
  } = useMethodTooltip<MethodInfo>(dataCleaningData);

  const handleConfigUpdate = useCallback((updates: Partial<DataCleaningConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
  }, [config, onConfigChange]);

  const handleConstantValueChange = useCallback((value: string) => {
    setConstantValue(value);
    const numValue = Number(value);
    handleConfigUpdate({ 
      constantValue: isNaN(numValue) ? value : numValue 
    });
  }, [handleConfigUpdate]);

  const handleCategoricalConstantValueChange = useCallback((value: string) => {
    setCategoricalConstantValue(value);
    handleConfigUpdate({ categoricalConstantValue: value });
  }, [handleConfigUpdate]);

  const handleStrategySelect = useCallback((strategy: string, configKey: keyof DataCleaningConfig) => {
    handleConfigUpdate({ [configKey]: strategy });
  }, [handleConfigUpdate]);

  // Get strategies for current tab and selected methods
  const strategiesForTab = useMemo(() => {
    const strategies: StrategyOption[] = [];
    
    selectedMethods.forEach(method => {
      const methodStrategies = STRATEGY_CONFIGS[method]?.[activeTab];
      if (methodStrategies) {
        strategies.push(...methodStrategies);
      }
    });
    
    return strategies;
  }, [selectedMethods, activeTab]);

  // Check if constant input should be shown
  const showConstantInput = useMemo(() => {
    return config.strategy === "constant" || 
           config.categoricalStrategy === "constant_category" || 
           config.categoricalStrategy === "missing_indicator";
  }, [config.strategy, config.categoricalStrategy]);

  // Render tab content
  const renderTabContent = useCallback((tabName: string, description: string) => {
    const strategies = selectedMethods.flatMap(method => 
      STRATEGY_CONFIGS[method]?.[tabName] || []
    );

    if (strategies.length === 0) {
      return (
        <div className="text-center py-8 text-slate-500">
          No strategies available for selected methods in this category
        </div>
      );
    }

    return (
      <>
        <div>
          <Label className="text-base font-semibold text-slate-900 mb-1 block">
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Strategies
          </Label>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 items-stretch">
          {strategies.map((strategy) => {
            const configValue = config[strategy.configKey];
            const isSelected = configValue === strategy.value;
            
            return (
              <StrategyCard
                key={strategy.id}
                isSelected={isSelected}
                onClick={() => handleStrategySelect(strategy.value, strategy.configKey)}
                title={strategy.title}
                description={strategy.description}
                methodId={strategy.methodId}
                onInfoClick={handleOpenTooltip}
              />
            );
          })}
        </div>

        {/* Constant value inputs */}
        {tabName === "numerical" && config.strategy === "constant" && (
          <div className="pt-2">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Constant Value
            </Label>
            <Input
              type="number"
              value={constantValue}
              onChange={(e) => handleConstantValueChange(e.target.value)}
              placeholder="Enter constant value (e.g., 0)"
              className="max-w-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              This value will be used to fill all missing numerical entries
            </p>
          </div>
        )}

        {tabName === "categorical" && (config.categoricalStrategy === "constant_category" || 
                                        config.categoricalStrategy === "missing_indicator") && (
          <div className="pt-2">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              {config.categoricalStrategy === "constant_category" 
                ? "Fixed Category Value" 
                : "Missing Indicator Label"}
            </Label>
            <Input
              type="text"
              value={categoricalConstantValue}
              onChange={(e) => handleCategoricalConstantValueChange(e.target.value)}
              placeholder={config.categoricalStrategy === "constant_category"
                ? "Enter category (e.g., Unknown, N/A)"
                : "Enter label (e.g., Missing, NA)"}
              className="max-w-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              This text will be used to fill missing categorical values
            </p>
          </div>
        )}
      </>
    );
  }, [selectedMethods, config, constantValue, categoricalConstantValue, handleStrategySelect, handleConstantValueChange, handleCategoricalConstantValueChange, handleOpenTooltip]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Configure Methods</h2>
          <p className="text-slate-600 mt-1">Set parameters for selected cleaning methods</p>
        </div>

        {selectedMethods.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Methods Selected</h3>
            <p className="text-slate-500">Go back and select cleaning methods first</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="numerical">Numerical</TabsTrigger>
              <TabsTrigger value="categorical">Categorical</TabsTrigger>
              <TabsTrigger value="common">Common</TabsTrigger>
            </TabsList>

            <TabsContent value="numerical" className="space-y-6">
              {renderTabContent("numerical", "Choose strategies for numerical data preprocessing")}
            </TabsContent>

            <TabsContent value="categorical" className="space-y-6">
              {renderTabContent("categorical", "Choose strategies for categorical/text data preprocessing")}
            </TabsContent>

            <TabsContent value="common" className="space-y-6">
              {renderTabContent("common", "Strategies applicable to both numerical and categorical data")}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ChevronRight className="h-5 w-5 rotate-180" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Review & Execute
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <MethodTooltipDialog
        open={tooltipOpen}
        onOpenChange={handleCloseTooltip}
        methodId={selectedMethodForTooltip}
        getCategoryColor={getCategoryColor}
        getImpactColor={getImpactColor}
        getMethodInfo={getMethodInfo}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        showFormula={false}
        showIcon={false}
      />
    </div>
  );
}