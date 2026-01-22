import { NextResponse } from "next/server";

// Use NEXT_PUBLIC_FASTAPI_URL for client-side, but for server-side API routes
// we can use either FASTAPI_URL or NEXT_PUBLIC_FASTAPI_URL
const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

console.log(`[API] Using FastAPI URL: ${FASTAPI_URL}`);

// GET - List all datasets
export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_URL}/datasets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Prevent caching for fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Datasets GET] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: errorText || "Failed to fetch datasets" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure we return an array, even if backend returns something else
    const datasetsArray = Array.isArray(data) ? data : [];
    
    return NextResponse.json(datasetsArray);
  } catch (error) {
    console.error("[Datasets GET] Error fetching datasets:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch datasets",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST - Create/upload a new dataset
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    console.log(`[Upload] Sending request to: ${FASTAPI_URL}/upload`);
    console.log(`[Upload] File: ${file.name}, Size: ${file.size} bytes`);

    let response;
    try {
      response = await fetch(`${FASTAPI_URL}/upload`, {
        method: "POST",
        body: backendFormData,
        // Don't set Content-Type header, let browser set it with boundary
      });
    } catch (fetchError) {
      console.error("[Upload] Fetch error:", fetchError);
      return NextResponse.json(
        { 
          error: `Failed to connect to backend server at ${FASTAPI_URL}. Please ensure the backend is running.`,
          details: fetchError instanceof Error ? fetchError.message : String(fetchError)
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        // Try to parse as JSON
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.detail || errorJson.error || errorText;
        } catch {
          // Not JSON, use as is
        }
      } catch {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error("[Upload] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${FASTAPI_URL}/upload`
      });
      
      return NextResponse.json(
        { 
          error: errorText || "Failed to upload dataset",
          status: response.status,
          backendUrl: `${FASTAPI_URL}/upload`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format response to match frontend Dataset interface expectations
    // Frontend expects: { data: { id, name, filename, size, rows, columns, createdAt, ... } }
    const formattedResponse = {
      data: {
        id: data.id || data.filename || `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.filename?.replace(/\.csv$/i, '') || "Uploaded Dataset",
        filename: data.filename || "unknown.csv",
        dataset_path: data.dataset_path,
        size: data.size || 0,
        rows: data.rows || 0,
        columns: data.columns || 0,
        createdAt: new Date().toISOString(),
        type: "tabular" as const,
        status: "active" as const,
        ...data
      }
    };
    
    console.log(`[Upload] Success:`, formattedResponse);
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("[Upload] Error uploading dataset:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload dataset",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}