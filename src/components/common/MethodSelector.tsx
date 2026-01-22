"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, CheckCircle2, Filter } from "lucide-react";
import MethodCard, { type Method } from "./MethodCard";
import { cn } from "@/lib/utils";

interface MethodSelectorProps {
  methods: Method[];
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
  onInfoClick?: (methodValue: string, event: React.MouseEvent) => void;
  categories?: string[];
  getCategoryCount?: (category: string) => number;
  showCategoryFilter?: boolean;
  showSelectAll?: boolean;
  gridCols?: "2" | "3";
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxHeight?: string;
  className?: string;
  getImpactColor?: (impact: string) => string; // Custom function to get impact color classes
}

export default function MethodSelector({
  methods,
  selectedMethods,
  onMethodsChange,
  onInfoClick,
  categories = [],
  getCategoryCount,
  showCategoryFilter = true,
  showSelectAll = true,
  gridCols = "3",
  searchPlaceholder = "Search methods by name or description...",
  emptyMessage = "No methods found",
  maxHeight = "600px",
  className,
  getImpactColor,
}: MethodSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleMethodToggle = (method: string) => {
    const newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter((m) => m !== method)
      : [...selectedMethods, method];
    onMethodsChange(newMethods);
  };

  const handleSelectAll = () => {
    if (selectedMethods.length === methods.length) {
      onMethodsChange([]);
    } else {
      onMethodsChange(methods.map((m) => m.value));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Filter methods based on search and category
  const filteredMethods = useMemo(() => {
    let filtered = methods;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.label.toLowerCase().includes(query) ||
          (m.description || m.desc || "").toLowerCase().includes(query) ||
          (m.category || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [methods, searchQuery, selectedCategory]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Select All */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
        {showSelectAll && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleSelectAll}
            className="whitespace-nowrap"
          >
            {selectedMethods.length === methods.length ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
        )}
      </div>

      {/* Category Filter */}
      {showCategoryFilter && categories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = getCategoryCount ? getCategoryCount(cat) : 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    {count > 0 && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-semibold",
                          selectedCategory === cat
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-600"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Methods Grid */}
      <div className="relative">
        {filteredMethods.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {emptyMessage}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery
                ? `No methods match "${searchQuery}"`
                : "No methods in this category"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={handleClearSearch}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "overflow-y-auto pr-2",
              `max-h-[${maxHeight}]`
            )}
            style={{ maxHeight }}
          >
            <div
              className={cn(
                "grid gap-4",
                gridCols === "3"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              )}
            >
              {filteredMethods.map((method) => (
                <MethodCard
                  key={method.value}
                  method={method}
                  isSelected={selectedMethods.includes(method.value)}
                  onToggle={handleMethodToggle}
                  onInfoClick={onInfoClick}
                  showCategory={true}
                  showImpact={true}
                  showComplexity={false}
                  gridCols={gridCols}
                  getImpactColor={getImpactColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

