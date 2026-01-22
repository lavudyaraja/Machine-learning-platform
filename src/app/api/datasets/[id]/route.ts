import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// GET - Get specific dataset with optional pagination
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // URL encode the ID to handle special characters and underscores
    const encodedId = encodeURIComponent(id);
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${FASTAPI_URL}/datasets/${encodedId}?${queryString}` : `${FASTAPI_URL}/datasets/${encodedId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch dataset" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dataset:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset" },
      { status: 500 }
    );
  }
}

// PUT - Update dataset (rename, lock, archive, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // URL encode the ID to handle special characters and underscores
    const encodedId = encodeURIComponent(id);
    const body = await request.json();

    const response = await fetch(`${FASTAPI_URL}/datasets/${encodedId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to update dataset" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating dataset:", error);
    return NextResponse.json(
      { error: "Failed to update dataset" },
      { status: 500 }
    );
  }
}

// DELETE - Delete dataset
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // URL encode the ID to handle special characters and underscores
    const encodedId = encodeURIComponent(id);
    console.log(`[Delete] Deleting dataset with ID: ${id} (encoded: ${encodedId})`);

    const response = await fetch(`${FASTAPI_URL}/datasets/${encodedId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
      
      console.error(`[Delete] Backend error:`, {
        status: response.status,
        error: errorText,
        id: id,
        encodedId: encodedId
      });
      
      return NextResponse.json(
        { error: errorText || "Failed to delete dataset" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting dataset:", error);
    return NextResponse.json(
      { error: "Failed to delete dataset" },
      { status: 500 }
    );
  }
}

