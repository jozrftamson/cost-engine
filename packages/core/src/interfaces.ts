import {
  UsageData,
  InfrastructureData,
  CostCalculationResult,
  PricingConfig,
  CostEvent,
  CreateCostEventInput,
} from './types';

// ============================================================================
// PROVIDER ADAPTER INTERFACE
// ============================================================================

/**
 * Request for collecting usage data from a provider
 */
export interface UsageRequest {
  provider: string;
  model?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
}

/**
 * Result of usage collection
 */
export interface UsageCollectionResult {
  usage?: UsageData;
  infrastructure?: InfrastructureData;
  provider: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Provider Adapter Interface
 * 
 * Each provider (OpenAI, Anthropic, etc.) implements this interface
 * to provide a consistent way to collect usage and calculate costs.
 */
export interface CostProviderAdapter {
  /**
   * Get the provider name (e.g., "openai", "anthropic")
   */
  getProviderName(): string;

  /**
   * Get the provider display name (e.g., "OpenAI", "Anthropic")
   */
  getProviderDisplayName(): string;

  /**
   * Collect usage data from the provider
   * 
   * @param input - Usage request with context
   * @returns Usage data collected from the provider
   */
  collectUsage(input: UsageRequest): Promise<UsageCollectionResult>;

  /**
   * Calculate cost based on usage and pricing
   * 
   * @param usage - Usage data
   * @param pricing - Pricing configuration
   * @returns Calculated cost with breakdown
   */
  calculateCost(
    usage: UsageData,
    pricing: PricingConfig
  ): Promise<CostCalculationResult>;

  /**
   * Validate provider-specific configuration
   * 
   * @param config - Configuration to validate
   * @returns true if valid, false otherwise
   */
  validateConfig(config: unknown): boolean;

  /**
   * Get supported models for this provider
   * 
   * @returns Array of model names
   */
  getSupportedModels(): string[];
}

// ============================================================================
// PRICING ENGINE INTERFACE
// ============================================================================

/**
 * Request for pricing lookup
 */
export interface PricingLookupRequest {
  provider: string;
  model?: string;
  timestamp: string; // ISO 8601 datetime
}

/**
 * Pricing Engine Interface
 * 
 * Responsible for managing pricing versions and calculating costs
 */
export interface PricingEngine {
  /**
   * Get pricing configuration for a specific provider/model at a given time
   * 
   * @param request - Pricing lookup request
   * @returns Pricing configuration or null if not found
   */
  getPricing(request: PricingLookupRequest): Promise<PricingConfig | null>;

  /**
   * Add or update pricing configuration
   * 
   * @param pricing - Pricing configuration to add/update
   * @returns Created/updated pricing configuration
   */
  upsertPricing(pricing: Omit<PricingConfig, 'id'>): Promise<PricingConfig>;

  /**
   * Calculate cost for a given usage and pricing
   * 
   * @param usage - Usage data
   * @param pricing - Pricing configuration
   * @returns Cost calculation result
   */
  calculateCost(
    usage: UsageData,
    pricing: PricingConfig
  ): Promise<CostCalculationResult>;

  /**
   * Get all active pricing versions for a provider
   * 
   * @param provider - Provider name
   * @returns Array of pricing configurations
   */
  getActivePricingVersions(provider: string): Promise<PricingConfig[]>;
}

// ============================================================================
// COST EVENT SERVICE INTERFACE
// ============================================================================

/**
 * Cost Event Service Interface
 * 
 * Responsible for ingesting, storing, and querying cost events
 */
export interface CostEventService {
  /**
   * Create a new cost event
   * 
   * @param input - Cost event input
   * @returns Created cost event
   */
  createEvent(input: CreateCostEventInput): Promise<CostEvent>;

  /**
   * Create multiple cost events in batch
   * 
   * @param inputs - Array of cost event inputs
   * @returns Array of created cost events
   */
  createEventsBatch(inputs: CreateCostEventInput[]): Promise<CostEvent[]>;

  /**
   * Get a cost event by ID
   * 
   * @param id - Event ID
   * @param organizationId - Organization ID for security
   * @returns Cost event or null if not found
   */
  getEventById(id: string, organizationId: string): Promise<CostEvent | null>;

  /**
   * Query cost events with filters
   * 
   * @param filters - Query filters
   * @returns Array of cost events
   */
  queryEvents(filters: Record<string, unknown>): Promise<CostEvent[]>;
}

// ============================================================================
// COST AGGREGATION SERVICE INTERFACE
// ============================================================================

/**
 * Aggregation period
 */
export type AggregationPeriod = 'day' | 'week' | 'month' | 'year';

/**
 * Aggregation request
 */
export interface AggregationRequest {
  organization_id: string;
  project_id?: string;
  customer_id?: string;
  provider?: string;
  period: AggregationPeriod;
  from_date: string;
  to_date: string;
}

/**
 * Aggregation result
 */
export interface AggregationResult {
  period: AggregationPeriod;
  from_date: string;
  to_date: string;
  total_cost: number;
  currency: string;
  breakdown_by_category: Record<string, number>;
  breakdown_by_provider?: Record<string, number>;
  usage_summary?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    total_requests?: number;
  };
}

/**
 * Cost Aggregation Service Interface
 * 
 * Responsible for aggregating cost data for reporting
 */
export interface CostAggregationService {
  /**
   * Aggregate costs for a given period
   * 
   * @param request - Aggregation request
   * @returns Aggregation result
   */
  aggregateCosts(request: AggregationRequest): Promise<AggregationResult>;

  /**
   * Update daily cost aggregations
   * 
   * @param date - Date to aggregate (ISO 8601)
   * @param organizationId - Organization ID
   */
  updateDailyAggregations(date: string, organizationId: string): Promise<void>;

  /**
   * Update monthly cost aggregations
   * 
   * @param year - Year
   * @param month - Month (1-12)
   * @param organizationId - Organization ID
   */
  updateMonthlyAggregations(
    year: number,
    month: number,
    organizationId: string
  ): Promise<void>;
}

// ============================================================================
// IDEMPOTENCY SERVICE INTERFACE
// ============================================================================

/**
 * Idempotency Service Interface
 * 
 * Ensures events are not processed multiple times
 */
export interface IdempotencyService {
  /**
   * Generate an idempotency key
   * 
   * @param source - Source information
   * @returns Idempotency key
   */
  generateKey(source: {
    platform: string;
    type: string;
    external_id?: string;
  }): string;

  /**
   * Check if an event with this key already exists
   * 
   * @param organizationId - Organization ID
   * @param key - Idempotency key
   * @returns true if exists, false otherwise
   */
  exists(organizationId: string, key: string): Promise<boolean>;

  /**
   * Get existing event by idempotency key
   * 
   * @param organizationId - Organization ID
   * @param key - Idempotency key
   * @returns Cost event or null if not found
   */
  getByKey(organizationId: string, key: string): Promise<CostEvent | null>;
}

// ============================================================================
// AUTHENTICATION SERVICE INTERFACE
// ============================================================================

/**
 * Authentication context
 */
export interface AuthContext {
  organization_id: string;
  user_id?: string;
  role: string;
  api_key_id?: string;
}

/**
 * Authentication Service Interface
 */
export interface AuthenticationService {
  /**
   * Verify API key and return auth context
   * 
   * @param apiKey - API key to verify
   * @returns Auth context or null if invalid
   */
  verifyApiKey(apiKey: string): Promise<AuthContext | null>;

  /**
   * Verify JWT token and return auth context
   * 
   * @param token - JWT token to verify
   * @returns Auth context or null if invalid
   */
  verifyToken(token: string): Promise<AuthContext | null>;

  /**
   * Create a new API key
   * 
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param name - API key name
   * @param role - Role for the API key
   * @returns API key (plain text, only returned once)
   */
  createApiKey(
    organizationId: string,
    userId: string,
    name: string,
    role: string
  ): Promise<{ id: string; key: string }>;

  /**
   * Revoke an API key
   * 
   * @param apiKeyId - API key ID
   * @param organizationId - Organization ID
   */
  revokeApiKey(apiKeyId: string, organizationId: string): Promise<void>;
}

// ============================================================================
// BUDGET SERVICE INTERFACE
// ============================================================================

/**
 * Budget check result
 */
export interface BudgetCheckResult {
  budget_id: string;
  budget_amount: number;
  current_spend: number;
  remaining: number;
  percentage_used: number;
  is_exceeded: boolean;
  is_warning: boolean; // e.g., > 80%
}

/**
 * Budget Service Interface
 */
export interface BudgetService {
  /**
   * Check budget status for a project/customer/workflow
   * 
   * @param organizationId - Organization ID
   * @param entityId - Project/Customer/Workflow ID
   * @param entityType - Type of entity
   * @returns Budget check result or null if no budget
   */
  checkBudget(
    organizationId: string,
    entityId: string,
    entityType: 'project' | 'customer' | 'workflow'
  ): Promise<BudgetCheckResult | null>;

  /**
   * Create an alert if budget threshold is exceeded
   * 
   * @param budgetCheck - Budget check result
   */
  createAlertIfNeeded(budgetCheck: BudgetCheckResult): Promise<void>;
}

// ============================================================================
// WEBHOOK SERVICE INTERFACE
// ============================================================================

/**
 * Webhook payload
 */
export interface WebhookPayload {
  event_type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Webhook Service Interface
 */
export interface WebhookService {
  /**
   * Process incoming webhook
   * 
   * @param payload - Webhook payload
   * @param organizationId - Organization ID
   * @returns Created cost event
   */
  processWebhook(
    payload: WebhookPayload,
    organizationId: string
  ): Promise<CostEvent>;

  /**
   * Validate webhook signature
   * 
   * @param payload - Webhook payload
   * @param signature - Signature to verify
   * @param secret - Webhook secret
   * @returns true if valid, false otherwise
   */
  validateSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean;
}

// ============================================================================
// REPORTING SERVICE INTERFACE
// ============================================================================

/**
 * Report type
 */
export type ReportType = 'project' | 'customer' | 'provider' | 'model' | 'workflow';

/**
 * Report request
 */
export interface ReportRequest {
  organization_id: string;
  report_type: ReportType;
  entity_id?: string;
  from_date: string;
  to_date: string;
  group_by?: string[];
}

/**
 * Report result
 */
export interface ReportResult {
  report_type: ReportType;
  from_date: string;
  to_date: string;
  total_cost: number;
  currency: string;
  data: Record<string, unknown>[];
}

/**
 * Reporting Service Interface
 */
export interface ReportingService {
  /**
   * Generate a cost report
   * 
   * @param request - Report request
   * @returns Report result
   */
  generateReport(request: ReportRequest): Promise<ReportResult>;

  /**
   * Export report to CSV
   * 
   * @param report - Report result
   * @returns CSV string
   */
  exportToCsv(report: ReportResult): string;

  /**
   * Export report to JSON
   * 
   * @param report - Report result
   * @returns JSON string
   */
  exportToJson(report: ReportResult): string;
}
