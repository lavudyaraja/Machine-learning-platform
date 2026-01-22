"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Model } from "./types";

interface SelectedModelsBarProps {
  selectedModels: Model[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onLoadModel: (models: Model[]) => void;
  isDataSplitComplete?: boolean;
  datasetId?: string;
}

export const SelectedModelsBar: React.FC<SelectedModelsBarProps> = ({
  selectedModels,
  onRemove,
  onClear,
  onLoadModel,
  isDataSplitComplete = false,
  datasetId,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loadedModelIds, setLoadedModelIds] = React.useState<string[]>([]);

  // Reset isLoaded when selected models change (user selects new/different models)
  React.useEffect(() => {
    const currentIds = selectedModels.map(m => m.id).sort().join(',');
    const loadedIds = loadedModelIds.sort().join(',');
    
    if (currentIds !== loadedIds && isLoaded) {
      setIsLoaded(false);
    }
  }, [selectedModels, loadedModelIds, isLoaded]);

  // Hide when no models selected or when models are loaded
  if (selectedModels.length === 0 || isLoaded) return null;

  const handleLoadModel = async () => {
    // Check split status from prop
    if (!isDataSplitComplete) {
      toast.error("Data not ready", {
        description: "Please split the dataset first, then proceed to training",
        duration: 4000,
      });
      return;
    }

    if (!datasetId) {
      toast.error("Dataset ID required", {
        description: "Please provide a dataset ID",
        duration: 4000,
      });
      return;
    }

    // Only allow one model selection at a time (backend processes one model)
    if (selectedModels.length === 0) {
      toast.error("No model selected", {
        description: "Please select a model first",
        duration: 3000,
      });
      return;
    }

    if (selectedModels.length > 1) {
      toast.error("Multiple models selected", {
        description: "Please select only one model at a time. Backend supports one model per request.",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedModel = selectedModels[0];
      
      // Map frontend model ID to backend model type
      const modelIdMapping: Record<string, string> = {
        'knn-classifier': 'knn',
        'knn-regressor': 'knn',
        'random-forest-classifier': 'random-forest',
        'random-forest-regressor': 'random-forest',
        'svm-classifier': 'svm',
        'svm-rbf': 'svm',
      };

      const backendModelType = modelIdMapping[selectedModel.id];
      
      if (!backendModelType) {
        toast.error("Unsupported model", {
          description: `Model ${selectedModel.name} is not supported by the backend. Only KNN, Random Forest, and SVM are supported.`,
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }

      // Determine task type from model category
      const taskType: 'classification' | 'regression' = 
        selectedModel.category === 'regression' ? 'regression' : 'classification';

      console.log('Model selection - Selected model:', {
        ...selectedModel,
        backendModelType,
        taskType,
      });

      toast.success(
        `${selectedModel.name} selected successfully`,
        {
          description: `Model is ready. You can specify target column during training.`,
          duration: 3000,
        }
      );
      
      setLoadedModelIds([selectedModel.id]);
      setIsLoaded(true);
      onLoadModel(selectedModels);
      
      // Navigate to training page after a short delay
      setTimeout(() => {
        if (datasetId) {
          router.push(`/train?datasetId=${datasetId}`);
        } else {
          router.push('/train');
        }
      }, 1500);

    } catch (error: any) {
      console.error("Failed to save model selection:", error);
      const errorMessage = error?.message || "Failed to save model selection";
      toast.error(errorMessage, {
        description: "Please try again",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <Card className="bg-background/95 backdrop-blur-xl border-2 border-primary/20 max-w-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {selectedModels.length > 0 ? selectedModels[0].name : "No Model Selected"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDataSplitComplete 
                      ? "Ready to load and train" 
                      : "Split dataset to continue"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClear} disabled={isLoading}>
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleLoadModel} 
                  className="gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Load Model
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Selected Model Display */}
            <div className="flex items-center gap-2">
              {selectedModels.map((model) => (
                <motion.div
                  key={model.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex-1"
                >
                  <Badge
                    variant="secondary"
                    className="w-full px-3 py-2 flex items-center justify-between gap-2 text-sm transition-all duration-200 hover:bg-secondary/80"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span className="text-base shrink-0">{model.icon}</span>
                      <span className="truncate font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">({model.category})</span>
                    </div>
                    <button
                      onClick={() => onRemove(model.id)}
                      className="p-1 rounded-full hover:bg-destructive/20 transition-colors duration-200 shrink-0"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SelectedModelsBar;