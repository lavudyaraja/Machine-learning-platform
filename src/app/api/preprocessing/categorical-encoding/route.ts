import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface CategoricalEncodingConfig {
  method: 'onehot' | 'one_hot' | 'label' | 'ordinal' | 'target' | 'binary' | 'frequency' | 'count' | 'hash' | 'leave_one_out' | 'leave-one-out' | 'woe' | 'weight_of_evidence';
  columns: string[];
  dropFirst?: boolean;
  handleUnknown?: 'error' | 'ignore';
  targetColumn?: string;
  ordinalMapping?: Record<string, Record<string, number>>;
  nFeatures?: number; // For hash encoding
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: CategoricalEncodingConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    // Normalize method name (handle various naming conventions)
    let methodNormalized = config.method.toLowerCase();
    if (methodNormalized === 'one_hot') {
      methodNormalized = 'onehot';
    } else if (methodNormalized === 'leave-one-out') {
      methodNormalized = 'leave_one_out';
    } else if (methodNormalized === 'weight_of_evidence') {
      methodNormalized = 'woe';
    }
    
    // Prepare request body for backend
    const requestBody: any = {
      dataset_id: datasetId,
      method: methodNormalized,
      columns: config.columns || [],
      target_column: config.targetColumn || null,
      drop_first: config.dropFirst || false,
      handle_unknown: config.handleUnknown || "ignore",
      ordinal_mapping: config.ordinalMapping || null,
    };
    
    // Add n_features for hash encoding
    if (methodNormalized === 'hash' && config.nFeatures) {
      requestBody.n_features = config.nFeatures;
    }

    // Call FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${FASTAPI_URL}/preprocess/categorical-encoding`, {
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
            error: "Categorical encoding failed",
            details: errorMessage
          },
          { status: response.status }
        );
      }

      const backendResult = await response.json();
      return NextResponse.json(backendResult);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            error: "Request timeout",
            details: `Connection timeout: FastAPI backend at ${FASTAPI_URL} is not responding. ` +
                     `Please ensure the backend server is running and try again.`
          },
          { status: 504 }
        );
      }

      if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('fetch failed')) {
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
    console.error("Categorical encoding error:", error);
    return NextResponse.json(
      {
        error: "Failed to encode categorical variables",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
