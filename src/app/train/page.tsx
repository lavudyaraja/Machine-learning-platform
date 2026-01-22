"use client";

import { Suspense } from "react";
import { MLStudioDashboard } from "@/components/training-ui/TrainingPage";

function TrainPageContent() {
  return <MLStudioDashboard />;
}

export default function TrainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="size-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading Training Studio...</p>
        </div>
      </div>
    }>
      <TrainPageContent />
    </Suspense>
  );
}