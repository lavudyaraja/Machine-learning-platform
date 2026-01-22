import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface FeatureScalingConfig {
  method: 'standard' | 'minmax' | 'robust' | 'maxabs' | 'quantile' | 'box_cox' | 'box-cox' | 'yeo_johnson' | 'yeo-johnson' | 'l1' | 'l2' | 'unit_vector' | 'unit-vector' | 'log' | 'decimal';
  columns: string[];
  featureRange?: [number, number]; // for minmax scaling
  withMean?: boolean; // for standard scaling
  withStd?: boolean; // for standard scaling
  withCentering?: boolean; // for robust scaling
  withScaling?: boolean; // for robust scaling
  nQuantiles?: number; // for quantile scaling
  outputDistribution?: 'uniform' | 'normal'; // for quantile scaling
  logBase?: number; // for log scaling
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: FeatureScalingConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    // Normalize method name
    let methodNormalized = config.method.toLowerCase();
    if (methodNormalized === 'box-cox') {
      methodNormalized = 'box_cox';
    } else if (methodNormalized === 'yeo-johnson') {
      methodNormalized = 'yeo_johnson';
    } else if (methodNormalized === 'unit-vector') {
      methodNormalized = 'unit_vector';
    }

    const requestBody = {
      dataset_id: datasetId,
      method: methodNormalized,
      columns: config.columns || [],
      feature_range: config.featureRange || null,
      with_mean: config.withMean !== false,
      with_std: config.withStd !== false,
      with_centering: config.withCentering !== false,
      with_scaling: config.withScaling !== false,
      n_quantiles: config.nQuantiles || 1000,
      output_distribution: config.outputDistribution || "uniform",
      log_base: config.logBase || null,
    };

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${FASTAPI_URL}/preprocess/feature-scaling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
      }

      const backendResult = await response.json();
      return NextResponse.json(backendResult);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: "Request timeout. The operation took too long." },
          { status: 408 }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error("Feature scaling error:", error);
    return NextResponse.json(
      {
        error: "Failed to scale features",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
