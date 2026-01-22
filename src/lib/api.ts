// Main API client (fetch wrapper)

import { API_CONFIG } from "@/config/api.config";
import type { ApiResponse, ApiError as ApiErrorType } from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper function to log errors in development only
function logError(context: string, details: any) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Format error details more clearly
    const formattedDetails = typeof details === 'object' && details !== null
      ? JSON.stringify(details, null, 2)
      : details;
    console.error(`${context}:`, formattedDetails);
  }
}

// Shared error handler for all HTTP methods
async function handleResponse<T>(response: Response, url: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText || "Request failed";
    let errorData: any = null;

    try {
      const text = await response.text();
      if (text?.trim()) {
        try {
          errorData = JSON.parse(text);
          // Handle different error response formats (FastAPI uses 'detail', others use 'error' or 'message')
          errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;

          // Add details if available
          if (errorData.details && typeof errorData.details === 'string') {
            errorMessage += `: ${errorData.details}`;
          }
        } catch {
          // If not JSON, check if it's HTML (common error)
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            errorMessage = `Received HTML response instead of JSON. This usually means the API endpoint returned an error page. URL: ${url}`;
          } else {
            // If not JSON, use the text as error message
            errorMessage = text.trim() || errorMessage;
          }
        }
      } else {
        // No response body, provide more context based on status code
        if (response.status === 404) {
          errorMessage = `Endpoint not found: ${url}. Please check if the API route exists and the backend server is running.`;
        } else if (response.status === 503) {
          errorMessage = `Service unavailable: The backend server may not be running. Please start the FastAPI backend.`;
        } else if (response.status === 500) {
          errorMessage = `Internal server error: An error occurred on the server.`;
        }
      }
    } catch {
      // If we can't read the response, provide default message based on status
      if (response.status === 404) {
        errorMessage = `Endpoint not found: ${url}`;
      }
    }

    logError(`API Error [${response.status}]`, {
      url,
      status: response.status,
      statusText: response.statusText,
      errorData: errorData || (errorMessage !== response.statusText ? { message: errorMessage } : 'No error data'),
      errorMessage
    });

    throw new ApiError(errorMessage, response.status);
  }

  return await response.json();
}

// Wrapper to handle network errors
async function handleRequest<T>(
  requestFn: () => Promise<Response>,
  url: string
): Promise<T> {
  try {
    const response = await requestFn();
    const data = await handleResponse<any>(response, url);
    
    // Check if this is a preprocessing API response (has success/processedData directly)
    if (data && typeof data === 'object' && 'success' in data && 'processedData' in data) {
      return data as T;
    }

    // Check if this is a preprocessing response with just success field (data cleaning, etc.)
    if (data && typeof data === 'object' && 'success' in data) {
      return data as T;
    }

    // If data is already an array or a direct object (not wrapped), return it directly
    if (Array.isArray(data) || (typeof data === 'object' && data !== null && !('data' in data))) {
      return data as T;
    }

    // Otherwise, expect the standard ApiResponse format
    if (data && typeof data === 'object' && 'data' in data) {
      const apiResponse: ApiResponse<T> = data;
      return apiResponse.data;
    }

    // Fallback: return data as-is
    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    let errorMessage = "Network error: Failed to fetch";
    let statusCode = 503;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide more helpful messages for common errors
      if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
        errorMessage = "Cannot connect to server. Please check if the backend service is running.";
        statusCode = 503;
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = "Connection refused. The server may not be running.";
        statusCode = 503;
      } else if (error.message.includes('timeout') || error.message.includes('aborted')) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 504;
      }
    }
    
    logError("Network Error", {
      url,
      error: errorMessage,
      originalError: error
    });
    
    throw new ApiError(errorMessage, statusCode);
  }
}

export const api = {
  get: async <T>(url: string): Promise<T> => {
    return handleRequest<T>(
      () => fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
      url
    );
  },

  post: async <T>(url: string, body?: unknown): Promise<T> => {
    const isFormData = body instanceof FormData;

    return handleRequest<T>(
      () => fetch(url, {
        method: "POST",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? (body as FormData) : JSON.stringify(body),
      }),
      url
    );
  },

  put: async <T>(url: string, body: unknown): Promise<T> => {
    return handleRequest<T>(
      () => fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      url
    );
  },

  delete: async <T>(url: string): Promise<T> => {
    return handleRequest<T>(
      () => fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
      url
    );
  },
};