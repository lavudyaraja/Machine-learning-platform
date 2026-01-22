import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// Upload endpoint - forward to backend
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

    // Forward to backend API
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${FASTAPI_URL}/upload`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to upload dataset" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading dataset:", error);
    return NextResponse.json(
      { error: "Failed to upload dataset" },
      { status: 500 }
    );
  }
}

