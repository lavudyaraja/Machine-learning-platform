"use client";

import { Info, AlertCircle } from "lucide-react";
import { featureExtractionData } from "../data/featureExtractionData";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

interface SelectMethodsProps {
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
}

const extractionMethods = [
  {
    value: "pca",
    label: "Principal Component Analysis (PCA)",
    category: "Linear",
    description: "Reduces dimensionality while preserving maximum variance",
    icon: "📊"
  },
  {
    value: "lda",
    label: "Linear Discriminant Analysis (LDA)",
    category: "Supervised",
    description: "Maximizes class separability for classification tasks",
    icon: "🎯"
  },
  {
    value: "ica",
    label: "Independent Component Analysis (ICA)",
    category: "Linear",
    description: "Separates multivariate signals into independent components",
    icon: "🔀"
  },
  {
    value: "svd",
    label: "Singular Value Decomposition (SVD)",
    category: "Matrix Factorization",
    description: "Decomposes matrix into singular vectors and values",
    icon: "🔢"
  },
  {
    value: "factor_analysis",
    label: "Factor Analysis",
    category: "Latent Variables",
    description: "Identifies underlying latent factors in data",
    icon: "🔍"
  },
];

export default function SelectMethods({
  selectedMethods,
  onMethodsChange
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
  } = useMethodTooltip<MethodInfo>(featureExtractionData);

  const handleMethodToggle = (method: string) => {
    const newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter((m) => m !== method)
      : [...selectedMethods, method];

    onMethodsChange(newMethods);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Feature Extraction Methods</h2>
        <p className="text-slate-500">
          Choose one or more dimensionality reduction techniques to transform your data
        </p>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extractionMethods.map((method) => (
          <div
            key={method.value}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedMethods.includes(method.value)
                ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-400 ring-offset-2"
                : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
            }`}
            onClick={() => handleMethodToggle(method.value)}
          >
            {/* Info Icon Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                onClick={(e) => handleOpenTooltip(method.value, e)}
              >
                <Info className="h-4 w-4 text-blue-600" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{method.icon}</span>
                  <h3 className="font-semibold text-slate-900">{method.label}</h3>
                </div>

                <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                  {method.category}
                </span>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {method.description}
                </p>
              </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedMethods.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                {selectedMethods.length} method{selectedMethods.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-800">
                {selectedMethods.map((m) => extractionMethods.find((method) => method.value === m)?.label).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning for no selection */}
      {selectedMethods.length === 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Please select at least one extraction method to continue
            </p>
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
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        showFormula={true}
        showIcon={true}
        impactLabel="Impact"
      />
    </div>
  );
}
