// API Route for Groq AI Integration
import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion, createStreamingChatCompletion } from "@/lib/ai";
import type { GroqChatOptions } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      model,
      temperature,
      maxCompletionTokens,
      topP,
      reasoningEffort,
      stream,
      stop,
    } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate message format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          { error: "Each message must have 'role' and 'content' fields" },
          { status: 400 }
        );
      }
      if (!["user", "assistant", "system"].includes(message.role)) {
        return NextResponse.json(
          { error: "Message role must be 'user', 'assistant', or 'system'" },
          { status: 400 }
        );
      }
    }

    const options: GroqChatOptions = {
      messages,
      model,
      temperature,
      maxCompletionTokens,
      topP,
      reasoningEffort,
      stream: stream === true,
      stop,
    };

    // Handle streaming response
    if (stream === true) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const streamGenerator = createStreamingChatCompletion(options);
            
            for await (const chunk of streamGenerator) {
              const data = encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`);
              controller.enqueue(data);
            }
            
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error: any) {
            const errorData = encoder.encode(
              `data: ${JSON.stringify({ error: error.message || "Streaming error" })}\n\n`
            );
            controller.enqueue(errorData);
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Handle non-streaming response
    const response = await createChatCompletion(options);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("AI API error:", error);
    
    // Check if it's an API key error
    if (error.message?.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        { error: "Groq API key is not configured. Please set GROQ_API_KEY in your environment variables." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

