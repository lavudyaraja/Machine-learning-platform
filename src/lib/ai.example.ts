/**
 * Example usage of Groq AI integration
 * 
 * This file demonstrates how to use the AI service in your components.
 * Copy the patterns below into your actual components.
 */

// Example 1: Using the useAI hook in a React component
/*
import { useAI } from "@/hooks/useAI";
import { useState } from "react";

export function MyComponent() {
  const { chat, chatStream, loading, error } = useAI();
  const [response, setResponse] = useState("");

  // Non-streaming example
  const handleChat = async () => {
    try {
      const result = await chat([
        {
          role: "user",
          content: "Explain machine learning in simple terms"
        }
      ], {
        model: "openai/gpt-oss-120b",
        temperature: 1,
        maxCompletionTokens: 8192,
      });
      
      setResponse(result.content);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Streaming example
  const handleStreamingChat = async () => {
    try {
      const fullResponse = await chatStream(
        [
          {
            role: "user",
            content: "Write a Python function to calculate factorial"
          }
        ],
        {
          model: "openai/gpt-oss-120b",
          temperature: 1,
          reasoningEffort: "medium",
        },
        (chunk) => {
          // This callback is called for each chunk
          setResponse(prev => prev + chunk);
        }
      );
      
      console.log("Full response:", fullResponse);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <button onClick={handleChat} disabled={loading}>
        {loading ? "Loading..." : "Chat"}
      </button>
      <button onClick={handleStreamingChat} disabled={loading}>
        {loading ? "Streaming..." : "Stream Chat"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {response && <pre>{response}</pre>}
    </div>
  );
}
*/

// Example 2: Direct API call (server-side only)
/*
import { createChatCompletion } from "@/lib/ai";

export async function serverSideFunction() {
  try {
    const response = await createChatCompletion({
      messages: [
        {
          role: "user",
          content: "What is the difference between supervised and unsupervised learning?"
        }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      maxCompletionTokens: 8192,
      topP: 1,
      reasoningEffort: "medium",
      stream: false,
    });

    console.log("Response:", response.content);
    return response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
*/

// Example 3: Streaming (server-side only)
/*
import { createStreamingChatCompletion } from "@/lib/ai";

export async function serverSideStreaming() {
  try {
    const stream = createStreamingChatCompletion({
      messages: [
        {
          role: "user",
          content: "Explain neural networks step by step"
        }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      reasoningEffort: "medium",
    });

    for await (const chunk of stream) {
      console.log(chunk);
      // Process each chunk as it arrives
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
*/

// Example 4: Using in API route
/*
import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  try {
    const response = await createChatCompletion({
      messages: [
        {
          role: "user",
          content: message
        }
      ],
    });

    return NextResponse.json({ response: response.content });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
*/

