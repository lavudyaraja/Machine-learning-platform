"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MissingValueHandler, {
  type MissingValueConfig,
} from "./missing-value-handling/MissingValueHandler";
import CategoricalEncoder, {
  type CategoricalEncodingConfig,
} from "./categorical-encoding/CategoricalEncoder";
import FeatureScaler, { type FeatureScalingConfig } from "./feature-scaling/FeatureScaler";
import FeatureSelector, {
  type FeatureSelectionConfig,
} from "./feature-selection/FeatureSelector";
import DataCleaner, { type DataCleaningConfig } from "./data-cleaning/DataCleaner";
import DatasetSplitter, {
  type DatasetSplittingConfig,
} from "./dataset-splitting/DatasetSplitter";
import FeatureExtractor, {
  type FeatureExtractionConfig,
} from "./feature-extraction/FeatureExtractor";
import PreprocessingSummary from "./PreprocessingSummary";

export interface PreprocessingConfig {
  missingValues?: MissingValueConfig;
  categoricalEncoding?: CategoricalEncodingConfig;
  featureScaling?: FeatureScalingConfig;
  featureSelection?: FeatureSelectionConfig;
  featureExtraction?: FeatureExtractionConfig;
  dataCleaning?: DataCleaningConfig;
  classImbalance?: any; // ClassImbalanceConfig - module not found
  dataTypeConversion?: any; // DataTypeConversionConfig - module not found
  datasetSplitting?: DatasetSplittingConfig;
}

interface PreprocessingWizardProps {
  datasetId?: string;
  columns?: string[];
  targetColumn?: string;
  onConfigChange?: (config: PreprocessingConfig) => void;
  onApply?: (config: PreprocessingConfig) => void;
  initialConfig?: PreprocessingConfig;
}

export default function PreprocessingWizard({
  datasetId,
  columns = [],
  targetColumn,
  onConfigChange,
  onApply,
  initialConfig,
}: PreprocessingWizardProps) {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'missing-values';
  const [config, setConfig] = useState<PreprocessingConfig>(initialConfig || {});
  const [processedDatasetFromMissingHandler, setProcessedDatasetFromMissingHandler] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [processedDatasetFromDataCleaner, setProcessedDatasetFromDataCleaner] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [processedDatasetFromFeatureScaler, setProcessedDatasetFromFeatureScaler] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [processedDatasetFromFeatureSelector, setProcessedDatasetFromFeatureSelector] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [processedDatasetFromFeatureExtractor, setProcessedDatasetFromFeatureExtractor] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [processedDatasetFromDatasetSplitter, setProcessedDatasetFromDatasetSplitter] = useState<{
    datasetId: string;
    data: {
      columns: string[];
      rows: unknown[][];
      totalRows: number;
    };
  } | null>(null);
  const [finalProcessedDatasetId, setFinalProcessedDatasetId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{
    missingDataChecks?: Array<{
      column?: string;
      missingCount?: number;
      missingPercentage?: number;
      rows?: number[];
    }>;
    columnsWithMissingValues?: string[];
  } | null>(null);

  const updateConfig = (key: keyof PreprocessingConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleApply = () => {
    onApply?.(config);
  };

  // Track final processed dataset ID
  useEffect(() => {
    if (!datasetId) return;

    // Determine the final processed dataset ID based on the last step completed
    // Dataset splitting creates train split which should be used for training
    const finalId = 
      processedDatasetFromDatasetSplitter?.datasetId || // Train split from dataset splitting (highest priority)
      processedDatasetFromFeatureExtractor?.datasetId ||
      processedDatasetFromFeatureSelector?.datasetId ||
      processedDatasetFromFeatureScaler?.datasetId ||
      processedDatasetFromDataCleaner?.datasetId ||
      processedDatasetFromMissingHandler?.datasetId ||
      null;

    if (finalId && finalId !== finalProcessedDatasetId) {
      setFinalProcessedDatasetId(finalId);
      console.log(`[PreprocessingWizard] ✅ Final processed dataset ID: ${finalId} for original dataset: ${datasetId}`);
    } else if (!finalId && finalProcessedDatasetId) {
      setFinalProcessedDatasetId(null);
    }
  }, [
    datasetId,
    processedDatasetFromMissingHandler?.datasetId,
    processedDatasetFromDataCleaner?.datasetId,
    processedDatasetFromFeatureScaler?.datasetId,
    processedDatasetFromFeatureSelector?.datasetId,
    processedDatasetFromFeatureExtractor?.datasetId,
    processedDatasetFromDatasetSplitter?.datasetId,
    finalProcessedDatasetId
  ]);

  return (
    <div className="space-y-6">
      <div>
          {section === 'missing-values' && (
            <>
              {/* Missing Values Handler */}
              <div className="space-y-4">
                <MissingValueHandler
                  datasetId={datasetId}
                  columns={columns}
                  onConfigChange={(cfg) => updateConfig("missingValues", cfg)}
                  initialConfig={config.missingValues}
                  validationResults={validationResults || undefined}
                  onProcessedDatasetReady={(processedId, processedData) => {
                    setProcessedDatasetFromMissingHandler({
                      datasetId: processedId,
                      data: processedData
                    });
                  }}
                />
              </div>
            </>
          )}

          {section === 'data-cleaning' && (
            <>
              {/* Data Cleaning Handler */}
              <div className="space-y-4">
                <DataCleaner
                  datasetId={datasetId}
                  columns={processedDatasetFromMissingHandler?.data.columns || columns}
                  targetColumn={targetColumn}
                  onConfigChange={(cfg) => updateConfig("dataCleaning", cfg)}
                  initialConfig={config.dataCleaning}
                  processedDatasetFromMissingHandler={processedDatasetFromMissingHandler || undefined}
                  onProcessedDatasetReady={(processedId, processedData) => {
                    setProcessedDatasetFromDataCleaner({
                      datasetId: processedId,
                      data: processedData
                    });
                  }}
                />
              </div>
            </>
          )}

          {section === 'categorical-encoding' && (
            <>
              {/* Categorical Encoding Handler */}
              <div className="space-y-4">
                <CategoricalEncoder
                  datasetId={datasetId}
                  columns={processedDatasetFromDataCleaner?.data.columns || columns}
                  targetColumn={targetColumn}
                  onConfigChange={(cfg) => updateConfig("categoricalEncoding", cfg)}
                  initialConfig={config.categoricalEncoding}
                  processedDatasetFromDataCleaner={processedDatasetFromDataCleaner || undefined}
                />
              </div>
            </>
          )}

          {section === 'feature-scaling' && (
            <>
              {/* Feature Scaling Handler */}
              <div className="space-y-4">
                <FeatureScaler
                  datasetId={datasetId}
                  columns={processedDatasetFromDataCleaner?.data.columns || columns}
                  onConfigChange={(cfg) => updateConfig("featureScaling", cfg)}
                  initialConfig={config.featureScaling}
                  processedDatasetFromDataCleaner={processedDatasetFromDataCleaner || undefined}
                  onProcessedDatasetReady={(processedId, processedData) => {
                    setProcessedDatasetFromFeatureScaler({
                      datasetId: processedId,
                      data: processedData
                    });
                  }}
                />
              </div>
            </>
          )}

          {section === 'feature-selection' && (
            <>
              {/* Feature Selection Handler */}
              <div className="space-y-4">
                <FeatureSelector
                  datasetId={datasetId}
                  columns={processedDatasetFromFeatureScaler?.data.columns || processedDatasetFromDataCleaner?.data.columns || columns}
                  targetColumn={targetColumn}
                  onConfigChange={(cfg) => updateConfig("featureSelection", cfg)}
                  initialConfig={config.featureSelection}
                  processedDatasetFromFeatureScaler={processedDatasetFromFeatureScaler || undefined}
                  onProcessedDatasetReady={(processedId, processedData) => {
                    setProcessedDatasetFromFeatureSelector({
                      datasetId: processedId,
                      data: processedData
                    });
                  }}
                />
              </div>
            </>
          )}

          {section === 'feature-extraction' && (
            <>
              {/* Feature Extraction Handler */}
              <div className="space-y-4">
                <FeatureExtractor
                  datasetId={datasetId}
                  columns={processedDatasetFromFeatureSelector?.data.columns || processedDatasetFromFeatureScaler?.data.columns || processedDatasetFromDataCleaner?.data.columns || columns}
                  targetColumn={targetColumn}
                  onConfigChange={(cfg) => updateConfig("featureExtraction", cfg)}
                  initialConfig={config.featureExtraction}
                  processedDatasetFromFeatureSelector={processedDatasetFromFeatureSelector || undefined}
                  onProcessedDatasetReady={(processedId, processedData) => {
                    setProcessedDatasetFromFeatureExtractor({
                      datasetId: processedId,
                      data: processedData
                    });
                  }}
                />
              </div>
            </>
          )}

          {section === 'dataset-splitting' && (
            <>
              {/* Dataset Splitting Handler */}
              <div className="space-y-4">
                <DatasetSplitter
                  datasetId={
                    processedDatasetFromFeatureExtractor?.datasetId ||
                    processedDatasetFromFeatureSelector?.datasetId ||
                    processedDatasetFromFeatureScaler?.datasetId ||
                    processedDatasetFromDataCleaner?.datasetId ||
                    datasetId
                  }
                  targetColumn={targetColumn}
                  onConfigChange={(cfg) => updateConfig("datasetSplitting", cfg)}
                  initialConfig={config.datasetSplitting}
                  onProcessedDatasetReady={(trainDatasetId, trainData) => {
                    setProcessedDatasetFromDatasetSplitter({
                      datasetId: trainDatasetId,
                      data: trainData
                    });
                  }}
                />
              </div>
            </>
          )}

            
            {/* <TabsContent value="cleaning" className="space-y-4">
              <DataCleaner
                datasetId={datasetId}
                columns={columns}
                targetColumn={targetColumn}
                onConfigChange={(cfg) => updateConfig("dataCleaning", cfg)}
                initialConfig={config.dataCleaning}
              />
            </TabsContent>

            <TabsContent value="categorical" className="space-y-4">
              <CategoricalEncoder
                datasetId={datasetId}
                columns={columns}
                targetColumn={targetColumn}
                onConfigChange={(cfg) => updateConfig("categoricalEncoding", cfg)}
                initialConfig={config.categoricalEncoding}
              />
            </TabsContent>

            <TabsContent value="scaling" className="space-y-4">
              <FeatureScaler
                datasetId={datasetId}
                columns={columns}
                onConfigChange={(cfg) => updateConfig("featureScaling", cfg)}
                initialConfig={config.featureScaling}
              />
            </TabsContent>

            <TabsContent value="selection" className="space-y-4">
              <FeatureSelector
                datasetId={datasetId}
                columns={columns}
                targetColumn={targetColumn}
                onConfigChange={(cfg) => updateConfig("featureSelection", cfg)}
                initialConfig={config.featureSelection}
              />
            </TabsContent>

            <TabsContent value="extraction" className="space-y-4">
              <FeatureExtractor
                datasetId={datasetId}
                columns={columns}
                targetColumn={targetColumn}
                onConfigChange={(cfg) => updateConfig("featureExtraction", cfg)}
                initialConfig={config.featureExtraction}
              />
            </TabsContent> */}


            {/* <TabsContent value="outliers" className="space-y-4">
              <OutlierHandler
                columns={columns}
                onConfigChange={(cfg) => updateConfig("outlierHandling", cfg)}
                initialConfig={config.outlierHandling}
              />
            </TabsContent> */}
{/* 
            <TabsContent value="imbalance" className="space-y-4">
              <ClassImbalanceHandler
                targetColumn={targetColumn}
                onConfigChange={(cfg) => updateConfig("classImbalance", cfg)}
                initialConfig={config.classImbalance}
              />
            </TabsContent> */}
{/* 
            <TabsContent value="conversion" className="space-y-4">
              <DataTypeConverter
                columns={columns}
                onConfigChange={(cfg) => updateConfig("dataTypeConversion", cfg)}
                initialConfig={config.dataTypeConversion}
              />
            </TabsContent> */}

            {/* <TabsContent value="splitting" className="space-y-4">
              <DatasetSplitter
                targetColumn={targetColumn}
                onConfigChange={(cfg) => updateConfig("datasetSplitting", cfg)}
                initialConfig={config.datasetSplitting}
              />
            </TabsContent> */}

          {/* Summary Section - Commented out for now */}
          {/* <div className="space-y-4 mt-6">
            <PreprocessingSummary config={config} />
            {onApply && (
              <div className="flex justify-end mt-6">
                <Button onClick={handleApply} size="lg">
                  Apply Preprocessing
                </Button>
              </div>
            )}
          </div> */}
      </div>
    </div>
  );
}
