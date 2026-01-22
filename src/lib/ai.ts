// Groq AI Service
import Groq from "groq-sdk";

// Initialize Groq client
let groqClient: Groq | null = null;

/**
 * Get or create Groq client instance
 */
export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    
    groqClient = new Groq({
      apiKey: apiKey,
    });
  }
  
  return groqClient;
}

/**
 * Interface for chat completion options
 */
export interface GroqChatOptions {
  model?: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  temperature?: number;
  maxCompletionTokens?: number;
  topP?: number;
  reasoningEffort?: "low" | "medium" | "high";
  stream?: boolean;
  stop?: string[] | null;
}

/**
 * Interface for chat completion response
 */
export interface GroqChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Create a chat completion with Groq
 */
export async function createChatCompletion(
  options: GroqChatOptions
): Promise<GroqChatResponse> {
  const client = getGroqClient();
  
  const {
    model = "openai/gpt-oss-120b",
    messages,
    temperature = 1,
    maxCompletionTokens = 8192,
    topP = 1,
    reasoningEffort = "medium",
    stream = false,
    stop = null,
  } = options;

  try {
    if (stream) {
      // Handle streaming response
      const completion = await client.chat.completions.create({
        model,
        messages: messages as any,
        temperature,
        max_completion_tokens: maxCompletionTokens,
        top_p: topP,
        reasoning_effort: reasoningEffort,
        stream: true,
        stop: stop as any,
      });

      // For streaming, we'll return the stream object
      // The caller should handle the stream
      return {
        content: "",
        model,
      };
    } else {
      // Handle non-streaming response
      const completion = await client.chat.completions.create({
        model,
        messages: messages as any,
        temperature,
        max_completion_tokens: maxCompletionTokens,
        top_p: topP,
        reasoning_effort: reasoningEffort,
        stream: false,
        stop: stop as any,
      });

      return {
        content: completion.choices[0]?.message?.content || "",
        model: completion.model,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens || 0,
          completionTokens: completion.usage.completion_tokens || 0,
          totalTokens: completion.usage.total_tokens || 0,
        } : undefined,
      };
    }
  } catch (error: any) {
    throw new Error(`Groq API error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Create a streaming chat completion
 */
export async function* createStreamingChatCompletion(
  options: GroqChatOptions
): AsyncGenerator<string, void, unknown> {
  const client = getGroqClient();
  
  const {
    model = "openai/gpt-oss-120b",
    messages,
    temperature = 1,
    maxCompletionTokens = 8192,
    topP = 1,
    reasoningEffort = "medium",
    stop = null,
  } = options;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_completion_tokens: maxCompletionTokens,
      top_p: topP,
      reasoning_effort: reasoningEffort,
      stream: true,
      stop: stop as any,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    throw new Error(`Groq API streaming error: ${error.message || "Unknown error"}`);
  }
}

