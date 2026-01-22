"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Search, ChevronRight, X, Filter, Sparkles, Info as InfoIcon } from "lucide-react";
import { scalingMethods, categories, filterMethods } from "../data/scalingMethods";
import { useMethodTooltip } from "@/components/common/useMethodTooltip";
import MethodTooltipDialog from "@/components/common/MethodTooltipDialog";
import { scalingData } from "../data/scalingData";
import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

interface SelectMethodsProps {
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
  onNext: () => void;
}

export default function SelectMethods({
  selectedMethods,
  onMethodsChange,
  onNext,
}: SelectMethodsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
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

  const handleMethodToggle = (method: string) => {
    const newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter((m) => m !== method)
      : [...selectedMethods, method];
    onMethodsChange(newMethods);
  };

  const handleSelectAll = () => {
    if (selectedMethods.length === scalingMethods.length) {
      onMethodsChange([]);
    } else {
      onMethodsChange(scalingMethods.map((m) => m.value));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredMethods = useMemo(
    () => filterMethods(scalingMethods, searchQuery, selectedCategory),
    [searchQuery, selectedCategory]
  );

  const categoryCount = useMemo(() => {
    return categories.reduce((acc, cat) => {
      if (cat === "all") {
        acc[cat] = scalingMethods.length;
      } else {
        acc[cat] = scalingMethods.filter((m) => m.category === cat).length;
      }
      return acc;
    }, {} as Record<string, number>);
  }, []);

  const selectedCount = selectedMethods.length;
  const totalCount = scalingMethods.length;

  return (
    <div className="space-y-6">
      {/* Method Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Scaling Methods</h2>
                <p className="text-sm text-slate-600">Choose feature scaling operations for your pipeline</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">{selectedCount}</div>
              <div className="text-xs text-slate-600">of {totalCount} selected</div>
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              {selectedMethods.length === scalingMethods.length ? (
                <>
                  <X className="h-4 w-4" />
                  Clear All
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Select All
                </>
              )}
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-700">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const count = categoryCount[cat] || 0;
                
                // Get category-specific colors
                const getCategoryButtonColor = (category: string, isActive: boolean) => {
                  if (category === "all") {
                    return isActive 
                      ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md" 
                      : "bg-white text-cyan-600 hover:bg-cyan-50 border-2 border-cyan-200";
                  }
                  if (category === "Standardization") {
                    return isActive 
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md" 
                      : "bg-white text-cyan-600 hover:bg-cyan-50 border-2 border-cyan-200";
                  }
                  if (category === "Normalization") {
                    return isActive 
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md" 
                      : "bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-200";
                  }
                  if (category === "Robust") {
                    return isActive 
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md" 
                      : "bg-white text-amber-600 hover:bg-amber-50 border-2 border-amber-200";
                  }
                  return isActive 
                    ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md" 
                    : "bg-white text-violet-600 hover:bg-violet-50 border-2 border-violet-200";
                };
                
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      getCategoryButtonColor(cat, selectedCategory === cat)
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                          selectedCategory === cat
                            ? "bg-white/25 text-white"
                            : "bg-black/5"
                        }`}
                      >
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Methods Grid */}
          {filteredMethods.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No Methods Found</h3>
              <p className="text-sm text-slate-500 mb-4">
                {searchQuery
                  ? `No methods match "${searchQuery}"`
                  : "No methods in this category"}
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMethods.map((method) => {
                const isSelected = selectedMethods.includes(method.value);
                
                // Category colors (different from categorical encoding)
                const getCategoryColor = (category: string) => {
                  switch(category) {
                    case "Standardization":
                      return isSelected 
                        ? "text-cyan-700 bg-cyan-100 border border-cyan-200 font-semibold" 
                        : "text-cyan-600 bg-cyan-50 border border-cyan-100";
                    case "Normalization":
                      return isSelected 
                        ? "text-indigo-700 bg-indigo-100 border border-indigo-200 font-semibold" 
                        : "text-indigo-600 bg-indigo-50 border border-indigo-100";
                    case "Robust":
                      return isSelected 
                        ? "text-amber-700 bg-amber-100 border border-amber-200 font-semibold" 
                        : "text-amber-600 bg-amber-50 border border-amber-100";
                    default:
                      return isSelected 
                        ? "text-violet-700 bg-violet-100 border border-violet-200 font-semibold" 
                        : "text-violet-600 bg-violet-50 border border-violet-100";
                  }
                };
                
                // Impact colors (different from categorical encoding)
                const getImpactColor = (impact: string) => {
                  switch(impact) {
                    case "high":
                      return isSelected 
                        ? "text-rose-700 bg-rose-100 border border-rose-200 font-semibold" 
                        : "text-rose-600 bg-rose-50 border border-rose-100";
                    case "medium":
                      return isSelected 
                        ? "text-yellow-700 bg-yellow-100 border border-yellow-200 font-semibold" 
                        : "text-yellow-600 bg-yellow-50 border border-yellow-100";
                    case "low":
                      return isSelected 
                        ? "text-lime-700 bg-lime-100 border border-lime-200 font-semibold" 
                        : "text-lime-600 bg-lime-50 border border-lime-100";
                    default:
                      return isSelected 
                        ? "text-sky-700 bg-sky-100 border border-sky-200 font-semibold" 
                        : "text-sky-600 bg-sky-50 border border-sky-100";
                  }
                };
                
                return (
                  <div
                    key={method.value}
                    onClick={() => handleMethodToggle(method.value)}
                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-cyan-300 shadow-lg bg-gradient-to-br from-cyan-50/50 to-indigo-50/30"
                        : "border-slate-100 hover:border-cyan-200 hover:shadow-md bg-white"
                    }`}
                  >
                    {/* Info Icon Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        type="button"
                        className={`h-6 w-6 flex items-center justify-center rounded-lg transition-colors ${
                          isSelected 
                            ? "hover:bg-cyan-100" 
                            : "hover:bg-slate-100"
                        }`}
                        onClick={(e) => handleOpenTooltip(method.value, e)}
                      >
                        <InfoIcon className={`h-3.5 w-3.5 ${isSelected ? "text-cyan-600" : "text-slate-500"}`} />
                      </button>
                    </div>

                    {/* Method Content */}
                    <div className="flex items-start gap-2 pr-7">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleMethodToggle(method.value)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 space-y-2 min-w-0">
                        <h3 className={`font-semibold text-sm ${isSelected ? "text-cyan-900" : "text-slate-900"}`}>
                          {method.label}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {method.desc}
                        </p>
                        {/* Method Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md ${getCategoryColor(method.category)}`}>
                            {method.category}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md ${getImpactColor(method.impact)}`}>
                            {method.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {selectedMethods.length > 0 && (
        <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-2xl border-2 border-cyan-200 p-5 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {selectedCount} {selectedCount === 1 ? "Method" : "Methods"} Selected
              </div>
              <div className="text-sm text-slate-600">
                Ready to configure your feature scaling pipeline
              </div>
            </div>
          </div>
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
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
        showIcon={false}
      />
    </div>
  );
}

