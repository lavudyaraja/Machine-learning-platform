import { useState } from "react";
import { MethodInfo } from "./MethodTooltipDialog";

/**
 * Generic tooltip hook for all preprocessing methods
 * 
 * @param methodData - Array of method info objects
 * @returns Tooltip state and handlers
 */
export function useMethodTooltip<T extends MethodInfo>(methodData: T[]) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [selectedMethodForTooltip, setSelectedMethodForTooltip] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleOpenTooltip = (methodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMethodForTooltip(methodId);
    setTooltipOpen(true);
  };

  const handleCloseTooltip = () => {
    setTooltipOpen(false);
    setSelectedMethodForTooltip(null);
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    if (selectedMethodForTooltip) {
      const methodInfo = methodData.find(m => m.id === selectedMethodForTooltip);
      if (methodInfo) {
        navigator.clipboard.writeText(methodInfo.implementationInsight);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    // Default category colors - can be overridden
    switch (category.toLowerCase()) {
      case "essential":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "transform":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "filter":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "wrapper":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "embedded":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "dimensionality reduction":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "supervised":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      case "unsupervised":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getMethodInfo = (methodId: string | null): MethodInfo | null => {
    if (!methodId) return null;
    return methodData.find(m => m.id === methodId) || null;
  };

  return {
    tooltipOpen,
    selectedMethodForTooltip,
    copiedCode,
    handleOpenTooltip,
    handleCloseTooltip,
    handleCopyCode,
    getCategoryColor,
    getImpactColor,
    getMethodInfo,
  };
}

