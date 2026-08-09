import { config } from 'dotenv';

// Load environment variables
config();

export const appConfig = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://cost_engine:password@localhost:5432/cost_engine',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  apiKeySalt: process.env.API_KEY_SALT || 'your-api-key-salt-change-this',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logPretty: process.env.LOG_PRETTY === 'true' || process.env.NODE_ENV === 'development',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Rate Limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitTimeWindow: parseInt(process.env.RATE_LIMIT_TIMEWINDOW || '60000', 10),

  // Swagger
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
} as const;

export type AppConfig = typeof appConfig;
