import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = ['JWT_SECRET'];

for (const key of requiredInProduction) {
  if (process.env.NODE_ENV === 'production' && !process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/journeybook',
  jwtSecret: process.env.JWT_SECRET || 'development_jwt_secret_change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'development_refresh_secret_change_me',
  duffelApiKey: process.env.DUFFEL_API_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  allowedOrigins,
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMaxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  trustProxy: toBoolean(process.env.TRUST_PROXY, false),
  logRequests: toBoolean(process.env.LOG_REQUESTS, true),
};

export const isProduction = env.nodeEnv === 'production';
