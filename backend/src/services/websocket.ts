import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import { JobUpdate } from '../types';

interface ClientInfo {
  ws: WebSocket;
  assignmentId?: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientInfo> = new Map();

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const clientId = Math.random().toString(36).substring(2);
      this.clients.set(clientId, { ws });

      console.log(`WS client connected: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'subscribe' && message.assignmentId) {
            const client = this.clients.get(clientId);
            if (client) {
              client.assignmentId = message.assignmentId;
              this.clients.set(clientId, client);
            }
            ws.send(
              JSON.stringify({
                type: 'subscribed',
                assignmentId: message.assignmentId,
              })
            );
          }
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WS client disconnected: ${clientId}`);
      });

      ws.on('error', (err) => {
        console.error(`WS client error (${clientId}):`, err.message);
        this.clients.delete(clientId);
      });

      ws.send(JSON.stringify({ type: 'connected', clientId }));
    });

    console.log('✅ WebSocket server initialized');
  }

  broadcast(assignmentId: string, update: JobUpdate): void {
    this.clients.forEach(({ ws, assignmentId: subId }) => {
      if (subId === assignmentId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'job_update', data: update }));
      }
    });
  }

  broadcastAll(message: object): void {
    this.clients.forEach(({ ws }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

export const wsManager = new WebSocketManager();
