"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Database, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api.config";

interface PreprocessingStep {
  id: number;
  dataset_id: string;
  dataset_name: string;
  step_type: string;
  step_name: string;
  config: Record<string, any>;
  output_path: string;
  status: string;
  created_at: string;
}

interface PreprocessingStepsResponse {
  steps: PreprocessingStep[];
  total: number;
}

export function PreprocessingStepsTable() {
  const [steps, setSteps] = useState<PreprocessingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.preprocessing.steps);
      if (!response.ok) {
        throw new Error(`Failed to fetch preprocessing steps: ${response.statusText}`);
      }
      
      const data: PreprocessingStepsResponse = await response.json();
      setSteps(data.steps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteps();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    
    return (
      <Badge variant={variants[status.toLowerCase()] || "secondary"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const getStepTypeBadge = (stepType: string) => {
    const colors: Record<string, string> = {
      missing_values: "bg-blue-100 text-blue-800",
      data_cleaning: "bg-green-100 text-green-800",
      categorical_encoding: "bg-purple-100 text-purple-800",
      feature_scaling: "bg-orange-100 text-orange-800",
      feature_selection: "bg-pink-100 text-pink-800",
      feature_extraction: "bg-indigo-100 text-indigo-800",
      dataset_splitting: "bg-teal-100 text-teal-800",
    };
    
    return (
      <Badge className={colors[stepType] || "bg-gray-100 text-gray-800"}>
        {stepType.replace("_", " ")}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preprocessing Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preprocessing Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSteps}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preprocessing Steps
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{steps.length} steps</Badge>
            <Button variant="outline" size="sm" onClick={fetchSteps}>
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No preprocessing steps found</p>
            <p className="text-sm text-gray-500 mt-2">
              Apply preprocessing techniques to datasets to see them here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {steps.map((step) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStepTypeBadge(step.step_type)}
                        {getStatusBadge(step.status)}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{step.step_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Dataset: <span className="font-medium">{step.dataset_name}</span>
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(step.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          ID: {step.dataset_id}
                        </div>
                      </div>
                      {step.config && Object.keys(step.config).length > 0 && (
                        <div className="mt-3">
                          <details className="text-xs">
                            <summary className="cursor-pointer flex items-center gap-1 hover:text-gray-700">
                              <Settings className="h-3 w-3" />
                              Configuration
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(step.config, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
