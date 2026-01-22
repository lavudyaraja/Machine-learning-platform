"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  RefreshCw,
  Layers,
  HelpCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog, { MethodInfo } from "@/components/common/MethodTooltipDialog";
import { featureSelectionData } from "../data/featureSelectionData";

interface MethodSelectionProps {
  selectedMethods: string[];
  onMethodToggle: (method: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  columns: string[];
  onNext?: () => void;
}

const filterMethods = [
  {
    value: "variance_threshold",
    label: "Variance Threshold",
    description: "Remove low variance features",
    category: "filter",
    icon: BarChart3,
  },
  {
    value: "correlation",
    label: "Correlation Filter",
    description: "Remove highly correlated features",
    category: "filter",
    icon: BarChart3,
  },
  {
    value: "chi_square",
    label: "Chi-Square Test",
    description: "Statistical independence test",
    category: "filter",
    icon: BarChart3,
  },
];

const wrapperMethods = [
  {
    value: "forward_selection",
    label: "Forward Selection",
    description: "Iteratively add best features",
    category: "wrapper",
    icon: RefreshCw,
  },
  {
    value: "backward_elimination",
    label: "Backward Elimination",
    description: "Iteratively remove worst features",
    category: "wrapper",
    icon: RefreshCw,
  },
  {
    value: "rfe",
    label: "RFE",
    description: "Recursive feature elimination",
    category: "wrapper",
    icon: RefreshCw,
  },
];

const embeddedMethods = [
  {
    value: "lasso",
    label: "Lasso (L1)",
    description: "L1 regularization",
    category: "embedded",
    icon: Layers,
  },
  {
    value: "ridge",
    label: "Ridge (L2)",
    description: "L2 regularization",
    category: "embedded",
    icon: Layers,
  },
  {
    value: "elastic_net",
    label: "Elastic Net",
    description: "L1 + L2 regularization",
    category: "embedded",
    icon: Layers,
  },
];

const MethodCard = ({ 
  method, 
  accentColor,
  isSelected,
  onToggle,
  onShowTooltip,
}: { 
  method: any; 
  accentColor: string;
  isSelected: boolean;
  onToggle: () => void;
  onShowTooltip: (e: any) => void;
}) => {
  const Icon = method.icon;

  return (
    <div
      className={`relative group rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? `border-blue-600 bg-blue-50 shadow-md ${accentColor}`
          : "border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm"
      }`}
      onClick={onToggle}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 shadow-lg z-10 ring-2 ring-white">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
              isSelected
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100"
            }`}
          >
            <Icon
              className={`h-5 w-5 transition-colors ${
                isSelected ? "text-blue-600" : "text-slate-600 group-hover:text-blue-600"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={`font-semibold text-sm leading-tight transition-colors ${
                  isSelected ? "text-slate-900" : "text-slate-800 group-hover:text-slate-900"
                }`}
              >
                {method.label}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 flex-shrink-0 transition-colors ${
                  isSelected
                    ? "hover:bg-blue-100"
                    : "hover:bg-slate-100"
                }`}
                onClick={onShowTooltip}
              >
                <HelpCircle
                  className={`h-4 w-4 transition-colors ${
                    isSelected ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"
                  }`}
                />
              </Button>
            </div>
            <p
              className={`text-xs leading-relaxed transition-colors ${
                isSelected ? "text-slate-700" : "text-slate-600 group-hover:text-slate-700"
              }`}
            >
              {method.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MethodSelection({
  selectedMethods,
  onMethodToggle,
  onExecute,
  isExecuting,
  columns,
  onNext,
}: MethodSelectionProps) {
  const [selectedTab, setSelectedTab] = useState("filter");

  const methodTooltipData: MethodInfo[] = featureSelectionData.map((method) => ({
    id: method.id,
    title: method.label,
    category: method.category.toLowerCase(),
    impact: method.impact,
    definition: method.definition,
    concept: method.concept,
    usedFor: method.useCases ? method.useCases.join(", ") : "",
    implementationInsight: method.implementationInsight,
    effect: method.effect,
    formula: method.formula,
  }));

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
  } = useMethodTooltip(methodTooltipData);

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Selection Methods</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {selectedMethods.length} method{selectedMethods.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {columns.length} features
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 mb-5 grid grid-cols-3 gap-1 rounded-lg">
            <TabsTrigger
              value="filter"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-sm font-medium transition-all data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-blue-600"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Filter
            </TabsTrigger>
            <TabsTrigger
              value="wrapper"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-sm font-medium transition-all data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-blue-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Wrapper
            </TabsTrigger>
            <TabsTrigger
              value="embedded"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-sm font-medium transition-all data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-blue-600"
            >
              <Layers className="h-4 w-4 mr-2" />
              Embedded
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filter" className="mt-0">
            <div className="grid grid-cols-3 gap-4">
              {filterMethods.map((method) => (
                <MethodCard
                  key={method.value}
                  method={method}
                  accentColor=""
                  isSelected={selectedMethods.includes(method.value)}
                  onToggle={() => onMethodToggle(method.value)}
                  onShowTooltip={(e) => handleOpenTooltip(method.value, e)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wrapper" className="mt-0 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Wrapper methods are computationally intensive for large datasets but
                  provide high accuracy
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {wrapperMethods.map((method) => (
                <MethodCard
                  key={method.value}
                  method={method}
                  accentColor=""
                  isSelected={selectedMethods.includes(method.value)}
                  onToggle={() => onMethodToggle(method.value)}
                  onShowTooltip={(e) => handleOpenTooltip(method.value, e)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="embedded" className="mt-0">
            <div className="grid grid-cols-3 gap-4">
              {embeddedMethods.map((method) => (
                <MethodCard
                  key={method.value}
                  method={method}
                  accentColor=""
                  isSelected={selectedMethods.includes(method.value)}
                  onToggle={() => onMethodToggle(method.value)}
                  onShowTooltip={(e) => handleOpenTooltip(method.value, e)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>


        {/* Selection Summary */}
        {selectedMethods.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {selectedMethods.length} {selectedMethods.length === 1 ? "Method" : "Methods"} Selected
                </div>
                <div className="text-xs text-slate-600">
                  Ready to configure your feature selection pipeline
                </div>
              </div>
            </div>
          </div>
        )}
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
        impactLabel="impact"
      />
    </div>
  );
}