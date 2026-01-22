"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type LearningParadigm,
  type TaskType,
  type FeatureType,
  type ComplexityLevel,
  type Model,
} from "./types";
import { MODELS_DATA } from "./constants";
import { ModelGrid } from "./ModelGrid";
import { SelectedModelsBar } from "./SelectedModelsBar";

// ============================================================================
// MAIN MODEL SELECTOR COMPONENT
// ============================================================================

interface ModelSelectorProps {
  datasetId?: string;
  onModelsSelected?: (models: string[]) => void;
  onModelsLoaded?: (models: Model[]) => void;
  initialSelectedModels?: string[];
  taskType?: TaskType;
  featureType?: FeatureType;
  isDataSplitComplete?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  datasetId,
  onModelsSelected,
  onModelsLoaded,
  initialSelectedModels = [],
  taskType,
  featureType,
  isDataSplitComplete = false,
}) => {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialSelectedModels);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModel, setDetailModel] = useState<Model | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    paradigm: null as LearningParadigm | "all" | null,
    task: taskType || ("all" as TaskType | "all"),
    complexity: "all" as ComplexityLevel | "all",
    featureType: featureType || ("all" as FeatureType | "all"),
  });

  // Backend supported models only: KNN, Random Forest, SVM
  const BACKEND_SUPPORTED_MODELS = [
    'knn-classifier',
    'knn-regressor',
    'random-forest-classifier',
    'random-forest-regressor',
    'svm-classifier',
    'svm-rbf'
  ];

  // Filter models based on search and filters - ONLY show backend supported models
  const filteredModels = useMemo(() => {
    return MODELS_DATA.filter((model) => {
      // CRITICAL: Only show backend-supported models
      if (!BACKEND_SUPPORTED_MODELS.includes(model.id)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.bestFor.toLowerCase().includes(query) ||
          model.useCases.some((uc) => uc.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Paradigm filter - when null, return all models (but they won't be displayed)
      if (filters.paradigm !== "all" && filters.paradigm !== null && model.paradigm !== filters.paradigm) {
        return false;
      }

      // Task filter
      if (filters.task !== "all" && model.category !== filters.task) {
        return false;
      }

      // Complexity filter
      if (filters.complexity !== "all" && model.complexity !== filters.complexity) {
        return false;
      }

      // Feature type filter
      if (filters.featureType !== "all" && model.featureType !== filters.featureType) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Get selected models
  const selectedModels = useMemo(() => {
    return MODELS_DATA.filter((m) => selectedModelIds.includes(m.id));
  }, [selectedModelIds]);

  // Note: Selected models are managed via state and passed to parent components
  // No local storage needed - backend handles model selection

  // Handlers
  // Only allow one model selection at a time (backend processes one model)
  const handleSelectModel = useCallback((id: string) => {
    setSelectedModelIds((prev) => {
      // If clicking the same model, deselect it
      if (prev.includes(id)) {
        return [];
      }
      // Otherwise, select only this model (replace previous selection)
      return [id];
    });
  }, []);

  const handleRemoveModel = useCallback((id: string) => {
    setSelectedModelIds((prev) => prev.filter((m) => m !== id));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedModelIds([]);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    // Convert empty string to null for paradigm filter
    const processedValue = key === "paradigm" && value === "" ? null : value;
    setFilters((prev) => ({ ...prev, [key]: processedValue }));
  }, []);

  const handleLoadModel = useCallback((models: Model[]) => {
    onModelsSelected?.(selectedModelIds);
    onModelsLoaded?.(models);
  }, [selectedModelIds, onModelsSelected, onModelsLoaded]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({
      paradigm: null,
      task: "all",
      complexity: "all",
      featureType: "all",
    });
  }, []);

  // Group models by paradigm for display
  const groupedModels = useMemo(() => {
    const groups: Record<LearningParadigm, Model[]> = {
      supervised: [],
      unsupervised: [],
      reinforcement: [],
    };
    filteredModels.forEach((model) => {
      groups[model.paradigm].push(model);
    });
    return groups;
  }, [filteredModels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Main Content with Grid */}
      <ModelGrid
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredModels={filteredModels}
        groupedModels={groupedModels}
        selectedModelIds={selectedModelIds}
        onSelectModel={handleSelectModel}
        onViewDetails={setDetailModel}
        detailModel={detailModel}
        onCloseDetails={() => setDetailModel(null)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        modelsData={MODELS_DATA}
      />


      {/* Selected Models Bar */}
      <AnimatePresence>
        <SelectedModelsBar
          selectedModels={selectedModels}
          onRemove={handleRemoveModel}
          onClear={handleClearSelection}
          onLoadModel={handleLoadModel}
          isDataSplitComplete={isDataSplitComplete}
          datasetId={datasetId}
        />
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
