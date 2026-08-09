# Open-Source Integrations & Tools

## 🔗 Ähnliche Open-Source Projekte

### 1. **Helicone** - LLM Observability Platform
- **GitHub:** https://github.com/Helicone/helicone
- **Features:**
  - Request logging & monitoring
  - Cost tracking
  - Latency analysis
  - User analytics
  - Caching layer
- **Integration mit Cost Engine:**
  ```typescript
  import { Helicone } from "@helicone/helicone";
  import { CostEngine } from "@cost-engine/sdk";
  
  // Sync Helicone data to Cost Engine
  const helicone = new Helicone({ apiKey: process.env.HELICONE_API_KEY });
  const costEngine = new CostEngine({ apiUrl: process.env.COST_ENGINE_URL });
  
  await costEngine.syncFromHelicone(helicone);
  ```

### 2. **LiteLLM** - Multi-Provider LLM Gateway
- **GitHub:** https://github.com/BerriAI/litellm
- **Features:**
  - Unified API für 100+ LLMs
  - Automatic cost tracking
  - Load balancing
  - Fallback routing
- **Integration:**
  ```python
  from litellm import completion
  from cost_engine import track_usage
  
  response = completion(model="gpt-4", messages=[...])
  track_usage(response.usage)
  ```

### 3. **LangSmith** - LangChain Monitoring
- **Website:** https://smith.langchain.com/
- **Features:**
  - Trace LangChain runs
  - Debug chains
  - Cost analysis
  - Performance metrics
- **Integration:**
  ```typescript
  import { LangChainTracer } from "langchain/callbacks";
  import { CostEngine } from "@cost-engine/sdk";
  
  const tracer = new LangChainTracer({
    callbacks: [costEngine.callback()],
  });
  ```

### 4. **OpenLLMetry** - OpenTelemetry for LLMs
- **GitHub:** https://github.com/traceloop/openllmetry
- **Features:**
  - OpenTelemetry integration
  - Distributed tracing
  - Metrics collection
  - Cost attribution
- **Integration:**
  ```python
  from opentelemetry.instrumentation.openai import OpenAIInstrumentor
  from cost_engine import CostEngineExporter
  
  OpenAIInstrumentor().instrument()
  exporter = CostEngineExporter(api_url=COST_ENGINE_URL)
  ```

### 5. **Langfuse** - LLM Engineering Platform
- **GitHub:** https://github.com/langfuse/langfuse
- **Features:**
  - Prompt management
  - Tracing & debugging
  - Cost tracking
  - User feedback
- **Integration:**
  ```typescript
  import { Langfuse } from "langfuse";
  
  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
  });
  
  // Export to Cost Engine
  await costEngine.importFromLangfuse(langfuse);
  ```

### 6. **Portkey** - AI Gateway
- **GitHub:** https://github.com/Portkey-AI/gateway
- **Features:**
  - Multi-provider routing
  - Caching & fallbacks
  - Cost optimization
  - Analytics
- **Integration:**
  ```typescript
  import Portkey from "portkey-ai";
  
  const portkey = new Portkey({
    apiKey: process.env.PORTKEY_API_KEY,
    virtualKey: process.env.VIRTUAL_KEY,
  });
  
  // Sync costs
  await costEngine.syncFromPortkey(portkey);
  ```

---

## 🎯 Token Counting Libraries

### 1. **tiktoken** (OpenAI)
```python
import tiktoken

encoding = tiktoken.encoding_for_model("gpt-4")
tokens = encoding.encode("Your text here")
print(f"Token count: {len(tokens)}")
```

### 2. **js-tiktoken** (JavaScript)
```typescript
import { encoding_for_model } from "@dqbd/tiktoken";

const enc = encoding_for_model("gpt-4");
const tokens = enc.encode("Your text here");
console.log(`Token count: ${tokens.length}`);
enc.free();
```

### 3. **anthropic-tokenizer**
```typescript
import { countTokens } from "@anthropic-ai/tokenizer";

const count = countTokens("Your text here");
console.log(`Token count: ${count}`);
```

---

## 🔧 Orchestration Tools

### 1. **LangGraph** - Multi-Agent Orchestration
```typescript
import { StateGraph } from "@langchain/langgraph";
import { CostEngine } from "@cost-engine/sdk";

const costEngine = new CostEngine({ apiUrl: process.env.COST_ENGINE_URL });

const workflow = new StateGraph({
  channels: {
    messages: { value: (x, y) => x.concat(y) },
    costs: { value: (x, y) => x + y, default: () => 0 },
  },
});

workflow.addNode("agent1", async (state) => {
  const result = await runAgent1(state);
  const cost = await costEngine.trackEvent({
    provider: "openai",
    model: "gpt-4",
    usage: result.usage,
  });
  return { messages: [result.message], costs: cost.total_cost };
});

workflow.addNode("agent2", async (state) => {
  const result = await runAgent2(state);
  const cost = await costEngine.trackEvent({
    provider: "anthropic",
    model: "claude-3-opus",
    usage: result.usage,
  });
  return { messages: [result.message], costs: cost.total_cost };
});

const app = workflow.compile();
const result = await app.invoke({ messages: ["Start"] });
console.log(`Total Cost: $${result.costs.toFixed(4)}`);
```

### 2. **AutoGen** - Multi-Agent Framework
```python
from autogen import AssistantAgent, UserProxyAgent
from cost_engine import CostEngine

cost_engine = CostEngine(api_url=os.getenv("COST_ENGINE_URL"))

assistant = AssistantAgent(
    name="assistant",
    llm_config={
        "model": "gpt-4",
        "api_key": os.getenv("OPENAI_API_KEY"),
    },
)

# Track costs after each message
def track_cost(sender, recipient, message):
    if hasattr(message, "usage"):
        cost_engine.track_event(
            provider="openai",
            model="gpt-4",
            usage=message.usage,
        )

assistant.register_reply(track_cost)
```

### 3. **CrewAI** - Role-Based Agents
```python
from crewai import Agent, Task, Crew
from cost_engine import CostEngine

cost_engine = CostEngine(api_url=os.getenv("COST_ENGINE_URL"))

researcher = Agent(
    role="Researcher",
    goal="Research topics",
    llm="gpt-4",
)

writer = Agent(
    role="Writer",
    goal="Write content",
    llm="claude-3-opus",
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[...],
    callbacks=[cost_engine.callback()],
)

result = crew.kickoff()
print(f"Total Cost: ${cost_engine.get_total_cost():.4f}")
```

---

## 📊 Visualization Tools

### 1. **Grafana Dashboard**
```yaml
# docker-compose.yml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
```

**Dashboard JSON:**
```json
{
  "dashboard": {
    "title": "AI Cost Tracking",
    "panels": [
      {
        "title": "Total Cost Over Time",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(ai_cost_total) by (provider)"
          }
        ]
      },
      {
        "title": "Token Usage by Model",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum(ai_tokens_total) by (model)"
          }
        ]
      }
    ]
  }
}
```

### 2. **Metabase Integration**
```sql
-- Create view for Metabase
CREATE VIEW ai_cost_summary AS
SELECT
  DATE(created_at) as date,
  provider,
  model,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(total_cost) as total_cost
FROM cost_events
GROUP BY DATE(created_at), provider, model
ORDER BY date DESC;
```

### 3. **Streamlit Dashboard**
```python
import streamlit as st
import pandas as pd
from cost_engine import CostEngine

st.title("AI Cost Dashboard")

cost_engine = CostEngine(api_url=os.getenv("COST_ENGINE_URL"))

# Fetch data
costs = cost_engine.get_costs(
    start_date="2026-01-01",
    end_date="2026-12-31"
)

df = pd.DataFrame(costs)

# Display metrics
col1, col2, col3 = st.columns(3)
col1.metric("Total Cost", f"${df['total_cost'].sum():.2f}")
col2.metric("Total Tokens", f"{df['total_tokens'].sum():,}")
col3.metric("Avg Cost/Request", f"${df['total_cost'].mean():.4f}")

# Charts
st.line_chart(df.groupby('date')['total_cost'].sum())
st.bar_chart(df.groupby('provider')['total_cost'].sum())
```

---

## 🚀 CI/CD Integration Examples

### 1. **GitHub Actions mit Cost Tracking**
```yaml
name: AI Workflow with Cost Tracking

on: [push]

jobs:
  ai-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run AI Task
        id: ai
        run: |
          # Your AI task
          echo "input_tokens=1000" >> $GITHUB_OUTPUT
          echo "output_tokens=500" >> $GITHUB_OUTPUT
      
      - name: Track Costs
        uses: jozrftamson/cost-engine-action@v1
        with:
          api-url: ${{ secrets.COST_ENGINE_URL }}
          api-key: ${{ secrets.COST_ENGINE_API_KEY }}
          provider: openai
          model: gpt-4
          input-tokens: ${{ steps.ai.outputs.input_tokens }}
          output-tokens: ${{ steps.ai.outputs.output_tokens }}
```

### 2. **GitLab CI Integration**
```yaml
ai-cost-tracking:
  stage: test
  script:
    - |
      # Run AI task
      RESPONSE=$(curl -X POST https://api.openai.com/v1/chat/completions ...)
      
      # Extract tokens
      INPUT_TOKENS=$(echo $RESPONSE | jq '.usage.prompt_tokens')
      OUTPUT_TOKENS=$(echo $RESPONSE | jq '.usage.completion_tokens')
      
      # Track in Cost Engine
      curl -X POST $COST_ENGINE_URL/api/v1/events \
        -H "X-API-Key: $COST_ENGINE_API_KEY" \
        -d "{
          \"provider\": \"openai\",
          \"model\": \"gpt-4\",
          \"usage\": {
            \"input_tokens\": $INPUT_TOKENS,
            \"output_tokens\": $OUTPUT_TOKENS
          }
        }"
```

### 3. **Jenkins Pipeline**
```groovy
pipeline {
    agent any
    
    stages {
        stage('AI Task') {
            steps {
                script {
                    def response = sh(
                        script: 'curl -X POST https://api.openai.com/v1/chat/completions ...',
                        returnStdout: true
                    )
                    
                    def usage = readJSON text: response
                    
                    // Track costs
                    sh """
                        curl -X POST ${env.COST_ENGINE_URL}/api/v1/events \
                          -H "X-API-Key: ${env.COST_ENGINE_API_KEY}" \
                          -d '{"provider":"openai","model":"gpt-4","usage":${usage}}'
                    """
                }
            }
        }
    }
}
```

---

## 🔌 SDK Examples

### TypeScript/JavaScript SDK
```typescript
import { CostEngine } from "@cost-engine/sdk";

const costEngine = new CostEngine({
  apiUrl: process.env.COST_ENGINE_URL!,
  apiKey: process.env.COST_ENGINE_API_KEY!,
});

// Track single event
await costEngine.trackEvent({
  source: {
    platform: "github",
    type: "github_action",
    workflow_id: "build-test",
  },
  provider: "openai",
  model: "gpt-4",
  usage: {
    input_tokens: 1000,
    output_tokens: 500,
  },
  project_id: "my-project",
});

// Query costs
const costs = await costEngine.getCosts({
  project_id: "my-project",
  start_date: "2026-01-01",
  end_date: "2026-12-31",
});

console.log(`Total: $${costs.total_cost.toFixed(2)}`);
```

### Python SDK
```python
from cost_engine import CostEngine

cost_engine = CostEngine(
    api_url=os.getenv("COST_ENGINE_URL"),
    api_key=os.getenv("COST_ENGINE_API_KEY")
)

# Track event
cost_engine.track_event(
    source={
        "platform": "github",
        "type": "github_action",
        "workflow_id": "build-test"
    },
    provider="openai",
    model="gpt-4",
    usage={
        "input_tokens": 1000,
        "output_tokens": 500
    },
    project_id="my-project"
)

# Query costs
costs = cost_engine.get_costs(
    project_id="my-project",
    start_date="2026-01-01",
    end_date="2026-12-31"
)

print(f"Total: ${costs['total_cost']:.2f}")
```

---

## 📚 Weitere Ressourcen

### Dokumentation
- [LangChain Docs](https://python.langchain.com/docs/)
- [LiteLLM Docs](https://docs.litellm.ai/)
- [Helicone Docs](https://docs.helicone.ai/)
- [Langfuse Docs](https://langfuse.com/docs)
- [OpenLLMetry Docs](https://www.traceloop.com/docs/openllmetry/introduction)

### Community
- [LangChain Discord](https://discord.gg/langchain)
- [OpenAI Community](https://community.openai.com/)
- [Anthropic Discord](https://discord.gg/anthropic)

### Tools & Utilities
- [Token Counter](https://platform.openai.com/tokenizer)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LLM Pricing Calculator](https://llmpricecheck.com/)

---

## 🎯 Best Practices für Integration

1. **Verwende Callbacks** - Automatisches Tracking ohne manuellen Code
2. **Batch Events** - Reduziere API-Calls zum Cost Engine
3. **Async Tracking** - Blockiere nicht den Hauptprozess
4. **Error Handling** - Tracking-Fehler sollten nicht die App crashen
5. **Metadata** - Füge Context hinzu (user_id, session_id, etc.)
6. **Regular Sync** - Synchronisiere mit anderen Tools (Helicone, Langfuse)
7. **Budget Alerts** - Setze Limits und Benachrichtigungen
8. **Cost Attribution** - Tracke Kosten pro Projekt/Kunde/Feature

---

**Letzte Aktualisierung:** 2026-08-09
