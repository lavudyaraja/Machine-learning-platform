// Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KNNHyperparametersDialog from './KNNHyperparametersDialog';
import RandomForestHyperparametersDialog from './RandomForestHyperparametersDialog';
import { SVMHyperparametersDialog } from './SVMHyperparametersDialog';
import { DecisionTreeHyperparametersDialog } from './DecisionTreeHyperparametersDialog';
import { LogisticRegressionHyperparametersDialog } from './LogisticRegressionHyperparametersDialog';
import { MODELS_DATA } from '@/components/model-selection/constants';
import type { Model } from '@/components/model-selection/types';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  learningRate: number;
  setLearningRate: (value: number) => void;
  weightDecay: string;
  setWeightDecay: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  loadedModels: { id: string; name: string; icon?: string }[];
  activeModelId?: string | null;
  onActiveModelChange?: (modelId: string | null) => void;
  onHyperparametersChange?: (hyperparameters: Record<string, any>) => void;
}

const MODEL_TYPE_IDS = {
  KNN: ['knn-classifier', 'knn-regressor', 'k-nearest-neighbors', 'k-nearest-neighbors-classifier', 'k-nearest-neighbors-regressor'],
  RANDOM_FOREST: ['random-forest-classifier', 'random-forest-regressor'],
  SVM: ['svm-classifier', 'svm-rbf', 'svr', 'support-vector-machine', 'support-vector-machine-classifier'],
  DECISION_TREE: ['decision-tree-classifier', 'decision-tree-regressor'],
  LOGISTIC_REGRESSION: ['logistic-regression']
};

export function Sidebar({
  sidebarOpen,
  learningRate,
  setLearningRate,
  weightDecay,
  setWeightDecay,
  notes,
  setNotes,
  selectedModel,
  setSelectedModel,
  loadedModels,
  activeModelId: externalActiveModelId,
  onActiveModelChange,
  onHyperparametersChange,
}: SidebarProps) {
  const [internalActiveModelId, setInternalActiveModelId] = useState<string | null>(null);
  const activeModelId = externalActiveModelId !== undefined ? externalActiveModelId : internalActiveModelId;
  
  const setActiveModelId = (id: string | null) => {
    if (onActiveModelChange) {
      onActiveModelChange(id);
    } else {
      setInternalActiveModelId(id);
    }
  };
  
  const [knnDialogOpen, setKnnDialogOpen] = useState(false);
  const [rfDialogOpen, setRfDialogOpen] = useState(false);
  const [svmDialogOpen, setSvmDialogOpen] = useState(false);
  const [dtDialogOpen, setDtDialogOpen] = useState(false);
  const [lrDialogOpen, setLrDialogOpen] = useState(false);
  const [earlyStoppingEnabled, setEarlyStoppingEnabled] = useState(true);
  const [patience, setPatience] = useState(5);
  const [minDelta, setMinDelta] = useState(0.001);
  const [hyperparameterTuningEnabled, setHyperparameterTuningEnabled] = useState(false);
  const [tuningMethod, setTuningMethod] = useState('grid');

  // Set first model as active by default when models are loaded (only if not externally controlled)
  useEffect(() => {
    if (externalActiveModelId === undefined && loadedModels.length > 0 && !activeModelId) {
      setActiveModelId(loadedModels[0].id);
    } else if (externalActiveModelId === undefined && loadedModels.length === 0) {
      setActiveModelId(null);
    }
  }, [loadedModels, activeModelId, externalActiveModelId]);

  const getModelType = (modelId: string | null): string | null => {
    if (!modelId) return null;
    const lowercaseId = modelId.toLowerCase();
    
    if (MODEL_TYPE_IDS.KNN.includes(lowercaseId)) return 'KNN';
    if (MODEL_TYPE_IDS.RANDOM_FOREST.includes(lowercaseId)) return 'RANDOM_FOREST';
    if (MODEL_TYPE_IDS.SVM.includes(lowercaseId)) return 'SVM';
    if (MODEL_TYPE_IDS.DECISION_TREE.includes(lowercaseId)) return 'DECISION_TREE';
    if (MODEL_TYPE_IDS.LOGISTIC_REGRESSION.includes(lowercaseId)) return 'LOGISTIC_REGRESSION';
    
    return null;
  };

  const openDialogForModel = (modelId: string) => {
    const modelType = getModelType(modelId);
    
    switch (modelType) {
      case 'KNN':
        setKnnDialogOpen(true);
        break;
      case 'RANDOM_FOREST':
        setRfDialogOpen(true);
        break;
      case 'SVM':
        setSvmDialogOpen(true);
        break;
      case 'DECISION_TREE':
        setDtDialogOpen(true);
        break;
      case 'LOGISTIC_REGRESSION':
        setLrDialogOpen(true);
        break;
    }
  };

  const handleModelClick = (modelId: string) => {
    setActiveModelId(modelId);
    openDialogForModel(modelId);
  };

  const handleInfoClick = (modelId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveModelId(modelId);
    openDialogForModel(modelId);
  };

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className="w-72 border-r border-slate-200 bg-white overflow-hidden flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Loaded Models */}
          <section>
            <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3">
              Loaded Models
            </h3>
            {loadedModels.length === 0 ? (
              <p className="text-xs text-slate-400">No models loaded yet</p>
            ) : (
              <div className="space-y-2">
                {loadedModels.map((model) => {
                  const isActive = activeModelId === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleModelClick(model.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors group ${
                        isActive
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-lg shrink-0">{model.icon || '🎯'}</span>
                        <span className={`text-sm font-semibold truncate ${
                          isActive ? 'text-blue-900' : 'text-slate-900'
                        }`}>
                          {model.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Info 
                          className={`w-4 h-4 transition-colors cursor-pointer ${
                            isActive 
                              ? 'text-blue-600' 
                              : 'text-slate-400 group-hover:text-blue-600'
                          }`}
                          onClick={(e) => handleInfoClick(model.id, e)}
                        />
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Hyperparameter Tuning */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                Hyperparameter Tuning
              </h3>
              <Switch
                checked={hyperparameterTuningEnabled}
                onCheckedChange={setHyperparameterTuningEnabled}
              />
            </div>
            {hyperparameterTuningEnabled && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">
                    Tuning Method
                  </label>
                  <Select value={tuningMethod} onValueChange={setTuningMethod}>
                    <SelectTrigger className="w-full bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Search</SelectItem>
                      <SelectItem value="random">Random Search</SelectItem>
                      <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">
                    Learning Rate Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="bg-white border-slate-200 text-xs"
                      defaultValue="0.0001"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="bg-white border-slate-200 text-xs"
                      defaultValue="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Early Stopping */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                Early Stopping
              </h3>
              <Switch
                checked={earlyStoppingEnabled}
                onCheckedChange={setEarlyStoppingEnabled}
              />
            </div>
            {earlyStoppingEnabled && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">
                      Patience
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {patience}
                    </span>
                  </div>
                  <Slider
                    value={[patience]}
                    onValueChange={(value) => setPatience(value[0])}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">
                      Min Delta
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {minDelta}
                    </span>
                  </div>
                  <Slider
                    value={[minDelta]}
                    onValueChange={(value) => setMinDelta(value[0])}
                    max={0.01}
                    min={0.0001}
                    step={0.0001}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Training Notes */}
          <section>
            <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3">
              Training Notes
            </h3>
            <div className="relative">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add observation notes..."
                className="h-28 resize-none"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-3 right-3 text-slate-500 hover:text-blue-600"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </div>
      </aside>

      {/* Hyperparameters Dialogs */}
      <KNNHyperparametersDialog
        open={knnDialogOpen}
        onOpenChange={setKnnDialogOpen}
        onSave={(params) => {
          if (onHyperparametersChange && activeModelId) {
            onHyperparametersChange({
              ...params,
              modelId: activeModelId,
            });
          }
        }}
      />
      <RandomForestHyperparametersDialog
        open={rfDialogOpen}
        onOpenChange={setRfDialogOpen}
        onSave={(params) => {
          if (onHyperparametersChange && activeModelId) {
            onHyperparametersChange({
              ...params,
              modelId: activeModelId,
            });
          }
        }}
      />
      <SVMHyperparametersDialog
        open={svmDialogOpen}
        onOpenChange={setSvmDialogOpen}
      />
      <DecisionTreeHyperparametersDialog
        open={dtDialogOpen}
        onOpenChange={setDtDialogOpen}
      />
      <LogisticRegressionHyperparametersDialog
        open={lrDialogOpen}
        onOpenChange={setLrDialogOpen}
      />
    </>
  );
}