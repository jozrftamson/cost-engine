import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { apiKeyAuth } from '../middleware/auth.middleware.js';

// Query parameters schema
const costsQuerySchema = z.object({
  project_id: z.string().optional(),
  customer_id: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function costsRoutes(server: FastifyInstance) {
  // GET /api/v1/costs - Query costs with filters
  server.get('/api/v1/costs', {
    preHandler: apiKeyAuth,
    schema: {
      tags: ['costs'],
      description: 'Query cost events with filters and pagination',
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          project_id: { type: 'string' },
          customer_id: { type: 'string' },
          provider: { type: 'string' },
          model: { type: 'string' },
          start_date: { type: 'string', format: 'date-time' },
          end_date: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  provider: { type: 'string' },
                  model: { type: 'string' },
                  usage: { type: 'object' },
                  cost: { type: 'object' },
                  created_at: { type: 'string' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                has_more: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const query = costsQuerySchema.parse(request.query);

      // TODO: Query database with filters
      const mockData = [
        {
          id: 'evt_1',
          provider: 'openai',
          model: 'gpt-4',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
          },
          cost: {
            total: 0.045,
            currency: 'USD',
          },
          created_at: new Date().toISOString(),
        },
      ];

      return reply.send({
        data: mockData,
        pagination: {
          total: 1,
          limit: query.limit,
          offset: query.offset,
          has_more: false,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      }
      throw error;
    }
  });

  // GET /api/v1/costs/summary - Cost summary with aggregations
  server.get('/api/v1/costs/summary', {
    preHandler: apiKeyAuth,
    schema: {
      tags: ['costs'],
      description: 'Get cost summary with aggregations by provider, model, project, etc.',
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          project_id: { type: 'string' },
          customer_id: { type: 'string' },
          start_date: { type: 'string', format: 'date-time' },
          end_date: { type: 'string', format: 'date-time' },
          group_by: {
            type: 'string',
            enum: ['provider', 'model', 'project', 'customer', 'day', 'week', 'month'],
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            total_cost: { type: 'number' },
            currency: { type: 'string' },
            period: {
              type: 'object',
              properties: {
                start: { type: 'string' },
                end: { type: 'string' },
              },
            },
            breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  cost: { type: 'number' },
                  events: { type: 'integer' },
                  tokens: {
                    type: 'object',
                    properties: {
                      input: { type: 'integer' },
                      output: { type: 'integer' },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    // TODO: Implement cost aggregation logic
    const mockSummary = {
      total_cost: 12.45,
      currency: 'USD',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      breakdown: [
        {
          key: 'openai',
          cost: 8.30,
          events: 150,
          tokens: {
            input: 125000,
            output: 45000,
            total: 170000,
          },
        },
        {
          key: 'anthropic',
          cost: 4.15,
          events: 80,
          tokens: {
            input: 80000,
            output: 30000,
            total: 110000,
          },
        },
      ],
    };

    return reply.send(mockSummary);
  });
}
