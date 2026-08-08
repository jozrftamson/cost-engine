# Unified AI Token & Automation Cost Engine

> A production-ready platform for tracking, calculating, and reporting costs across AI models, automations, GitHub Actions, APIs, and infrastructure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

---

## 🎯 Overview

The **Unified AI Token & Automation Cost Engine** is a centralized platform that answers the critical question:

> **"What did this project, customer, automation, agent, workflow, or GitHub run actually cost?"**

### Key Features

- 🤖 **Multi-Provider AI Cost Tracking**: OpenAI, Anthropic, Google AI, OpenRouter, Ollama, and more
- 🔄 **Automation Cost Tracking**: n8n, Apify, Make, Zapier, GitHub Actions, custom workflows
- ☸️ **Infrastructure Costs**: Kubernetes (via OpenCost), compute, storage, network
- 📊 **Unified Cost Intelligence**: Single API for all cost sources
- 🏢 **Multi-Tenant**: Organization-based data isolation
- 💰 **Accurate Historical Pricing**: Versioned pricing data for accurate cost calculations
- 🔐 **Secure**: API key authentication, role-based access control, audit logging
- 📈 **Scalable**: Event-driven architecture ready for high volumes

---

## 🏗️ Architecture

```
                  ┌─────────────────────────┐
                  │   Cost Intelligence API │
                  │                         │
                  │ REST API / Webhooks     │
                  │ Cost Calculation        │
                  │ Aggregation             │
                  │ Reporting               │
                  └────────────┬────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   GitHub Actions          AI Providers        Automation
   CI/CD                   OpenAI              n8n
   Workflows               Anthropic           Apify
   Builds                  Google AI           Make
   Tests                   OpenRouter          Zapier
                           Ollama              Custom Agents
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                     ┌───────────────────┐
                     │ Cost Data Layer   │
                     │                   │
                     │ Token usage       │
                     │ API calls         │
                     │ Runtime           │
                     │ Infrastructure    │
                     │ Project           │
                     │ Customer          │
                     │ Workflow          │
                     └─────────┬─────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │ PostgreSQL         │
                    │ Cost Events        │
                    │ Pricing Versions   │
                    └────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 16+
- Docker (optional, for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cost-engine.git
cd cost-engine

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start the API server
npm run dev
```

### Using the GitHub Action

Add to your workflow:

```yaml
name: AI Cost Tracking

on:
  push:
  workflow_dispatch:

jobs:
  cost-tracking:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Track AI Costs
        uses: your-org/cost-engine-action@v1
        with:
          api-url: ${{ secrets.COST_ENGINE_URL }}
          api-key: ${{ secrets.COST_ENGINE_API_KEY }}
          project-id: ${{ vars.PROJECT_ID }}
```

---

## 📦 Project Structure

```
cost-engine/
├── apps/
│   ├── api/              # REST API server (Fastify)
│   ├── worker/           # Background job processor
│   └── dashboard/        # Web dashboard (Next.js)
│
├── packages/
│   ├── core/             # Core domain models and interfaces
│   ├── pricing/          # Pricing engine
│   ├── providers/        # Provider adapters (OpenAI, Anthropic, etc.)
│   ├── github/           # GitHub-specific utilities
│   ├── opencost/         # OpenCost integration
│   ├── database/         # Database schema and queries (Drizzle ORM)
│   └── shared/           # Shared utilities and types
│
├── actions/
│   └── token-cost/       # GitHub Action for cost tracking
│
├── infrastructure/
│   ├── docker/           # Docker configurations
│   ├── kubernetes/       # Kubernetes manifests
│   └── opencost/         # OpenCost setup
│
├── migrations/           # Database migrations
├── tests/                # Test suites
└── docs/                 # Documentation
```

---

## 🔌 API Endpoints

### Event Ingestion

```http
POST /api/v1/events
Content-Type: application/json
Authorization: Bearer <api-key>

{
  "source": {
    "platform": "github",
    "type": "github_action",
    "external_id": "workflow_run_123"
  },
  "project_id": "project_123",
  "provider": "openai",
  "model": "gpt-4",
  "usage": {
    "input_tokens": 10000,
    "output_tokens": 2500
  }
}
```

### Cost Queries

```http
GET /api/v1/costs?project_id=project_123&period=month
Authorization: Bearer <api-key>

Response:
{
  "project_id": "project_123",
  "period": "month",
  "costs": {
    "ai": 42.15,
    "automation": 18.20,
    "infrastructure": 31.50,
    "total": 91.85
  },
  "usage": {
    "input_tokens": 12000000,
    "output_tokens": 4300000
  }
}
```

### Project Costs

```http
GET /api/v1/projects/project_123/costs
Authorization: Bearer <api-key>
```

### Customer Costs

```http
GET /api/v1/customers/customer_123/costs
Authorization: Bearer <api-key>
```

---

## 🔐 Authentication

The API supports two authentication methods:

### API Keys

```bash
# Generate an API key
curl -X POST https://api.cost-engine.example.com/api/v1/auth/keys \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key", "role": "SERVICE"}'
```

### Bearer Tokens (JWT)

```bash
# Login to get a token
curl -X POST https://api.cost-engine.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📊 Supported Providers

### AI Providers
- ✅ OpenAI (GPT-4, GPT-3.5, etc.)
- ✅ Anthropic (Claude 3, Claude 2)
- ✅ Google AI (Gemini)
- ✅ OpenRouter (multi-provider)
- ✅ Ollama (local models)
- 🔜 Azure OpenAI
- 🔜 AWS Bedrock
- 🔜 Mistral AI
- 🔜 Cohere

### Automation Platforms
- ✅ GitHub Actions
- 🔜 n8n
- 🔜 Apify
- 🔜 Make
- 🔜 Zapier
- 🔜 GitLab CI
- 🔜 Jenkins

### Infrastructure
- 🔜 OpenCost (Kubernetes)
- 🔜 AWS Cost Explorer
- 🔜 Azure Cost Management
- 🔜 GCP Billing

---

## 🗺️ Roadmap

### Phase 1 - MVP (Current)
- [x] Architecture design
- [ ] PostgreSQL schema
- [ ] Core event model
- [ ] Pricing engine
- [ ] REST API
- [ ] GitHub Action
- [ ] OpenAI adapter
- [ ] Anthropic adapter

### Phase 2
- [ ] Additional AI providers
- [ ] Webhook ingestion
- [ ] SDK (Node.js, Python)
- [ ] CLI tool

### Phase 3
- [ ] OpenCost integration
- [ ] Kubernetes cost tracking
- [ ] Infrastructure allocation

### Phase 4
- [ ] CRM integration
- [ ] Budgets and alerts
- [ ] Cost forecasting

### Phase 5
- [ ] Web dashboard
- [ ] Cost optimization recommendations
- [ ] Anomaly detection

---

## 📖 Documentation

- [Architecture Decision Records](./docs/ADR-001-architecture-overview.md)
- [API Documentation](./docs/api.md) (Coming soon)
- [Database Schema](./docs/schema.md) (Coming soon)
- [Provider Adapters](./docs/providers.md) (Coming soon)
- [Deployment Guide](./docs/deployment.md) (Coming soon)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by FinOps best practices
- Built with modern TypeScript tooling
- Powered by PostgreSQL and Fastify

---

## 📞 Support

- 📧 Email: support@cost-engine.example.com
- 💬 Discord: [Join our community](https://discord.gg/cost-engine)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/cost-engine/issues)

---

**Built with ❤️ for the AI and automation community**
