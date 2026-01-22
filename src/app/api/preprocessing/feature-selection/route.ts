import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface FeatureSelectionConfig {
  method: 'variance_threshold' | 'correlation' | 'mutual_info' | 'chi2' | 'f_test' | 'forward_selection' | 'backward_elimination' | 'rfe' | 'recursive_elimination' | 'lasso' | 'ridge' | 'elastic_net' | 'tree_importance';
  nFeatures?: number;
  threshold?: number;
  targetColumn?: string;
  correlationThreshold?: number;
  columns?: string[];
  alpha?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: FeatureSelectionConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    // Map frontend method names to backend method names
    const methodMapping: Record<string, string> = {
      'variance_threshold': 'variance_threshold',
      'correlation': 'correlation',
      'chi_square': 'chi2',
      'chi2': 'chi2',
      'mutual_info': 'mutual_info',
      'forward_selection': 'forward_selection',
      'backward_elimination': 'backward_elimination',
      'rfe': 'rfe',
      'recursive_elimination': 'rfe',
      'lasso': 'lasso',
      'ridge': 'ridge',
      'elastic_net': 'elastic_net',
      'tree_importance': 'tree_importance',
      'f_test': 'f_test'
    };

    const backendMethod = methodMapping[config.method] || config.method;

    // Prepare request body for FastAPI
    const requestBody = {
      dataset_id: datasetId,
      method: backendMethod,
      columns: config.columns || [],
      target_column: config.targetColumn || null,
      n_features: config.nFeatures || null,
      threshold: config.threshold || 0.0,
      correlation_threshold: config.correlationThreshold || 0.8,
      alpha: config.alpha || 0.01
    };

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${FASTAPI_URL}/preprocess/feature-selection`, {
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
        
        if (response.status === 404) {
          if (errorMessage.includes("Dataset file not found")) {
            throw new Error(errorMessage);
          } else {
            throw new Error(
              `FastAPI endpoint not found. Please ensure the backend server is running and the endpoint '/preprocess/feature-selection' is registered. ` +
              `Start backend with: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
            );
          }
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
    console.error("Feature selection error:", error);
    
    let statusCode = 500;
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      statusCode = 404;
    } else if (error.message?.includes("timeout") || error.message?.includes("not responding") || error.message?.includes("Cannot connect")) {
      statusCode = 503;
    } else if (error.message?.includes("required") || error.message?.includes("400")) {
      statusCode = 400;
    }
    
    return NextResponse.json(
      {
        error: error.message || "Failed to perform feature selection",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
          : undefined
      },
      { status: statusCode }
    );
  }
}
