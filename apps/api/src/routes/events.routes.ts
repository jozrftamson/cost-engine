import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { apiKeyAuth } from '../middleware/auth.middleware.js';

// Zod schemas for validation
const eventSourceSchema = z.object({
  platform: z.enum(['github', 'gitlab', 'jenkins', 'circleci', 'custom']),
  type: z.string(),
  workflow_id: z.string().optional(),
  run_id: z.string().optional(),
  repository: z.string().optional(),
});

const usageSchema = z.object({
  input_tokens: z.number().int().min(0),
  output_tokens: z.number().int().min(0),
  cached_tokens: z.number().int().min(0).optional(),
  total_tokens: z.number().int().min(0).optional(),
});

const createEventSchema = z.object({
  source: eventSourceSchema,
  provider: z.string(),
  model: z.string(),
  usage: usageSchema,
  project_id: z.string().optional(),
  customer_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const batchEventsSchema = z.object({
  events: z.array(createEventSchema).min(1).max(100),
});

export async function eventsRoutes(server: FastifyInstance) {
  // POST /api/v1/events - Create single event
  server.post('/api/v1/events', {
    preHandler: apiKeyAuth,
    schema: {
      tags: ['events'],
      description: 'Ingest a single cost event',
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['source', 'provider', 'model', 'usage'],
        properties: {
          source: {
            type: 'object',
            required: ['platform', 'type'],
            properties: {
              platform: { type: 'string', enum: ['github', 'gitlab', 'jenkins', 'circleci', 'custom'] },
              type: { type: 'string' },
              workflow_id: { type: 'string' },
              run_id: { type: 'string' },
              repository: { type: 'string' },
            },
          },
          provider: { type: 'string' },
          model: { type: 'string' },
          usage: {
            type: 'object',
            required: ['input_tokens', 'output_tokens'],
            properties: {
              input_tokens: { type: 'integer', minimum: 0 },
              output_tokens: { type: 'integer', minimum: 0 },
              cached_tokens: { type: 'integer', minimum: 0 },
              total_tokens: { type: 'integer', minimum: 0 },
            },
          },
          project_id: { type: 'string' },
          customer_id: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            cost: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                currency: { type: 'string' },
                breakdown: {
                  type: 'object',
                  properties: {
                    input: { type: 'number' },
                    output: { type: 'number' },
                    cached: { type: 'number' },
                  },
                },
              },
            },
            created_at: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = createEventSchema.parse(request.body);

      // TODO: Implement actual event creation logic
      // 1. Validate provider and model
      // 2. Calculate cost using pricing engine
      // 3. Store event in database
      // 4. Return event with calculated cost

      const mockEvent = {
        id: `evt_${Date.now()}`,
        status: 'processed',
        cost: {
          total: 0.045,
          currency: 'USD',
          breakdown: {
            input: 0.03,
            output: 0.015,
            cached: 0,
          },
        },
        created_at: new Date().toISOString(),
      };

      return reply.code(201).send(mockEvent);
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

  // POST /api/v1/events/batch - Create multiple events
  server.post('/api/v1/events/batch', {
    preHandler: apiKeyAuth,
    schema: {
      tags: ['events'],
      description: 'Ingest multiple cost events in a single request (max 100)',
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['events'],
        properties: {
          events: {
            type: 'array',
            minItems: 1,
            maxItems: 100,
            items: {
              type: 'object',
              required: ['source', 'provider', 'model', 'usage'],
            },
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            processed: { type: 'integer' },
            failed: { type: 'integer' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = batchEventsSchema.parse(request.body);

      // TODO: Implement batch event creation
      // Process events in parallel with proper error handling

      const results = body.events.map((_, index) => ({
        id: `evt_${Date.now()}_${index}`,
        status: 'processed',
      }));

      return reply.code(201).send({
        processed: results.length,
        failed: 0,
        events: results,
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

  // GET /api/v1/events/:id - Get event by ID
  server.get('/api/v1/events/:id', {
    preHandler: apiKeyAuth,
    schema: {
      tags: ['events'],
      description: 'Get a cost event by ID',
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            source: { type: 'object' },
            provider: { type: 'string' },
            model: { type: 'string' },
            usage: { type: 'object' },
            cost: { type: 'object' },
            created_at: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // TODO: Fetch event from database
    const mockEvent = {
      id,
      source: {
        platform: 'github',
        type: 'github_action',
        workflow_id: 'build-test',
        repository: 'org/repo',
      },
      provider: 'openai',
      model: 'gpt-4',
      usage: {
        input_tokens: 1000,
        output_tokens: 500,
        total_tokens: 1500,
      },
      cost: {
        total: 0.045,
        currency: 'USD',
        breakdown: {
          input: 0.03,
          output: 0.015,
        },
      },
      created_at: new Date().toISOString(),
    };

    return reply.send(mockEvent);
  });
}
