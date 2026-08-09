import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { appConfig } from './config.js';
import { logger } from './utils/logger.js';
import { eventsRoutes } from './routes/events.routes.js';
import { costsRoutes } from './routes/costs.routes.js';

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Security plugins
  await server.register(helmet, {
    contentSecurityPolicy: false,
  });

  await server.register(cors, {
    origin: appConfig.corsOrigin,
    credentials: true,
  });

  await server.register(rateLimit, {
    max: appConfig.rateLimitMax,
    timeWindow: appConfig.rateLimitTimeWindow,
  });

  // JWT plugin
  await server.register(jwt, {
    secret: appConfig.jwtSecret,
  });

  // Swagger documentation
  if (appConfig.swaggerEnabled) {
    await server.register(swagger, {
      openapi: {
        info: {
          title: 'Cost Engine API',
          description: 'Unified AI Token & Automation Cost Tracking API',
          version: '1.0.0',
          contact: {
            name: 'Cost Engine Team',
            url: 'https://github.com/jozrftamson/cost-engine',
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
        },
        servers: [
          {
            url: `http://localhost:${appConfig.port}`,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'events', description: 'Cost event ingestion endpoints' },
          { name: 'costs', description: 'Cost query and aggregation endpoints' },
          { name: 'projects', description: 'Project management endpoints' },
          { name: 'health', description: 'Health check and monitoring' },
        ],
        components: {
          securitySchemes: {
            apiKey: {
              type: 'apiKey',
              name: 'X-API-Key',
              in: 'header',
              description: 'API key for service authentication',
            },
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'JWT token for user authentication',
            },
          },
        },
      },
    });

    await server.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        displayRequestDuration: true,
      },
      staticCSP: true,
    });
  }

  // Register routes
  await server.register(eventsRoutes);
  await server.register(costsRoutes);

  // Health check route
  server.get('/health', {
    schema: {
      tags: ['health'],
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  });

  // Root route
  server.get('/', async () => {
    return {
      name: 'Cost Engine API',
      version: '1.0.0',
      description: 'Unified AI Token & Automation Cost Tracking',
      documentation: appConfig.swaggerEnabled ? '/docs' : 'disabled',
      endpoints: {
        health: '/health',
        events: '/api/v1/events',
        costs: '/api/v1/costs',
      },
    };
  });

  return server;
}

export async function startServer(): Promise<FastifyInstance> {
  const server = await buildServer();

  try {
    await server.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    logger.info(`🚀 Server listening on ${appConfig.host}:${appConfig.port}`);
    logger.info(`📝 Environment: ${appConfig.nodeEnv}`);
    
    if (appConfig.swaggerEnabled) {
      logger.info(`📚 Swagger UI: http://localhost:${appConfig.port}/docs`);
    }

    return server;
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}