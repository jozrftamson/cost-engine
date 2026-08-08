# ADR-001: Architecture Overview - Unified AI Token & Automation Cost Engine

**Status:** Accepted  
**Date:** 2026-08-08  
**Decision Makers:** Platform Engineering Team  

---

## Context

We need a production-ready **Unified AI Token & Automation Cost Engine** that can:

1. Centrally capture costs from AI models, automations, GitHub Actions, APIs, and workflows
2. Calculate costs using versioned pricing data
3. Store cost events in a structured, queryable format
4. Provide a REST API for CRM systems and other platforms
5. Start as a GitHub Action and evolve into a central Cost Intelligence Platform

### Key Requirements

- **Provider-agnostic**: Support multiple AI providers (OpenAI, Anthropic, Google AI, etc.)
- **Multi-tenant**: Isolate data by organization
- **Extensible**: Easy to add new providers and cost sources
- **Accurate**: Historical pricing must be preserved for accurate cost calculations
- **Idempotent**: Handle duplicate events gracefully
- **Scalable**: Prepare for high event volumes

---

## Decision

### 1. Architecture Pattern: Layered + Adapter Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  REST API │ GitHub Action │ Webhooks │ CLI │ Dashboard      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  Event Ingestion │ Cost Calculation │ Aggregation │ Reports │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                           │
│  Cost Events │ Pricing Engine │ Provider Adapters │ Rules   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│  PostgreSQL │ Redis (optional) │ External APIs │ Logging    │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:**
- Clear separation of concerns
- Easy to test each layer independently
- Adapters isolate provider-specific logic
- Domain layer contains business rules

---

### 2. Technology Stack

#### Backend
- **Language:** TypeScript (type safety, excellent tooling)
- **Runtime:** Node.js 20+ LTS
- **API Framework:** Fastify (performance, schema validation)
- **Database:** PostgreSQL 16+ (JSONB support, reliability)
- **ORM:** Drizzle ORM (type-safe, lightweight, better performance than Prisma)
- **Validation:** Zod (runtime type validation)
- **Testing:** Vitest (fast, modern)

#### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Kubernetes (future)
- **CI/CD:** GitHub Actions
- **Monitoring:** OpenTelemetry (future)

**Rationale:**
- TypeScript provides type safety across the entire stack
- Fastify offers better performance than Express
- Drizzle ORM is lighter and faster than Prisma
- PostgreSQL handles complex queries and JSONB efficiently

---

### 3. Data Model: Unified Cost Event

All cost sources normalize to a single event model:

```typescript
interface CostEvent {
  id: string;                    // UUID
  organization_id: string;       // Multi-tenant isolation
  timestamp: string;             // ISO 8601
  idempotency_key: string;       // Prevent duplicates
  
  source: {
    platform: string;            // github, n8n, apify, etc.
    type: string;                // github_action, llm_call, etc.
    external_id?: string;        // Provider's ID
  };
  
  project_id?: string;
  customer_id?: string;
  workflow_id?: string;
  agent_id?: string;
  
  provider?: string;             // openai, anthropic, etc.
  model?: string;                // gpt-4, claude-3, etc.
  
  usage?: {
    input_tokens?: number;       // null if not available
    output_tokens?: number;
    cached_tokens?: number;
    reasoning_tokens?: number;
    requests?: number;
    runtime_seconds?: number;
  };
  
  infrastructure?: {
    cpu_seconds?: number;
    memory_gb_seconds?: number;
    gpu_seconds?: number;
    storage_gb?: number;
    network_gb?: number;
  };
  
  cost: {
    amount: number;              // Calculated cost
    currency: string;            // USD, EUR
    category: string;            // AI_TOKEN, AUTOMATION, etc.
    breakdown?: {                // Optional detailed breakdown
      input_cost?: number;
      output_cost?: number;
      cache_cost?: number;
      infrastructure_cost?: number;
    };
  };
  
  metadata?: Record<string, unknown>;  // Flexible additional data
}
```

**Rationale:**
- Single unified model simplifies queries and aggregations
- Optional fields allow different providers to report what they have
- `null` vs `0` distinction preserves data quality
- JSONB metadata field provides flexibility without schema changes

---

### 4. Pricing Engine: Versioned & Decoupled

Pricing data is **never hardcoded**. Instead:

```typescript
interface PricingVersion {
  id: string;
  provider: string;
  model: string;
  currency: string;
  version: string;              // e.g., "2026-08"
  effective_from: string;       // ISO 8601
  effective_until?: string;     // null = current
  
  pricing: {
    input_per_1m_tokens?: number;
    output_per_1m_tokens?: number;
    cached_input_per_1m_tokens?: number;
    request_price?: number;
    runtime_per_second?: number;
  };
  
  metadata?: Record<string, unknown>;
}
```

**Cost Calculation Flow:**
1. Event arrives with timestamp
2. Query pricing table for correct version at that timestamp
3. Calculate cost using historical pricing
4. Store calculated cost with event

**Rationale:**
- Historical accuracy: Old events use old prices
- Easy to update prices without code changes
- Supports price changes over time
- Audit trail for pricing changes

---

### 5. Provider Adapter Pattern

Each provider implements a standard interface:

```typescript
interface CostProviderAdapter {
  getProviderName(): string;
  
  collectUsage(input: UsageRequest): Promise<UsageData>;
  
  calculateCost(
    usage: UsageData,
    pricing: PricingConfig
  ): Promise<CostResult>;
  
  validateConfig(config: unknown): boolean;
}
```

**Initial Adapters:**
- OpenAIAdapter
- AnthropicAdapter
- GoogleAIAdapter
- OpenRouterAdapter
- OllamaAdapter
- GitHubActionsAdapter

**Rationale:**
- Easy to add new providers
- Isolates provider-specific logic
- Testable in isolation
- Consistent interface for all providers

---

### 6. Multi-Tenancy: Organization-Based Isolation

Every table includes `organization_id`:

```sql
CREATE TABLE cost_events (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  -- ... other fields
);

CREATE INDEX idx_cost_events_org ON cost_events(organization_id);
```

**Row-Level Security (RLS):**
```sql
ALTER TABLE cost_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON cost_events
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

**Rationale:**
- Database-level isolation prevents data leaks
- Indexes on organization_id ensure query performance
- RLS provides defense in depth

---

### 7. Idempotency: Key-Based Deduplication

Every event has an idempotency key:

```typescript
// Example for GitHub Actions
const idempotencyKey = `github:${repo}:${workflow_run_id}:${event_type}`;

// Database constraint
CREATE UNIQUE INDEX idx_cost_events_idempotency 
  ON cost_events(organization_id, idempotency_key);
```

**Behavior:**
- First event: INSERT
- Duplicate event: UPDATE (or ignore)
- Prevents double-counting costs

**Rationale:**
- GitHub Actions can be re-run
- Network failures can cause retries
- Ensures accurate cost tracking

---

### 8. API Design: RESTful + Versioned

**Base URL:** `/api/v1`

**Key Endpoints:**
```
POST   /api/v1/events              # Ingest single event
POST   /api/v1/events/batch        # Ingest multiple events
GET    /api/v1/costs               # Query costs with filters
GET    /api/v1/projects/:id/costs  # Project-specific costs
GET    /api/v1/customers/:id/costs # Customer-specific costs
GET    /api/v1/pricing             # List pricing versions
POST   /api/v1/pricing             # Add new pricing version
GET    /api/v1/health              # Health check
GET    /api/v1/metrics             # Prometheus metrics
```

**Authentication:**
- API Keys (hashed in database)
- Bearer tokens (JWT)
- Role-based access control (ADMIN, FINANCE, DEVELOPER, VIEWER, SERVICE)

**Rationale:**
- RESTful design is familiar and well-understood
- Versioning allows breaking changes
- Multiple auth methods support different use cases

---

### 9. GitHub Action: First Integration Point

**Action Structure:**
```yaml
name: 'AI Cost Tracking'
description: 'Track AI and automation costs in your workflows'
inputs:
  api-url:
    description: 'Cost Engine API URL'
    required: true
  api-key:
    description: 'Cost Engine API Key'
    required: true
  project-id:
    description: 'Project ID for cost attribution'
    required: true
runs:
  using: 'node20'
  main: 'dist/index.js'
```

**Action Responsibilities:**
1. Collect GitHub context (repo, workflow, run ID, commit)
2. Detect AI provider usage (environment variables, logs)
3. Extract token usage (if available)
4. Calculate runtime
5. Send event to Cost Engine API
6. Generate cost report summary

**Rationale:**
- GitHub Actions is the first use case
- Provides immediate value
- Tests the entire system end-to-end

---

### 10. Security Considerations

**Secrets Management:**
- Never log API keys or provider secrets
- Use GitHub Secrets for sensitive data
- Hash API keys in database (bcrypt)
- Rotate keys regularly

**Input Validation:**
- Validate all API inputs with Zod schemas
- Sanitize user-provided data
- Rate limiting on API endpoints
- SQL injection prevention (parameterized queries)

**Audit Logging:**
- Log all API access
- Track who accessed what data
- Retention policy for audit logs

**Rationale:**
- Security is critical for cost data
- Compliance requirements (GDPR, SOC 2)
- Prevent unauthorized access

---

## Consequences

### Positive
- Clear architecture enables parallel development
- Provider adapters make it easy to add new sources
- Versioned pricing ensures historical accuracy
- Multi-tenancy supports SaaS model
- Idempotency prevents cost miscalculations

### Negative
- Initial complexity higher than simple solution
- Requires PostgreSQL (not serverless-friendly initially)
- More moving parts to maintain

### Mitigations
- Start with MVP (Phase 1) to validate architecture
- Comprehensive tests to catch issues early
- Good documentation to onboard new developers
- Consider serverless options in future (Phase 5+)

---

## Implementation Phases

### Phase 1 (MVP) - 2-3 weeks
- PostgreSQL schema
- Core event model
- Pricing engine
- REST API (basic endpoints)
- GitHub Action
- OpenAI + Anthropic adapters

### Phase 2 - 1-2 weeks
- Additional providers (Google AI, OpenRouter, Ollama)
- Webhook ingestion
- Enhanced reporting

### Phase 3 - 2-3 weeks
- OpenCost integration
- Kubernetes cost tracking
- Infrastructure cost allocation

### Phase 4 - 2-3 weeks
- CRM integration
- Budgets and alerts
- Forecasting

### Phase 5 - Ongoing
- Dashboard
- Cost optimization recommendations
- Anomaly detection
- Advanced analytics

---

## References

- [Twelve-Factor App](https://12factor.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Fastify Documentation](https://www.fastify.io/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

## Approval

This ADR has been reviewed and approved for implementation.

**Next Steps:**
1. Create database schema
2. Implement core packages
3. Build REST API
4. Develop GitHub Action
5. Write tests
6. Deploy MVP
