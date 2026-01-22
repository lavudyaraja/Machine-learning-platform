// App-wide constants

export const APP_NAME = "Model Creation Agent";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws";

// FastAPI Backend URLs
export const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
export const FASTAPI_WS_URL = process.env.NEXT_PUBLIC_FASTAPI_WS_URL || "ws://localhost:8000";

