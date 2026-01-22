import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface ModelSelectionConfig {
  modelType: string; // 'knn', 'random_forest', 'svm'
  targetColumn: string;
  taskType: 'classification' | 'regression';
  nNeighbors?: number; // For KNN
  nEstimators?: number; // For Random Forest
  maxDepth?: number; // For Random Forest
  C?: number; // For SVM
  kernel?: string; // For SVM
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: ModelSelectionConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    if (!config.modelType || !config.targetColumn || !config.taskType) {
      return NextResponse.json(
        { error: "modelType, targetColumn, and taskType are required" },
        { status: 400 }
      );
    }

    // Map frontend model IDs to backend model names
    // Only support: KNN, Random Forest, and SVM
    const modelMapping: Record<string, string> = {
      // KNN variants
      'knn': 'knn',
      'knn-classifier': 'knn',
      'knn-regressor': 'knn',
      'k-nearest-neighbors': 'knn',
      'k-nearest-neighbors-classifier': 'knn',
      'k-nearest-neighbors-regressor': 'knn',
      // Random Forest variants
      'random-forest': 'random_forest',
      'random-forest-classifier': 'random_forest',
      'random-forest-regressor': 'random_forest',
      'random_forest': 'random_forest',
      'random_forest_classifier': 'random_forest',
      'random_forest_regressor': 'random_forest',
      // SVM variants
      'svm': 'svm',
      'svm-classifier': 'svm',
      'svm-rbf': 'svm',
      'svm-linear': 'svm',
      'support-vector-machine': 'svm',
      'support-vector-machine-classifier': 'svm',
    };

    const normalizedModelType = config.modelType.toLowerCase().trim();
    const backendModelType = modelMapping[normalizedModelType];

    // Validate that only supported models are used
    if (!backendModelType) {
      return NextResponse.json(
        { 
          error: `Unsupported model type: ${config.modelType}. Only KNN, Random Forest, and SVM are supported.`,
          supportedModels: ['knn', 'knn-classifier', 'knn-regressor', 'random-forest', 'random-forest-classifier', 'random-forest-regressor', 'svm', 'svm-classifier', 'svm-rbf']
        },
        { status: 400 }
      );
    }

    // Prepare request body for FastAPI
    const requestBody: any = {
      dataset_id: datasetId,
      model_type: backendModelType,
      target_column: config.targetColumn,
      task_type: config.taskType,
    };

    // Add model-specific parameters based on backend model type
    if (backendModelType === 'knn' && config.nNeighbors) {
      requestBody.n_neighbors = config.nNeighbors;
    } else if (backendModelType === 'random_forest') {
      if (config.nEstimators) {
        requestBody.n_estimators = config.nEstimators;
      }
      if (config.maxDepth) {
        requestBody.max_depth = config.maxDepth;
      }
    } else if (backendModelType === 'svm') {
      if (config.C) {
        requestBody.C = config.C;
      }
      if (config.kernel) {
        requestBody.kernel = config.kernel;
      }
    }

    console.log("Model selection request:", {
      url: `${FASTAPI_URL}/model-selection`,
      modelType: backendModelType,
      taskType: config.taskType,
      targetColumn: config.targetColumn
    });

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${FASTAPI_URL}/model-selection`, {
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
        
        // Provide more context for 404 errors
        if (response.status === 404) {
          if (errorMessage.includes("Dataset file not found")) {
            throw new Error(errorMessage);
          } else {
            throw new Error(
              `FastAPI endpoint not found. Please ensure the backend server is running and the endpoint '/model-selection' is registered. ` +
              `Start backend with: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
            );
          }
        }
        
        throw new Error(errorMessage);
      }

      const backendResult = await response.json();

      return NextResponse.json({
        success: true,
        modelType: backendResult.model_type,
        taskType: backendResult.task_type,
        metrics: backendResult.metrics,
        modelPath: backendResult.model_path,
        originalRows: backendResult.original_rows,
        originalColumns: backendResult.original_columns,
        predictions: backendResult.predictions,
        message: `Model selection completed successfully. Model type: ${backendResult.model_type}, Task: ${backendResult.task_type}`
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle specific error types
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
      
      // Re-throw other errors
      throw fetchError;
    }

  } catch (error: any) {
    console.error("Model selection error:", error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      statusCode = 404;
    } else if (error.message?.includes("timeout") || error.message?.includes("not responding") || error.message?.includes("Cannot connect")) {
      statusCode = 503; // Service Unavailable
    } else if (error.message?.includes("required") || error.message?.includes("400") || error.message?.includes("Invalid")) {
      statusCode = 400;
    }
    
    return NextResponse.json(
      {
        error: error.message || "Failed to process model selection",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
          : undefined
      },
      { status: statusCode }
    );
  }
}
