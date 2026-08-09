import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import { appConfig } from '../config.js';

export interface AuthUser {
  id: string;
  organizationId: string;
  role: 'ADMIN' | 'USER' | 'SERVICE';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * API Key Authentication Middleware
 * Validates X-API-Key header
 */
export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Missing API key',
    });
  }

  // TODO: Validate API key against database
  // For now, accept any key for development
  if (appConfig.nodeEnv === 'development') {
    request.user = {
      id: 'dev-user',
      organizationId: 'dev-org',
      role: 'ADMIN',
    };
    return;
  }

  // In production, validate against database
  // const apiKeyRecord = await validateApiKey(apiKey);
  // if (!apiKeyRecord) {
  //   return reply.code(401).send({ error: 'Invalid API key' });
  // }
  // request.user = apiKeyRecord.user;
}

/**
 * JWT Authentication Middleware
 * Validates Bearer token
 */
export async function jwtAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Optional Authentication Middleware
 * Allows both authenticated and unauthenticated requests
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers['x-api-key'] as string;
  const authHeader = request.headers.authorization;

  if (apiKey) {
    await apiKeyAuth(request, reply);
  } else if (authHeader?.startsWith('Bearer ')) {
    try {
      await request.jwtVerify();
    } catch {
      // Ignore JWT errors for optional auth
    }
  }
}

/**
 * Role-based authorization
 */
export function requireRole(...roles: AuthUser['role'][]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
  };
}
