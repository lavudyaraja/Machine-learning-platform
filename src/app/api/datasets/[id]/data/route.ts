import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// PUT - Update dataset data (columns and rows)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Encode the dataset ID to handle special characters
    const encodedId = encodeURIComponent(id);

    const response = await fetch(`${FASTAPI_URL}/datasets/${encodedId}/data`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to update dataset data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating dataset data:", error);
    return NextResponse.json(
      { error: "Failed to update dataset data" },
      { status: 500 }
    );
  }
}

