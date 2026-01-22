"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import BeforeValidation from "@/components/dataset/dataset-validation/BeforeValidation";
import type { ValidationConfig } from "@/components/dataset/dataset-validation/BeforeValidation";
import AfterValidation from "@/components/dataset/dataset-validation/AfterValidation";
import { useValidation } from "@/components/dataset/dataset-validation/validation";

function ValidatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const datasetId = searchParams.get("dataset");
  const targetColumn = searchParams.get("targetColumn") || undefined;
  const [validationStarted, setValidationStarted] = useState(false);
  const [validationConfig, setValidationConfig] = useState<ValidationConfig | null>(null);

  const {
    report,
    loading,
    error,
    runValidation,
    currentStep,
    progress,
    elapsedTime,
    formatTime,
    finalTime,
    currentColumn,
    totalColumns,
    columnChecks,
    validatedColumns,
  } = useValidation(datasetId || "", targetColumn);

  if (!datasetId) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-slate-900">Dataset ID is required</p>
          <Button asChild>
            <Link href="/datasets">Go to Datasets</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleRunValidation = async (config: ValidationConfig) => {
    setValidationConfig(config);
    setValidationStarted(true);
    // Config is stored in state, no localStorage needed
    await runValidation();
  };

  // Show AfterValidation if validation is complete (has report) or if validation was started and is loading
  const showResults = validationStarted && (report || loading || error);
  
  // Check if validation is currently running
  const isValidationRunning = validationStarted && loading && !report;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation Bar */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[24px] px-4 py-3 flex items-center justify-between hover:border-purple-400 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
            <span className="text-xs font-semibold uppercase tracking-tight text-slate-700 font-sans">
              {showResults ? "Validation Results" : "Configure Validation"}
            </span>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href={`/datasets/${datasetId}/preprocessing`} className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Preprocessing Techniques
            </Link>
          </Button>
        
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {showResults ? (
          <AfterValidationWrapper 
            report={report} 
            loading={loading} 
            error={error}
            datasetId={datasetId}
            currentStep={currentStep}
            progress={progress}
            elapsedTime={elapsedTime}
            formatTime={formatTime}
            finalTime={finalTime}
            currentColumn={currentColumn}
            totalColumns={totalColumns}
            columnChecks={columnChecks}
            validatedColumns={validatedColumns}
          />
        ) : (
          <BeforeValidationWrapper datasetId={datasetId} onRunValidation={handleRunValidation} />
        )}
      </main>
    </div>
  );
}

// Wrapper component to pass onRunValidation to BeforeValidation
function BeforeValidationWrapper({ 
  datasetId, 
  onRunValidation 
}: { 
  datasetId: string;
  onRunValidation: (config: ValidationConfig) => void;
}) {
  return <BeforeValidation datasetId={datasetId} onRunValidation={onRunValidation} />;
}

// Wrapper component to show loading state or results
function AfterValidationWrapper({ 
  report, 
  loading, 
  error,
  datasetId,
  currentStep,
  progress,
  elapsedTime,
  formatTime,
  finalTime,
  currentColumn,
  totalColumns,
  columnChecks,
  validatedColumns,
}: { 
  report: any; 
  loading: boolean; 
  error: string | null;
  datasetId: string;
  currentStep: string;
  progress: number;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  finalTime: number | null;
  currentColumn: string;
  totalColumns: number;
  columnChecks: Record<string, { status: "checking" | "done" | "pending"; currentCheck: string }>;
  validatedColumns: string[];
}) {

  // Show loading state
  if (loading) {
    const columnEntries = Object.entries(columnChecks);
    const doneCount = columnEntries.filter(([_, check]) => check.status === "done").length;
    const checkingCount = columnEntries.filter(([_, check]) => check.status === "checking").length;
    
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-center space-y-4 mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg font-semibold text-slate-900">Running validation...</p>
              <p className="text-sm text-slate-600">{currentStep || "Initializing..."}</p>
              {currentColumn && (
                <p className="text-sm font-medium text-blue-600">Validating column: {currentColumn}</p>
              )}
              <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-600 mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                </div>
                {totalColumns > 0 && (
                  <div className="flex items-center gap-2">
                    <span>Columns: {doneCount + checkingCount}/{totalColumns}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Column-by-column progress */}
            {columnEntries.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Column Validation Progress</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {columnEntries.map(([colName, check]) => (
                    <div 
                      key={colName}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                        check.status === "done" 
                          ? "bg-emerald-50 border-emerald-200" 
                          : check.status === "checking"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-2 h-2 rounded-full ${
                          check.status === "done" 
                            ? "bg-emerald-500" 
                            : check.status === "checking"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-slate-300"
                        }`} />
                        <span className="text-sm font-medium text-slate-900">{colName}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        check.status === "done" 
                          ? "text-emerald-700" 
                          : check.status === "checking"
                          ? "text-blue-700"
                          : "text-slate-500"
                      }`}>
                        {check.status === "done" ? "✓ Done" : check.status === "checking" ? "Checking..." : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <p className="text-lg font-semibold text-slate-900">Validation Error</p>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // Show results
  return <AfterValidation datasetId={datasetId} report={report} loading={loading} finalTime={finalTime} />;
}

export default function ValidatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600 font-medium">Loading validation...</p>
        </div>
      </div>
    }>
      <ValidatePageContent />
    </Suspense>
  );
}

