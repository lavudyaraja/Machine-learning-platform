"use client";

import type { Dataset } from "@/types";
import DatasetGridCard from "./DatasetGridCard";
import DatasetListCard from "./DatasetListCard";

interface DatasetCardProps {
  dataset: Dataset;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Dataset>) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  deleting?: boolean;
  viewMode?: "grid" | "list";
}

export default function DatasetCard({
  dataset,
  onDelete,
  onUpdate,
  onDuplicate,
  deleting = false,
  viewMode = "grid",
}: DatasetCardProps) {
  const commonProps = {
    dataset,
    onDelete,
    onUpdate,
    onDuplicate,
    deleting,
  };

  if (viewMode === "list") {
    return <DatasetListCard {...commonProps} />;
  }

  return <DatasetGridCard {...commonProps} />;
}

