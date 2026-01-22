import {
  Brain,
  Network,
  Zap,
  Target,
  TrendingUp,
  Boxes,
  GitBranch,
  Gauge,
  Layers,
} from "lucide-react";
import type {
  LearningParadigm,
  TaskType,
  FeatureType,
  ComplexityLevel,
} from "./types";
import { getAllModels } from "./model-registry";

// ============================================================================
// MODEL DATA - Now loaded from individual model files
// ============================================================================

export const MODELS_DATA = getAllModels();

// ============================================================================
// CONFIGURATIONS
// ============================================================================

export const paradigmConfig = {
  supervised: {
    label: "Supervised Learning",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
    description: "Learn from labeled data to make predictions",
  },
  unsupervised: {
    label: "Unsupervised Learning",
    icon: Network,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-600 dark:text-purple-400",
    description: "Discover patterns in unlabeled data",
  },
  reinforcement: {
    label: "Reinforcement Learning",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-400",
    description: "Learn through interaction with environment",
  },
};

export const taskConfig = {
  classification: {
    label: "Classification",
    icon: Target,
    color: "text-emerald-500",
    description: "Predict categorical outcomes",
  },
  regression: {
    label: "Regression",
    icon: TrendingUp,
    color: "text-blue-500",
    description: "Predict continuous values",
  },
  clustering: {
    label: "Clustering",
    icon: Boxes,
    color: "text-purple-500",
    description: "Group similar data points",
  },
  association_rules: {
    label: "Association Rules",
    icon: GitBranch,
    color: "text-amber-500",
    description: "Find relationships between items",
  },
  reinforcement: {
    label: "Reinforcement Learning",
    icon: Zap,
    color: "text-amber-500",
    description: "Learn through interaction with environment",
  },
};

export const complexityConfig: Record<ComplexityLevel, { color: string; bgColor: string; icon: typeof Gauge }> = {
  Low: { color: "text-green-600", bgColor: "bg-green-500/10", icon: Gauge },
  Medium: { color: "text-amber-600", bgColor: "bg-amber-500/10", icon: Gauge },
  High: { color: "text-red-600", bgColor: "bg-red-500/10", icon: Gauge },
};
