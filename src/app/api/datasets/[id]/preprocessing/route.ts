import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const encodedId = encodeURIComponent(id);

    const response = await fetch(
      `${FASTAPI_URL}/datasets/${encodedId}/preprocessing`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch preprocessing steps" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching preprocessing steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch preprocessing steps" },
      { status: 500 }
    );
  }
}
