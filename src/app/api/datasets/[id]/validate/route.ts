import { NextResponse } from "next/server";
import type { ValidationReport } from "@/types/validation";

// Use NEXT_PUBLIC_FASTAPI_URL for client-side, but for server-side API routes
// we can use either FASTAPI_URL or NEXT_PUBLIC_FASTAPI_URL
const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

// Helper to create consistent error responses
function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message, detail: message, message },
    { status }
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return errorResponse("Dataset ID is required", 400);
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional, continue with empty object
    }
    
    const { targetColumn, validationLevel = "standard" } = body;

    // Validate validationLevel
    const validLevels = ["basic", "standard", "comprehensive"];
    if (!validLevels.includes(validationLevel)) {
      return errorResponse(
        `Invalid validationLevel. Must be one of: ${validLevels.join(", ")}`,
        400
      );
    }

    // Call Python backend for validation
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

      // Encode the ID to handle special characters
      const encodedId = encodeURIComponent(id);
      
      const response = await fetch(`${FASTAPI_URL}/datasets/${encodedId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetColumn: targetColumn || null,
          // dataset_path is not needed - backend will fetch from database
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = response.statusText || "Validation failed";
        
        try {
          const rawText = await response.text();
          if (rawText?.trim()) {
            try {
              const errorData = JSON.parse(rawText);
              errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
            } catch {
              errorMessage = rawText.trim();
            }
          } else if (response.status === 500) {
            errorMessage = "Internal server error in validation service. Check backend logs.";
          }
        } catch {
          if (response.status === 500) {
            errorMessage = "Internal server error in validation service.";
          }
        }
        
        console.error("Python backend validation error:", {
          status: response.status,
          url: `${FASTAPI_URL}/datasets/${id}/validate`,
          errorMessage
        });
        
        return errorResponse(errorMessage, response.status >= 400 && response.status < 500 ? response.status : 500);
      }

      const validationReport: ValidationReport = await response.json();
      return NextResponse.json({ data: validationReport });

    } catch (fetchError: any) {
      console.error("Error calling Python backend:", fetchError);
      
      let errorMessage = "Failed to connect to validation service";
      let statusCode = 503;
      
      // Handle different types of fetch errors
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        errorMessage = "Validation request timed out. The dataset may be too large.";
        statusCode = 504;
      } else if (
        fetchError.code === 'ECONNREFUSED' || 
        fetchError.cause?.code === 'ECONNREFUSED' ||
        fetchError.message?.includes('ECONNREFUSED') ||
        fetchError.message?.includes('fetch failed') ||
        fetchError.message?.includes('Failed to fetch')
      ) {
        errorMessage = `Python backend is not running at ${FASTAPI_URL}. Please ensure the backend server is started.`;
        statusCode = 503;
      } else if (fetchError.message) {
        // Provide more helpful error message
        if (fetchError.message.includes('fetch failed')) {
          errorMessage = `Cannot connect to backend server at ${FASTAPI_URL}. Please check if the server is running.`;
        } else {
          errorMessage = `Connection error: ${fetchError.message}`;
        }
      }
      
      return errorResponse(errorMessage, statusCode);
    }

  } catch (error: any) {
    console.error("Error validating dataset:", error);
    return errorResponse(error?.message || "Failed to validate dataset", 500);
  }
}