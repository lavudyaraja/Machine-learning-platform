"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PreprocessingConfig } from "./PreprocessingWizard";

interface PreprocessingSummaryProps {
  config: PreprocessingConfig;
}

export default function PreprocessingSummary({ config }: PreprocessingSummaryProps) {
  const steps = [
    {
      key: "missingValues",
      title: "Missing Value Handling",
      enabled: !!config.missingValues,
      details: config.missingValues
        ? `Method: ${config.missingValues.method}${config.missingValues.columns?.length ? ` (${config.missingValues.columns.length} columns)` : ""}`
        : "",
    },
    {
      key: "categoricalEncoding",
      title: "Categorical Encoding",
      enabled: !!config.categoricalEncoding,
      details: config.categoricalEncoding
        ? `Method: ${config.categoricalEncoding.method}${config.categoricalEncoding.columns?.length ? ` (${config.categoricalEncoding.columns.length} columns)` : ""}`
        : "",
    },
    {
      key: "featureScaling",
      title: "Feature Scaling",
      enabled: !!config.featureScaling,
      details: config.featureScaling
        ? `Method: ${config.featureScaling.method}${config.featureScaling.columns?.length ? ` (${config.featureScaling.columns.length} columns)` : ""}`
        : "",
    },
    {
      key: "featureSelection",
      title: "Feature Selection",
      enabled: !!config.featureSelection,
      details: config.featureSelection
        ? `Methods: ${config.featureSelection.methods?.length || 0}${config.featureSelection.selectedColumns?.length ? ` (${config.featureSelection.selectedColumns.length} columns)` : ""}`
        : "",
    },
    {
      key: "dataCleaning",
      title: "Data Cleaning",
      enabled: !!config.dataCleaning,
      details: config.dataCleaning
        ? config.dataCleaning.selectedMethods?.length
          ? `Methods: ${config.dataCleaning.selectedMethods.length}${config.dataCleaning.columns?.length ? ` (${config.dataCleaning.columns.length} columns)` : ""}`
          : "Enabled"
        : "",
    },
    // {
    //   key: "outlierHandling",
    //   title: "Outlier Handling",
    //   enabled: !!config.outlierHandling,
    //   details: config.outlierHandling
    //     ? `Method: ${config.outlierHandling.method}${config.outlierHandling.columns?.length ? ` (${config.outlierHandling.columns.length} columns)` : ""}`
    //     : "",
    // },
    // {
    //   key: "classImbalance",
    //   title: "Class Imbalance Handling",
    //   enabled: !!config.classImbalance,
    //   details: config.classImbalance
    //     ? `Method: ${config.classImbalance.method}`
    //     : "",
    // },
    {
      key: "dataTypeConversion",
      title: "Data Type Conversion",
      enabled: !!config.dataTypeConversion,
      details: config.dataTypeConversion
        ? `Conversions: ${config.dataTypeConversion.conversions?.length || 0}${config.dataTypeConversion.stringToNumeric ? ", Auto string→numeric" : ""}${config.dataTypeConversion.dateToFeatures ? ", Date→features" : ""}`
        : "",
    },
    // {
    //   key: "datasetSplitting",
    //   title: "Dataset Splitting",
    //   enabled: !!config.datasetSplitting,
    //   details: config.datasetSplitting
    //     ? `Method: ${config.datasetSplitting.method}, Train: ${((config.datasetSplitting.trainSize || 0) * 100).toFixed(0)}%, Val: ${((config.datasetSplitting.validationSize || 0) * 100).toFixed(0)}%, Test: ${((config.datasetSplitting.testSize || 0) * 100).toFixed(0)}%`
    //     : "",
    // },
  ];

  const enabledSteps = steps.filter((s) => s.enabled).length;
  const totalSteps = steps.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preprocessing Summary</CardTitle>
        <CardDescription>
          Review all configured preprocessing steps before applying
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Total Steps Configured</p>
            <p className="text-2xl font-bold">{enabledSteps} / {totalSteps}</p>
          </div>
          <Badge variant={enabledSteps > 0 ? "default" : "secondary"}>
            {enabledSteps > 0 ? "Ready" : "No steps configured"}
          </Badge>
        </div>

        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.key}
              className="flex items-start justify-between p-3 border rounded-lg"
            >
              <div className="flex items-start gap-3 flex-1">
                {step.enabled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{step.title}</p>
                  {step.enabled && step.details && (
                    <p className="text-xs text-muted-foreground mt-1">{step.details}</p>
                  )}
                  {!step.enabled && (
                    <p className="text-xs text-muted-foreground mt-1">Not configured</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {enabledSteps === 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No preprocessing steps have been configured. Configure at least one step to proceed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
