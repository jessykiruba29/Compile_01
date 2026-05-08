// ─── Pipeline Stage ───────────────────────────────────────────────────────────

export type StageStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

export interface PipelineStage {
  id: string;
  index: number;
  label: string;
  sublabel: string;
  status: StageStatus;
  durationMs?: number;
  tokens?: number;
  retries?: number;
  output?: unknown;
  logs: LogEntry[];
}

// ─── Log ──────────────────────────────────────────────────────────────────────

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug' | 'stage';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  detail?: string;
}

// ─── Compiler Output ──────────────────────────────────────────────────────────

export interface IntentOutput {
  app_name: string;
  description: string;
  entities: string[];
  features: string[];
  roles: string[];
  has_auth: boolean;
  has_payments: boolean;
  assumptions: string[];
  clarifications_needed: string[];
}

export interface CompilerOutput {
  intent: {
    app_type: string;
    features: string[];
    roles: string[];
    entities: string[];
  };
  design: {
    entities: Record<string, { fields: string[] }>;
    flows: Array<{ name: string; steps: string[] }>;
    roles: Record<string, string[]>;
    modules: Array<{ name: string; tech: string }>;
  };
  schemas: {
    db_schema: Record<string, any>;
    api_schema: Record<string, any>;
    ui_schema: Record<string, any>;
  };
  validation: {
    passed: boolean;
    repaired?: boolean;
    original_error_count?: number;
    final_error_count?: number;
    issues: Array<{
      severity: string;
      layer: string;
      field: string;
      issue: string;
      repaired: boolean;
      repair_action?: string;
    }>;
    repaired_count?: number;
    summary?: string;
  };
  repairs: any[];
  execution_ready: boolean;
  meta: {
    generated_at: number;
    total_latency_ms: number;
    total_tokens: number;
    total_cost_usd: number;
  };
}

export interface DbField {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string;
  unique?: boolean;
  references?: string;
}

export interface DbTable {
  name: string;
  fields: DbField[];
  indexes?: string[];
}

export interface DbSchema {
  tables: DbTable[];
  relations: Array<{ from: string; to: string; type: string }>;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  auth: boolean;
  roles?: string[];
  body?: Record<string, string>;
  response: string;
  description: string;
}

export interface ApiSchema {
  base_url: string;
  version: string;
  endpoints: ApiEndpoint[];
}

export interface UiComponent {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: UiComponent[];
}

export interface UiPage {
  id: string;
  path: string;
  title: string;
  auth_required: boolean;
  roles?: string[];
  layout: string;
  components: UiComponent[];
}

export interface UiSchema {
  theme: string;
  pages: UiPage[];
  nav: Array<{ label: string; path: string; icon: string; roles?: string[] }>;
}

export interface AuthRule {
  resource: string;
  actions: Record<string, string[]>;
}

export interface AuthSchema {
  strategy: string;
  roles: string[];
  permissions: AuthRule[];
  session_ttl: string;
}

export interface BusinessLogic {
  rules: Array<{
    name: string;
    trigger: string;
    condition: string;
    action: string;
  }>;
}

export interface ValidationIssue {
  layer: string;
  field: string;
  issue: string;
  severity: 'error' | 'warning';
  repaired: boolean;
  repair_action?: string;
}



// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface CompileMetrics {
  total_latency_ms: number;
  stage_latencies: Record<string, number>;
  total_tokens: number;
  stage_tokens: Record<string, number>;
  retries: number;
  validation_issues: number;
  repaired: number;
  cost_usd: number;
  execution_ready: boolean;
}

// ─── Compiler State ───────────────────────────────────────────────────────────

export type CompilerPhase = 'idle' | 'compiling' | 'validating' | 'done' | 'error';

export interface CompilerState {
  phase: CompilerPhase;
  stages: PipelineStage[];
  output: CompilerOutput | null;
  metrics: CompileMetrics | null;
  error: string | null;
  activeTab: string;
}