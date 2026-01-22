"use client";

import { useState, useMemo } from "react";
import { 
  Plus, Search, Grid3x3, List, 
  Database, X, SlidersHorizontal, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DatasetUpload from "@/components/dataset/DatasetUpload";
import DatasetCard from "@/components/dataset/DatasetCard";
import CodePreview from "@/components/dataset/CodePreview";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import { useDataset } from "@/hooks/useDataset";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Dataset } from "@/types";
import CategoricalPipeline from "@/components/common/CategoricalPipeline";
import NumericalPipeline from "@/components/common/NumericalPipeline";

export default function DatasetsPage() {
  const { datasets, loading, error, deleteDataset, updateDataset, duplicateDataset, refetch } = useDataset();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    type: "",
    minRows: "",
    maxRows: "",
    minColumns: "",
    maxColumns: "",
    minSize: "",
    maxSize: "",
    dateFrom: "",
    dateTo: ""
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredDatasets = useMemo(() => {
    // Safety check: ensure datasets is an array
    if (!datasets || !Array.isArray(datasets)) {
      return [];
    }
    
    // First, remove duplicates based on ID - more robust deduplication
    const uniqueDatasets = datasets.filter((dataset, index, arr) => {
      const firstIndex = arr.findIndex(d => d.id === dataset.id);
      if (firstIndex === index) {
        return true;
      }
      // Log duplicate detection for debugging
      console.log(`Removing duplicate dataset: ${dataset.name} (ID: ${dataset.id})`);
      return false;
    });

    console.log(`Total datasets: ${datasets.length}, Unique datasets: ${uniqueDatasets.length}`);

    return uniqueDatasets.filter((dataset) => {
      const matchesSearch = dataset.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           dataset.filename.toLowerCase().includes(debouncedSearch.toLowerCase());
      if (!matchesSearch) return false;

      // Filter by type
      if (filters.type && dataset.type !== filters.type) return false;

      // Filter by size
      if (filters.minSize) {
        const minSizeBytes = parseFloat(filters.minSize) * 1024 * 1024; // Convert MB to bytes
        if (dataset.size < minSizeBytes) return false;
      }
      if (filters.maxSize) {
        const maxSizeBytes = parseFloat(filters.maxSize) * 1024 * 1024; // Convert MB to bytes
        if (dataset.size > maxSizeBytes) return false;
      }

      // Filter by created date
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        const datasetDate = new Date(dataset.createdAt);
        if (datasetDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        const datasetDate = new Date(dataset.createdAt);
        if (datasetDate > toDate) return false;
      }

      return true;
    });
  }, [datasets, debouncedSearch, filters]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== "").length;

  const handleUpdate = async (id: string, updates: Partial<Dataset>): Promise<void> => {
    await updateDataset(id, updates);
    await refetch();
  };

  const handleDuplicate = async (id: string): Promise<void> => {
    await duplicateDataset(id);
    await refetch();
  };

  const handleDelete = (id: string): void => {
    deleteDataset(id);
    refetch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Database className="text-white size-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Dataset Library</h1>
                <p className="text-xs text-slate-500">Manage your datasets</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowCodePreview(!showCodePreview)}
                variant="outline"
                className={cn(
                  "px-4 border-slate-200",
                  showCodePreview && "bg-slate-100 text-slate-900"
                )}
              >
                {showCodePreview ? (
                  <>
                    <X className="size-4 mr-2" />
                    Close Code
                  </>
                ) : (
                  <>
                    <Code className="size-4 mr-2" />
                    View Code
                  </>
                )}
              </Button>

              <Button 
                onClick={() => setShowUpload(!showUpload)}
                className={cn(
                  "px-4",
                  showUpload ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
                )}
                
              >
                {showUpload ? (
                  <>
                    <X className="size-4 mr-2" />
                    Close
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    New Dataset
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Modal for Code Preview */}
      <Modal
        open={showCodePreview}
        onClose={() => setShowCodePreview(false)}
        // title="Dataset Processing Code"
        showCloseButton={true}
        closeOnOverlayClick={true}
      >
        <ModalBody className="p-0">
          <CodePreview
            codeSnippets={{
              import: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report`,
              load: `# Load dataset
df = pd.read_csv('dataset.csv')

# Display basic information
print(df.head())
print(df.info())
print(df.describe())`,
              preprocessing: `# Handle missing values
df = df.fillna(df.mean())

# Encode categorical variables
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['category'] = le.fit_transform(df['category'])

# Feature selection
X = df.drop('target', axis=1)
y = df['target']`,
              training: `# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
print(classification_report(y_test, y_pred))`
            }}
            title=""
            language="python"
            maxHeight="100%"
          />
        </ModalBody>
      </Modal>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Only show pipelines when datasets are available */}
        {datasets && datasets.length > 0 && (
          <div className="mb-8 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Ready to Start Preprocessing?</h2>
              <p className="text-sm text-slate-600">
                Select a dataset to begin your machine learning pipeline
              </p>
            </div>
          </div>
        )}
      </div>

      <main className="container max-w-7xl mx-auto px-4 py-8">

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="border border-slate-200 shadow-none hover:border-sky-400 transition-colors duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input 
                    placeholder="Search datasets by name or filename..."
                    className="pl-10 h-10 border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="relative border-slate-200 hover:border-sky-400 transition-colors duration-200 cursor-pointer"
                      >
                        <SlidersHorizontal className="size-4 text-slate-600" />
                        {activeFiltersCount > 0 && (
                          <span className="absolute -top-1 -right-1 size-5 bg-blue-600 text-[10px] text-white rounded-full flex items-center justify-center font-semibold">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" align="end">
                      <div className="space-y-4">
                        {/* Filter by Type */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Dataset Type</Label>
                          <Select 
                            value={filters.type || "all"} 
                            onValueChange={(v) => setFilters({...filters, type: v === "all" ? "" : v})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="tabular">Tabular (Structured)</SelectItem>
                              <SelectItem value="image">Image Sets</SelectItem>
                              <SelectItem value="text">Raw Text</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Filter by Size */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Dataset Size</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">Min Size (MB)</Label>
                              <Input
                                type="number"
                                placeholder="Min"
                                value={filters.minSize}
                                onChange={(e) => setFilters({...filters, minSize: e.target.value})}
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">Max Size (MB)</Label>
                              <Input
                                type="number"
                                placeholder="Max"
                                value={filters.maxSize}
                                onChange={(e) => setFilters({...filters, maxSize: e.target.value})}
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Filter by Created Date */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Created Date</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">From</Label>
                              <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-600">To</Label>
                              <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {activeFiltersCount > 0 && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setFilters({
                                type: "",
                                minRows: "",
                                maxRows: "",
                                minColumns: "",
                                maxColumns: "",
                                minSize: "",
                                maxSize: "",
                                dateFrom: "",
                                dateTo: ""
                              });
                            }}
                            className="w-full text-xs"
                          >
                            Clear All Filters
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="w-px h-6 bg-slate-200" />
                  
                  <ToggleGroup 
                    type="single" 
                    value={viewMode} 
                    onValueChange={(v) => v && setViewMode(v as "grid" | "list")} 
                    className="border border-slate-200 rounded-md p-1 hover:border-sky-400 transition-colors duration-200"
                  >
                    <ToggleGroupItem value="grid" className="data-[state=on]:bg-slate-100 cursor-pointer hover:border-sky-400 transition-colors duration-200">
                      <Grid3x3 className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" className="data-[state=on]:bg-slate-100 cursor-pointer hover:border-sky-400 transition-colors duration-200">
                      <List className="size-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Your Datasets</h2>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {filteredDatasets.length}
              </Badge>
            </div>
            {filteredDatasets.length > 0 && (
              <p className="text-xs text-slate-500">Sorted by: Recently Added</p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-sm text-slate-600">Loading datasets...</p>
            </div>
          ) : error ? (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-red-600">Error: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()} 
                  className="mt-4 border-red-200 text-red-600 hover:bg-red-100"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : !datasets || datasets.length === 0 ? (
            <Card className="border border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="bg-slate-100 size-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="text-slate-400 size-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Datasets Found</h3>
                <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
                  Your library is empty. Upload a CSV or tabular file to get started.
                </p>
                <Button onClick={() => setShowUpload(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                  <Plus className="size-4 mr-2" />
                  Upload Dataset
                </Button>
              </CardContent>
            </Card>
          ) : filteredDatasets.length === 0 ? (
            <Card className="border border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="bg-slate-100 size-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-400 size-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Results Found</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      type: "",
                      minRows: "",
                      maxRows: "",
                      minColumns: "",
                      maxColumns: "",
                      minSize: "",
                      maxSize: "",
                      dateFrom: "",
                      dateTo: ""
                    });
                  }}
                  className="border-slate-200"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "flex flex-col gap-4"
            )}>
              {filteredDatasets.map((dataset, index) => (
                <DatasetCard
                  key={`${dataset.id}-${index}`}
                  dataset={dataset}
                  viewMode={viewMode}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-slate-900">Upload New Dataset</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUpload(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <DatasetUpload
                onUploadSuccess={(dataset) => {
                  setShowUpload(false);
                  refetch();
                }}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
