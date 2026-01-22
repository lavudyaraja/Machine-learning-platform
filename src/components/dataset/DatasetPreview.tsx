"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info, BarChart3 } from "lucide-react";
import { useDatasetPreview } from "@/hooks/useDatasetPreview";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Dataset } from "@/types/dataset";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatasetPreviewProps {
  datasetId: string;
  pageSize?: number;
  dataset?: Dataset;
}

export default function DatasetPreview({
  datasetId,
  pageSize = 50,
  dataset,
}: DatasetPreviewProps) {
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize);

  const {
    preview,
    loading,
    error,
    currentPage,
    goToPage,
    nextPage,
    previousPage,
  } = useDatasetPreview({
    datasetId,
    pageSize: selectedPageSize,
    enabled: !!datasetId,
  });

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setSelectedPageSize(newPageSize);
  };

  // Enhanced dataset type detection
  const datasetClassification = useMemo(() => {
    if (!dataset?.columnsInfo || !Array.isArray(dataset.columnsInfo) || dataset.columnsInfo.length === 0) {
      return {
        types: [],
        categories: [],
        description: null,
        hasNumerical: false,
        hasCategorical: false,
        hasText: false,
        hasMixed: false,
      };
    }

    let numericalCount = 0;
    let categoricalCount = 0;
    let textCount = 0;
    let dateCount = 0;

    dataset.columnsInfo.forEach(col => {
      const type = col.type?.toLowerCase() || "";
      
      if (type.includes("numeric") || type.includes("int") || type.includes("float") || type.includes("number") || type.includes("decimal")) {
        numericalCount++;
      } else if (type.includes("date") || type.includes("time") || type.includes("datetime")) {
        dateCount++;
      } else if (type.includes("text") || type.includes("string") && (col.unique || 0) > dataset.rows * 0.5) {
        textCount++;
      } else if (type.includes("categorical") || type.includes("string") || type.includes("object") || type.includes("category")) {
        categoricalCount++;
      }
    });

    const types: string[] = [];
    const categories: string[] = [];
    
    const hasNumerical = numericalCount > 0;
    const hasCategorical = categoricalCount > 0;
    const hasText = textCount > 0;
    const hasDate = dateCount > 0;
    const hasMixed = (hasNumerical && hasCategorical) || (hasNumerical && hasText) || (hasCategorical && hasText);

    // Primary types
    if (hasNumerical) types.push("Numerical");
    if (hasCategorical) types.push("Categorical");
    if (hasText) types.push("Text");
    if (hasDate) types.push("Temporal");

    // Categories based on structure
    const isStructural = dataset.type === "tabular" || (!dataset.type && dataset.columns > 0 && dataset.rows > 0);
    if (isStructural) categories.push("Structural");
    
    if (hasMixed) {
      categories.push("Mixed-Type");
    } else if (hasNumerical && numericalCount === dataset.columns) {
      categories.push("Pure Numerical");
    } else if (hasCategorical && categoricalCount === dataset.columns) {
      categories.push("Pure Categorical");
    }

    return {
      types,
      categories,
      hasNumerical,
      hasCategorical,
      hasText,
      hasMixed,
      numericalCount,
      categoricalCount,
      textCount,
      dateCount,
    };
  }, [dataset]);


  if (loading && !preview) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dataset preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-center text-destructive font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Info className="size-8 text-muted-foreground" />
            <p className="text-center text-muted-foreground">No preview available for this dataset</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { columns, rows, totalRows, totalPages = 1 } = preview;
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(startRow + rows.length - 1, totalRows);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Preview Card */}
      <Card className="border border-slate-200 rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg sm:text-xl">Dataset Preview</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Preview shows a sample of your dataset. Use pagination to navigate through all rows.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 sm:space-y-4 px-0 sm:px-6 pb-4 sm:pb-6">
          <div className="w-full overflow-x-auto">
            <div className="rounded-md border min-w-full inline-block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {columns.map((column, index) => (
                      <TableHead
                        key={index}
                        className="font-semibold whitespace-nowrap sticky top-0 bg-background z-10 border-r last:border-r-0 min-w-[120px] sm:min-w-[150px] px-2 sm:px-4 text-xs sm:text-sm"
                      >
                        <span className="truncate">{column}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-8 sm:py-12"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Loading data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center text-muted-foreground py-8 sm:py-12"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="size-6 text-muted-foreground" />
                          <p className="text-sm">No data available</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className="font-mono text-xs sm:text-sm whitespace-nowrap min-w-[120px] sm:min-w-[150px] max-w-[200px] sm:max-w-[300px] border-r last:border-r-0 px-2 sm:px-4"
                          >
                            <div className="truncate" title={String(cell || "")}>
                              {String(cell || "")}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Page Size Selector - Left Side */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
                  <Select 
                    value={selectedPageSize.toString()} 
                    onValueChange={(v) => handlePageSizeChange(Number(v))}
                  >
                    <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm h-8 sm:h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagination Controls - Right Side */}
                <Pagination>
                  <PaginationContent className="flex-wrap gap-1 sm:gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={previousPage}
                        className={cn(
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-accent",
                          "text-xs sm:text-sm"
                        )}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => {
                      if (page === "ellipsis") {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis className="text-xs sm:text-sm" />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className={cn(
                              "cursor-pointer text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] h-8 sm:h-10",
                              currentPage === page && "bg-primary text-primary-foreground"
                            )}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className={cn(
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-accent",
                          "text-xs sm:text-sm"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}

          {/* Footer Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t px-3 sm:px-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatNumber(dataset?.columns || 0)} columns
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(totalRows)} total rows
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Page {currentPage} of {formatNumber(totalPages)}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing rows {formatNumber(startRow)} - {formatNumber(endRow)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}