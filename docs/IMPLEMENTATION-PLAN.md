# Implementation Plan - Cost Engine MVP

**Status:** In Progress  
**Target Completion:** Phase 1 MVP - 2-3 weeks  
**Last Updated:** 2026-08-08

---

## ✅ Completed

### Architecture & Planning
- [x] Architecture Decision Record (ADR-001)
- [x] Repository structure created
- [x] Core type definitions
- [x] Interface definitions
- [x] Database schema design
- [x] Pricing engine foundation
- [x] Development environment setup (docker-compose.yml)
- [x] Project documentation (README.md)

---

## 🚧 In Progress - Phase 1 MVP

### 1. Database Layer (Priority: HIGH)

**Package:** `@cost-engine/database`

#### Tasks:
- [ ] Complete Drizzle ORM configuration
  - [ ] Create `drizzle.config.ts`
  - [ ] Set up database connection pool
  - [ ] Configure migrations

- [ ] Implement database migrations
  - [ ] Initial schema migration (all tables)
  - [ ] Create indexes
  - [ ] Set up Row-Level Security (RLS) policies

- [ ] Create repository implementations
  - [ ] `PricingRepository` (PostgreSQL implementation)
  - [ ] `CostEventRepository`
  - [ ] `OrganizationRepository`
  - [ ] `ProjectRepository`
  - [ ] `CustomerRepository`

- [ ] Database utilities
  - [ ] Connection management
  - [ ] Transaction helpers
  - [ ] Query builders

**Files to Create:**
```
packages/database/
├── drizzle.config.ts
├── src/
│   ├── index.ts
│   ├── schema.ts ✅
│   ├── connection.ts
│   ├── migrate.ts
│   ├── seed.ts
│   ├── repositories/
│   │   ├── pricing.repository.ts
│   │   ├── cost-event.repository.ts
│   │   ├── organization.repository.ts
│   │   ├── project.repository.ts
│   │   └── customer.repository.ts
│   └── utils/
│       ├── transaction.ts
│       └── query-builder.ts
└── migrations/
    └── 0001_initial_schema.sql
```

---

### 2. Provider Adapters (Priority: HIGH)

**Package:** `@cost-engine/providers`

#### Tasks:
- [ ] Create base adapter class
- [ ] Implement OpenAI adapter
  - [ ] Usage collection from API responses
  - [ ] Cost calculation
  - [ ] Model validation
  - [ ] Support for GPT-4, GPT-3.5, etc.

- [ ] Implement Anthropic adapter
  - [ ] Usage collection
  - [ ] Cost calculation
  - [ ] Support for Claude 3 models

- [ ] Implement Google AI adapter
  - [ ] Usage collection
  - [ ] Cost calculation
  - [ ] Support for Gemini models

- [ ] Implement OpenRouter adapter
- [ ] Implement Ollama adapter (local models)

- [ ] Provider registry
  - [ ] Dynamic provider loading
  - [ ] Provider discovery

**Files to Create:**
```
packages/providers/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── base-adapter.ts
│   ├── provider-registry.ts
│   ├── openai/
│   │   ├── openai-adapter.ts
│   │   ├── openai-models.ts
│   │   └── openai-types.ts
│   ├── anthropic/
│   │   ├── anthropic-adapter.ts
│   │   ├── anthropic-models.ts
│   │   └── anthropic-types.ts
│   ├── google/
│   │   ├── google-adapter.ts
│   │   ├── google-models.ts
│   │   └── google-types.ts
│   ├── openrouter/
│   │   └── openrouter-adapter.ts
│   └── ollama/
│       └── ollama-adapter.ts
└── tests/
```

---

### 3. REST API (Priority: HIGH)

**Package:** `apps/api`

#### Tasks:
- [ ] Set up Fastify server
  - [ ] Server configuration
  - [ ] Plugin system
  - [ ] Error handling
  - [ ] Request logging

- [ ] Authentication & Authorization
  - [ ] API key authentication
  - [ ] JWT token authentication
  - [ ] Role-based access control (RBAC)
  - [ ] Auth middleware

- [ ] Core API endpoints
  - [ ] `POST /api/v1/events` - Ingest single event
  - [ ] `POST /api/v1/events/batch` - Ingest batch events
  - [ ] `GET /api/v1/events/:id` - Get event by ID
  - [ ] `GET /api/v1/costs` - Query costs with filters
  - [ ] `GET /api/v1/costs/summary` - Cost summary

- [ ] Project endpoints
  - [ ] `GET /api/v1/projects` - List projects
  - [ ] `GET /api/v1/projects/:id` - Get project
  - [ ] `GET /api/v1/projects/:id/costs` - Project costs
  - [ ] `POST /api/v1/projects` - Create project

- [ ] Customer endpoints
  - [ ] `GET /api/v1/customers` - List customers
  - [ ] `GET /api/v1/customers/:id/costs` - Customer costs

- [ ] Provider & Model endpoints
  - [ ] `GET /api/v1/providers` - List providers
  - [ ] `GET /api/v1/providers/:provider/usage` - Provider usage
  - [ ] `GET /api/v1/models` - List models

- [ ] Pricing endpoints
  - [ ] `GET /api/v1/pricing` - List pricing versions
  - [ ] `POST /api/v1/pricing` - Add pricing version

- [ ] Health & Metrics
  - [ ] `GET /health` - Health check
  - [ ] `GET /metrics` - Prometheus metrics

- [ ] OpenAPI documentation
  - [ ] Generate OpenAPI spec
  - [ ] Swagger UI integration

**Files to Create:**
```
apps/api/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── server.ts
│   ├── config.ts
│   ├── plugins/
│   │   ├── auth.plugin.ts
│   │   ├── cors.plugin.ts
│   │   ├── rate-limit.plugin.ts
│   │   └── swagger.plugin.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logging.middleware.ts
│   ├── routes/
│   │   ├── events.routes.ts
│   │   ├── costs.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── customers.routes.ts
│   │   ├── providers.routes.ts
│   │   ├── pricing.routes.ts
│   │   └── health.routes.ts
│   ├── controllers/
│   │   ├── events.controller.ts
│   │   ├── costs.controller.ts
│   │   ├── projects.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── cost-event.service.ts
│   │   ├── cost-aggregation.service.ts
│   │   ├── auth.service.ts
│   │   └── ...
│   └── utils/
│       ├── logger.ts
│       ├── validation.ts
│       └── response.ts
└── tests/
```

---

### 4. GitHub Action (Priority: HIGH)

**Package:** `actions/token-cost`

#### Tasks:
- [ ] Create action metadata (`action.yml`)
- [ ] Implement action logic
  - [ ] Collect GitHub context
  - [ ] Detect AI provider usage
  - [ ] Extract token usage from logs/env
  - [ ] Calculate runtime
  - [ ] Send event to Cost Engine API

- [ ] Generate cost report
  - [ ] Format cost summary
  - [ ] Create GitHub job summary
  - [ ] Add workflow annotations

- [ ] Error handling
  - [ ] Graceful failures
  - [ ] Retry logic
  - [ ] Detailed error messages

- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests with mock API
  - [ ] Example workflows

**Files to Create:**
```
actions/token-cost/
├── action.yml
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── main.ts
│   ├── github-context.ts
│   ├── usage-collector.ts
│   ├── api-client.ts
│   ├── report-generator.ts
│   └── utils/
│       ├── logger.ts
│       └── retry.ts
├── dist/
│   └── index.js (compiled)
├── tests/
└── examples/
    └── workflow.yml
```

---

### 5. Testing (Priority: MEDIUM)

#### Tasks:
- [ ] Unit tests for core packages
  - [ ] `@cost-engine/core` types and schemas
  - [ ] `@cost-engine/pricing` engine
  - [ ] Provider adapters

- [ ] Integration tests
  - [ ] Database operations
  - [ ] API endpoints
  - [ ] Provider adapters with mock APIs

- [ ] End-to-End tests
  - [ ] Full event ingestion flow
  - [ ] Cost calculation accuracy
  - [ ] GitHub Action integration

- [ ] Test utilities
  - [ ] Mock data generators
  - [ ] Test fixtures
  - [ ] Database seeding for tests

**Test Coverage Goals:**
- Core packages: 90%+
- API endpoints: 80%+
- Provider adapters: 85%+

---

### 6. Documentation (Priority: MEDIUM)

#### Tasks:
- [ ] API documentation
  - [ ] OpenAPI specification
  - [ ] Endpoint examples
  - [ ] Authentication guide

- [ ] Database documentation
  - [ ] Schema diagrams
  - [ ] Table descriptions
  - [ ] Query examples

- [ ] Provider adapter guide
  - [ ] How to add new providers
  - [ ] Adapter interface documentation
  - [ ] Testing adapters

- [ ] Deployment guide
  - [ ] Docker deployment
  - [ ] Kubernetes deployment (basic)
  - [ ] Environment configuration
  - [ ] Database migrations

- [ ] Usage examples
  - [ ] GitHub Action usage
  - [ ] API client examples (Node.js, Python)
  - [ ] Webhook integration
  - [ ] CRM integration examples

**Files to Create:**
```
docs/
├── ADR-001-architecture-overview.md ✅
├── IMPLEMENTATION-PLAN.md ✅
├── api/
│   ├── openapi.yaml
│   ├── authentication.md
│   └── endpoints.md
├── database/
│   ├── schema.md
│   ├── migrations.md
│   └── queries.md
├── providers/
│   ├── adding-providers.md
│   └── adapter-guide.md
├── deployment/
│   ├── docker.md
│   ├── kubernetes.md
│   └── configuration.md
└── examples/
    ├── github-action.md
    ├── api-client.md
    └── crm-integration.md
```

---

## 📋 Definition of Done - MVP

The MVP is complete when:

1. ✅ **Architecture documented** - ADR created
2. ✅ **Repository structure** - All directories created
3. ✅ **Core types defined** - TypeScript interfaces and schemas
4. ✅ **Database schema** - PostgreSQL schema with Drizzle ORM
5. ✅ **Pricing engine** - Basic implementation with versioned pricing
6. [ ] **Database migrations** - Working migrations and seed data
7. [ ] **Provider adapters** - OpenAI and Anthropic adapters working
8. [ ] **REST API** - Core endpoints functional
9. [ ] **Authentication** - API key and JWT auth working
10. [ ] **GitHub Action** - Action can track costs and report
11. [ ] **Tests** - Core functionality tested (unit + integration)
12. [ ] **Docker setup** - docker-compose working for local dev
13. [ ] **Documentation** - API docs and deployment guide

### Success Criteria Test:

```bash
# 1. Start services
docker-compose up -d

# 2. Run migrations
npm run db:migrate

# 3. Seed test data
npm run db:seed

# 4. Start API
cd apps/api && npm run dev

# 5. Test event ingestion
curl -X POST http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer test-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"platform": "github", "type": "github_action"},
    "provider": "openai",
    "model": "gpt-4",
    "usage": {"input_tokens": 1000, "output_tokens": 500}
  }'

# 6. Query costs
curl http://localhost:3000/api/v1/costs?project_id=test-project \
  -H "Authorization: Bearer test-api-key"

# 7. Run GitHub Action (in test workflow)
# Should successfully track costs and generate report
```

---

## 🔄 Next Steps (Immediate)

### Week 1: Database & Core Services
1. Complete database migrations
2. Implement repository layer
3. Set up connection pooling
4. Create seed data

### Week 2: API & Providers
1. Build Fastify API server
2. Implement authentication
3. Create core endpoints
4. Build OpenAI adapter
5. Build Anthropic adapter

### Week 3: GitHub Action & Testing
1. Develop GitHub Action
2. Write integration tests
3. End-to-end testing
4. Documentation
5. Docker optimization

---

## 📊 Progress Tracking

| Component | Status | Progress | Priority |
|-----------|--------|----------|----------|
| Architecture | ✅ Done | 100% | HIGH |
| Core Types | ✅ Done | 100% | HIGH |
| Database Schema | ✅ Done | 100% | HIGH |
| Pricing Engine | ✅ Done | 80% | HIGH |
| Database Layer | 🚧 In Progress | 20% | HIGH |
| Provider Adapters | ⏳ Not Started | 0% | HIGH |
| REST API | ⏳ Not Started | 0% | HIGH |
| GitHub Action | ⏳ Not Started | 0% | HIGH |
| Testing | ⏳ Not Started | 0% | MEDIUM |
| Documentation | 🚧 In Progress | 30% | MEDIUM |

---

## 🎯 Phase 2 Preview (Post-MVP)

After MVP completion, focus on:

1. **Additional Providers**
   - Google AI (Gemini)
   - OpenRouter
   - Ollama
   - Azure OpenAI

2. **Webhook Ingestion**
   - Generic webhook endpoint
   - Signature validation
   - Provider-specific webhooks

3. **SDK Development**
   - Node.js SDK
   - Python SDK
   - Go SDK (optional)

4. **CLI Tool**
   - Cost queries from terminal
   - Project management
   - Pricing management

5. **Enhanced Reporting**
   - CSV/JSON export
   - Custom date ranges
   - Advanced filtering

---

## 📝 Notes

- Keep security as top priority (API keys, secrets management)
- Ensure idempotency in all event ingestion
- Maintain backward compatibility in API
- Document all breaking changes
- Use semantic versioning

---

**Last Updated:** 2026-08-08  
**Next Review:** After Week 1 completion
