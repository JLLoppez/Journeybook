import express, { Application, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';

import { env, isProduction } from './config/env';
import authRoutes from './routes/authRoutes';
import flightRoutes from './routes/flightRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import aiPlannerRoutes from './routes/aiPlannerRoutes';

const app: Application = express();
const server = http.createServer(app);

app.set('trust proxy', env.trustProxy);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

if (!isProduction && env.logRequests) {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const connectDB = async () => {
  await mongoose.connect(env.mongodbUri);
  console.log('✅ MongoDB connected');
};

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'JourneyBook API',
    version: '2.0.0',
    status: 'ok',
    docs: '/api/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiPlannerRoutes);

app.get('/api/health', async (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    status: dbState === 1 ? 'success' : 'degraded',
    message: 'JourneyBook API v2 running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    database: dbState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(env.port, () => {
      console.log(`🚀 Server on port ${env.port}`);
      console.log('📡 Endpoints: auth, flights, bookings, payments, ai');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void startServer();

export default app;
