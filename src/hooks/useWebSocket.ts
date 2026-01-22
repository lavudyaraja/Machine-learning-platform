// WebSocket connection management

import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket connection logic
    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  return { connected };
}

