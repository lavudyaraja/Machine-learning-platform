"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, AlertCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Model } from "./types";
import { taskConfig, complexityConfig } from "./constants";

interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (model: Model) => void;
  index: number;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected,
  onSelect,
  onViewDetails,
  index,
}) => {
  const TaskIcon = taskConfig[model.category]?.icon || Target;
  const complexity = complexityConfig[model.complexity as keyof typeof complexityConfig] || complexityConfig.Low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card
        className={cn(
          "group relative h-[320px] flex flex-col overflow-hidden cursor-pointer transition-all duration-200",
          "bg-white dark:bg-gray-900 border-2",
          "hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700",
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
            : "border-gray-200 dark:border-gray-800"
        )}
        onClick={() => onSelect(model.id)}
      >

        {/* Header Section */}
        <div className="p-3 pb-2">
          <div className="flex items-start gap-2.5 mb-2">
            {/* Icon */}
            <div className="relative shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                "transition-transform duration-200 group-hover:scale-105",
                model.color,
                isSelected && "ring-2 ring-purple-500"
              )}>
                {model.icon}
              </div>
            </div>

            {/* Title and Badges */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1">
                {model.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[9px] font-medium px-1.5 py-0 rounded",
                    complexity.bgColor,
                    complexity.color
                  )}
                >
                  {model.complexity}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 rounded border-gray-300 dark:border-gray-700"
                >
                  <TaskIcon className="w-2.5 h-2.5 mr-1" />
                  {taskConfig[model.category]?.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
            {model.description}
          </p>

          {/* Keywords/Tags */}
          {model.useCases && model.useCases.length > 0 && (
          <div className="mt-2 columns-2 gap-2">
            {model.useCases.map((keyword, index) => (
              <Badge
                key={index}
                variant="outline"
                className="
                  mb-2 inline-block w-full
                  text-[10px] px-2 py-1 rounded-sm text-black bg-purple-50
                  border hover:bg-blue-100 hover:border-blue-400
                  text-center
                "
              >
                {keyword}
              </Badge>
            ))}
          </div>
        )}
        </div>

        {/* Footer Section */}
        <div className="mt-auto px-3 pb-2.5 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors cursor-pointer">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {model.pros.length}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold mb-2">Pros</p>
                  <ul className="text-xs space-y-1">
                    {model.pros.slice(0, 3).map((pro, i) => (
                      <li key={i}>• {pro}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {model.cons.length}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold mb-2">Cons</p>
                  <ul className="text-xs space-y-1">
                    {model.cons.slice(0, 3).map((con, i) => (
                      <li key={i}>• {con}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Details Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-[10px]",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                "transition-opacity duration-200"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(model);
              }}
            >
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">View</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ModelCard;

