import { useEffect, useRef, useState } from "react";

const FASTAPI_WS_URL = process.env.NEXT_PUBLIC_FASTAPI_WS_URL || "ws://localhost:8000";

export interface TrainingUpdate {
  type: "connected" | "progress" | "complete" | "error" | "status" | "ping";
  progress?: number;
  epoch?: number;
  total_epochs?: number;
  elapsed_time?: number;
  metrics?: {
    accuracy?: number;
    loss?: number;
    mse?: number;
    r2_score?: number;
    valLoss?: number;
    valAccuracy?: number;
    trainLoss?: number;
    trainAccuracy?: number;
  };
  training_history?: Array<{
    epoch: number;
    trainLoss?: number;
    valLoss?: number;
    trainAccuracy?: number;
    valAccuracy?: number;
    loss?: number;
    accuracy?: number;
    mse?: number;
    r2?: number;
  }>;
  resource_usage?: {
    timestamp?: number;
    cpu?: number;
    ram?: number;
    gpu?: number;
  };
  message?: string;
  results?: any;
  error?: string;
  status?: string;
}

export function useTrainingWebSocket(jobId: string | null) {
  const [connected, setConnected] = useState(false);
  const [update, setUpdate] = useState<TrainingUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const updateCounterRef = useRef(0);

  useEffect(() => {
    if (!jobId) return;

    // Connect to WebSocket
    const ws = new WebSocket(`${FASTAPI_WS_URL}/ws/${jobId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      console.log("✅ WebSocket connected for job:", jobId);
    };

    ws.onmessage = (event) => {
      try {
        const data: TrainingUpdate = JSON.parse(event.data);
        // Skip ping messages
        if (data.type === 'ping') {
          return;
        }
        
        updateCounterRef.current += 1;
        console.log(`📨 WebSocket update #${updateCounterRef.current} received:`, data.type, {
          epoch: data.epoch,
          progress: data.progress,
          historyLength: data.training_history?.length || 0
        });
        
        // Create a new object with a timestamp to ensure React detects the change
        const updateWithTimestamp = {
          ...data,
          _timestamp: Date.now(),
          _updateId: updateCounterRef.current
        };
        
        setUpdate(updateWithTimestamp as TrainingUpdate);
      } catch (err) {
        console.error("❌ Error parsing WebSocket message:", err, event.data);
      }
    };

    ws.onerror = (error) => {
      setError("WebSocket connection error");
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = (event) => {
      setConnected(false);
      console.log("🔌 WebSocket disconnected:", event.code, event.reason || "No reason");
    };

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [jobId]);

  return { connected, update, error };
}

