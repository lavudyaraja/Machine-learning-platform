"use client";

import { Database, File, Calendar, TrendingUp, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/formatters";
import type { Dataset } from "@/types";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import Crousel from "../common/Crousel";
interface DatasetStatsProps {
  dataset: Dataset;
}

export default function DatasetStats({ dataset }: DatasetStatsProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
  };

  // Analyze dataset type and structure
  const datasetAnalysis = useMemo(() => {
    const analysis = {
      types: [] as string[],
      categories: [] as string[],
    };

    if (dataset.columnsInfo && Array.isArray(dataset.columnsInfo) && dataset.columnsInfo.length > 0) {
      let numericalCount = 0;
      let categoricalCount = 0;

      dataset.columnsInfo.forEach(col => {
        const type = col.type?.toLowerCase() || "";
        
        if (type.includes("numeric") || type.includes("int") || type.includes("float") || type.includes("number")) {
          numericalCount++;
          if (!analysis.types.includes("Numerical")) analysis.types.push("Numerical");
        } else if (type.includes("categorical") || type.includes("string") || type.includes("object") || type.includes("text")) {
          categoricalCount++;
          if (!analysis.types.includes("Categorical")) analysis.types.push("Categorical");
        }
      });

      // Determine categories
      if (numericalCount > 0 && categoricalCount > 0) {
        analysis.categories.push("Mixed");
      }
    }

    // Determine structural category
    const isStructural = dataset.type === "tabular" || (!dataset.type && dataset.columns > 0 && dataset.rows > 0);
    if (isStructural) analysis.categories.push("Structural");

    return analysis;
  }, [dataset]);


  const stats = [
    {
      label: "Total Rows",
      value: formatNumber(dataset.rows),
      icon: Database,
      subtitle: "Data points",
      color: "bg-blue-500/10 text-blue-600",
      hoverBorder: "hover:border-blue-400",
    },
    {
      label: "Total Columns",
      value: dataset.columns.toString(),
      icon: Layers,
      subtitle: "Features",
      color: "bg-purple-500/10 text-purple-600",
      hoverBorder: "hover:border-blue-400",
    },
    {
      label: "File Size",
      value: formatFileSize(dataset.size),
      icon: File,
      subtitle: "Storage used",
      color: "bg-orange-500/10 text-orange-600",
      hoverBorder: "hover:border-orange-400",
    },
    {
      label: "Created",
      value: formatDate(new Date(dataset.createdAt)),
      icon: Calendar,
      subtitle: "Upload date",
      color: "bg-teal-500/10 text-teal-600",
      hoverBorder: "hover:border-blue-400",
    },
  ];


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={cn("relative overflow-hidden group transition-all duration-300 border", stat.hoverBorder)}>
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0 transition-all duration-300 group-hover:scale-110", stat.color)}>
                  <stat.icon className="size-3 sm:size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate mb-1">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Dataset Type Badge */}
      {(datasetAnalysis.types.length > 0 || datasetAnalysis.categories.length > 0) && (
        <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-2 border-blue-200 hover:border-blue-400 transition-colors duration-200">
          <CardContent className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 sm:size-5 text-primary" />
                <span className="text-xs sm:text-sm font-semibold">Dataset Classification:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {datasetAnalysis.types.map((type, idx) => (
                  <Badge key={idx} variant="default" className="text-xs sm:text-sm font-medium">
                    {type}
                  </Badge>
                ))}
                {datasetAnalysis.categories.map((category, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs sm:text-sm font-medium">
                    {category}
                  </Badge>
                ))}
                {dataset.type && (
                  <Badge variant="outline" className="text-xs sm:text-sm font-medium capitalize">
                    {dataset.type}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}