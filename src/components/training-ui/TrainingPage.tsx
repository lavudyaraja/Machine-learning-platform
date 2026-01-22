// TrainingPage.tsx'use client';

"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './Main-content';

export function MLStudioDashboard() {
  const [learningRate, setLearningRate] = useState(40);
  const [weightDecay, setWeightDecay] = useState('0.01');
  const [notes, setNotes] = useState('');
  const [selectedModel, setSelectedModel] = useState('resnet50');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadedModels, setLoadedModels] = useState<{ id: string; name: string; icon?: string }[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [hyperparameters, setHyperparameters] = useState<Record<string, any>>({});
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('datasetId');

  // Models and target column should be passed as props or fetched from backend
  // No localStorage needed - backend handles all data persistence
  useEffect(() => {
    // Initialize empty state - models should be loaded from backend or passed as props
    setLoadedModels([]);
    setActiveModelId(null);
    setTargetColumn('');
  }, [datasetId]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          weightDecay={weightDecay}
          setWeightDecay={setWeightDecay}
          notes={notes}
          setNotes={setNotes}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          loadedModels={loadedModels}
          activeModelId={activeModelId}
          onActiveModelChange={setActiveModelId}
          onHyperparametersChange={setHyperparameters}
        />
        <MainContent 
          sidebarOpen={sidebarOpen}
          activeModelId={activeModelId}
          loadedModels={loadedModels}
          datasetId={datasetId}
          targetColumn={targetColumn}
          hyperparameters={hyperparameters}
        />
      </div>
    </div>
  );
}