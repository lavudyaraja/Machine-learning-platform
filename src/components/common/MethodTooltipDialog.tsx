"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code2,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Copy,
  Check,
  Calculator,
} from "lucide-react";

/**
 * Generic method info interface that all preprocessing methods should extend
 */
export interface MethodInfo {
  id: string;
  title?: string;
  label?: string; // Alternative to title
  icon?: string | React.ReactNode;
  category: string;
  impact: "high" | "medium" | "low";
  definition: string;
  concept: string;
  usedFor?: string;
  useCases?: string[]; // Alternative to usedFor
  implementationInsight: string;
  effect: string;
  formula?: string;
  complexity?: string; // For feature selection
}

interface MethodTooltipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  methodId: string | null;
  getCategoryColor: (category: string) => string;
  getImpactColor: (impact: "high" | "medium" | "low") => string;
  getMethodInfo: (methodId: string | null) => MethodInfo | null;
  copiedCode: boolean;
  onCopyCode: () => void;
  showFormula?: boolean; // Whether to show formula section
  showIcon?: boolean; // Whether to show icon in header
  impactLabel?: string; // Custom label for impact badge (default: "impact")
}

export default function MethodTooltipDialog({
  open,
  onOpenChange,
  methodId,
  getCategoryColor,
  getImpactColor,
  getMethodInfo,
  copiedCode,
  onCopyCode,
  showFormula = true,
  showIcon = false,
  impactLabel = "impact",
}: MethodTooltipDialogProps) {
  const methodInfo = getMethodInfo(methodId);

  if (!methodInfo) {
    return null;
  }

  const title = methodInfo.title || methodInfo.label || methodInfo.id;
  const usedForContent = methodInfo.usedFor || methodInfo.useCases;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className={`flex items-center gap-3 mb-2 ${showIcon ? "" : "hidden"}`}>
              {methodInfo.icon && (
                <span className="text-3xl">{methodInfo.icon}</span>
              )}
              <DialogTitle className="text-2xl font-bold">
                {title}
              </DialogTitle>
            </div>
            {!showIcon && (
              <DialogTitle className="text-2xl font-bold">
                {title}
              </DialogTitle>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getCategoryColor(methodInfo.category)}>
                {methodInfo.category}
              </Badge>
              <Badge className={getImpactColor(methodInfo.impact)}>
                {impactLabel === "impact" ? `${methodInfo.impact} impact` : `Impact: ${methodInfo.impact}`}
              </Badge>
              {methodInfo.complexity && (
                <Badge variant="secondary">
                  {methodInfo.complexity} Complexity
                </Badge>
              )}
            </div>
          </div>

          {/* Definition */}
          <Section title="Definition" icon={<BookOpen className="h-4 w-4 text-blue-600" />}>
            {methodInfo.definition}
          </Section>

          {/* Concept */}
          <Section title="Concept" icon={<Lightbulb className="h-4 w-4 text-yellow-600" />}>
            {methodInfo.concept}
          </Section>

          {/* Used For / Use Cases */}
          {usedForContent && (
            <Section title={methodInfo.useCases ? "Use Cases" : "Used For"} icon={<Target className="h-4 w-4 text-green-600" />}>
              {methodInfo.useCases ? (
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                  {methodInfo.useCases.map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed">{methodInfo.usedFor}</p>
              )}
            </Section>
          )}

          {/* Formula */}
          {showFormula && methodInfo.formula && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Calculator className="h-4 w-4 text-purple-600" />
                Formula
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <code className="text-sm font-mono text-slate-900 dark:text-slate-100">
                  {methodInfo.formula}
                </code>
              </div>
            </div>
          )}

          {/* Implementation Insight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Code2 className="h-4 w-4 text-blue-600" />
                Implementation Insight
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyCode}
              >
                {copiedCode ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-600" />
                )}
              </Button>
            </div>

            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto border border-slate-800">
              {methodInfo.implementationInsight}
            </pre>
          </div>

          {/* Effect */}
          <Section title="Effect" icon={<Zap className="h-4 w-4 text-orange-600" />}>
            {methodInfo.effect}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Reusable Section Component
 */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

