'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { JobUpdate } from '@/types';

interface UseWebSocketOptions {
  assignmentId?: string | null;
  onUpdate?: (update: JobUpdate) => void;
}

function getWebSocketUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  try {
    const apiUrl = new URL(apiBase);
    apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    apiUrl.pathname = '/ws';
    apiUrl.search = '';
    apiUrl.hash = '';
    return apiUrl.toString();
  } catch {
    return 'ws://localhost:5000/ws';
  }
}

export function useWebSocket({ assignmentId, onUpdate }: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setJobUpdate = useAssessmentStore((s) => s.setJobUpdate);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WS connected');
      if (assignmentId) {
        ws.send(JSON.stringify({ type: 'subscribe', assignmentId }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'job_update' && message.data) {
          const update = message.data as JobUpdate;
          setJobUpdate(update);
          onUpdate?.(update);
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    };

    ws.onclose = () => {
      console.log('WS disconnected, reconnecting in 3s...');
      reconnectTimerRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [assignmentId, setJobUpdate, onUpdate]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribe = useCallback((id: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', assignmentId: id }));
    }
  }, []);

  return { subscribe, ws: wsRef.current };
}
