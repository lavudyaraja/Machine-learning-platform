"use client";

import React, { useState, useMemo } from "react";
import { Search, BookOpen, Brain, Target, Sparkles, X, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import type { Model, LearningParadigm } from "./types";
import { ModelSidebar } from "./DetailedPanel";
import { ModelCard } from "./ModelCard";
import { SelectedModelsBar } from "./SelectedModelsBar";

interface ModelGridProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredModels: Model[];
  groupedModels: Record<LearningParadigm, Model[]>;
  selectedModelIds: string[];
  onSelectModel: (id: string) => void;
  onViewDetails: (model: Model) => void;
  detailModel: Model | null;
  onCloseDetails: () => void;
  filters: {
    paradigm: LearningParadigm | "all" | null;
    task: string;
    complexity: string;
    featureType: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  modelsData: Model[];
}

// Paradigm Configuration
const paradigmConfig = {
  supervised: {
    label: "Supervised Learning",
    icon: BookOpen,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200"
  },
  unsupervised: {
    label: "Unsupervised Learning",
    icon: Brain,
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200"
  },
  reinforcement: {
    label: "Reinforcement Learning",
    icon: Target,
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200"
  }
};

// Helper function to get base name of model
const getBaseName = (id: string): string => {
  return id
    .replace(/-classifier$/, "")
    .replace(/-regressor$/, "")
    .replace(/-regression$/, "");
};



// ModelSection Component
const ModelSection = ({ 
  models, 
  selectedModelIds, 
  onSelectModel, 
  onViewDetails, 
  emptyMessage = "No models found in this category" 
}: {
  models: Model[];
  selectedModelIds: string[];
  onSelectModel: (id: string) => void;
  onViewDetails: (model: Model) => void;
  emptyMessage?: string;
}) => {
  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <Search className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {models.map((model, index) => (
        <ModelCard
          key={model.id}
          model={model}
          isSelected={selectedModelIds.includes(model.id)}
          onSelect={onSelectModel}
          onViewDetails={onViewDetails}
          index={index}
        />
      ))}
    </div>
  );
};


// Main ModelGrid Component
export const ModelGrid = ({
  searchQuery,
  onSearchChange,
  filteredModels,
  groupedModels,
  selectedModelIds,
  onSelectModel,
  onViewDetails,
  detailModel,
  onCloseDetails,
  filters,
  onFilterChange,
  onClearFilters,
  modelsData
}: ModelGridProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [supervisedTab, setSupervisedTab] = useState("all");
  const [unsupervisedTab, setUnsupervisedTab] = useState("all");

  // Memoize common models calculation
  const commonModels = useMemo(() => {
    const classificationModels = groupedModels.supervised.filter((m) => m.category === "classification");
    const regressionModels = groupedModels.supervised.filter((m) => m.category === "regression");

    const commonModelsSet = new Set<string>();
    const result: Model[] = [];

    classificationModels.forEach((cm) => {
      const baseName = getBaseName(cm.id);
      if (regressionModels.some((rm) => getBaseName(rm.id) === baseName)) {
        if (!commonModelsSet.has(cm.id)) {
          commonModelsSet.add(cm.id);
          result.push(cm);
        }
      }
    });

    regressionModels.forEach((rm) => {
      const baseName = getBaseName(rm.id);
      if (classificationModels.some((cm) => getBaseName(cm.id) === baseName)) {
        if (!commonModelsSet.has(rm.id)) {
          commonModelsSet.add(rm.id);
          result.push(rm);
        }
      }
    });

    return result;
  }, [groupedModels.supervised]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const paradigms: LearningParadigm[] = ["supervised", "unsupervised", "reinforcement"];

  // Calculate total counts for each paradigm
  const paradigmCounts = useMemo(() => {
    const counts: Record<LearningParadigm, number> = {
      supervised: 0,
      unsupervised: 0,
      reinforcement: 0
    };
    modelsData.forEach((model) => {
      counts[model.paradigm]++;
    });
    return counts;
  }, [modelsData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6">
          {/* Collapsible Sidebar */}
          <div
            style={{
              width: sidebarCollapsed ? "64px" : "256px",
              transition: "width 0.3s ease"
            }}
            className="shrink-0"
          >
            <Card className="sticky top-6">
              <CardHeader className={cn(sidebarCollapsed ? "p-2" : "p-4")}>
                <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
                  {!sidebarCollapsed && (
                    <h3 className="text-sm font-semibold text-gray-900">Learning Types</h3>
                  )}
                  <button
                    onClick={toggleSidebar}
                    className="rounded-lg hover:bg-gray-100 transition-colors p-2"
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className={cn("flex-1", sidebarCollapsed ? "p-2" : "p-4")}>
                <div className={cn("space-y-2", sidebarCollapsed && "flex flex-col items-center")}>
                  {paradigms.map((paradigm) => {
                    const config = paradigmConfig[paradigm];
                    const ParadigmIcon = config.icon;
                    const count = paradigmCounts[paradigm];
                    const isActive = filters.paradigm === paradigm;

                    return (
                      <button
                        key={paradigm}
                        onClick={() => onFilterChange("paradigm", isActive ? "" : paradigm)}
                        className={cn(
                          "rounded-lg transition-all duration-200 border",
                          sidebarCollapsed
                            ? "w-10 h-10 flex items-center justify-center p-0"
                            : "w-full flex items-center gap-3 p-3 text-left",
                          isActive
                            ? "bg-blue-50 border-blue-200 text-blue-600"
                            : "border-transparent hover:bg-gray-100 text-gray-600"
                        )}
                        aria-label={`Filter by ${config.label}`}
                        aria-pressed={isActive}
                      >
                        <div className={cn("rounded-lg flex items-center justify-center shrink-0 w-10 h-10", config.bgColor)}>
                          <ParadigmIcon className={cn("w-5 h-5", config.textColor)} />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{config.label}</p>
                            <p className="text-xs text-gray-500">{count} models</p>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {!sidebarCollapsed && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{modelsData.length}</p>
                        <p className="text-xs text-gray-600">Total Models</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="w-full max-w-5xl mx-auto">
              {/* Welcome Screen */}
              {filters.paradigm === null && (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                  <div className="space-y-8 w-full max-w-3xl">
                    <div className="space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-blue-600" />
                      </div>
                      
                      <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900">Explore AI Models</h1>
                        <p className="text-gray-600 text-lg max-w-lg mx-auto">
                          Select a learning paradigm to begin exploring available algorithms and architectures.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      {paradigms.map((paradigm) => {
                        const config = paradigmConfig[paradigm];
                        const ParadigmIcon = config.icon;
                        return (
                          <Button
                            key={paradigm}
                            variant="outline"
                            className="h-auto flex-col gap-4 p-6 py-8 border-2 hover:border-blue-300 transition-all"
                            onClick={() => onFilterChange("paradigm", paradigm)}
                          >
                            <div className={cn("p-3 rounded-xl border", config.bgColor, config.borderColor)}>
                              <ParadigmIcon className={cn("w-8 h-8", config.textColor)} />
                            </div>
                            <div className="space-y-1">
                              <span className="text-lg font-semibold text-gray-900 block">{config.label}</span>
                              <span className="text-xs text-gray-600">
                                {paradigm === 'supervised' && 'Predict outcomes from labeled data'}
                                {paradigm === 'unsupervised' && 'Discover patterns in unlabeled data'}
                                {paradigm === 'reinforcement' && 'Learn through trial and error'}
                              </span>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Area */}
              {filters.paradigm !== null && (
                <div className="space-y-8">
                  {/* Supervised Learning */}
                  {filters.paradigm === "supervised" && (
                    <div className="space-y-6">
                      <div className="text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900">Supervised Learning</h2>
                        <p className="text-gray-600 max-w-2xl">
                          Algorithms that learn from labeled training data to make predictions or decisions.
                        </p>
                      </div>

                      <Tabs value={supervisedTab} onValueChange={setSupervisedTab} className="w-full">
                        <TabsList className="bg-gray-100 border border-gray-200 p-1 w-full md:w-auto">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="classification">Classification</TabsTrigger>
                          <TabsTrigger value="regression">Regression</TabsTrigger>
                          <TabsTrigger value="common">Common Models</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                          <TabsContent value="all">
                            <ModelSection
                              models={groupedModels.supervised}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No supervised learning models found"
                            />
                          </TabsContent>
                          <TabsContent value="classification">
                            <ModelSection
                              models={groupedModels.supervised.filter((m) => m.category === "classification")}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No classification models found"
                            />
                          </TabsContent>
                          <TabsContent value="regression">
                            <ModelSection
                              models={groupedModels.supervised.filter((m) => m.category === "regression")}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No regression models found"
                            />
                          </TabsContent>
                          <TabsContent value="common">
                            <ModelSection
                              models={commonModels}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No common models found"
                            />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  )}

                  {/* Unsupervised Learning */}
                  {filters.paradigm === "unsupervised" && (
                    <div className="space-y-6">
                      <div className="text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900">Unsupervised Learning</h2>
                        <p className="text-gray-600 max-w-2xl">
                          Algorithms used to find patterns in data without pre-existing labels.
                        </p>
                      </div>

                      <Tabs value={unsupervisedTab} onValueChange={setUnsupervisedTab} className="w-full">
                        <TabsList className="bg-gray-100 border border-gray-200 p-1 w-full md:w-auto">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="clustering">Clustering</TabsTrigger>
                          <TabsTrigger value="association">Association</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                          <TabsContent value="all">
                            <ModelSection
                              models={groupedModels.unsupervised}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No unsupervised learning models found"
                            />
                          </TabsContent>
                          <TabsContent value="clustering">
                            <ModelSection
                              models={groupedModels.unsupervised.filter((m) => m.category === "clustering")}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No clustering models found"
                            />
                          </TabsContent>
                          <TabsContent value="association">
                            <ModelSection
                              models={groupedModels.unsupervised.filter((m) => m.category === "association_rules")}
                              selectedModelIds={selectedModelIds}
                              onSelectModel={onSelectModel}
                              onViewDetails={onViewDetails}
                              emptyMessage="No association rule models found"
                            />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  )}

                  {/* Reinforcement Learning */}
                  {filters.paradigm === "reinforcement" && (
                    <div className="space-y-6">
                      <div className="text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900">Reinforcement Learning</h2>
                        <p className="text-gray-600 max-w-2xl">
                          Agents learn to make decisions by performing actions and receiving rewards.
                        </p>
                      </div>
                      
                      <ModelSection
                        models={groupedModels.reinforcement}
                        selectedModelIds={selectedModelIds}
                        onSelectModel={onSelectModel}
                        onViewDetails={onViewDetails}
                        emptyMessage="No reinforcement learning models found"
                      />
                    </div>
                  )}

                  {/* Global Empty State */}
                  {filters.paradigm !== null && filteredModels.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 border border-gray-200">
                        <Search className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">No models found</h3>
                      <p className="text-gray-600 mb-6 max-w-sm">
                        We couldn't find any models matching your current criteria.
                      </p>
                      <Button variant="outline" size="lg" onClick={onClearFilters} className="gap-2">
                        <X className="w-4 h-4" />
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detail Sidebar - Desktop View */}
          {detailModel && (
            <div
              style={{
                width: "380px",
                transition: "all 0.3s ease"
              }}
              className="shrink-0 hidden lg:block"
            >
              <div className="sticky top-6 h-[calc(100vh-120px)] overflow-hidden">
                <ModelSidebar
                  model={detailModel}
                  onClose={onCloseDetails}
                  isSelected={selectedModelIds.includes(detailModel.id)}
                  onToggleSelect={() => onSelectModel(detailModel.id)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sidebar - Mobile Modal */}
      {detailModel && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onCloseDetails}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ModelSidebar
              model={detailModel}
              onClose={onCloseDetails}
              isSelected={selectedModelIds.includes(detailModel.id)}
              onToggleSelect={() => onSelectModel(detailModel.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelGrid;