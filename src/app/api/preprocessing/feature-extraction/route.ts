import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface FeatureExtractionConfig {
  method: 'pca' | 'lda' | 'ica' | 'svd' | 'factor_analysis' | 'tsne' | 'umap';
  nComponents?: number;
  varianceThreshold?: number;
  columns?: string[];
  targetColumn?: string;
  randomState?: number;
  // Method-specific parameters
  svdSolver?: string;
  whiten?: boolean;
  tol?: number;
  solver?: string;
  shrinkage?: number;
  algorithm?: string;
  fun?: string;
  maxIter?: number;
  nIter?: number;
  perplexity?: number;
  earlyExaggeration?: number;
  learningRate?: string | number;
  nNeighbors?: number;
  minDist?: number;
  metric?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: FeatureExtractionConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    // Prepare request body for FastAPI
    const requestBody: any = {
      dataset_id: datasetId,
      method: config.method,
      columns: config.columns && config.columns.length > 0 ? config.columns : undefined,
      n_components: config.nComponents || 2,
      target_column: config.targetColumn || null,
      variance_threshold: config.varianceThreshold || null,
      random_state: config.randomState || 42,
    };

    // Add method-specific parameters
    if (config.method === "pca") {
      if (config.svdSolver !== undefined) requestBody.svd_solver = config.svdSolver;
      if (config.whiten !== undefined) requestBody.whiten = config.whiten;
      if (config.tol !== undefined) requestBody.tol = config.tol;
    } else if (config.method === "lda") {
      if (config.solver !== undefined) requestBody.solver = config.solver;
      if (config.shrinkage !== undefined) requestBody.shrinkage = config.shrinkage;
    } else if (config.method === "ica") {
      if (config.algorithm !== undefined) requestBody.algorithm = config.algorithm;
      if (config.fun !== undefined) requestBody.fun = config.fun;
      if (config.maxIter !== undefined) requestBody.max_iter = config.maxIter;
    } else if (config.method === "svd") {
      if (config.nIter !== undefined) requestBody.n_iter = config.nIter;
    } else if (config.method === "tsne") {
      if (config.perplexity !== undefined) requestBody.perplexity = config.perplexity;
      if (config.earlyExaggeration !== undefined) requestBody.early_exaggeration = config.earlyExaggeration;
      if (config.learningRate !== undefined) requestBody.learning_rate = config.learningRate;
    } else if (config.method === "umap") {
      if (config.nNeighbors !== undefined) requestBody.n_neighbors = config.nNeighbors;
      if (config.minDist !== undefined) requestBody.min_dist = config.minDist;
      if (config.metric !== undefined) requestBody.metric = config.metric;
    }

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${FASTAPI_URL}/preprocess/feature-extraction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        
        throw new Error(errorMessage);
      }

      const backendResult = await response.json();
      return NextResponse.json(backendResult);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_HEADERS_TIMEOUT') {
        throw new Error(
          `Connection timeout: FastAPI backend at ${FASTAPI_URL} is not responding. ` +
          `Please ensure the backend server is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
        );
      }
      
      if (fetchError.message?.includes('fetch failed') || 
          fetchError.message?.includes('ECONNREFUSED') ||
          fetchError.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to FastAPI backend at ${FASTAPI_URL}. ` +
          `Please start the backend server: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error("Feature extraction error:", error);
    
    let statusCode = 500;
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      statusCode = 404;
    } else if (error.message?.includes("timeout") || error.message?.includes("not responding") || error.message?.includes("Cannot connect")) {
      statusCode = 503;
    } else if (error.message?.includes("required") || error.message?.includes("400") || error.message?.includes("Invalid method")) {
      statusCode = 400;
    }
    
    return NextResponse.json(
      {
        error: error.message || "Failed to perform feature extraction",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
          : undefined
      },
      { status: statusCode }
    );
  }
}
