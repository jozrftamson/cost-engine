# AI Cost Tracking Action

Track AI and automation costs directly in your GitHub workflows with the Cost Engine.

## Features

- 🤖 **Multi-Provider Support**: OpenAI, Anthropic, Google AI, and more
- 💰 **Accurate Cost Tracking**: Real-time cost calculation based on token usage
- 📊 **Detailed Reports**: Generate cost summaries in workflow logs
- 🔐 **Secure**: API key authentication with encrypted secrets
- 📈 **Project Attribution**: Link costs to specific projects and customers
- 🎯 **Zero Configuration**: Works out of the box with sensible defaults

## Usage

### Basic Example

```yaml
name: AI Cost Tracking

on:
  push:
  workflow_dispatch:

jobs:
  track-costs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Track AI Costs
        uses: jozrftamson/cost-engine-action@v1
        with:
          api-url: ${{ secrets.COST_ENGINE_URL }}
          api-key: ${{ secrets.COST_ENGINE_API_KEY }}
          project-id: ${{ vars.PROJECT_ID }}
```

### Advanced Example with Manual Token Tracking

```yaml
name: AI Workflow with Cost Tracking

on:
  push:
  workflow_dispatch:

jobs:
  ai-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run AI Task
        id: ai-task
        run: |
          # Your AI task here
          echo "input_tokens=10000" >> $GITHUB_OUTPUT
          echo "output_tokens=2500" >> $GITHUB_OUTPUT
      
      - name: Track AI Costs
        uses: jozrftamson/cost-engine-action@v1
        with:
          api-url: ${{ secrets.COST_ENGINE_URL }}
          api-key: ${{ secrets.COST_ENGINE_API_KEY }}
          project-id: ${{ vars.PROJECT_ID }}
          customer-id: ${{ vars.CUSTOMER_ID }}
          provider: 'openai'
          model: 'gpt-4'
          input-tokens: ${{ steps.ai-task.outputs.input_tokens }}
          output-tokens: ${{ steps.ai-task.outputs.output_tokens }}
```

## Inputs

| Input | Required | Description | Default |
|-------|----------|-------------|---------|
| `api-url` | ✅ | Cost Engine API URL | - |
| `api-key` | ✅ | Cost Engine API Key | - |
| `project-id` | ✅ | Project ID for cost attribution | - |
| `customer-id` | ❌ | Customer ID (optional) | - |
| `workflow-id` | ❌ | Workflow ID (optional) | - |
| `provider` | ❌ | AI Provider (openai, anthropic, google) | Auto-detected |
| `model` | ❌ | AI Model name | Auto-detected |
| `input-tokens` | ❌ | Number of input tokens used | Auto-detected |
| `output-tokens` | ❌ | Number of output tokens used | Auto-detected |
| `cached-tokens` | ❌ | Number of cached tokens used | Auto-detected |

## Outputs

| Output | Description |
|--------|-------------|
| `total-cost` | Total cost calculated for this run |
| `cost-currency` | Currency of the cost (USD, EUR, etc.) |
| `event-id` | Cost event ID in the Cost Engine |

## Setup

### 1. Set up Cost Engine

First, deploy the Cost Engine API or use a hosted instance:

```bash
# Using Docker
docker-compose up -d

# Or deploy to your infrastructure
# See: https://github.com/jozrftamson/cost-engine
```

### 2. Create API Key

Generate an API key in the Cost Engine:

```bash
curl -X POST https://your-cost-engine.com/api/v1/auth/keys \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "GitHub Actions", "role": "SERVICE"}'
```

### 3. Configure GitHub Secrets

Add the following secrets to your repository:

- `COST_ENGINE_URL`: Your Cost Engine API URL
- `COST_ENGINE_API_KEY`: Your API key from step 2

### 4. Configure Variables

Add the following variables to your repository:

- `PROJECT_ID`: Your project ID in Cost Engine
- `CUSTOMER_ID`: (Optional) Your customer ID

## Cost Report Example

After each run, the action generates a detailed cost report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI COST REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: marketplace-ai
Workflow: build-and-test
AI Provider: OpenAI
Model: GPT-4

Input Tokens: 124,300
Output Tokens: 31,200
Total Tokens: 155,500

AI Cost: $4.68
GitHub Runtime: 3m 42s
Infrastructure: $0.12

Total Run Cost: $4.80

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Supported Providers

- ✅ OpenAI (GPT-4, GPT-3.5, etc.)
- ✅ Anthropic (Claude 3)
- ✅ Google AI (Gemini)
- ✅ OpenRouter
- ✅ Ollama (local models)
- 🔜 Azure OpenAI
- 🔜 AWS Bedrock

## Auto-Detection

The action automatically detects:

- **Provider**: From environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
- **Model**: From API responses or logs
- **Token Usage**: From API responses or logs
- **Runtime**: From GitHub Actions context

## Security

- API keys are never logged or exposed
- All communication uses HTTPS
- Secrets are stored encrypted in GitHub
- No sensitive data is stored in Cost Engine by default

## Troubleshooting

### Action fails with "Repository not found"

Make sure your `api-url` is correct and accessible from GitHub Actions runners.

### No costs are tracked

Check that:
1. Your API key is valid
2. The project ID exists in Cost Engine
3. The provider and model are supported

### Token usage is not detected

You can manually specify token usage using the `input-tokens` and `output-tokens` inputs.

## Examples

See the [examples directory](../../examples/) for more usage examples:

- Basic cost tracking
- Multi-provider workflows
- Customer attribution
- Budget alerts integration

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Support

- 📧 Email: support@cost-engine.example.com
- 💬 Discord: [Join our community](https://discord.gg/cost-engine)
- 🐛 Issues: [GitHub Issues](https://github.com/jozrftamson/cost-engine/issues)

## Related

- [Cost Engine API](https://github.com/jozrftamson/cost-engine)
- [Cost Engine Documentation](https://github.com/jozrftamson/cost-engine/tree/main/docs)
- [Cost Engine Dashboard](https://github.com/jozrftamson/cost-engine-dashboard)
