import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface DataCleaningConfig {
  selectedMethods?: string[];
  columns?: string[];
  strategy?: string | string[];
  categoricalStrategy?: string | string[];
  logTransformMethod?: string | string[];
  outlierMethod?: string | string[];
  skewnessMethod?: string | string[];
  textNormalizerMethod?: string | string[];
  whitespaceTrimmerMethod?: string | string[];
  imbalanceHandlerMethod?: string | string[];
  consistencyFixerMethod?: string | string[];
  duplicateRemoverMethod?: string | string[];
  noisyDataMethod?: string | string[];
  targetColumn?: string;
  constantValue?: string | number;
  categoricalConstantValue?: string;
  threshold?: number;
  windowSize?: number;
  removeSpecialChars?: boolean;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: DataCleaningConfig;
    };

    if (!datasetId || !config || !config.selectedMethods || config.selectedMethods.length === 0) {
      return NextResponse.json(
        { error: "Dataset ID, configuration, and at least one selected method are required" },
        { status: 400 }
      );
    }

    // Map frontend method names to backend format
    const methodMapping: Record<string, { method_type: string; method: string }> = {
      "handling_missing_values": {
        method_type: config.strategy === "forward_fill" || config.strategy === "backward_fill" || config.strategy === "drop" 
          ? "common" 
          : config.categoricalStrategy ? "categorical" : "numerical",
        method: config.strategy === "forward_fill" ? "apply_forward_fill"
          : config.strategy === "backward_fill" ? "apply_backward_fill"
          : config.strategy === "drop" ? "drop_rows_with_missing"
          : config.categoricalStrategy ? "handle_missing_values" : "handle_missing_values"
      },
      "removing_duplicates": { method_type: "common", method: "remove_duplicates" },
      "fixing_inconsistent_data": { method_type: "categorical", method: "fix_consistency" },
      "correcting_data_types": { method_type: "common", method: "correct_data_types" },
      "null_column_dropper": { method_type: "common", method: "drop_null_columns" },
      "whitespace_trimmer": { method_type: "categorical", method: "trim_whitespace" },
      "standardizing_text": { method_type: "categorical", method: "standardize_text" },
      "log_transformer": { method_type: "numerical", method: "apply_log_transformation" },
      "date_time_parser": { method_type: "common", method: "parse_datetime" },
      "unit_converter": { method_type: "numerical", method: "convert_units" },
      "handling_outliers": { method_type: "numerical", method: "handle_outliers" },
      "imbalance_handler": { method_type: "categorical", method: "handle_class_imbalance" },
      "skewness_fixer": { method_type: "numerical", method: "fix_skewness" },
      "collinearity_remover": { method_type: "numerical", method: "remove_collinearity" },
      "noisy_data_smoother": { method_type: "numerical", method: "smooth_noisy_data" },
      "handling_invalid_values": { method_type: "common", method: "validate_data" },
      "removing_irrelevant_features": { method_type: "common", method: "drop_columns" },
    };

    // Process first selected method (backend processes one at a time)
    const firstMethod = config.selectedMethods[0];
    const methodMap = methodMapping[firstMethod];
    
    if (!methodMap) {
      return NextResponse.json(
        { error: `Unknown method: ${firstMethod}` },
        { status: 400 }
      );
    }

    // Build request body for backend
    const requestBody: any = {
      dataset_id: datasetId,
      method_type: methodMap.method_type,
      method: methodMap.method,
      columns: config.columns || [],
    };

    // Add method-specific parameters
    // Handle strategy mapping
    if (config.strategy === "zero") {
      // Zero fill is handled as constant value = 0
      requestBody.constant_value = 0;
      requestBody.strategy = "constant";
    } else if (config.strategy) {
      requestBody.strategy = config.strategy;
    }
    if (config.categoricalStrategy) {
      requestBody.strategy = config.categoricalStrategy;
    }
    if (config.constantValue !== undefined && config.strategy !== "zero") {
      requestBody.constant_value = config.constantValue;
    }
    if (config.categoricalConstantValue !== undefined) {
      requestBody.constant_value = config.categoricalConstantValue;
    }
    if (config.threshold !== undefined) {
      requestBody.threshold = config.threshold;
    }
    if (config.targetColumn) {
      requestBody.target_column = config.targetColumn;
    }
    if (config.textNormalizerMethod) {
      requestBody.text_method = config.textNormalizerMethod;
    }
    if (config.whitespaceTrimmerMethod) {
      requestBody.trim_method = config.whitespaceTrimmerMethod;
    }
    if (config.imbalanceHandlerMethod) {
      requestBody.imbalance_method = config.imbalanceHandlerMethod;
    }
    if (config.logTransformMethod) {
      requestBody.log_method = config.logTransformMethod;
    }
    if (config.outlierMethod) {
      requestBody.outlier_method = config.outlierMethod;
    }
    if (config.skewnessMethod) {
      requestBody.skewness_method = config.skewnessMethod;
    }
    if (config.windowSize !== undefined) {
      requestBody.window_size = config.windowSize;
    }
    if (config.removeSpecialChars !== undefined) {
      requestBody.remove_special_chars = config.removeSpecialChars;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
        const response = await fetch(`${FASTAPI_URL}/preprocess/data-cleaning`, {
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
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use status text
          }
          
        return NextResponse.json(
          {
            error: "Data cleaning failed",
            details: errorMessage
          },
          { status: response.status }
        );
        }

        const backendResult = await response.json();
      return NextResponse.json(backendResult);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        return NextResponse.json(
          {
            error: "Request timeout",
            details: `Connection timeout: FastAPI backend at ${FASTAPI_URL} is not responding. ` +
                     `Please ensure the backend server is running and try again.`
          },
          { status: 504 }
        );
      }
      
      if (fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('fetch failed')) {
        return NextResponse.json(
          {
            error: "Connection failed",
            details: `Cannot connect to FastAPI backend at ${FASTAPI_URL}. ` +
                     `Please ensure the backend server is running.`
          },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Data cleaning error:", error);
    return NextResponse.json(
      {
        error: "Failed to clean data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
