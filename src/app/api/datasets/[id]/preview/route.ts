import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

// GET - Get dataset preview with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    
    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 1000) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }
    
    // URL encode the ID to handle special characters
    const encodedId = encodeURIComponent(id);
    const url = `${FASTAPI_URL}/datasets/${encodedId}/preview?page=${page}&page_size=${pageSize}`;

    console.log(`[Preview] Fetching preview for dataset ${id}, page ${page}, pageSize ${pageSize}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Prevent caching for fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Preview] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url
      });
      
      // Parse error message if JSON
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.error || errorText;
      } catch {
        // Not JSON, use as is
      }
      
      return NextResponse.json(
        { error: errorMessage || "Failed to fetch dataset preview" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error("[Preview] Invalid response format:", data);
      return NextResponse.json(
        { error: "Invalid response format from backend" },
        { status: 500 }
      );
    }
    
    // Ensure required fields exist
    const validatedData = {
      columns: Array.isArray(data.columns) ? data.columns : [],
      rows: Array.isArray(data.rows) ? data.rows : [],
      totalRows: typeof data.totalRows === 'number' ? data.totalRows : 0,
      page: typeof data.page === 'number' ? data.page : page,
      pageSize: typeof data.pageSize === 'number' ? data.pageSize : pageSize,
      totalPages: typeof data.totalPages === 'number' ? data.totalPages : 1
    };
    
    console.log(`[Preview] Success: ${validatedData.rows.length} rows retrieved`);
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("[Preview] Error fetching dataset preview:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch dataset preview",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}