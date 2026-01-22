import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface MissingValueConfig {
  method: string;
  columns: string[];
  threshold?: number;
  constantValue?: number | string;
  selectedMethods?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, config } = await request.json() as {
      datasetId: string;
      config: MissingValueConfig;
    };

    if (!datasetId || !config) {
      return NextResponse.json(
        { error: "Dataset ID and configuration are required" },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend for processing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Validate constant value for constant method
      if (config.method === "constant" && !config.constantValue) {
        return NextResponse.json(
          { error: "Constant value is required when using constant method" },
          { status: 400 }
        );
      }

      const requestBody = {
        dataset_id: datasetId,
        method: config.method,
        columns: config.columns || [],
        constant_value: config.constantValue,
        threshold: config.threshold || 0.5,
      };

      console.log(`[Missing Values API] Calling FastAPI: ${FASTAPI_URL}/preprocess/missing-values`);
      console.log(`[Missing Values API] Request body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${FASTAPI_URL}/preprocess/missing-values`, {
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
        let errorDetails: any = null;
        
        try {
          const errorText = await response.text();
          if (errorText?.trim()) {
            try {
              errorDetails = JSON.parse(errorText);
              errorMessage = errorDetails.detail || errorDetails.error || errorDetails.message || errorMessage;
              
              if (errorDetails.details) {
                errorMessage += `: ${errorDetails.details}`;
              }
            } catch (e) {
              errorMessage = errorText.trim() || errorMessage;
            }
          } else {
            if (response.status === 404) {
              errorMessage = `FastAPI endpoint not found. Please ensure the backend server is running at ${FASTAPI_URL} and the endpoint /preprocess/missing-values exists.`;
            } else if (response.status === 503) {
              errorMessage = `FastAPI backend service unavailable. Please start the backend server.`;
            }
          }
        } catch (e) {
          if (response.status === 404) {
            errorMessage = `FastAPI endpoint not found at ${FASTAPI_URL}/preprocess/missing-values. Please check if the backend is running.`;
          }
        }
        
        console.error(`[Missing Values API] Backend error:`, {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorDetails
        });
        
        throw new Error(errorMessage);
      }

      const backendResult = await response.json();

      // Return backend result directly
      return NextResponse.json(backendResult);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      console.error(`[Missing Values API] Fetch error:`, {
        name: fetchError.name,
        message: fetchError.message,
        code: fetchError.code,
        cause: fetchError.cause
      });
      
      // Handle specific error types
      if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_HEADERS_TIMEOUT') {
        throw new Error(
          `Connection timeout: FastAPI backend at ${FASTAPI_URL} is not responding. ` +
          `Please ensure the backend server is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
        );
      }
      
      if (fetchError.message?.includes('fetch failed') || 
          fetchError.message?.includes('ECONNREFUSED') ||
          fetchError.code === 'ECONNREFUSED' ||
          fetchError.cause?.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to FastAPI backend at ${FASTAPI_URL}/preprocess/missing-values. ` +
          `Please start the backend server: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
        );
      }
      
      // Handle 404 specifically
      if (fetchError.message?.includes('404') || fetchError.message?.includes('not found')) {
        throw new Error(
          `FastAPI endpoint not found: ${FASTAPI_URL}/preprocess/missing-values. ` +
          `Please ensure the backend server is running and the endpoint exists.`
        );
      }
      
      // Re-throw other errors
      throw fetchError;
    }

  } catch (error: any) {
    console.error("[Missing Values API] Processing error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = error.message || "Failed to process missing values";
    let errorDetails: string | undefined = undefined;
    
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      statusCode = 404;
      errorDetails = "The FastAPI endpoint may not exist or the backend server is not running.";
    } else if (error.message?.includes("timeout") || error.message?.includes("not responding") || error.message?.includes("Cannot connect")) {
      statusCode = 503; // Service Unavailable
      errorDetails = "The FastAPI backend server is not responding. Please start it: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000";
    } else if (error.message?.includes("required") || error.message?.includes("400") || error.message?.includes("Constant value is required")) {
      statusCode = 400;
    } else if (error.message?.includes("FastAPI")) {
      statusCode = 503;
      errorDetails = "Make sure FastAPI backend is running: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000";
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}
