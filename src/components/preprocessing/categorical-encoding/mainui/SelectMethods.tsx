"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Info } from "lucide-react";
import { ENCODING_METHODS } from "../data/encodingMethods";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import { categoricalEncodingData } from "../categoricalEncodingData";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

interface SelectMethodsProps {
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
}

export default function SelectMethods({
  selectedMethods,
  onMethodsChange,
}: SelectMethodsProps) {
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
  } = useMethodTooltip<MethodInfo>(categoricalEncodingData);

  const handleMethodToggle = (method: string) => {
    const newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter((m) => m !== method)
      : [...selectedMethods, method];
    onMethodsChange(newMethods);
  };

  // Determine color based on data type in bestFor text
  const getBestForColor = (text: string, isSelected: boolean) => {
    const lower = text.toLowerCase();
    
    // Nominal data / Low cardinality - Blue
    if (lower.includes('nominal') || lower.includes('low cardinality')) {
      return isSelected ? 'text-blue-700 bg-blue-100 border border-blue-200' : 'text-blue-600 bg-blue-50 border border-blue-100';
    } 
    // Ordinal data / Ordered categories - Purple
    else if (lower.includes('ordinal') || lower.includes('ordered categories')) {
      return isSelected ? 'text-purple-700 bg-purple-100 border border-purple-200' : 'text-purple-600 bg-purple-50 border border-purple-100';
    } 
    // High cardinality - Orange
    else if (lower.includes('high cardinality')) {
      return isSelected ? 'text-orange-700 bg-orange-100 border border-orange-200' : 'text-orange-600 bg-orange-50 border border-orange-100';
    }
    // Categorical with patterns - Teal
    else if (lower.includes('patterns')) {
      return isSelected ? 'text-teal-700 bg-teal-100 border border-teal-200' : 'text-teal-600 bg-teal-50 border border-teal-100';
    }
    // Prevents overfitting - Green
    else if (lower.includes('overfitting')) {
      return isSelected ? 'text-green-700 bg-green-100 border border-green-200' : 'text-green-600 bg-green-50 border border-green-100';
    }
    // Binary classification - Pink
    else if (lower.includes('binary')) {
      return isSelected ? 'text-pink-700 bg-pink-100 border border-pink-200' : 'text-pink-600 bg-pink-50 border border-pink-100';
    }
    
    return isSelected ? 'text-indigo-600 bg-indigo-100' : 'text-slate-500 bg-slate-100';
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select Encoding Methods</h2>
              <p className="text-sm text-slate-500">Choose one or more encoding techniques</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ENCODING_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethods.includes(method.value);
              
              return (
                <div
                  key={method.value}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50/50 border-indigo-300 shadow-lg"
                      : "border-slate-100 hover:border-indigo-200 bg-slate-50/30 hover:shadow-md"
                  }`}
                  onClick={() => handleMethodToggle(method.value)}
                >
                  {/* Info Icon Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      type="button"
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-indigo-100 transition-colors"
                      onClick={(e) => handleOpenTooltip(method.value, e)}
                    >
                      <Info className="h-4 w-4 text-indigo-600" />
                    </button>
                  </div>
                  <div className="flex items-start gap-3 pr-8">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleMethodToggle(method.value)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-indigo-100" : "bg-slate-100"}`}>
                          <Icon className={`h-4 w-4 ${isSelected ? "text-indigo-600" : "text-slate-600"}`} />
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900">{method.label}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {method.description}
                      </p>
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${getBestForColor(method.bestFor, isSelected)}`}>
                        {method.bestFor}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedMethods.length > 0 && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                <p className="text-sm text-indigo-800">
                  <strong>{selectedMethods.length} method(s) selected:</strong>{" "}
                  {selectedMethods.map(m => 
                    ENCODING_METHODS.find(method => method.value === m)?.label
                  ).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
