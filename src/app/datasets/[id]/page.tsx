"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Info, Table as TableIcon, 
  Activity, Database, Sparkles, LayoutGrid, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DatasetStats from "@/components/dataset/DatasetStats";
import DatasetPreview from "@/components/dataset/DatasetPreview";
import { useDatasetDetail } from "@/hooks/useDataset";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DatasetErrorBoundary from "@/components/dataset/DatasetErrorBoundary";

function DatasetDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { dataset, loading, error } = useDatasetDetail(id);

  const category = useMemo(() => {
    if (!dataset) return "Standard Dataset";
    const hasNum = dataset.columnsInfo?.some(c => c.type?.toLowerCase().includes("float") || c.type?.toLowerCase().includes("int"));
    return hasNum ? "Numerical Analysis" : "Categorical Data";
  }, [dataset]);

  if (loading) {
    return (
      <div className="flex h-[90vh] items-center justify-center bg-white">
        <div className="relative flex flex-col items-center">
          <div className="size-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <Database className="absolute top-5 size-6 text-blue-600 animate-pulse" />
          <p className="mt-6 text-sm font-bold tracking-widest text-slate-400 uppercase">Synchronizing</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="flex h-[80vh] items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-10 border border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/50">
          <div className="bg-orange-50 size-16 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
             <Info className="text-orange-500 size-8 -rotate-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 italic">Oops! Data Missing</h2>
          <p className="text-slate-500 mt-2 mb-4 text-sm leading-relaxed">
            The dataset might have been moved or you don't have permission to access it.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
              <p className="text-red-700 text-sm font-medium">Error Details:</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Button asChild variant="default" className="w-full rounded-2xl h-12 bg-slate-900 hover:bg-black transition-all">
              <Link href="/datasets">Back to Library</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-2xl h-12"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* 1. Ultra-Thin Floating Navbar */}
      <nav className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[24px] px-4 py-3 flex items-center justify-between hover:border-purple-400 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Link href="/datasets" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
            <span className="text-xs font-semibold uppercase tracking-tight text-slate-700 font-sans">Dataset.Detail</span>
          </div>
          <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all">
            <Link href={`/validate?dataset=${dataset.id}`} className="flex items-center gap-2">
              Run Validation <ArrowUpRight size={14} />
            </Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        {/* 2. Hero Header Section */}
        <section className="mb-16 text-center flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              {category}
            </Badge>
            <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              ID: {dataset.id.slice(0, 8)}
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-950 mb-6 font-sans">
            {dataset.name}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <LayoutGrid size={18} className="text-blue-500" />
              <span className="text-sm font-semibold tracking-tight"><b className="text-slate-900">{dataset.columns}</b> Features</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              <span className="text-sm font-semibold tracking-tight"><b className="text-slate-900">{dataset.rows.toLocaleString()}</b> Entries</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={18} className="text-blue-500" />
              <span className="text-sm font-mono text-xs uppercase tracking-tighter truncate max-w-[200px]">{dataset.filename}</span>
            </div>
          </div>
        </section>

        {/* 3. Stats Grid (Using your component) */}
        <section className="mb-12">
           <DatasetStats dataset={dataset} />
        </section>

        {/* 4. Data Preview Section with Custom Card */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <TableIcon size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 uppercase font-sans">Raw Preview</h2>
                <p className="text-xs font-medium text-slate-400 tracking-tight">Viewing top sequence of the structural data</p>
              </div>
            </div>
          </div>

          <DatasetPreview datasetId={id} pageSize={50} dataset={dataset} />
        </div>

        {/* 5. Bottom Info Banner */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group transition-all hover:scale-[1.01]">
              <div className="relative z-10">
                <h3 className="text-2xl font-black italic mb-3 uppercase tracking-tighter">System Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  This dataset has been verified for schema consistency. You can now use it to train models or perform deep statistical validation.
                </p>
                <Button asChild className="bg-white text-black hover:bg-slate-200 rounded-xl font-semibold px-8 transition-all font-sans">
                  <Link href={`/validate?dataset=${dataset.id}`}>Run Validation</Link>
                </Button>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={120} />
              </div>
           </div>

           <div className="p-8 rounded-[32px] border border-slate-200 bg-white flex flex-col justify-center hover:border-purple-400 transition-colors duration-200">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 font-sans">Metadata Info</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm font-medium text-slate-600 font-sans">Classification</span>
                  <span className="text-sm font-semibold text-slate-900 font-sans">{category}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm font-medium text-slate-600 font-sans">Architecture</span>
                  <span className="text-sm font-semibold text-slate-900 font-sans">Tabular V2</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm font-medium text-slate-600 font-sans">File Type</span>
                  <span className="text-sm font-semibold text-slate-900 font-sans">CSV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600 font-sans">Status</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-md uppercase tracking-tight font-sans">Ready to Use</span>
                </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

export default function DatasetDetailPage() {
  return (
    <DatasetErrorBoundary>
      <DatasetDetailContent />
    </DatasetErrorBoundary>
  );
}