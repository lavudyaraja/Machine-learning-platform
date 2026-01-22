import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface TrainingRequest {
  datasetId: string;
  modelId: string;
  targetColumn: string;
  taskType: 'classification' | 'regression';
  hyperparameters?: Record<string, any>;
}

// Map frontend model IDs to backend model types
const modelMapping: Record<string, string> = {
  // KNN
  'knn': 'knn',
  'knn-classifier': 'knn',
  'knn-regressor': 'knn',
  'k-nearest-neighbors': 'knn',
  'k-nearest-neighbors-classifier': 'knn',
  'k-nearest-neighbors-regressor': 'knn',
  // Random Forest
  'random-forest': 'random_forest',
  'random-forest-classifier': 'random_forest',
  'random-forest-regressor': 'random_forest',
  'random_forest': 'random_forest',
  'random_forest_classifier': 'random_forest',
  'random_forest_regressor': 'random_forest',
  // SVM
  'svm': 'svm',
  'svm-classifier': 'svm',
  'svm-rbf': 'svm',
  'svm-linear': 'svm',
  'support-vector-machine': 'svm',
  'support-vector-machine-classifier': 'svm',
  // Decision Tree
  'decision-tree': 'decision_tree',
  'decision-tree-classifier': 'decision_tree',
  'decision-tree-regressor': 'decision_tree',
  // Logistic Regression
  'logistic-regression': 'logistic_regression',
  // XGBoost
  'xgboost': 'xgboost',
  'xgboost-classifier': 'xgboost',
  'xgboost-regressor': 'xgboost',
  // LightGBM
  'lightgbm': 'lightgbm',
  'lightgbm-classifier': 'lightgbm',
  'lightgbm-regressor': 'lightgbm',
};

// Convert hyperparameters to backend format
function convertHyperparameters(modelType: string, hyperparameters: Record<string, any>): Record<string, any> {
  const config: Record<string, any> = { model_type: modelType };
  
  // Add epochs and batch_size if provided
  if (hyperparameters.epochs !== undefined && hyperparameters.epochs !== null) {
    config.epochs = hyperparameters.epochs;
  }
  if (hyperparameters.batch_size !== undefined && hyperparameters.batch_size !== null) {
    config.batch_size = hyperparameters.batch_size;
  }
  
  if (modelType === 'knn') {
    if (hyperparameters.kValue) config.n_neighbors = hyperparameters.kValue;
    if (hyperparameters.distanceMetric) config.metric = hyperparameters.distanceMetric;
    if (hyperparameters.weightFunction) config.weights = hyperparameters.weightFunction;
    if (hyperparameters.algorithm) config.algorithm = hyperparameters.algorithm;
    if (hyperparameters.minkowskiP) config.p = hyperparameters.minkowskiP;
  } else if (modelType === 'random_forest') {
    if (hyperparameters.nEstimators) config.n_estimators = hyperparameters.nEstimators;
    if (hyperparameters.maxDepth) config.max_depth = hyperparameters.maxDepth;
    if (hyperparameters.minSamplesSplit) config.min_samples_split = hyperparameters.minSamplesSplit;
    if (hyperparameters.minSamplesLeaf) config.min_samples_leaf = hyperparameters.minSamplesLeaf;
    if (hyperparameters.maxFeatures) config.max_features = hyperparameters.maxFeatures;
    if (hyperparameters.criterion) config.criterion = hyperparameters.criterion;
  } else if (modelType === 'svm') {
    if (hyperparameters.C) config.C = hyperparameters.C;
    if (hyperparameters.kernel) config.kernel = hyperparameters.kernel;
    if (hyperparameters.gamma) config.gamma = hyperparameters.gamma;
    if (hyperparameters.degree) config.degree = hyperparameters.degree;
  } else if (modelType === 'decision_tree') {
    if (hyperparameters.maxDepth) config.max_depth = hyperparameters.maxDepth;
    if (hyperparameters.minSamplesSplit) config.min_samples_split = hyperparameters.minSamplesSplit;
    if (hyperparameters.minSamplesLeaf) config.min_samples_leaf = hyperparameters.minSamplesLeaf;
    if (hyperparameters.criterion) config.criterion = hyperparameters.criterion;
  } else if (modelType === 'logistic_regression') {
    if (hyperparameters.C) config.C = hyperparameters.C;
    if (hyperparameters.penalty) config.penalty = hyperparameters.penalty;
    if (hyperparameters.solver) config.solver = hyperparameters.solver;
    if (hyperparameters.maxIter) config.max_iter = hyperparameters.maxIter;
  }
  
  return config;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrainingRequest = await request.json();

    if (!body.datasetId || !body.modelId || !body.targetColumn || !body.taskType) {
      return NextResponse.json(
        { error: "datasetId, modelId, targetColumn, and taskType are required" },
        { status: 400 }
      );
    }

    // Map model ID to backend model type
    const normalizedModelId = body.modelId.toLowerCase().trim();
    const backendModelType = modelMapping[normalizedModelId];

    if (!backendModelType) {
      return NextResponse.json(
        { 
          error: `Unsupported model: ${body.modelId}`,
          supportedModels: Object.keys(modelMapping)
        },
        { status: 400 }
      );
    }

    // Convert hyperparameters
    const modelConfig = convertHyperparameters(backendModelType, body.hyperparameters || {});

    // Prepare request for FastAPI
    const trainRequest = {
      dataset_id: body.datasetId,
      model_config: modelConfig,
      target_column: body.targetColumn,
      task_type: body.taskType,
    };

    console.log("Training request:", {
      url: `${FASTAPI_URL}/train`,
      modelType: backendModelType,
      modelConfig: modelConfig,
      taskType: body.taskType,
      targetColumn: body.targetColumn
    });

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for job creation

    try {
      const response = await fetch(`${FASTAPI_URL}/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        jobId: result.job_id,
        taskId: result.task_id,
        status: result.status,
        message: result.message || "Training job created successfully",
        websocketUrl: `ws://localhost:8000/ws/${result.job_id}`
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error(
          `Connection timeout: FastAPI backend at ${FASTAPI_URL} is not responding. ` +
          `Please ensure the backend server is running.`
        );
      }
      
      if (fetchError.message?.includes('fetch failed') || fetchError.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to FastAPI backend at ${FASTAPI_URL}. ` +
          `Please start the backend server.`
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error("Training API error:", error);
    
    let statusCode = 500;
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      statusCode = 404;
    } else if (error.message?.includes("timeout") || error.message?.includes("Cannot connect")) {
      statusCode = 503;
    } else if (error.message?.includes("required") || error.message?.includes("400")) {
      statusCode = 400;
    }
    
    return NextResponse.json(
      {
        error: error.message || "Failed to create training job",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running"
          : undefined
      },
      { status: statusCode }
    );
  }
}
