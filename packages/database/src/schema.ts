import { pgTable, uuid, varchar, timestamp, jsonb, numeric, index, uniqueIndex, text, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'FINANCE', 'DEVELOPER', 'VIEWER', 'SERVICE']);

export const costCategoryEnum = pgEnum('cost_category', [
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
  'OTHER'
]);

export const alertSeverityEnum = pgEnum('alert_severity', ['INFO', 'WARNING', 'CRITICAL']);

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  slugIdx: uniqueIndex('organizations_slug_idx').on(table.slug),
}));

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: userRoleEnum('role').notNull().default('VIEWER'),
  passwordHash: varchar('password_hash', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgEmailIdx: uniqueIndex('users_org_email_idx').on(table.organizationId, table.email),
  orgIdx: index('users_org_idx').on(table.organizationId),
}));

// ============================================================================
// API KEYS
// ============================================================================

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('SERVICE'),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('api_keys_org_idx').on(table.organizationId),
  keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
}));

// ============================================================================
// CUSTOMERS
// ============================================================================

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  externalId: varchar('external_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('customers_org_idx').on(table.organizationId),
  orgExternalIdIdx: uniqueIndex('customers_org_external_id_idx').on(table.organizationId, table.externalId),
}));

// ============================================================================
// PROJECTS
// ============================================================================

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('projects_org_idx').on(table.organizationId),
  customerIdx: index('projects_customer_idx').on(table.customerId),
  orgSlugIdx: uniqueIndex('projects_org_slug_idx').on(table.organizationId, table.slug),
}));

// ============================================================================
// WORKFLOWS
// ============================================================================

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 100 }).notNull(), // github, n8n, apify, etc.
  externalId: varchar('external_id', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('workflows_org_idx').on(table.organizationId),
  projectIdx: index('workflows_project_idx').on(table.projectId),
  platformIdx: index('workflows_platform_idx').on(table.platform),
}));

// ============================================================================
// AGENTS
// ============================================================================

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }), // rag, assistant, custom, etc.
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('agents_org_idx').on(table.organizationId),
  projectIdx: index('agents_project_idx').on(table.projectId),
}));

// ============================================================================
// PROVIDERS
// ============================================================================

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // ai, automation, infrastructure
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  nameIdx: uniqueIndex('providers_name_idx').on(table.name),
}));

// ============================================================================
// MODELS
// ============================================================================

export const models = pgTable('models', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  providerIdx: index('models_provider_idx').on(table.providerId),
  providerNameIdx: uniqueIndex('models_provider_name_idx').on(table.providerId, table.name),
}));

// ============================================================================
// PRICING VERSIONS
// ============================================================================

export const pricingVersions = pgTable('pricing_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  modelId: uuid('model_id').references(() => models.id, { onDelete: 'cascade' }),
  version: varchar('version', { length: 50 }).notNull(), // e.g., "2026-08"
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveUntil: timestamp('effective_until'),
  
  // Pricing details (stored as numeric for precision)
  inputPer1mTokens: numeric('input_per_1m_tokens', { precision: 20, scale: 10 }),
  outputPer1mTokens: numeric('output_per_1m_tokens', { precision: 20, scale: 10 }),
  cachedInputPer1mTokens: numeric('cached_input_per_1m_tokens', { precision: 20, scale: 10 }),
  requestPrice: numeric('request_price', { precision: 20, scale: 10 }),
  runtimePerSecond: numeric('runtime_per_second', { precision: 20, scale: 10 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  providerIdx: index('pricing_versions_provider_idx').on(table.providerId),
  modelIdx: index('pricing_versions_model_idx').on(table.modelId),
  effectiveFromIdx: index('pricing_versions_effective_from_idx').on(table.effectiveFrom),
  providerModelVersionIdx: uniqueIndex('pricing_versions_provider_model_version_idx')
    .on(table.providerId, table.modelId, table.version),
}));

// ============================================================================
// COST EVENTS
// ============================================================================

export const costEvents = pgTable('cost_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  idempotencyKey: varchar('idempotency_key', { length: 500 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  
  // Source information
  sourcePlatform: varchar('source_platform', { length: 100 }).notNull(),
  sourceType: varchar('source_type', { length: 100 }).notNull(),
  sourceExternalId: varchar('source_external_id', { length: 255 }),
  
  // Relationships
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  workflowId: uuid('workflow_id').references(() => workflows.id, { onDelete: 'set null' }),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  
  // Provider information
  providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'set null' }),
  modelId: uuid('model_id').references(() => models.id, { onDelete: 'set null' }),
  pricingVersionId: uuid('pricing_version_id').references(() => pricingVersions.id, { onDelete: 'set null' }),
  
  // Usage data (nullable - not all events have all fields)
  inputTokens: numeric('input_tokens', { precision: 20, scale: 0 }),
  outputTokens: numeric('output_tokens', { precision: 20, scale: 0 }),
  cachedTokens: numeric('cached_tokens', { precision: 20, scale: 0 }),
  reasoningTokens: numeric('reasoning_tokens', { precision: 20, scale: 0 }),
  totalTokens: numeric('total_tokens', { precision: 20, scale: 0 }),
  requests: numeric('requests', { precision: 20, scale: 0 }),
  runtimeSeconds: numeric('runtime_seconds', { precision: 20, scale: 2 }),
  
  // Infrastructure usage (nullable)
  cpuSeconds: numeric('cpu_seconds', { precision: 20, scale: 2 }),
  memoryGbSeconds: numeric('memory_gb_seconds', { precision: 20, scale: 4 }),
  gpuSeconds: numeric('gpu_seconds', { precision: 20, scale: 2 }),
  storageGb: numeric('storage_gb', { precision: 20, scale: 4 }),
  networkGb: numeric('network_gb', { precision: 20, scale: 4 }),
  
  // Cost information
  costAmount: numeric('cost_amount', { precision: 20, scale: 10 }).notNull(),
  costCurrency: varchar('cost_currency', { length: 3 }).notNull().default('USD'),
  costCategory: costCategoryEnum('cost_category').notNull(),
  
  // Cost breakdown (optional)
  inputCost: numeric('input_cost', { precision: 20, scale: 10 }),
  outputCost: numeric('output_cost', { precision: 20, scale: 10 }),
  cacheCost: numeric('cache_cost', { precision: 20, scale: 10 }),
  infrastructureCost: numeric('infrastructure_cost', { precision: 20, scale: 10 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('cost_events_org_idx').on(table.organizationId),
  timestampIdx: index('cost_events_timestamp_idx').on(table.timestamp),
  projectIdx: index('cost_events_project_idx').on(table.projectId),
  customerIdx: index('cost_events_customer_idx').on(table.customerId),
  workflowIdx: index('cost_events_workflow_idx').on(table.workflowId),
  providerIdx: index('cost_events_provider_idx').on(table.providerId),
  modelIdx: index('cost_events_model_idx').on(table.modelId),
  categoryIdx: index('cost_events_category_idx').on(table.costCategory),
  sourcePlatformIdx: index('cost_events_source_platform_idx').on(table.sourcePlatform),
  orgIdempotencyIdx: uniqueIndex('cost_events_org_idempotency_idx')
    .on(table.organizationId, table.idempotencyKey),
  // Composite indexes for common queries
  orgProjectTimestampIdx: index('cost_events_org_project_timestamp_idx')
    .on(table.organizationId, table.projectId, table.timestamp),
  orgCustomerTimestampIdx: index('cost_events_org_customer_timestamp_idx')
    .on(table.organizationId, table.customerId, table.timestamp),
}));

// ============================================================================
// GITHUB REPOSITORIES
// ============================================================================

export const githubRepositories = pgTable('github_repositories', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  owner: varchar('owner', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 512 }).notNull(),
  externalId: varchar('external_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('github_repositories_org_idx').on(table.organizationId),
  projectIdx: index('github_repositories_project_idx').on(table.projectId),
  orgFullNameIdx: uniqueIndex('github_repositories_org_full_name_idx')
    .on(table.organizationId, table.fullName),
}));

// ============================================================================
// GITHUB WORKFLOWS
// ============================================================================

export const githubWorkflows = pgTable('github_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  repositoryId: uuid('repository_id').notNull().references(() => githubRepositories.id, { onDelete: 'cascade' }),
  workflowId: uuid('workflow_id').references(() => workflows.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  path: varchar('path', { length: 512 }).notNull(),
  externalId: varchar('external_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('github_workflows_org_idx').on(table.organizationId),
  repoIdx: index('github_workflows_repo_idx').on(table.repositoryId),
  workflowIdx: index('github_workflows_workflow_idx').on(table.workflowId),
}));

// ============================================================================
// GITHUB WORKFLOW RUNS
// ============================================================================

export const githubWorkflowRuns = pgTable('github_workflow_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  githubWorkflowId: uuid('github_workflow_id').notNull().references(() => githubWorkflows.id, { onDelete: 'cascade' }),
  runNumber: numeric('run_number', { precision: 20, scale: 0 }).notNull(),
  externalId: varchar('external_id', { length: 255 }).notNull(),
  commitSha: varchar('commit_sha', { length: 40 }),
  branch: varchar('branch', { length: 255 }),
  status: varchar('status', { length: 50 }),
  conclusion: varchar('conclusion', { length: 50 }),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  runtimeSeconds: numeric('runtime_seconds', { precision: 20, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('github_workflow_runs_org_idx').on(table.organizationId),
  workflowIdx: index('github_workflow_runs_workflow_idx').on(table.githubWorkflowId),
  orgExternalIdIdx: uniqueIndex('github_workflow_runs_org_external_id_idx')
    .on(table.organizationId, table.externalId),
}));

// ============================================================================
// BUDGETS
// ============================================================================

export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  workflowId: uuid('workflow_id').references(() => workflows.id, { onDelete: 'cascade' }),
  
  name: varchar('name', { length: 255 }).notNull(),
  period: varchar('period', { length: 50 }).notNull(), // daily, weekly, monthly
  amount: numeric('amount', { precision: 20, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('budgets_org_idx').on(table.organizationId),
  projectIdx: index('budgets_project_idx').on(table.projectId),
  customerIdx: index('budgets_customer_idx').on(table.customerId),
}));

// ============================================================================
// ALERTS
// ============================================================================

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  budgetId: uuid('budget_id').references(() => budgets.id, { onDelete: 'cascade' }),
  
  severity: alertSeverityEnum('severity').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  isResolved: boolean('is_resolved').notNull().default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  orgIdx: index('alerts_org_idx').on(table.organizationId),
  budgetIdx: index('alerts_budget_idx').on(table.budgetId),
  severityIdx: index('alerts_severity_idx').on(table.severity),
  createdAtIdx: index('alerts_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// DAILY COST AGGREGATIONS
// ============================================================================

export const dailyCosts = pgTable('daily_costs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'cascade' }),
  
  totalCost: numeric('total_cost', { precision: 20, scale: 10 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  
  inputTokens: numeric('input_tokens', { precision: 20, scale: 0 }),
  outputTokens: numeric('output_tokens', { precision: 20, scale: 0 }),
  totalTokens: numeric('total_tokens', { precision: 20, scale: 0 }),
  requests: numeric('requests', { precision: 20, scale: 0 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('daily_costs_org_idx').on(table.organizationId),
  dateIdx: index('daily_costs_date_idx').on(table.date),
  projectIdx: index('daily_costs_project_idx').on(table.projectId),
  customerIdx: index('daily_costs_customer_idx').on(table.customerId),
  providerIdx: index('daily_costs_provider_idx').on(table.providerId),
  orgDateProjectIdx: uniqueIndex('daily_costs_org_date_project_idx')
    .on(table.organizationId, table.date, table.projectId, table.providerId),
}));

// ============================================================================
// MONTHLY COST AGGREGATIONS
// ============================================================================

export const monthlyCosts = pgTable('monthly_costs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  year: numeric('year', { precision: 4, scale: 0 }).notNull(),
  month: numeric('month', { precision: 2, scale: 0 }).notNull(),
  
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'cascade' }),
  
  totalCost: numeric('total_cost', { precision: 20, scale: 10 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  
  inputTokens: numeric('input_tokens', { precision: 20, scale: 0 }),
  outputTokens: numeric('output_tokens', { precision: 20, scale: 0 }),
  totalTokens: numeric('total_tokens', { precision: 20, scale: 0 }),
  requests: numeric('requests', { precision: 20, scale: 0 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('monthly_costs_org_idx').on(table.organizationId),
  yearMonthIdx: index('monthly_costs_year_month_idx').on(table.year, table.month),
  projectIdx: index('monthly_costs_project_idx').on(table.projectId),
  customerIdx: index('monthly_costs_customer_idx').on(table.customerId),
  providerIdx: index('monthly_costs_provider_idx').on(table.providerId),
  orgYearMonthProjectIdx: uniqueIndex('monthly_costs_org_year_month_project_idx')
    .on(table.organizationId, table.year, table.month, table.projectId, table.providerId),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  customers: many(customers),
  projects: many(projects),
  costEvents: many(costEvents),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  projects: many(projects),
  costEvents: many(costEvents),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
  workflows: many(workflows),
  costEvents: many(costEvents),
}));

export const costEventsRelations = relations(costEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [costEvents.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [costEvents.projectId],
    references: [projects.id],
  }),
  customer: one(customers, {
    fields: [costEvents.customerId],
    references: [customers.id],
  }),
  provider: one(providers, {
    fields: [costEvents.providerId],
    references: [providers.id],
  }),
  model: one(models, {
    fields: [costEvents.modelId],
    references: [models.id],
  }),
}));
