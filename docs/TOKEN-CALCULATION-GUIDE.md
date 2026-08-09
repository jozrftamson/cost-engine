# Token Calculation & Cost Optimization Guide

## 📊 Token Berechnung - Wie funktioniert es?

### Grundprinzip

Token sind die Grundeinheit für AI-Modell-Kosten. Jeder Provider berechnet unterschiedlich:

```
Kosten = (Input-Tokens × Input-Preis) + (Output-Tokens × Output-Preis) + (Cached-Tokens × Cache-Preis)
```

### Token-Preise (Stand 2026)

#### OpenAI GPT-4
```typescript
const GPT4_PRICING = {
  input: 30.00,   // $30 per 1M tokens
  output: 60.00,  // $60 per 1M tokens
  cached: 15.00,  // $15 per 1M tokens (50% discount)
};

// Beispiel: 1000 Input + 500 Output Tokens
const cost = (1000 * 30 / 1_000_000) + (500 * 60 / 1_000_000);
// = 0.03 + 0.03 = $0.06
```

#### Anthropic Claude 3
```typescript
const CLAUDE3_PRICING = {
  opus: {
    input: 15.00,   // $15 per 1M tokens
    output: 75.00,  // $75 per 1M tokens
  },
  sonnet: {
    input: 3.00,    // $3 per 1M tokens
    output: 15.00,  // $15 per 1M tokens
  },
  haiku: {
    input: 0.25,    // $0.25 per 1M tokens
    output: 1.25,   // $1.25 per 1M tokens
  },
};
```

#### Google Gemini
```typescript
const GEMINI_PRICING = {
  pro: {
    input: 7.00,    // $7 per 1M tokens
    output: 21.00,  // $21 per 1M tokens
    cached: 3.50,   // $3.50 per 1M tokens (50% discount)
  },
  flash: {
    input: 0.35,    // $0.35 per 1M tokens
    output: 1.05,   // $1.05 per 1M tokens
    cached: 0.175,  // $0.175 per 1M tokens
  },
};
```

---

## 💡 Token Calculation - Code Snippets

### 1. TypeScript/JavaScript Implementation

```typescript
interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cached_tokens?: number;
}

interface PricingConfig {
  input_price: number;  // Price per 1M tokens
  output_price: number;
  cached_price?: number;
}

interface CostResult {
  input_cost: number;
  output_cost: number;
  cached_cost: number;
  total_cost: number;
  currency: string;
  savings?: number;
}

function calculateCost(
  usage: TokenUsage,
  pricing: PricingConfig
): CostResult {
  const inputCost = (usage.input_tokens * pricing.input_price) / 1_000_000;
  const outputCost = (usage.output_tokens * pricing.output_price) / 1_000_000;
  const cachedCost = usage.cached_tokens && pricing.cached_price
    ? (usage.cached_tokens * pricing.cached_price) / 1_000_000
    : 0;

  const totalCost = inputCost + outputCost + cachedCost;

  // Calculate savings from caching
  let savings = 0;
  if (usage.cached_tokens && pricing.cached_price) {
    const uncachedCost = (usage.cached_tokens * pricing.input_price) / 1_000_000;
    savings = uncachedCost - cachedCost;
  }

  return {
    input_cost: inputCost,
    output_cost: outputCost,
    cached_cost: cachedCost,
    total_cost: totalCost,
    currency: 'USD',
    savings,
  };
}

// Beispiel-Verwendung
const usage: TokenUsage = {
  input_tokens: 1500,
  output_tokens: 750,
  cached_tokens: 200,
};

const gpt4Pricing: PricingConfig = {
  input_price: 30.00,
  output_price: 60.00,
  cached_price: 15.00,
};

const cost = calculateCost(usage, gpt4Pricing);
console.log(`Total Cost: $${cost.total_cost.toFixed(4)}`);
console.log(`Savings from Cache: $${cost.savings?.toFixed(4)}`);
```

### 2. Python Implementation

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class TokenUsage:
    input_tokens: int
    output_tokens: int
    cached_tokens: Optional[int] = 0

@dataclass
class PricingConfig:
    input_price: float  # Price per 1M tokens
    output_price: float
    cached_price: Optional[float] = None

@dataclass
class CostResult:
    input_cost: float
    output_cost: float
    cached_cost: float
    total_cost: float
    currency: str = "USD"
    savings: Optional[float] = None

def calculate_cost(usage: TokenUsage, pricing: PricingConfig) -> CostResult:
    """Calculate AI API costs based on token usage and pricing."""
    
    input_cost = (usage.input_tokens * pricing.input_price) / 1_000_000
    output_cost = (usage.output_tokens * pricing.output_price) / 1_000_000
    
    cached_cost = 0
    savings = None
    
    if usage.cached_tokens and pricing.cached_price:
        cached_cost = (usage.cached_tokens * pricing.cached_price) / 1_000_000
        uncached_cost = (usage.cached_tokens * pricing.input_price) / 1_000_000
        savings = uncached_cost - cached_cost
    
    total_cost = input_cost + output_cost + cached_cost
    
    return CostResult(
        input_cost=input_cost,
        output_cost=output_cost,
        cached_cost=cached_cost,
        total_cost=total_cost,
        savings=savings
    )

# Beispiel-Verwendung
usage = TokenUsage(
    input_tokens=1500,
    output_tokens=750,
    cached_tokens=200
)

gpt4_pricing = PricingConfig(
    input_price=30.00,
    output_price=60.00,
    cached_price=15.00
)

cost = calculate_cost(usage, gpt4_pricing)
print(f"Total Cost: ${cost.total_cost:.4f}")
print(f"Savings from Cache: ${cost.savings:.4f}")
```

---

## 📈 Token Visualization - Verschiedene Ansätze

### 1. Terminal/CLI Visualization (ASCII)

```typescript
function visualizeTokens(usage: TokenUsage): string {
  const total = usage.input_tokens + usage.output_tokens + (usage.cached_tokens || 0);
  
  const inputPercent = Math.round((usage.input_tokens / total) * 100);
  const outputPercent = Math.round((usage.output_tokens / total) * 100);
  const cachedPercent = Math.round(((usage.cached_tokens || 0) / total) * 100);
  
  const barLength = 50;
  const inputBar = '█'.repeat(Math.round(inputPercent * barLength / 100));
  const outputBar = '█'.repeat(Math.round(outputPercent * barLength / 100));
  const cachedBar = '█'.repeat(Math.round(cachedPercent * barLength / 100));
  
  return `
Token Distribution:
Input:  ${inputBar.padEnd(barLength, '░')} ${inputPercent}% (${usage.input_tokens.toLocaleString()})
Output: ${outputBar.padEnd(barLength, '░')} ${outputPercent}% (${usage.output_tokens.toLocaleString()})
Cached: ${cachedBar.padEnd(barLength, '░')} ${cachedPercent}% (${(usage.cached_tokens || 0).toLocaleString()})
Total:  ${total.toLocaleString()} tokens
  `.trim();
}

// Beispiel
console.log(visualizeTokens({
  input_tokens: 1500,
  output_tokens: 750,
  cached_tokens: 200,
}));
```

### 2. GitHub Actions Summary (Markdown)

```typescript
function generateGitHubSummary(usage: TokenUsage, cost: CostResult): string {
  return `
# 💰 AI Cost Report

## Token Usage
| Type | Tokens | Cost | Percentage |
|------|--------|------|------------|
| Input | ${usage.input_tokens.toLocaleString()} | $${cost.input_cost.toFixed(4)} | ${Math.round((usage.input_tokens / (usage.input_tokens + usage.output_tokens)) * 100)}% |
| Output | ${usage.output_tokens.toLocaleString()} | $${cost.output_cost.toFixed(4)} | ${Math.round((usage.output_tokens / (usage.input_tokens + usage.output_tokens)) * 100)}% |
| Cached | ${(usage.cached_tokens || 0).toLocaleString()} | $${cost.cached_cost.toFixed(4)} | - |
| **Total** | **${(usage.input_tokens + usage.output_tokens).toLocaleString()}** | **$${cost.total_cost.toFixed(4)}** | **100%** |

${cost.savings ? `## 💡 Cache Savings\nYou saved **$${cost.savings.toFixed(4)}** by using cached tokens!` : ''}

## Cost Breakdown
\`\`\`
Input:  ████████████████░░░░ ${usage.input_tokens} tokens ($${cost.input_cost.toFixed(4)})
Output: ████████░░░░░░░░░░░░ ${usage.output_tokens} tokens ($${cost.output_cost.toFixed(4)})
Cached: ██░░░░░░░░░░░░░░░░░░ ${usage.cached_tokens || 0} tokens ($${cost.cached_cost.toFixed(4)})
\`\`\`
  `.trim();
}
```

### 3. Web Dashboard (React Component)

```tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface TokenVisualizationProps {
  usage: TokenUsage;
  cost: CostResult;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export const TokenVisualization: React.FC<TokenVisualizationProps> = ({ usage, cost }) => {
  const pieData = [
    { name: 'Input', value: usage.input_tokens, cost: cost.input_cost },
    { name: 'Output', value: usage.output_tokens, cost: cost.output_cost },
    { name: 'Cached', value: usage.cached_tokens || 0, cost: cost.cached_cost },
  ];

  const barData = [
    { name: 'Input', tokens: usage.input_tokens, cost: cost.input_cost },
    { name: 'Output', tokens: usage.output_tokens, cost: cost.output_cost },
    { name: 'Cached', tokens: usage.cached_tokens || 0, cost: cost.cached_cost },
  ];

  return (
    <div className="token-visualization">
      <h2>Token Usage & Cost Analysis</h2>
      
      <div className="charts">
        <div className="pie-chart">
          <h3>Token Distribution</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bar-chart">
          <h3>Cost Breakdown</h3>
          <BarChart width={500} height={300} data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cost" fill="#8884d8" name="Cost ($)" />
          </BarChart>
        </div>
      </div>

      <div className="summary">
        <h3>Summary</h3>
        <p>Total Tokens: {(usage.input_tokens + usage.output_tokens).toLocaleString()}</p>
        <p>Total Cost: ${cost.total_cost.toFixed(4)}</p>
        {cost.savings && <p className="savings">💰 Savings: ${cost.savings.toFixed(4)}</p>}
      </div>
    </div>
  );
};
```

---

## 💰 Cost Optimization Strategies

### 1. Prompt Caching (50-90% Ersparnis)

```typescript
// ❌ Ohne Caching
const response1 = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: longSystemPrompt }, // Wird jedes Mal neu verarbeitet
    { role: "user", content: "Question 1" }
  ]
});

// ✅ Mit Caching (OpenAI)
const response2 = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { 
      role: "system", 
      content: longSystemPrompt,
      // Markiere für Caching
      cache_control: { type: "ephemeral" }
    },
    { role: "user", content: "Question 2" }
  ]
});

// Ersparnis: 50% auf System-Prompt Tokens bei wiederholten Anfragen
```

### 2. Model Selection (bis zu 95% Ersparnis)

```typescript
// Kosten-Vergleich für gleiche Aufgabe
const models = {
  'gpt-4': { input: 30, output: 60 },           // $0.090 für 1000 tokens
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 }, // $0.002 für 1000 tokens
  'claude-haiku': { input: 0.25, output: 1.25 },// $0.0015 für 1000 tokens
};

// Strategie: Verwende günstigere Modelle für einfache Aufgaben
async function smartModelSelection(task: string) {
  if (task.complexity === 'simple') {
    return 'gpt-3.5-turbo'; // 95% günstiger
  } else if (task.complexity === 'medium') {
    return 'claude-haiku';  // 98% günstiger
  } else {
    return 'gpt-4';         // Für komplexe Aufgaben
  }
}
```

### 3. Batch Processing (Reduziert API-Calls)

```typescript
// ❌ Einzelne Requests
for (const item of items) {
  await processWithAI(item); // 100 API calls
}

// ✅ Batch Processing
const batchSize = 10;
const batches = chunk(items, batchSize);

for (const batch of batches) {
  await processWithAI(batch.join('\n')); // 10 API calls
}

// Ersparnis: 90% weniger API-Overhead
```

### 4. Token Optimization

```typescript
// ❌ Verbose Prompt (1500 tokens)
const verbosePrompt = `
Please analyze the following text and provide a detailed summary...
[Long instructions with examples]
`;

// ✅ Optimized Prompt (500 tokens)
const optimizedPrompt = `
Summarize this text in 3 bullet points:
`;

// Ersparnis: 67% weniger Input-Tokens
```

---

## 🔗 Integration mit Open-Source Tools

### 1. LangChain Integration

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { CostEngine } from "@cost-engine/sdk";

const costEngine = new CostEngine({
  apiUrl: process.env.COST_ENGINE_URL,
  apiKey: process.env.COST_ENGINE_API_KEY,
});

const llm = new ChatOpenAI({
  modelName: "gpt-4",
  callbacks: [{
    handleLLMEnd: async (output) => {
      // Track costs automatically
      await costEngine.trackEvent({
        provider: "openai",
        model: "gpt-4",
        usage: {
          input_tokens: output.llmOutput?.tokenUsage?.promptTokens || 0,
          output_tokens: output.llmOutput?.tokenUsage?.completionTokens || 0,
        },
      });
    },
  }],
});
```

### 2. LiteLLM Integration

```python
from litellm import completion
from cost_engine import CostEngine

cost_engine = CostEngine(
    api_url=os.getenv("COST_ENGINE_URL"),
    api_key=os.getenv("COST_ENGINE_API_KEY")
)

response = completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)

# Track costs
cost_engine.track_event(
    provider="openai",
    model="gpt-4",
    usage={
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens
    }
)
```

### 3. Helicone Integration

```typescript
import { Helicone } from "@helicone/helicone";
import { CostEngine } from "@cost-engine/sdk";

// Helicone für Monitoring
const helicone = new Helicone({
  apiKey: process.env.HELICONE_API_KEY,
});

// Cost Engine für Aggregation
const costEngine = new CostEngine({
  apiUrl: process.env.COST_ENGINE_URL,
  apiKey: process.env.COST_ENGINE_API_KEY,
});

// Sync costs from Helicone to Cost Engine
await costEngine.syncFromHelicone(helicone);
```

---

## 📊 Real-World Beispiele

### Beispiel 1: GitHub Actions Workflow

```yaml
- name: AI Code Review
  run: |
    # Run AI code review
    RESPONSE=$(curl -X POST https://api.openai.com/v1/chat/completions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -d '{"model":"gpt-4","messages":[...]}')
    
    # Extract token usage
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

### Beispiel 2: Multi-Agent System

```typescript
// Orchestrate multiple AI agents with cost tracking
class MultiAgentOrchestrator {
  async runAgents(task: string) {
    const agents = [
      { name: 'researcher', model: 'gpt-4' },
      { name: 'writer', model: 'claude-3-opus' },
      { name: 'reviewer', model: 'gpt-3.5-turbo' },
    ];

    let totalCost = 0;

    for (const agent of agents) {
      const result = await this.runAgent(agent, task);
      
      const cost = await costEngine.trackEvent({
        provider: agent.model.includes('gpt') ? 'openai' : 'anthropic',
        model: agent.model,
        usage: result.usage,
        metadata: { agent: agent.name },
      });

      totalCost += cost.total_cost;
      
      console.log(`${agent.name}: $${cost.total_cost.toFixed(4)}`);
    }

    console.log(`Total Cost: $${totalCost.toFixed(4)}`);
  }
}
```

---

## 🎯 Best Practices

1. **Immer Token-Usage tracken** - Auch in Development
2. **Caching aktivieren** - Wo möglich (50-90% Ersparnis)
3. **Günstigere Modelle** - Für einfache Aufgaben
4. **Batch Processing** - Reduziert API-Overhead
5. **Prompt Optimization** - Kürzer = günstiger
6. **Budget Alerts** - Setze Limits
7. **Regular Audits** - Überprüfe monatlich
8. **A/B Testing** - Teste verschiedene Modelle

---

## 📚 Weitere Ressourcen

- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Google AI Pricing](https://ai.google.dev/pricing)
- [LangChain Cost Tracking](https://python.langchain.com/docs/guides/productionization/cost_tracking)
- [Helicone Docs](https://docs.helicone.ai/)
- [LiteLLM Docs](https://docs.litellm.ai/)
