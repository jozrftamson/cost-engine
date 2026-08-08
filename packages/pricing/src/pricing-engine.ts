import {
  PricingEngine,
  PricingLookupRequest,
  PricingConfig,
  UsageData,
  CostCalculationResult,
  CostBreakdown,
} from '@cost-engine/core';

/**
 * Default Pricing Engine Implementation
 * 
 * Manages pricing versions and calculates costs based on usage data.
 * Pricing is versioned to ensure historical accuracy.
 */
export class DefaultPricingEngine implements PricingEngine {
  private pricingCache: Map<string, PricingConfig[]> = new Map();

  constructor(
    private readonly pricingRepository: PricingRepository
  ) {}

  /**
   * Get pricing configuration for a specific provider/model at a given time
   */
  async getPricing(request: PricingLookupRequest): Promise<PricingConfig | null> {
    const { provider, model, timestamp } = request;
    const cacheKey = `${provider}:${model || 'default'}`;

    // Try cache first
    let pricingVersions = this.pricingCache.get(cacheKey);

    if (!pricingVersions) {
      // Load from repository
      pricingVersions = await this.pricingRepository.findByProvider(provider, model);
      this.pricingCache.set(cacheKey, pricingVersions);
    }

    // Find the pricing version that was effective at the given timestamp
    const requestDate = new Date(timestamp);

    for (const pricing of pricingVersions) {
      const effectiveFrom = new Date(pricing.effective_from);
      const effectiveUntil = pricing.effective_until
        ? new Date(pricing.effective_until)
        : null;

      if (effectiveFrom <= requestDate) {
        if (!effectiveUntil || requestDate < effectiveUntil) {
          return pricing;
        }
      }
    }

    return null;
  }

  /**
   * Add or update pricing configuration
   */
  async upsertPricing(pricing: Omit<PricingConfig, 'id'>): Promise<PricingConfig> {
    const created = await this.pricingRepository.upsert(pricing);

    // Invalidate cache for this provider/model
    const cacheKey = `${pricing.provider}:${pricing.model || 'default'}`;
    this.pricingCache.delete(cacheKey);

    return created;
  }

  /**
   * Calculate cost for given usage and pricing
   */
  async calculateCost(
    usage: UsageData,
    pricing: PricingConfig
  ): Promise<CostCalculationResult> {
    const breakdown: CostBreakdown = {};
    let totalCost = 0;

    // Calculate input token cost
    if (usage.input_tokens && pricing.pricing.input_per_1m_tokens) {
      const inputCost = (usage.input_tokens / 1_000_000) * pricing.pricing.input_per_1m_tokens;
      breakdown.input_cost = inputCost;
      totalCost += inputCost;
    }

    // Calculate output token cost
    if (usage.output_tokens && pricing.pricing.output_per_1m_tokens) {
      const outputCost = (usage.output_tokens / 1_000_000) * pricing.pricing.output_per_1m_tokens;
      breakdown.output_cost = outputCost;
      totalCost += outputCost;
    }

    // Calculate cached token cost
    if (usage.cached_tokens && pricing.pricing.cached_input_per_1m_tokens) {
      const cacheCost = (usage.cached_tokens / 1_000_000) * pricing.pricing.cached_input_per_1m_tokens;
      breakdown.cache_cost = cacheCost;
      totalCost += cacheCost;
    }

    // Calculate request cost
    if (usage.requests && pricing.pricing.request_price) {
      const requestCost = usage.requests * pricing.pricing.request_price;
      totalCost += requestCost;
    }

    // Calculate runtime cost
    if (usage.runtime_seconds && pricing.pricing.runtime_per_second) {
      const runtimeCost = usage.runtime_seconds * pricing.pricing.runtime_per_second;
      breakdown.infrastructure_cost = runtimeCost;
      totalCost += runtimeCost;
    }

    return {
      total_cost: totalCost,
      currency: pricing.currency,
      breakdown,
      pricing_version_id: pricing.id,
    };
  }

  /**
   * Get all active pricing versions for a provider
   */
  async getActivePricingVersions(provider: string): Promise<PricingConfig[]> {
    return this.pricingRepository.findActiveByProvider(provider);
  }

  /**
   * Clear pricing cache
   */
  clearCache(): void {
    this.pricingCache.clear();
  }
}

/**
 * Pricing Repository Interface
 * 
 * Abstracts database operations for pricing data
 */
export interface PricingRepository {
  /**
   * Find pricing versions by provider and optional model
   */
  findByProvider(provider: string, model?: string): Promise<PricingConfig[]>;

  /**
   * Find active pricing versions by provider
   */
  findActiveByProvider(provider: string): Promise<PricingConfig[]>;

  /**
   * Upsert pricing configuration
   */
  upsert(pricing: Omit<PricingConfig, 'id'>): Promise<PricingConfig>;

  /**
   * Find pricing by ID
   */
  findById(id: string): Promise<PricingConfig | null>;
}

/**
 * In-Memory Pricing Repository (for testing)
 */
export class InMemoryPricingRepository implements PricingRepository {
  private pricings: Map<string, PricingConfig> = new Map();

  async findByProvider(provider: string, model?: string): Promise<PricingConfig[]> {
    const results: PricingConfig[] = [];

    for (const pricing of this.pricings.values()) {
      if (pricing.provider === provider) {
        if (!model || pricing.model === model) {
          results.push(pricing);
        }
      }
    }

    // Sort by effective_from descending (newest first)
    return results.sort((a, b) => {
      return new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime();
    });
  }

  async findActiveByProvider(provider: string): Promise<PricingConfig[]> {
    const now = new Date();
    const results: PricingConfig[] = [];

    for (const pricing of this.pricings.values()) {
      if (pricing.provider === provider) {
        const effectiveFrom = new Date(pricing.effective_from);
        const effectiveUntil = pricing.effective_until
          ? new Date(pricing.effective_until)
          : null;

        if (effectiveFrom <= now && (!effectiveUntil || now < effectiveUntil)) {
          results.push(pricing);
        }
      }
    }

    return results;
  }

  async upsert(pricing: Omit<PricingConfig, 'id'>): Promise<PricingConfig> {
    const id = this.generateId();
    const newPricing: PricingConfig = { ...pricing, id };
    this.pricings.set(id, newPricing);
    return newPricing;
  }

  async findById(id: string): Promise<PricingConfig | null> {
    return this.pricings.get(id) || null;
  }

  private generateId(): string {
    return `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Utility function to create default pricing for common providers
 */
export function createDefaultPricing(): Omit<PricingConfig, 'id'>[] {
  const now = new Date().toISOString();

  return [
    // OpenAI GPT-4
    {
      provider: 'openai',
      model: 'gpt-4',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 30.0,
        output_per_1m_tokens: 60.0,
      },
    },
    // OpenAI GPT-4 Turbo
    {
      provider: 'openai',
      model: 'gpt-4-turbo',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 10.0,
        output_per_1m_tokens: 30.0,
      },
    },
    // OpenAI GPT-3.5 Turbo
    {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 0.5,
        output_per_1m_tokens: 1.5,
      },
    },
    // Anthropic Claude 3 Opus
    {
      provider: 'anthropic',
      model: 'claude-3-opus',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 15.0,
        output_per_1m_tokens: 75.0,
      },
    },
    // Anthropic Claude 3 Sonnet
    {
      provider: 'anthropic',
      model: 'claude-3-sonnet',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 3.0,
        output_per_1m_tokens: 15.0,
      },
    },
    // Anthropic Claude 3 Haiku
    {
      provider: 'anthropic',
      model: 'claude-3-haiku',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 0.25,
        output_per_1m_tokens: 1.25,
      },
    },
    // Google Gemini Pro
    {
      provider: 'google',
      model: 'gemini-pro',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 0.5,
        output_per_1m_tokens: 1.5,
      },
    },
    // Google Gemini Ultra
    {
      provider: 'google',
      model: 'gemini-ultra',
      version: '2026-08',
      currency: 'USD',
      effective_from: now,
      pricing: {
        input_per_1m_tokens: 10.0,
        output_per_1m_tokens: 30.0,
      },
    },
  ];
}
