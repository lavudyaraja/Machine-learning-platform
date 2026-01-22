"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileCheck, Database, Type, AlertCircle, Copy, Target, BarChart3, 
  Sparkles, Shield, ShieldAlert, GitCompare, Download, Filter, Search, 
  Calendar, FileText, CheckCircle2, XCircle, AlertTriangle, Info, X, Clock, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ValidationReport, ValidationCheck as ValidationCheckType } from "@/types/validation";
import { ArrowRight } from "lucide-react";
import DatasetPreview from "@/components/dataset/DatasetPreview";

// Types
type ValidationStatus = 'pass' | 'warning' | 'fail';

interface ValidationCheck {
  id: string;
  name: string;
  category: string;
  originalCategoryId: string;
  status: ValidationStatus;
  icon: React.ElementType;
  details: string;
  message?: string;
  metrics?: { label: string; value: string | number }[];
  recommendations?: string[];
  timestamp: string;
}

interface StatusConfig {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  icon: React.ElementType;
}

// Constants
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
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

const CATEGORY_LABEL_MAP: Record<string, string> = {
  file_level: "Infrastructure",
  structure_level: "Infrastructure",
  data_type: "Quality",
  missing_data: "Quality",
  duplicate_data: "Quality",
  target_variable: "Modeling",
  class_distribution: "Modeling",
  feature_quality: "Quality",
  value_integrity: "Quality",
  data_leakage: "Security",
  dataset_consistency: "Quality",
};

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  file_level: "File Level",
  structure_level: "Structure",
  data_type: "Data Types",
  missing_data: "Missing Data",
  duplicate_data: "Duplicates",
  target_variable: "Target Variable",
  class_distribution: "Class Distribution",
  feature_quality: "Feature Quality",
  value_integrity: "Value Integrity",
  data_leakage: "Data Leakage",
  dataset_consistency: "Consistency",
};

const STATUS_CONFIGS: Record<ValidationStatus, StatusConfig> = {
  pass: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-700',
    icon: CheckCircle2
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-700',
    icon: AlertTriangle
  },
  fail: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-700',
    icon: XCircle
  }
};

// Helper Functions
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${mins}m ${secs}s`;
};

const cleanFilePath = (message: string): string => {
  if (!message) return message;
  
  // More aggressive pattern to catch all file paths
  // Match any drive letter followed by backslash and path
  let cleaned = message.replace(/[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/gi, '');
  
  // Remove Unix/Linux absolute paths
  cleaned = cleaned.replace(/\/[^\s]+\/[^\s]+/g, '');
  
  // Remove "File found at" and everything after it until end or period
  cleaned = cleaned.replace(/File found at.*?(?=\.|$)/gi, '');
  
  // Remove "path" and everything after it (usually file paths)
  cleaned = cleaned.replace(/path\s+.*?(?=\.|$)/gi, '');
  
  // Remove any remaining long strings (likely file paths or filenames)
  cleaned = cleaned.replace(/[^\s]{30,}/g, '');
  
  // Remove any text that looks like a filename with extension
  cleaned = cleaned.replace(/[^\s]+\.[a-z]{2,4}/gi, '');
  
  // Clean up multiple spaces, periods, and trim
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/\.+/g, '.').trim();
  
  // If message becomes empty or too short after cleaning, return a simple message
  if (!cleaned || cleaned.length < 3) {
    return "Validation check completed";
  }
  
  return cleaned;
};

const convertValidationCheck = (check: ValidationCheckType, timestamp: string): ValidationCheck => {
  const Icon = CATEGORY_ICON_MAP[check.category] || FileCheck;
  const category = CATEGORY_LABEL_MAP[check.category] || "Quality";
  
  // Normalize status to ensure it's one of the expected values
  const normalizedStatus: ValidationStatus = 
    (check.status === 'pass' || check.status === 'warning' || check.status === 'fail') 
      ? check.status 
      : 'warning'; // Default to 'warning' for unknown status values
  
  const metrics: { label: string; value: string | number }[] = [];
  if (check.details) {
    Object.entries(check.details).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        metrics.push({ label: key, value });
      }
    });
  }

  // For "File Exists" checks, completely replace the message to avoid file paths
  let cleanedMessage = check.message || "";
  if (check.name.toLowerCase().includes('file exists') || check.name.toLowerCase().includes('file found')) {
    cleanedMessage = normalizedStatus === 'pass' 
      ? 'File exists and is accessible' 
      : normalizedStatus === 'fail'
      ? 'File not found or inaccessible'
      : 'File validation completed';
  } else {
    // Clean up the message to remove file paths for other checks
    cleanedMessage = cleanFilePath(cleanedMessage);
  }
  
  return {
    id: check.id,
    name: check.name,
    category,
    originalCategoryId: check.category,
    status: normalizedStatus,
    icon: Icon,
    details: cleanedMessage || "No details available",
    message: normalizedStatus === 'fail' ? `${check.severity === 'blocking' ? 'Blocking' : 'Warning'} issue` : undefined,
    metrics: metrics.length > 0 ? metrics : undefined,
    timestamp,
  };
};

const getHealthScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  return 'Needs Attention';
};

const getHealthScoreBadgeClass = (score: number): string => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
};

// Sub-Components
const SummaryCard = ({ icon: Icon, label, value, subtext, hoverColor }: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtext: string;
  hoverColor: string;
}) => (
  <div className={cn("bg-white border border-slate-200 rounded-xl p-4 transition-colors", hoverColor)}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4" />
      <p className="text-xs font-semibold text-slate-600">{label}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{subtext}</p>
  </div>
);

const HealthScoreCard = ({ healthScore }: { healthScore: number }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
    <p className="text-xs font-semibold text-slate-600 mb-3">Overall Health</p>
    <div className="flex items-center justify-between">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="transparent" stroke="#3b82f6" strokeWidth="8"
            strokeLinecap="round" strokeDasharray="282.6"
            strokeDashoffset={282.6 - (282.6 * healthScore) / 100}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-900">{healthScore}%</span>
        </div>
      </div>
      <Badge className={cn("text-xs font-semibold", getHealthScoreBadgeClass(healthScore))}>
        {getHealthScoreLabel(healthScore)}
      </Badge>
    </div>
  </div>
);

const ValidationCheckCard = ({ check }: { check: ValidationCheck }) => {
  const Icon = check.icon;
  // Normalize status to ensure it's one of the expected values
  const normalizedStatus: ValidationStatus = 
    (check.status === 'pass' || check.status === 'warning' || check.status === 'fail') 
      ? check.status 
      : 'warning'; // Default to 'warning' for unknown status values
  const config = STATUS_CONFIGS[normalizedStatus];
  const StatusIcon = config.icon;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 overflow-hidden min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0", config.iconBg)}>
            <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-sm font-normal text-slate-900 truncate">{check.name}</h3>
            <Badge variant="outline" className="text-xs h-4 mt-0.5">{check.category}</Badge>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md flex-shrink-0", config.bg, config.border)}>
          <StatusIcon className={cn("h-3 w-3", config.iconColor)} />
          <span className={cn("text-xs font-bold capitalize", config.iconColor)}>{normalizedStatus}</span>
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-100">
        <p className="text-xs text-slate-600 leading-relaxed break-words break-all" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{check.details}</p>
        {check.metrics && check.metrics.length > 0 && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {check.metrics.map((metric, idx) => (
              <div key={idx} className="text-right">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-xs text-slate-700 break-words">{metric.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {check.recommendations && check.recommendations.length > 0 && (
        <div className="space-y-1.5">
          {check.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
              <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-900">{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DownloadButton = ({ icon: Icon, title, description, onClick }: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 text-sm mb-1">{title}</div>
        <div className="text-xs text-slate-600">{description}</div>
      </div>
      <div className="flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  </button>
);

// Main Component Props
interface ValidationResultsDashboardProps {
  datasetId: string;
  report: ValidationReport | null;
  loading?: boolean;
  finalTime?: number | null;
  dataset?: {
    name?: string;
    filename?: string;
    rows?: number;
    columns?: number;
  } | null;
}

export default function ValidationResultsDashboard({ 
  datasetId, 
  report, 
  loading: propLoading, 
  finalTime, 
  dataset 
}: ValidationResultsDashboardProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [datasetPreviewOpen, setDatasetPreviewOpen] = useState(false);
  const [datasetDownloadDialogOpen, setDatasetDownloadDialogOpen] = useState(false);

  // Computed values
  const validationChecks = useMemo(() => {
    if (!report) return [];
    return report.checks.map(check => convertValidationCheck(check, report.timestamp));
  }, [report]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(CATEGORY_ICON_MAP).forEach(catId => {
      counts[catId] = validationChecks.filter(check => check.originalCategoryId === catId).length;
    });
    return counts;
  }, [validationChecks]);

  const filteredChecks = useMemo(() => {
    return validationChecks.filter((check: ValidationCheck) => {
      const matchesSearch = check.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           check.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || check.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || check.category === categoryFilter;
      const matchesCategoryId = selectedCategoryId === 'all' || check.originalCategoryId === selectedCategoryId;
      return matchesSearch && matchesStatus && matchesCategory && matchesCategoryId;
    });
  }, [validationChecks, searchQuery, statusFilter, categoryFilter, selectedCategoryId]);

  const stats = useMemo(() => {
    const totalChecks = report?.totalChecks || 0;
    const passedChecks = report?.passedChecks || 0;
    const warningChecks = report?.warningChecks || 0;
    const failedChecks = report?.failedChecks || 0;
    // Use healthScore from report if available, otherwise calculate a simple one
    const healthScore = report?.healthScore ?? (totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0);
    
    return { totalChecks, passedChecks, warningChecks, failedChecks, healthScore };
  }, [report]);

  // Event handlers
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSelectedCategoryId('all');
  }, []);

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || selectedCategoryId !== 'all';

  // Loading state
  if (propLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-600">Loading validation results...</p>
        </div>
      </div>
    );
  }

  // No report state
  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
          <p className="text-sm text-slate-600">No validation report available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dataset Validation Report</h1>
          <p className="text-sm text-slate-600">{dataset?.name || dataset?.filename || "Unknown Dataset"}</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-600">{new Date(report.timestamp).toLocaleString()}</span>
            </div>
            {finalTime !== null && finalTime !== undefined && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-600">Duration: {formatTime(finalTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <HealthScoreCard healthScore={stats.healthScore} />
          <SummaryCard 
            icon={CheckCircle2} 
            label="Passed" 
            value={stats.passedChecks} 
            subtext={`of ${stats.totalChecks} checks`}
            hoverColor="hover:border-emerald-300"
          />
          <SummaryCard 
            icon={AlertTriangle} 
            label="Warnings" 
            value={stats.warningChecks} 
            subtext="needs attention"
            hoverColor="hover:border-amber-300"
          />
          <SummaryCard 
            icon={XCircle} 
            label="Failed" 
            value={stats.failedChecks} 
            subtext="critical issues"
            hoverColor="hover:border-red-300"
          />
        </div>

        {/* Export Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Export Full Report</p>
                <p className="text-xs text-slate-600">Download as CSV or Excel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setDatasetPreviewOpen(true)} size="sm" variant="outline">
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Download Dataset
              </Button>
              <Button onClick={() => setDownloadDialogOpen(true)} size="sm">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Report
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search validation checks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pass">Passed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="fail">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Quality">Quality</SelectItem>
                <SelectItem value="Modeling">Modeling</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing <span className="font-semibold text-slate-900">{filteredChecks.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{stats.totalChecks}</span> checks
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-3 sticky top-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Categories</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                    selectedCategoryId === 'all' ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>All Categories</span>
                  <Badge variant="secondary" className={cn("text-xs font-bold h-5 px-2", selectedCategoryId === 'all' && "bg-blue-500 text-white border-blue-400")}>
                    {stats.totalChecks}
                  </Badge>
                </button>
                {Object.entries(CATEGORY_ICON_MAP).map(([categoryId, IconComponent]) => {
                  const Icon = IconComponent;
                  const count = categoryCounts[categoryId] || 0;
                  const displayName = CATEGORY_DISPLAY_NAMES[categoryId] || categoryId;
                  
                  return (
                    <button
                      key={categoryId}
                      onClick={() => setSelectedCategoryId(categoryId)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                        selectedCategoryId === categoryId ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{displayName}</span>
                      </div>
                      <Badge variant="secondary" className={cn("text-xs font-bold h-5 px-2", selectedCategoryId === categoryId && "bg-blue-500 text-white border-blue-400")}>
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Validation Cards */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Validation Checks
              {selectedCategoryId !== 'all' && (
                <span className="text-base font-normal text-slate-600 ml-2">
                  - {CATEGORY_DISPLAY_NAMES[selectedCategoryId]}
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredChecks.map((check: ValidationCheck) => (
                <ValidationCheckCard key={check.id} check={check} />
              ))}
            </div>

            {filteredChecks.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-900 mb-1">No checks found</h3>
                <p className="text-sm text-slate-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Preprocessing Link */}
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Preprocessing Techniques</p>
                <p className="text-xs text-slate-600">Apply preprocessing techniques to improve your dataset quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Report Dialog */}
      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="max-w-lg border-0 bg-white ">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Download Validation Report</DialogTitle>
            <p className="text-sm text-slate-600 leading-relaxed">Export your comprehensive validation results</p>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-3">
              <DownloadButton
                icon={FileText}
                title="Download as CSV"
                description="Comma-separated values format, perfect for data analysis"
                onClick={() => setDownloadDialogOpen(false)}
              />
              <DownloadButton
                icon={FileText}
                title="Download as Excel"
                description="Microsoft Excel format with multiple sheets"
                onClick={() => setDownloadDialogOpen(false)}
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Ready for download • {stats.totalChecks} validation checks included</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dataset Preview Dialog */}
      <Dialog open={datasetPreviewOpen} onOpenChange={setDatasetPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Dataset Preview with Validation Results</DialogTitle>
            <DialogDescription>View dataset with validation check results identified</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {datasetId ? (
              <DatasetPreview 
                datasetId={datasetId} 
                pageSize={50}
              />
            ) : (
              <div className="text-center py-12 text-slate-600">
                Dataset ID not available
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDatasetPreviewOpen(false)}>Close</Button>
            <Button onClick={() => {
              setDatasetPreviewOpen(false);
              setDatasetDownloadDialogOpen(true);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download Dataset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dataset Download Dialog */}
      <Dialog open={datasetDownloadDialogOpen} onOpenChange={setDatasetDownloadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-slate-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900 text-center">Download Dataset with Validation</DialogTitle>
            <DialogDescription className="text-center">Download your dataset enhanced with validation results</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <div className="grid grid-cols-1 gap-3">
              <DownloadButton
                icon={FileText}
                title="Download as CSV"
                description="Comma-separated format with validation columns added"
                onClick={() => setDatasetDownloadDialogOpen(false)}
              />
              <DownloadButton
                icon={FileText}
                title="Download as Excel"
                description="Microsoft Excel format with validation results in organized sheets"
                onClick={() => setDatasetDownloadDialogOpen(false)}
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Ready for download • {dataset?.rows || 0} rows with validation results</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}