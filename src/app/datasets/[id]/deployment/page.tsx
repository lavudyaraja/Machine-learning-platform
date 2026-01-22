"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModelSelector } from "@/components/model-selection/ModelSelector";
import { useDatasetDetail } from "@/hooks/useDataset";
import type { TaskType, FeatureType, Model } from "@/components/model-selection/types";

export default function DeploymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const datasetId = params.id as string;
  const step = searchParams.get("step") || "model-selection";
  
  const { dataset, loading: datasetLoading } = useDatasetDetail(datasetId);
  const [isDataSplitComplete, setIsDataSplitComplete] = useState(false);

  // Split status should be fetched from backend API
  useEffect(() => {
    // TODO: Fetch split status from backend API using datasetId
    // For now, initialize as false
    setIsDataSplitComplete(false);
  }, [datasetId]);

  // Determine task type and feature type from dataset
  const taskType = useMemo<TaskType | undefined>(() => {
    // You can determine this from dataset metadata or let user select
    // For now, we'll let ModelSelector handle it
    return undefined;
  }, [dataset]);

  const featureType = useMemo<FeatureType | undefined>(() => {
    if (!dataset?.columnsInfo) return undefined;
    
    const hasNumerical = dataset.columnsInfo.some(
      (col) => 
        col.type?.toLowerCase().includes("numeric") ||
        col.type?.toLowerCase().includes("int") ||
        col.type?.toLowerCase().includes("float") ||
        col.type?.toLowerCase().includes("number")
    );
    
    const hasCategorical = dataset.columnsInfo.some(
      (col) =>
        col.type?.toLowerCase().includes("categorical") ||
        col.type?.toLowerCase().includes("string") ||
        col.type?.toLowerCase().includes("object") ||
        col.type?.toLowerCase().includes("category")
    );

    if (hasNumerical && hasCategorical) {
      return "categorical_mixed";
    } else if (hasNumerical) {
      return "numerical";
    } else {
      return "categorical_mixed";
    }
  }, [dataset]);

  const handleModelsSelected = (modelIds: string[]) => {
    // Handle model selection - you can save this or navigate to next step
    console.log("Selected models:", modelIds);
    // Example: navigate to next step with selected models
    // router.push(`/datasets/${datasetId}/deployment?step=model-training&models=${modelIds.join(',')}`);
  };

  const handleModelsLoaded = (models: Model[]) => {
    // Handle when models are successfully loaded
    console.log("Models loaded for training:", models);
    // Navigate to training step or perform other actions
    // router.push(`/datasets/${datasetId}/deployment?step=model-training&models=${models.map(m => m.id).join(',')}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <Link 
                href={`/datasets/${datasetId}`} 
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-muted-foreground" />
              </Link>
              <div className="h-4 w-[1px] bg-border mx-1" />
              <span className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                Model Selection Studio
              </span>
            </div>

            {/* Center Section */}
            {step === "model-selection" && (
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href={`/datasets/${datasetId}/preprocessing?section=dataset-splitting`} className="flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dataset Splitting
                </Link>
              </Button>
            )}

            {/* Right Section */}
            {step === "model-selection" && (
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href={`/datasets/${datasetId}/training`} className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  Training
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full">
        {step === "model-selection" && (
          <ModelSelector 
            datasetId={datasetId}
            taskType={taskType}
            featureType={featureType}
            onModelsSelected={handleModelsSelected}
            onModelsLoaded={handleModelsLoaded}
            isDataSplitComplete={isDataSplitComplete}
          />
        )}
      </main>
    </div>
  );
}

