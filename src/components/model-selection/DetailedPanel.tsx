"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Plus,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Star,
  Layers,
  Target,
  Brain,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Settings,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Model } from "./types";
import { paradigmConfig, taskConfig, complexityConfig } from "./constants";
import { getModelInfoById } from "./model-registry";
import { generateModelCode } from "./model-code-generator";

interface ModelSidebarProps {
  model: Model | null;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  icon: React.ElementType;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  icon: Icon,
  title,
  iconColor,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-1.5 sm:p-2 rounded-lg",
          "hover:bg-muted/50 transition-colors group"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", iconColor)} />
          <span className="text-xs sm:text-sm font-semibold">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Info Card Component
interface InfoCardProps {
  children: React.ReactNode;
  variant?: "amber" | "green" | "blue" | "purple";
}

const InfoCard: React.FC<InfoCardProps> = ({ children, variant = "amber" }) => {
  const variantStyles = {
    amber: "bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-100",
    green: "bg-green-500/5 border-green-500/20 text-green-900 dark:text-green-100",
    blue: "bg-blue-500/5 border-blue-500/20 text-blue-900 dark:text-blue-100",
    purple: "bg-purple-500/5 border-purple-500/20 text-purple-900 dark:text-purple-100",
  };

  return (
    <div className={cn(
      "text-sm rounded-lg p-4 border backdrop-blur-sm",
      "transition-all duration-200 hover:shadow-sm",
      variantStyles[variant]
    )}>
      {children}
    </div>
  );
};

// List Item Component
interface ListItemProps {
  icon: React.ElementType;
  text: string;
  variant: "success" | "warning";
}

const ListItem: React.FC<ListItemProps> = ({ icon: Icon, text, variant }) => {
  const variantStyles = {
    success: {
      bg: "bg-green-500/5 hover:bg-green-500/10",
      border: "border-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    warning: {
      bg: "bg-amber-500/5 hover:bg-amber-500/10",
      border: "border-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "text-xs sm:text-sm flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 border transition-all duration-200",
        styles.bg,
        styles.border
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0", styles.iconColor)} />
      <span className="leading-relaxed">{text}</span>
    </motion.li>
  );
};

export const ModelSidebar: React.FC<ModelSidebarProps> = ({
  model,
  onClose,
  isSelected,
  onToggleSelect,
}) => {
  // Memoize computed values
  const sidebarData = useMemo(() => {
    if (!model) return null;

    const TaskIcon = taskConfig[model.category as keyof typeof taskConfig]?.icon || Target;
    const ParadigmIcon = paradigmConfig[model.paradigm as keyof typeof paradigmConfig]?.icon || Brain;
    const complexity = complexityConfig[model.complexity as keyof typeof complexityConfig] || complexityConfig.Low;
    const paradigmInfo = paradigmConfig[model.paradigm as keyof typeof paradigmConfig];
    const taskInfo = taskConfig[model.category as keyof typeof taskConfig];

    const complexityLabel = model.complexity.charAt(0).toUpperCase() + model.complexity.slice(1);

    const featureTypeDisplay =
      model.featureType === "numerical"
        ? "Numerical Features Only"
        : "Numerical & Categorical Features";

    const featureTypeDescription =
      model.featureType === "numerical"
        ? "This model works exclusively with numerical data"
        : "This model can handle both numerical and categorical data";

    return {
      TaskIcon,
      ParadigmIcon,
      complexity,
      paradigmInfo,
      taskInfo,
      complexityLabel,
      featureTypeDisplay,
      featureTypeDescription,
    };
  }, [model]);

  if (!model || !sidebarData) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No model selected</p>
          <p className="text-xs text-muted-foreground/60">Click on a model card to view details</p>
        </div>
      </div>
    );
  }

  const {
    TaskIcon,
    ParadigmIcon,
    complexity,
    paradigmInfo,
    taskInfo,
    complexityLabel,
    featureTypeDisplay,
    featureTypeDescription,
  } = sidebarData;

  // Load detailed model info from individual files
  const modelInfo = useMemo(() => {
    if (!model) return null;
    return getModelInfoById(model.id);
  }, [model]);

  // Generate model-specific code preview
  const codePreview = useMemo(() => {
    if (!model || !modelInfo) return "";
    
    // If codeExample exists, use it
    if (modelInfo.codeExample) {
      return modelInfo.codeExample;
    }
    
    // Generate model-specific code based on model ID
    return generateModelCode(model.id, model.category, modelInfo);
  }, [model, modelInfo]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header - Minimal */}
      <div className="relative p-4 sm:p-6 border-b border-border/50 bg-white shrink-0">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 sm:top-3 sm:right-3 h-6 w-6 sm:h-7 sm:w-7 rounded-full z-10",
            "hover:bg-destructive/10 hover:text-destructive transition-colors"
          )}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Button>

        {/* Model Name */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center pt-2 pr-8"
        >
          <h2 className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
            {modelInfo?.name || model.name}
          </h2>
        </motion.div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white"
        >
          {/* Description & Badges Combined */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="max-w-md mx-auto text-left">
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {(() => {
                  const description = (modelInfo as any)?.detailedDescription || modelInfo?.description || model.description;
                  const lines = description.split('\n');
                  // Format description with bold headings
                  return lines.map((line: string, idx: number) => {
                    // Check if line starts with a number followed by a heading (e.g., "1.Training Data:")
                    const headingMatch = line.match(/^(\d+)\.([A-Z][^:]+):(.*)$/);
                    if (headingMatch) {
                      const [, number, heading, rest] = headingMatch;
                      return (
                        <React.Fragment key={idx}>
                          <span className="font-semibold">{number}.{heading}:</span>{rest}
                          {idx < lines.length - 1 && <br />}
                        </React.Fragment>
                      );
                    }
                    // Check if line is just a heading (e.g., "Training Data:")
                    if (line.match(/^[A-Z][^:]+:$/)) {
                      return (
                        <React.Fragment key={idx}>
                          <span className="font-semibold">{line}</span>
                          {idx < lines.length - 1 && <br />}
                        </React.Fragment>
                      );
                    }
                    return (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < lines.length - 1 && <br />}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs sm:text-sm transition-all duration-200 hover:scale-105",
                  paradigmInfo?.textColor
                )}
              >
                <ParadigmIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                {paradigmInfo?.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs sm:text-sm transition-all duration-200 hover:scale-105",
                  taskInfo?.color
                )}
              >
                <TaskIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                {taskInfo?.label}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs sm:text-sm transition-all duration-200 hover:scale-105",
                  complexity.bgColor,
                  complexity.color
                )}
              >
                <complexity.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                {complexityLabel}
              </Badge>
            </div>
          </div>
          {/* Code Preview */}
          <CollapsibleSection icon={Settings} title="Code Preview" iconColor="text-blue-500" defaultOpen={true}>
            <div className="relative">
              <div className={cn(
                "rounded-lg border border-border/50 bg-muted/30 p-3 sm:p-4",
                "overflow-x-auto max-h-64 overflow-y-auto"
              )}>
                <pre className="text-[10px] sm:text-xs font-mono text-foreground whitespace-pre break-words">
                  <code>{codePreview}</code>
                </pre>
              </div>
            </div>
          </CollapsibleSection>

          {/* Use Cases */}
          {(modelInfo?.useCases && modelInfo.useCases.length > 0) || (model.useCases && model.useCases.length > 0) ? (
            <CollapsibleSection icon={Star} title="Common Use Cases" iconColor="text-purple-500">
              <div className="space-y-2">
                {(modelInfo?.useCases || model.useCases || []).map((useCase: string, i: number) => (
                  <motion.div
                    key={`usecase-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg border border-purple-500/20",
                      "bg-purple-500/5 hover:bg-purple-500/10 transition-colors duration-200"
                    )}
                  >
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500 shrink-0" />
                    <span className="text-xs sm:text-sm">{useCase}</span>
                  </motion.div>
                ))}
              </div>
            </CollapsibleSection>
          ) : null}

          {/* Best For */}
          {modelInfo?.bestFor && (
            <CollapsibleSection icon={Lightbulb} title="Best For" iconColor="text-amber-500">
              <div className={cn(
                "p-3 sm:p-4 rounded-lg border border-amber-500/20 bg-amber-500/5",
                "hover:bg-amber-500/10 transition-colors duration-200"
              )}>
                <p className="text-xs sm:text-sm leading-relaxed">{modelInfo.bestFor}</p>
              </div>
            </CollapsibleSection>
          )}

          {/* Pros */}
          {modelInfo?.pros && modelInfo.pros.length > 0 && (
            <CollapsibleSection icon={CheckCircle2} title="Advantages" iconColor="text-green-500">
              <ul className="space-y-2">
                {modelInfo.pros.map((pro: string, i: number) => (
                  <ListItem key={`pro-${i}`} icon={CheckCircle2} text={pro} variant="success" />
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Cons */}
          {modelInfo?.cons && modelInfo.cons.length > 0 && (
            <CollapsibleSection icon={AlertCircle} title="Limitations" iconColor="text-amber-500">
              <ul className="space-y-2">
                {modelInfo.cons.map((con: string, i: number) => (
                  <ListItem key={`con-${i}`} icon={AlertCircle} text={con} variant="warning" />
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Hyperparameters */}
          {modelInfo?.hyperparameters && Object.keys(modelInfo.hyperparameters).length > 0 && (
            <CollapsibleSection icon={Settings} title="Hyperparameters" iconColor="text-indigo-500">
              <div className="space-y-3">
                {Object.entries(modelInfo.hyperparameters).map(([key, param]: [string, any]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 sm:p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5",
                      "hover:bg-indigo-500/10 transition-colors duration-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground">{key}</h4>
                      {param.default !== undefined && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          Default: {typeof param.default === 'number' ? param.default : String(param.default)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                      {param.description}
                    </p>
                    {param.range && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Range: [{param.range[0]}, {param.range[1]}]
                      </p>
                    )}
                    {param.options && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {param.options.map((opt: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-[10px]">
                            {opt}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Requirements */}
          {modelInfo?.requirements && (
            <CollapsibleSection icon={Layers} title="Data Requirements" iconColor="text-blue-500">
              <div className="space-y-2 sm:space-y-3">
                {modelInfo.requirements.dataType && (
                  <InfoCard variant="blue">
                    <div className="flex items-start gap-2">
                      <Layers className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-1">Data Type</p>
                        <p className="text-[10px] sm:text-xs">{modelInfo.requirements.dataType}</p>
                      </div>
                    </div>
                  </InfoCard>
                )}
                {modelInfo.requirements.scaling && (
                  <InfoCard variant="blue">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-1">Scaling</p>
                        <p className="text-[10px] sm:text-xs">{modelInfo.requirements.scaling}</p>
                      </div>
                    </div>
                  </InfoCard>
                )}
                {modelInfo.requirements.missingValues && (
                  <InfoCard variant="blue">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-1">Missing Values</p>
                        <p className="text-[10px] sm:text-xs">{modelInfo.requirements.missingValues}</p>
                      </div>
                    </div>
                  </InfoCard>
                )}
                {modelInfo.requirements.categorical && (
                  <InfoCard variant="blue">
                    <div className="flex items-start gap-2">
                      <Layers className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold mb-1">Categorical Features</p>
                        <p className="text-[10px] sm:text-xs">{modelInfo.requirements.categorical}</p>
                      </div>
                    </div>
                  </InfoCard>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Performance */}
          {modelInfo?.performance && (
            <CollapsibleSection icon={Zap} title="Performance Characteristics" iconColor="text-purple-500">
              <div className="grid grid-cols-2 gap-3">
                {modelInfo.performance.trainingSpeed && (
                  <div className={cn(
                    "p-3 rounded-lg border border-purple-500/20 bg-purple-500/5",
                    "hover:bg-purple-500/10 transition-colors"
                  )}>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Training Speed</p>
                    <p className="text-xs sm:text-sm font-semibold">{modelInfo.performance.trainingSpeed}</p>
                  </div>
                )}
                {modelInfo.performance.predictionSpeed && (
                  <div className={cn(
                    "p-3 rounded-lg border border-purple-500/20 bg-purple-500/5",
                    "hover:bg-purple-500/10 transition-colors"
                  )}>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Prediction Speed</p>
                    <p className="text-xs sm:text-sm font-semibold">{modelInfo.performance.predictionSpeed}</p>
                  </div>
                )}
                {modelInfo.performance.memoryUsage && (
                  <div className={cn(
                    "p-3 rounded-lg border border-purple-500/20 bg-purple-500/5",
                    "hover:bg-purple-500/10 transition-colors"
                  )}>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Memory Usage</p>
                    <p className="text-xs sm:text-sm font-semibold">{modelInfo.performance.memoryUsage}</p>
                  </div>
                )}
                {modelInfo.performance.scalability && (
                  <div className={cn(
                    "p-3 rounded-lg border border-purple-500/20 bg-purple-500/5",
                    "hover:bg-purple-500/10 transition-colors"
                  )}>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Scalability</p>
                    <p className="text-xs sm:text-sm font-semibold">{modelInfo.performance.scalability}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
        </motion.div>
      </div>

      {/* Footer - Selection Button */}
      <div className="p-3 sm:p-4 border-t border-border/50 bg-white">
        <Button
          className={cn(
            "w-full transition-all duration-200 shadow-sm text-xs sm:text-sm h-8 sm:h-9",
            isSelected
              ? "bg-primary/10 text-primary border-2 border-primary hover:bg-primary/20"
              : "hover:scale-[1.02]"
          )}
          variant={isSelected ? "outline" : "default"}
          onClick={onToggleSelect}
          aria-label={isSelected ? "Remove from selection" : "Add to selection"}
          aria-pressed={isSelected}
        >
          <motion.div
            className="flex items-center gap-1.5"
            animate={{ scale: isSelected ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {isSelected ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:text-xs">Selected for Comparison</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:text-xs">Add to Comparison</span>
              </>
            )}
          </motion.div>
        </Button>
        
        <AnimatePresence>
          {isSelected && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] sm:text-xs text-center text-muted-foreground mt-2 sm:mt-3"
            >
              ✓ Added to your comparison list
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModelSidebar;
