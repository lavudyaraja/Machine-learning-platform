"use client";

import { useParams } from "next/navigation";
import { useDatasetDetail } from "@/hooks/useDataset";
import { PreprocessingLayout } from "@/components/preprocessing";
import { Loader2, AlertTriangle, Database, Sparkles, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { clearAllPreprocessingState, debugCacheState, forceClearAndReload } from "@/utils/clearCache";
import { debugCurrentDatasetState } from "@/utils/datasetDebug";

export default function PreprocessingPage() {
  const params = useParams();
  const id = params.id as string;
  const [currentStep, setCurrentStep] = useState<string>('missing-values');
  const { dataset, loading, error } = useDatasetDetail(id);

  // Debug cache state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`[PreprocessingPage] Mounted with dataset ID: ${id}`);
      debugCacheState();
      
      // Debug current dataset state
      debugCurrentDatasetState().then(result => {
        console.log('[PreprocessingPage] Dataset debug result:', result);
      });
    }
  }, [id]);

  const handleDebugDatasets = async () => {
    console.log('[PreprocessingPage] Manual dataset debug triggered...');
    const result = await debugCurrentDatasetState();
    console.log('[PreprocessingPage] Debug result:', result);
    
    // Show an alert with the results
    if (result.urlDatasetId && result.availableDatasets) {
      const exists = result.availableDatasets.some(d => d.id === result.urlDatasetId);
      alert(`Dataset Debug Info:
Current URL Dataset ID: ${result.urlDatasetId}
Dataset Exists: ${exists}
Available Datasets: ${result.availableDatasets.length}
Available IDs: ${result.availableDatasets.map(d => d.id).join(', ')}

${!exists ? '❌ This explains the 404 error!' : '✅ Dataset should be accessible'}`);
    }
  };

  const columns = useMemo(() => {
    return dataset?.columnsInfo?.map((col) => col.name) || [];
  }, [dataset?.columnsInfo]);

  useEffect(() => {
    if (window.location.hash === '#preprocessing-layout') {
      setTimeout(() => {
        const element = document.getElementById('preprocessing-layout');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [dataset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-10 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-12 h-12 text-indigo-600 animate-pulse" />
            </div>
            <div className="absolute inset-0 border-2 border-indigo-200 rounded-2xl animate-spin border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent"></div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Loading Dataset
            </h1>
            <p className="text-sm text-slate-600">
              Preparing your preprocessing environment...
            </p>
            <div className="flex items-center justify-center gap-1 mt-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Dataset Not Found
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {error ||
                "The requested dataset could not be loaded. It may have been deleted or you may not have access to it."}
            </p>
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Dataset ID:</strong> {id}
                </p>
                <p className="text-xs text-slate-500">
                  Please check if this dataset exists or upload a new one.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  <Link href="/datasets" className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to Datasets
                  </Link>
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg transition-all"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="container max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Data Preprocessing</h1>
                <p className="text-sm text-slate-600">Dataset: <span className="font-medium text-indigo-600">{dataset.name}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{dataset.rows?.toLocaleString() || 'N/A'}</p>
                <p className="text-xs text-slate-500">Rows</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{columns.length}</p>
                <p className="text-xs text-slate-500">Columns</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugDatasets}
                className="border-blue-300 hover:bg-blue-50 text-blue-700"
              >
                <Database className="w-4 h-4 mr-2" />
                Debug Datasets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('[PreprocessingPage] Force clearing cache and reloading...');
                  forceClearAndReload();
                }}
                className="border-red-300 hover:bg-red-50 text-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Clear Cache
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-slate-300 hover:bg-slate-50"
              >
                <Link href="/datasets">Exit</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        id="preprocessing-layout" 
        className="container max-w-[1600px] mx-auto px-6 py-8"
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          <PreprocessingLayout
            datasetId={id}
            datasetName={dataset.name}
            columns={columns}
            rowCount={dataset.rows}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      </div>

      {/* Footer Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/80 shadow-lg z-40">
        <div className="container max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                Preprocessing Pipeline Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep ? 85 : 0)}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500">In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}