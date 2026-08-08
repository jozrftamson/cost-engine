import { z } from 'zod';

// ============================================================================
// COST CATEGORIES
// ============================================================================

export const CostCategory = {
  AI_TOKEN: 'AI_TOKEN',
  AI_REQUEST: 'AI_REQUEST',
  API: 'API',
  AUTOMATION: 'AUTOMATION',
  COMPUTE: 'COMPUTE',
  STORAGE: 'STORAGE',
  DATABASE: 'DATABASE',
  NETWORK: 'NETWORK',
  KUBERNETES: 'KUBERNETES',
  GITHUB_ACTION: 'GITHUB_ACTION',
  APIFY: 'APIFY',
  OTHER: 'OTHER',
} as const;

export type CostCategory = typeof CostCategory[keyof typeof CostCategory];

// ============================================================================
// USER ROLES
// ============================================================================

export const UserRole = {
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  DEVELOPER: 'DEVELOPER',
  VIEWER: 'VIEWER',
  SERVICE: 'SERVICE',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// ============================================================================
// ALERT SEVERITY
// ============================================================================

export const AlertSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;

export type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];

// ============================================================================
// SOURCE INFORMATION
// ============================================================================

export interface SourceInfo {
  platform: string;        // github, n8n, apify, openai, etc.
  type: string;           // github_action, llm_call, automation_run, etc.
  external_id?: string;   // Provider's ID for this event
}

export const SourceInfoSchema = z.object({
  platform: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  external_id: z.string().max(255).optional(),
});

// ============================================================================
// USAGE DATA
// ============================================================================

export interface UsageData {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cached_tokens?: number | null;
  reasoning_tokens?: number | null;
  total_tokens?: number | null;
  requests?: number | null;
  runtime_seconds?: number | null;
}

export const UsageDataSchema = z.object({
  input_tokens: z.number().int().nonnegative().nullable().optional(),
  output_tokens: z.number().int().nonnegative().nullable().optional(),
  cached_tokens: z.number().int().nonnegative().nullable().optional(),
  reasoning_tokens: z.number().int().nonnegative().nullable().optional(),
  total_tokens: z.number().int().nonnegative().nullable().optional(),
  requests: z.number().int().nonnegative().nullable().optional(),
  runtime_seconds: z.number().nonnegative().nullable().optional(),
});

// ============================================================================
// INFRASTRUCTURE DATA
// ============================================================================

export interface InfrastructureData {
  cpu_seconds?: number | null;
  memory_gb_seconds?: number | null;
  gpu_seconds?: number | null;
  storage_gb?: number | null;
  network_gb?: number | null;
}

export const InfrastructureDataSchema = z.object({
  cpu_seconds: z.number().nonnegative().nullable().optional(),
  memory_gb_seconds: z.number().nonnegative().nullable().optional(),
  gpu_seconds: z.number().nonnegative().nullable().optional(),
  storage_gb: z.number().nonnegative().nullable().optional(),
  network_gb: z.number().nonnegative().nullable().optional(),
});

// ============================================================================
// COST BREAKDOWN
// ============================================================================

export interface CostBreakdown {
  input_cost?: number;
  output_cost?: number;
  cache_cost?: number;
  infrastructure_cost?: number;
}

export const CostBreakdownSchema = z.object({
  input_cost: z.number().nonnegative().optional(),
  output_cost: z.number().nonnegative().optional(),
  cache_cost: z.number().nonnegative().optional(),
  infrastructure_cost: z.number().nonnegative().optional(),
});

// ============================================================================
// COST INFORMATION
// ============================================================================

export interface CostInfo {
  amount: number;
  currency: string;
  category: CostCategory;
  breakdown?: CostBreakdown;
}

export const CostInfoSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  category: z.enum([
    'AI_TOKEN',
    'AI_REQUEST',
    'API',
    'AUTOMATION',
    'COMPUTE',
    'STORAGE',
    'DATABASE',
    'NETWORK',
    'KUBERNETES',
    'GITHUB_ACTION',
    'APIFY',
    'OTHER',
  ]),
  breakdown: CostBreakdownSchema.optional(),
});

// ============================================================================
// COST EVENT (Unified Model)
// ============================================================================

export interface CostEvent {
  id: string;
  organization_id: string;
  timestamp: string;
  idempotency_key: string;

  source: SourceInfo;

  project_id?: string;
  customer_id?: string;
  workflow_id?: string;
  agent_id?: string;

  provider?: string;
  model?: string;

  usage?: UsageData;
  infrastructure?: InfrastructureData;

  cost: CostInfo;

  metadata?: Record<string, unknown>;
}

export const CostEventSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  idempotency_key: z.string().min(1).max(500),

  source: SourceInfoSchema,

  project_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  workflow_id: z.string().uuid().optional(),
  agent_id: z.string().uuid().optional(),

  provider: z.string().max(100).optional(),
  model: z.string().max(255).optional(),

  usage: UsageDataSchema.optional(),
  infrastructure: InfrastructureDataSchema.optional(),

  cost: CostInfoSchema,

  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// CREATE COST EVENT (Input)
// ============================================================================

export interface CreateCostEventInput {
  organization_id: string;
  timestamp?: string; // Optional, defaults to now
  idempotency_key?: string; // Optional, can be auto-generated

  source: SourceInfo;

  project_id?: string;
  customer_id?: string;
  workflow_id?: string;
  agent_id?: string;

  provider?: string;
  model?: string;

  usage?: UsageData;
  infrastructure?: InfrastructureData;

  cost?: Partial<CostInfo>; // Can be calculated if not provided

  metadata?: Record<string, unknown>;
}

export const CreateCostEventInputSchema = z.object({
  organization_id: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
  idempotency_key: z.string().min(1).max(500).optional(),

  source: SourceInfoSchema,

  project_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  workflow_id: z.string().uuid().optional(),
  agent_id: z.string().uuid().optional(),

  provider: z.string().max(100).optional(),
  model: z.string().max(255).optional(),

  usage: UsageDataSchema.optional(),
  infrastructure: InfrastructureDataSchema.optional(),

  cost: CostInfoSchema.partial().optional(),

  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export interface PricingConfig {
  id: string;
  provider: string;
  model?: string;
  version: string;
  currency: string;
  effective_from: string;
  effective_until?: string | null;

  pricing: {
    input_per_1m_tokens?: number;
    output_per_1m_tokens?: number;
    cached_input_per_1m_tokens?: number;
    request_price?: number;
    runtime_per_second?: number;
  };

  metadata?: Record<string, unknown>;
}

export const PricingConfigSchema = z.object({
  id: z.string().uuid(),
  provider: z.string().min(1).max(100),
  model: z.string().max(255).optional(),
  version: z.string().min(1).max(50),
  currency: z.string().length(3),
  effective_from: z.string().datetime(),
  effective_until: z.string().datetime().nullable().optional(),

  pricing: z.object({
    input_per_1m_tokens: z.number().nonnegative().optional(),
    output_per_1m_tokens: z.number().nonnegative().optional(),
    cached_input_per_1m_tokens: z.number().nonnegative().optional(),
    request_price: z.number().nonnegative().optional(),
    runtime_per_second: z.number().nonnegative().optional(),
  }),

  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// COST CALCULATION RESULT
// ============================================================================

export interface CostCalculationResult {
  total_cost: number;
  currency: string;
  breakdown: CostBreakdown;
  pricing_version_id: string;
}

export const CostCalculationResultSchema = z.object({
  total_cost: z.number().nonnegative(),
  currency: z.string().length(3),
  breakdown: CostBreakdownSchema,
  pricing_version_id: z.string().uuid(),
});

// ============================================================================
// COST QUERY FILTERS
// ============================================================================

export interface CostQueryFilters {
  organization_id: string;
  project_id?: string;
  customer_id?: string;
  workflow_id?: string;
  provider?: string;
  model?: string;
  category?: CostCategory;
  from_date?: string;
  to_date?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export const CostQueryFiltersSchema = z.object({
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  workflow_id: z.string().uuid().optional(),
  provider: z.string().max(100).optional(),
  model: z.string().max(255).optional(),
  category: z.enum([
    'AI_TOKEN',
    'AI_REQUEST',
    'API',
    'AUTOMATION',
    'COMPUTE',
    'STORAGE',
    'DATABASE',
    'NETWORK',
    'KUBERNETES',
    'GITHUB_ACTION',
    'APIFY',
    'OTHER',
  ]).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
});

// ============================================================================
// COST SUMMARY
// ============================================================================

export interface CostSummary {
  total_cost: number;
  currency: string;
  breakdown_by_category: Record<CostCategory, number>;
  usage_summary?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    total_requests?: number;
  };
}

export const CostSummarySchema = z.object({
  total_cost: z.number().nonnegative(),
  currency: z.string().length(3),
  breakdown_by_category: z.record(z.number().nonnegative()),
  usage_summary: z.object({
    total_input_tokens: z.number().int().nonnegative().optional(),
    total_output_tokens: z.number().int().nonnegative().optional(),
    total_requests: z.number().int().nonnegative().optional(),
  }).optional(),
});

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export interface Provider {
  id: string;
  name: string;
  display_name: string;
  type: 'ai' | 'automation' | 'infrastructure';
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export const ProviderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  display_name: z.string().min(1).max(255),
  type: z.enum(['ai', 'automation', 'infrastructure']),
  is_active: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// MODEL TYPES
// ============================================================================

export interface Model {
  id: string;
  provider_id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export const ModelSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  display_name: z.string().min(1).max(255),
  is_active: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: string;
  organization_id: string;
  customer_id?: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  customer_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  is_active: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface Customer {
  id: string;
  organization_id: string;
  external_id?: string;
  name: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  external_id: z.string().max(255).optional(),
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// BUDGET TYPES
// ============================================================================

export interface Budget {
  id: string;
  organization_id: string;
  project_id?: string;
  customer_id?: string;
  workflow_id?: string;
  name: string;
  period: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currency: string;
  is_active: boolean;
}

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  workflow_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  period: z.enum(['daily', 'weekly', 'monthly']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  is_active: z.boolean(),
});

// ============================================================================
// ALERT TYPES
// ============================================================================

export interface Alert {
  id: string;
  organization_id: string;
  budget_id?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export const AlertSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  budget_id: z.string().uuid().optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  is_resolved: z.boolean(),
  resolved_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
});
