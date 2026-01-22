"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileCheck, Database, Type, AlertCircle, Copy, Target, BarChart3, 
  Sparkles, Shield, ShieldAlert, GitCompare, Settings, Save, Play, 
  Check, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDatasetDetail } from "@/hooks/useDataset";

// Constants
const STORAGE_KEY = 'validation-config';

// Types
interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  hasSettings?: boolean;
  settings?: Record<string, any>;
}

interface ValidationCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  checks: ValidationCheck[];
}

export interface ValidationConfig {
  enabledChecks: string[];
  settings: Record<string, Record<string, any>>;
}

// Category Icons Map
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  file_level: FileCheck,
  structure_level: Database,
  data_type: Type,
  missing_data: AlertCircle,
  duplicate_data: Copy,
  target_variable: Target,
  class_distribution: BarChart3,
  feature_quality: Sparkles,
  value_integrity: Shield,
  data_leakage: ShieldAlert,
  dataset_consistency: GitCompare,
};

// Validation Categories Configuration
const createValidationCategories = (): ValidationCategory[] => [
  {
    id: 'file_level',
    name: 'File Level',
    icon: FileCheck,
    checks: [
      { id: 'file_format', name: 'File Format', description: 'Verify file format and encoding', enabled: true },
      { id: 'file_size', name: 'File Size', description: 'Check if file size is within acceptable limits', enabled: true, hasSettings: true, settings: { maxSize: 100, unit: 'MB' } },
      { id: 'file_accessibility', name: 'File Accessibility', description: 'Ensure file is readable and accessible', enabled: true },
    ]
  },
  {
    id: 'structure_level',
    name: 'Structure',
    icon: Database,
    checks: [
      { id: 'column_names', name: 'Column Names', description: 'Validate column naming conventions', enabled: true },
      { id: 'column_count', name: 'Column Count', description: 'Verify expected number of columns', enabled: true, hasSettings: true, settings: { expectedCount: 10 } },
      { id: 'row_count', name: 'Row Count', description: 'Check minimum row requirements', enabled: true, hasSettings: true, settings: { minRows: 100 } },
      { id: 'empty_columns', name: 'Empty Columns', description: 'Detect completely empty columns', enabled: true },
    ]
  },
  {
    id: 'data_type',
    name: 'Data Types',
    icon: Type,
    checks: [
      { id: 'type_inference', name: 'Type Inference', description: 'Verify that data types inferred match the expected schema', enabled: true },
      { id: 'numeric_range', name: 'Numeric Range', description: 'Check if numeric values fall within a specified range', enabled: true, hasSettings: true, settings: { min: 0, max: 100 } },
      { id: 'categorical_values', name: 'Categorical Values', description: 'Ensure categorical features only contain expected values', enabled: false },
      { id: 'datetime_format', name: 'Datetime Format', description: 'Validate that datetime columns adhere to a consistent format', enabled: true, hasSettings: true, settings: { format: 'YYYY-MM-DD' } },
    ]
  },
  {
    id: 'missing_data',
    name: 'Missing Data',
    icon: AlertCircle,
    checks: [
      { id: 'null_detection', name: 'Null Detection', description: 'Identify null and missing values', enabled: true },
      { id: 'missing_threshold', name: 'Missing Threshold', description: 'Flag columns exceeding missing value threshold', enabled: true, hasSettings: true, settings: { threshold: 5, unit: '%' } },
      { id: 'missing_patterns', name: 'Missing Patterns', description: 'Detect systematic missing data patterns', enabled: true },
    ]
  },
  {
    id: 'duplicate_data',
    name: 'Duplicates',
    icon: Copy,
    checks: [
      { id: 'exact_duplicates', name: 'Exact Duplicates', description: 'Find completely identical rows', enabled: true },
      { id: 'key_duplicates', name: 'Key Duplicates', description: 'Check for duplicate primary keys or IDs', enabled: true, hasSettings: true, settings: { keyColumn: 'id' } },
      { id: 'partial_duplicates', name: 'Partial Duplicates', description: 'Identify near-duplicate records', enabled: false },
    ]
  },
  {
    id: 'target_variable',
    name: 'Target Variable',
    icon: Target,
    checks: [
      { id: 'target_existence', name: 'Target Existence', description: 'Verify target variable exists', enabled: true },
      { id: 'target_type', name: 'Target Type', description: 'Validate target variable data type', enabled: true },
      { id: 'target_nulls', name: 'Target Nulls', description: 'Check for missing values in target', enabled: true },
    ]
  },
  {
    id: 'class_distribution',
    name: 'Class Distribution',
    icon: BarChart3,
    checks: [
      { id: 'class_balance', name: 'Class Balance', description: 'Analyze class distribution and imbalance', enabled: true },
      { id: 'minority_class', name: 'Minority Class', description: 'Check minimum class representation', enabled: true, hasSettings: true, settings: { minPercent: 10 } },
      { id: 'class_separation', name: 'Class Separation', description: 'Evaluate separability of classes', enabled: false },
    ]
  },
  {
    id: 'feature_quality',
    name: 'Feature Quality',
    icon: Sparkles,
    checks: [
      { id: 'zero_variance', name: 'Zero Variance', description: 'Detect features with no variance', enabled: true },
      { id: 'high_correlation', name: 'High Correlation', description: 'Identify highly correlated feature pairs', enabled: true, hasSettings: true, settings: { threshold: 0.95 } },
      { id: 'feature_importance', name: 'Feature Importance', description: 'Assess preliminary feature importance', enabled: false },
    ]
  },
  {
    id: 'value_integrity',
    name: 'Value Integrity',
    icon: Shield,
    checks: [
      { id: 'outlier_detection', name: 'Outlier Detection', description: 'Identify statistical outliers', enabled: true },
      { id: 'value_constraints', name: 'Value Constraints', description: 'Verify business rule constraints', enabled: true, hasSettings: true },
      { id: 'data_consistency', name: 'Data Consistency', description: 'Check cross-field data consistency', enabled: true },
    ]
  },
  {
    id: 'data_leakage',
    name: 'Data Leakage',
    icon: ShieldAlert,
    checks: [
      { id: 'temporal_leakage', name: 'Temporal Leakage', description: 'Detect future information in features', enabled: true },
      { id: 'target_leakage', name: 'Target Leakage', description: 'Identify features derived from target', enabled: true },
      { id: 'test_leakage', name: 'Test Leakage', description: 'Check for test set information leakage', enabled: true },
    ]
  },
  {
    id: 'dataset_consistency',
    name: 'Consistency',
    icon: GitCompare,
    checks: [
      { id: 'referential_integrity', name: 'Referential Integrity', description: 'Validate foreign key relationships', enabled: true },
      { id: 'temporal_order', name: 'Temporal Order', description: 'Verify chronological ordering', enabled: true },
      { id: 'logical_consistency', name: 'Logical Consistency', description: 'Check logical rule compliance', enabled: true },
    ]
  },
];

// Configuration helpers - no local storage needed
const loadConfiguration = (): ValidationCategory[] => {
  // Always return default configuration
  // Configuration should be managed via state or backend API
  return createValidationCategories();
};

const saveConfiguration = (categories: ValidationCategory[]) => {
  // Configuration saving should be handled by backend API
  // For now, just log (can be implemented later with backend)
  console.log('Validation configuration updated:', categories);
};

// Settings Dialog Component
const SettingsDialog = ({ 
  check, 
  open, 
  onOpenChange,
  onSave 
}: { 
  check: ValidationCheck | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: Record<string, any>) => void;
}) => {
  const [settings, setSettings] = useState(check?.settings || {});

  const handleSave = () => {
    onSave(settings);
    onOpenChange(false);
  };

  if (!check) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{check.name} Settings</DialogTitle>
          <DialogDescription>{check.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Input
                id={key}
                value={value}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="h-9"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dataset Info Card Component
const DatasetInfoCard = ({ dataset }: { dataset: any }) => (
  <div className="mt-4 p-4 bg-white border-2 border-slate-200 rounded-xl">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Database className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{dataset.name}</p>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
          <span><strong>{dataset.rows?.toLocaleString() || 0}</strong> rows</span>
          <span><strong>{dataset.columns || 0}</strong> columns</span>
          <span><strong>{dataset.filename}</strong></span>
        </div>
      </div>
    </div>
  </div>
);

// Main Component Props
interface ValidationConfigurationProps {
  datasetId: string;
  onRunValidation?: (config: ValidationConfig) => void;
}

export default function ValidationConfiguration({ datasetId, onRunValidation }: ValidationConfigurationProps) {
  const [categories, setCategories] = useState<ValidationCategory[]>(loadConfiguration);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('data_type');
  const [settingsDialog, setSettingsDialog] = useState<{ check: ValidationCheck | null; open: boolean }>({
    check: null,
    open: false
  });

  const { dataset, loading: datasetLoading, error: datasetError } = useDatasetDetail(datasetId);

  const selectedCategory = useMemo(
    () => categories.find(c => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const { allChecksEnabled, enabledCount } = useMemo(() => {
    const enabled = selectedCategory?.checks.filter(c => c.enabled).length ?? 0;
    const all = selectedCategory?.checks.every(c => c.enabled) ?? false;
    return { allChecksEnabled: all, enabledCount: enabled };
  }, [selectedCategory]);

  const handleToggleCheck = useCallback((categoryId: string, checkId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          checks: cat.checks.map(check => 
            check.id === checkId ? { ...check, enabled: !check.enabled } : check
          )
        };
      }
      return cat;
    }));
  }, []);

  const handleToggleAllChecks = useCallback((categoryId: string, enabled: boolean) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          checks: cat.checks.map(check => ({ ...check, enabled }))
        };
      }
      return cat;
    }));
  }, []);

  const handleOpenSettings = useCallback((check: ValidationCheck) => {
    setSettingsDialog({ check, open: true });
  }, []);

  const handleSaveSettings = useCallback((checkId: string, settings: Record<string, any>) => {
    setCategories(prev => {
      const updated = prev.map(cat => ({
        ...cat,
        checks: cat.checks.map(check => 
          check.id === checkId ? { ...check, settings } : check
        )
      }));
      saveConfiguration(updated);
      return updated;
    });
    toast.success("Settings saved successfully");
  }, []);

  const handleSaveConfiguration = useCallback(() => {
    saveConfiguration(categories);
    toast.success("Configuration saved successfully");
  }, [categories]);

  const handleRunValidation = useCallback(() => {
    const totalEnabled = categories.reduce((sum, cat) => 
      sum + cat.checks.filter(c => c.enabled).length, 0
    );
    
    if (totalEnabled === 0) {
      toast.error("Please enable at least one validation check");
      return;
    }

    const config: ValidationConfig = {
      enabledChecks: [],
      settings: {}
    };

    categories.forEach(category => {
      category.checks.forEach(check => {
        if (check.enabled) {
          config.enabledChecks.push(`${category.id}_${check.id}`);
          if (check.settings && Object.keys(check.settings).length > 0) {
            config.settings[`${category.id}_${check.id}`] = check.settings;
          }
        }
      });
    });

    toast.info("Starting validation...");
    onRunValidation?.(config);
  }, [categories, onRunValidation]);

  if (datasetLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-600">Loading dataset information...</p>
        </div>
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="text-sm text-red-600">{datasetError || "Dataset not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Configure Validation Checks
              </h1>
              <p className="text-base text-slate-600">
                Select and customize the checks to run on your dataset. Disabled checks will be skipped.
              </p>
              <DatasetInfoCard dataset={dataset} />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveConfiguration} className="font-semibold">
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
              <Button onClick={handleRunValidation} className="bg-blue-600 hover:bg-blue-700 font-semibold">
                <Play className="h-4 w-4 mr-2" />
                Run Validation
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-white border-2 border-slate-200 rounded-xl p-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const enabledInCategory = category.checks.filter(c => c.enabled).length;
                const totalInCategory = category.checks.length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      selectedCategoryId === category.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <Badge 
                      variant={selectedCategoryId === category.id ? "secondary" : "outline"}
                      className={cn(
                        "text-xs font-bold",
                        selectedCategoryId === category.id && "bg-blue-500 text-white border-blue-400"
                      )}
                    >
                      {enabledInCategory}/{totalInCategory}
                    </Badge>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            {selectedCategory && (
              <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 px-6 py-5 bg-slate-50">
                  <div className="flex items-center gap-3">
                    {React.createElement(selectedCategory.icon, { className: "h-6 w-6 text-blue-600" })}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedCategory.name}</h2>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {enabledCount} of {selectedCategory.checks.length} checks enabled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="master-toggle" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Enable All
                    </Label>
                    <Switch
                      id="master-toggle"
                      checked={allChecksEnabled}
                      onCheckedChange={(checked) => handleToggleAllChecks(selectedCategory.id, checked)}
                    />
                  </div>
                </div>

                {/* Checks */}
                <div className="divide-y-2 divide-slate-100">
                  {selectedCategory.checks.map((check) => (
                    <div key={check.id} className="flex items-start justify-between gap-4 px-6 py-5 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{check.name}</p>
                          {check.enabled && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{check.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {check.hasSettings && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenSettings(check)}
                            className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Switch
                          checked={check.enabled}
                          onCheckedChange={() => handleToggleCheck(selectedCategory.id, check.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        check={settingsDialog.check}
        open={settingsDialog.open}
        onOpenChange={(open) => setSettingsDialog({ ...settingsDialog, open })}
        onSave={(settings) => {
          if (settingsDialog.check) {
            handleSaveSettings(settingsDialog.check.id, settings);
          }
        }}
      />
    </div>
  );
}