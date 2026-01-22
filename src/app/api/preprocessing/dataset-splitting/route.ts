import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface DatasetSplittingConfig {
  method: 'random' | 'stratified' | 'time_series' | 'group';
  testSize?: number;
  validationSize?: number;
  randomState?: number;
  stratifyColumn?: string;
  timeColumn?: string;
  groupColumn?: string;
  shuffle?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: DatasetSplittingConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    // Map frontend method names to backend method names
    const methodMapping: Record<string, string> = {
      'train_test': 'random',
      'train_val': 'random',
      'train_val_test': 'random',
      'stratified': 'stratified',
      'random': 'random',
      'time_series': 'time_series',
      'group': 'group'
    };

    const backendMethod = methodMapping[config.method] || config.method;

    // Prepare request body for FastAPI
    const requestBody: any = {
      dataset_id: datasetId,
      method: backendMethod,
      test_size: config.testSize || 0.2,
      validation_size: config.validationSize || null,
      random_state: config.randomState || 42,
      shuffle: config.shuffle !== false,
    };

    // Add method-specific parameters
    if (config.method === "stratified" && config.stratifyColumn) {
      requestBody.stratify_column = config.stratifyColumn;
    }
    if (config.method === "time_series" && config.timeColumn) {
      requestBody.time_column = config.timeColumn;
    }
    if (config.method === "group" && config.groupColumn) {
      requestBody.group_column = config.groupColumn;
    }

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${FASTAPI_URL}/preprocess/dataset-splitting`, {
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
              `FastAPI endpoint not found. Please ensure the backend server is running and the endpoint '/preprocess/dataset-splitting' is registered. ` +
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
    console.error("Dataset splitting error:", error);
    
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
        error: error.message || "Failed to split dataset",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
          : undefined
      },
      { status: statusCode }
    );
  }
}
