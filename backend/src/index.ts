import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';

dotenv.config();

import assignmentRoutes from './routes/assignments';
import { wsManager } from './services/websocket';
import { getRedisConnection } from './services/redis';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// Routes
app.use('/api/assignments', assignmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Initialize services
async function bootstrap() {
  const PORT = parseInt(process.env.PORT || '5000', 10);

  // Connect to MongoDB
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/assessment-creator';
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  // Initialize Redis
  getRedisConnection();

  // Initialize WebSocket
  wsManager.initialize(server);

  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ WebSocket server on ws://localhost:${PORT}/ws`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
