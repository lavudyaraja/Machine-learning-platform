// Hook for AI API integration
import { useState, useCallback } from "react";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatOptions {
  model?: string;
  temperature?: number;
  maxCompletionTokens?: number;
  topP?: number;
  reasoningEffort?: "low" | "medium" | "high";
  stream?: boolean;
  stop?: string[] | null;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a chat completion request
   */
  const chat = useCallback(async (
    messages: AIMessage[],
    options?: AIChatOptions
  ): Promise<AIResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a streaming chat completion request
   */
  const chatStream = useCallback(async (
    messages: AIMessage[],
    options?: AIChatOptions,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          ...options,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            
            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              
              if (parsed.content) {
                fullContent += parsed.content;
                onChunk?.(parsed.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullContent;
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    chat,
    chatStream,
    loading,
    error,
  };
}

