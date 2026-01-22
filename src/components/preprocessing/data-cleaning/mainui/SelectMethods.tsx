"use client";

import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { cleaningMethods, categories, impactColors } from "./dataCleaningMethods";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import { dataCleaningData } from "./dataCleaningData";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";
import MethodSelector from "@/components/common/MethodSelector";
import type { Method } from "@/components/common/MethodCard";

// Types
interface SelectMethodsProps {
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
  onNext: () => void;
}

// Constants
const GRID_COLUMNS = "3" as const;
const SEARCH_PLACEHOLDER = "Search methods by name or description...";
const EMPTY_MESSAGE = "No methods found";
const MAX_HEIGHT = "600px";

// Helper function to get impact color class
const getImpactColorClass = (impact: string): string => {
  return impactColors[impact as keyof typeof impactColors] || "bg-blue-100 text-blue-700";
};

export default function SelectMethods({
  selectedMethods,
  onMethodsChange,
  onNext,
}: SelectMethodsProps) {
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

  // Convert cleaning methods to Method format (memoized)
  const methods: Method[] = useMemo(() => {
    return cleaningMethods.map((m) => ({
      value: m.value,
      label: m.label,
      desc: m.desc,
      category: m.category,
      impact: m.impact,
    }));
  }, []);

  // Memoized category count calculator
  const getCategoryCount = useCallback((category: string): number => {
    if (category === "all") {
      return cleaningMethods.length;
    }
    return cleaningMethods.filter((m) => m.category === category).length;
  }, []);

  // Memoized counts
  const counts = useMemo(() => ({
    selected: selectedMethods.length,
    total: cleaningMethods.length,
  }), [selectedMethods.length]);

  // Action footer content (memoized)
  const ActionFooter = useMemo(() => {
    if (counts.selected === 0) return null;

    return (
      <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {counts.selected} {counts.selected === 1 ? "Method" : "Methods"} Selected
            </div>
            <div className="text-sm text-slate-500">
              Ready to configure your data cleaning pipeline
            </div>
          </div>
        </div>
        <Button
          size="lg"
          onClick={onNext}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Continue to Configure
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }, [counts.selected, onNext]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-slate-900">
                Choose Cleaning Methods
              </h2>
            </div>
            <p className="text-slate-600">
              Select data cleaning operations for your pipeline
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold text-blue-600">
              {counts.selected}
            </div>
            <div className="text-sm text-slate-500">
              of {counts.total} selected
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <MethodSelector
          methods={methods}
          selectedMethods={selectedMethods}
          onMethodsChange={onMethodsChange}
          onInfoClick={handleOpenTooltip}
          categories={[...categories]}
          getCategoryCount={getCategoryCount}
          getImpactColor={getImpactColorClass}
          showCategoryFilter={true}
          showSelectAll={true}
          gridCols={GRID_COLUMNS}
          searchPlaceholder={SEARCH_PLACEHOLDER}
          emptyMessage={EMPTY_MESSAGE}
          maxHeight={MAX_HEIGHT}
        />
      </div>

      {/* Action Footer */}
      {ActionFooter}

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
        showFormula={false}
        showIcon={false}
      />
    </div>
  );
}