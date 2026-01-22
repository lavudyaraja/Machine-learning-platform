import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Call FastAPI backend to resume job
    const response = await fetch(`${FASTAPI_URL}/jobs/${jobId}/resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      return NextResponse.json(
        { error: errorData.detail || `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error("Resume job error:", error);
    
    return NextResponse.json(
      {
        error: error.message || "Failed to resume job",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running"
          : undefined
      },
      { status: 500 }
    );
  }
}
