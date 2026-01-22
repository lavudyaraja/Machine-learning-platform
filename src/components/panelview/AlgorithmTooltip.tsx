"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { AlgorithmInfo } from "./algorithmData";

interface Props {
  algorithm: AlgorithmInfo;
}

// Global state to track closed modals across all instances
const closedModals = new Map<string, number>();

export default function AlgorithmTooltip({ algorithm }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canOpen, setCanOpen] = useState(true);

  // Check cooldown status
  useEffect(() => {
    const checkCooldown = () => {
      const closedTime = closedModals.get(algorithm.id);
      
      if (!closedTime) {
        setCanOpen(true);
        return;
      }
      
      const timeSinceClose = Date.now() - closedTime;
      const twoMinutes = 2 * 60 * 1000;
      
      if (timeSinceClose >= twoMinutes) {
        closedModals.delete(algorithm.id);
        setCanOpen(true);
      } else {
        setCanOpen(false);
      }
    };

    checkCooldown();
    
    // Check every second if cooldown has expired
    const interval = setInterval(checkCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [algorithm.id]);

  const handleCardClick = () => {
    if (!canOpen) {
      return; // Don't open if cooldown is active
    }
    setOpen(true);
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Store close time when modal is closed
      closedModals.set(algorithm.id, Date.now());
      setOpen(false);
      setCanOpen(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(algorithm.implementationInsight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg"
        onClick={handleCardClick}
      >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">
                  {algorithm.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {algorithm.definition}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {algorithm.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span className="line-clamp-1">
                {algorithm.usedFor}
              </span>
            </div>
          </CardContent>
        </Card>

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {algorithm.title}
              </DialogTitle>
              <Badge variant="outline" className="mt-2">
                {algorithm.category}
              </Badge>
            </div>

            <Section title="Definition" icon={<BookOpen />}>
              {algorithm.definition}
            </Section>

            <Section title="Concept" icon={<Lightbulb />}>
              {algorithm.concept}
            </Section>

            <Section title="Used For" icon={<Target />}>
              {algorithm.usedFor}
            </Section>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  Implementation Insight
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCode}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto border border-slate-800">
{algorithm.implementationInsight}
              </pre>
            </div>

            <Section title="Effect" icon={<Zap />}>
              {algorithm.effect}
            </Section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}