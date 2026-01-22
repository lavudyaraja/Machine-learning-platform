"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Method {
  value: string;
  label: string;
  description?: string;
  desc?: string; // Alternative prop name
  category?: string;
  impact?: string;
  complexity?: string;
  icon?: string | React.ReactNode;
}

interface MethodCardProps {
  method: Method;
  isSelected: boolean;
  onToggle: (methodValue: string) => void;
  onInfoClick?: (methodValue: string, event: React.MouseEvent) => void;
  showCategory?: boolean;
  showImpact?: boolean;
  showComplexity?: boolean;
  gridCols?: "2" | "3";
  className?: string;
  getImpactColor?: (impact: string) => string; // Custom function to get impact color classes
}

export default function MethodCard({
  method,
  isSelected,
  onToggle,
  onInfoClick,
  showCategory = true,
  showImpact = true,
  showComplexity = false,
  gridCols = "3",
  className,
  getImpactColor,
}: MethodCardProps) {
  const description = method.description || method.desc || "";
  const icon = method.icon;

  return (
    <div
      onClick={() => onToggle(method.value)}
      className={cn(
        "relative rounded-lg border-2 transition-all text-left hover:border-blue-400 cursor-pointer",
        gridCols === "3" ? "p-5" : "p-4",
        isSelected
          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-md"
          : "border-slate-200 bg-white dark:border-gray-700 dark:hover:border-gray-600",
        className
      )}
    >
      {/* Info Icon Button */}
      {onInfoClick && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick(method.value, e);
            }}
          >
            <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
        </div>
      )}

      {/* Method Content */}
      <div className={cn("flex-1", gridCols === "3" ? "mb-4 pr-12" : "pr-8")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <span className={typeof icon === "string" ? "text-2xl" : ""}>
                  {icon}
                </span>
              )}
              <h3
                className={cn(
                  "font-semibold text-slate-900",
                  gridCols === "3" ? "text-base" : "text-sm"
                )}
              >
                {method.label}
              </h3>
            </div>
            <p
              className={cn(
                "text-slate-600 leading-relaxed mb-2",
                gridCols === "3" ? "text-sm" : "text-xs"
              )}
            >
              {description}
            </p>

            {/* Method Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {showCategory && method.category && (
                <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                  {method.category}
                </span>
              )}
              {showImpact && method.impact && (
                <span
                  className={cn(
                    "text-xs px-3 py-1 rounded font-medium",
                    getImpactColor
                      ? getImpactColor(method.impact)
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {method.impact}
                </span>
              )}
              {showComplexity && method.complexity && (
                <Badge
                  variant={
                    method.complexity === "Low"
                      ? "secondary"
                      : method.complexity === "Medium"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {method.complexity} Complexity
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

