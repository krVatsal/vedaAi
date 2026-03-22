import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import { JobUpdate } from '../types';
import { getRedisConnection } from './redis';
import IORedis from 'ioredis';

interface ClientInfo {
  ws: WebSocket;
  assignmentId?: string;
}

const PUB_SUB_CHANNEL = 'ws-job-updates';

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientInfo> = new Map();
  private pubClient: IORedis | null = null;
  private subClient: IORedis | null = null;

  initialize(server: Server): void {
    // Setup Redis PubSub
    this.pubClient = getRedisConnection().duplicate();
    this.subClient = getRedisConnection().duplicate();

    this.subClient.subscribe(PUB_SUB_CHANNEL, (err, count) => {
      if (err) console.error('Failed to subscribe to Redis PubSub:', err);
    });

    this.subClient.on('message', (channel, message) => {
      if (channel === PUB_SUB_CHANNEL) {
        try {
          const { assignmentId, update } = JSON.parse(message);
          this.broadcastLocal(assignmentId, update);
        } catch (err) {
          console.error('Failed to parse PubSub message:', err);
        }
      }
    });

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

  // Broadcasts to local connected clients
  private broadcastLocal(assignmentId: string, update: JobUpdate): void {
    this.clients.forEach(({ ws, assignmentId: subId }) => {
      if (subId === assignmentId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'job_update', data: update }));
      }
    });
  }

  // Called by worker to broadcast via Redis
  broadcast(assignmentId: string, update: JobUpdate): void {
    if (!this.pubClient) {
      this.pubClient = getRedisConnection().duplicate();
    }
    this.pubClient.publish(PUB_SUB_CHANNEL, JSON.stringify({ assignmentId, update }));
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
