import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(
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

    // Call FastAPI backend to get job status
    const response = await fetch(`${FASTAPI_URL}/jobs/${jobId}`, {
      method: "GET",
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

    const jobStatus = await response.json();

    return NextResponse.json({
      success: true,
      jobId: jobStatus.job_id,
      status: jobStatus.status,
      progress: jobStatus.progress || 0,
      message: jobStatus.message,
      metrics: jobStatus.metrics,
      results: jobStatus.results,
      error: jobStatus.error,
      createdAt: jobStatus.created_at,
      completedAt: jobStatus.completed_at,
    });

  } catch (error: any) {
    console.error("Get job status error:", error);
    
    return NextResponse.json(
      {
        error: error.message || "Failed to get job status",
        details: error.message?.includes("FastAPI") 
          ? "Make sure FastAPI backend is running"
          : undefined
      },
      { status: 500 }
    );
  }
}
