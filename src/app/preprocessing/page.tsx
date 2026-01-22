"use client";

import { PreprocessingStepsTable } from "@/components/preprocessing";

export default function PreprocessingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Preprocessing Steps</h1>
        <p className="text-gray-600">
          View all preprocessing techniques that have been applied to datasets in the system.
        </p>
      </div>
      
      <PreprocessingStepsTable />
    </div>
  );
}
