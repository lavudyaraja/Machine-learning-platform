"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Copy, Check, BookOpen, Lightbulb, Target, Zap, FileText, Download, File } from "lucide-react";
import { missingValueData } from "../missingValueData";

interface DialogsProps {
  // Download Report Dialog
  downloadDialogOpen: boolean;
  onDownloadDialogChange: (open: boolean) => void;
  onDownloadReportPDF?: () => void;
  onDownloadReportExcel?: () => void;
  onDownloadReportCSV?: () => void;

  // Download Dataset Dialog
  datasetDownloadDialogOpen: boolean;
  onDatasetDownloadDialogChange: (open: boolean) => void;
  onDownloadDatasetCSV?: () => void;
  onDownloadDatasetExcel?: () => void;

  // Method Tooltip Dialog
  tooltipOpen: boolean;
  selectedMethodForTooltip: string | null;
  copiedCode: boolean;
  onTooltipChange: (open: boolean) => void;
  onCopyMethodCode: () => void;
  getCategoryColor: (category: string) => string;
}

export function Dialogs({
  downloadDialogOpen,
  onDownloadDialogChange,
  onDownloadReportPDF,
  onDownloadReportExcel,
  onDownloadReportCSV,
  datasetDownloadDialogOpen,
  onDatasetDownloadDialogChange,
  onDownloadDatasetCSV,
  onDownloadDatasetExcel,
  tooltipOpen,
  selectedMethodForTooltip,
  copiedCode,
  onTooltipChange,
  onCopyMethodCode,
  getCategoryColor,
}: DialogsProps) {
  const methodInfo = selectedMethodForTooltip
    ? missingValueData.find((m) => m.id === selectedMethodForTooltip)
    : null;

  return (
    <>
      {/* Download Report Dialog */}
      <Dialog open={downloadDialogOpen} onOpenChange={onDownloadDialogChange}>
        <DialogContent className="max-w-md border-2 border-slate-200 dark:border-slate-700 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="h-6 w-6 text-blue-600" />
              Download Report
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Choose your preferred format for the analysis report
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {onDownloadReportPDF && (
              <Button
                onClick={onDownloadReportPDF}
                className="w-full justify-start h-auto py-4 px-4 bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-300 rounded-lg transition-all group"
                variant="outline"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-slate-900">Download as PDF</p>
                    <p className="text-xs text-slate-600">Professional report with charts</p>
                  </div>
                </div>
              </Button>
            )}

            {onDownloadReportExcel && (
              <Button
                onClick={onDownloadReportExcel}
                className="w-full justify-start h-auto py-4 px-4 bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-300 rounded-lg transition-all group"
                variant="outline"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <File className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-slate-900">Download as Excel</p>
                    <p className="text-xs text-slate-600">Microsoft Excel (.xlsx) with multiple sheets</p>
                  </div>
                </div>
              </Button>
            )}

            {onDownloadReportCSV && (
              <Button
                onClick={onDownloadReportCSV}
                className="w-full justify-start h-auto py-4 px-4 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-lg transition-all group"
                variant="outline"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-slate-900">Download as CSV</p>
                    <p className="text-xs text-slate-600">Comma-separated values</p>
                  </div>
                </div>
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onDownloadDialogChange(false)}
              className="border-2 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Dataset Dialog */}
      <Dialog open={datasetDownloadDialogOpen} onOpenChange={onDatasetDownloadDialogChange}>
        <DialogContent className="max-w-md border-2 border-slate-200 dark:border-slate-700 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="h-6 w-6 text-indigo-600" />
              Download Dataset
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Export processed dataset with statistical results
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {onDownloadDatasetCSV && (
              <Button
                onClick={onDownloadDatasetCSV}
                className="w-full justify-start h-auto py-4 px-4 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-lg transition-all group"
                variant="outline"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-slate-900">Download as CSV</p>
                    <p className="text-xs text-slate-600">With result_of_mean, result_of_mode columns</p>
                  </div>
                </div>
              </Button>
            )}

            {onDownloadDatasetExcel && (
              <Button
                onClick={onDownloadDatasetExcel}
                className="w-full justify-start h-auto py-4 px-4 bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-300 rounded-lg transition-all group"
                variant="outline"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <File className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-slate-900">Download as Excel</p>
                    <p className="text-xs text-slate-600">Multiple sheets with data and statistics</p>
                  </div>
                </div>
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onDatasetDownloadDialogChange(false)}
              className="border-2 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Method Tooltip Dialog */}
      <Dialog open={tooltipOpen} onOpenChange={onTooltipChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-slate-200 dark:border-slate-700 rounded-xl">
          {methodInfo && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{methodInfo.icon}</span>
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {methodInfo.title}
                  </DialogTitle>
                </div>
                <Badge className={`${getCategoryColor(methodInfo.category)} border-0`}>
                  {methodInfo.category}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Definition
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  {methodInfo.definition}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Concept
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  {methodInfo.concept}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Target className="h-5 w-5 text-green-600" />
                  Used For
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  {methodInfo.usedFor}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Code2 className="h-5 w-5 text-purple-600" />
                    Implementation Insight
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCopyMethodCode}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-600" />
                    )}
                  </Button>
                </div>

                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto border-2 border-slate-800">
                  {methodInfo.implementationInsight}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Effect
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  {methodInfo.effect}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
