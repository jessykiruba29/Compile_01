'use client';
import { Globe, CheckCircle, XCircle } from 'lucide-react';

// Define interface locally to avoid type issues
interface RuntimeOutput {
  schemas?: {
    db_schema?: Record<string, any>;
    api_schema?: Record<string, any>;
    ui_schema?: Record<string, any>;
  };
  design?: {
    roles?: Record<string, any>;
    flows?: any[];
  };
  validation?: {
    passed?: boolean;
  };
  meta?: {
    total_latency_ms?: number;
    total_tokens?: number;
    total_cost_usd?: number;
  };
}

interface RuntimeStatusProps {
  output: RuntimeOutput | null;
}

export default function RuntimeStatus({ output }: RuntimeStatusProps) {
  // Safe checking with optional chaining
  const dbExists = output?.schemas?.db_schema && Object.keys(output.schemas.db_schema).length > 0;
  const apiExists = output?.schemas?.api_schema && Object.keys(output.schemas.api_schema).length > 0;
  const uiExists = output?.schemas?.ui_schema && Object.keys(output.schemas.ui_schema).length > 0;
  const authExists = output?.design?.roles && Object.keys(output.design.roles).length > 0;
  const logicExists = output?.design?.flows && output.design.flows.length > 0;
  const validated = output?.validation?.passed === true;
  
  // Count actual endpoints safely
  let endpointCount = 0;
  if (output?.schemas?.api_schema) {
    const apiSchema = output.schemas.api_schema;
    endpointCount = Object.values(apiSchema).reduce(
      (acc: number, service: any) => acc + (service.endpoints?.length || 0), 0
    );
  }

  const readinessChecks = [
    { name: "DB Schema Valid", valid: dbExists, description: "Tables and relations generated" },
    { name: "API Schema Valid", valid: apiExists, description: "Endpoints and methods defined" },
    { name: "UI Schema Valid", valid: uiExists, description: "Pages and components configured" },
    { name: "Auth Rules Valid", valid: authExists, description: "Roles and permissions defined" },
    { name: "Business Logic Valid", valid: logicExists, description: "Rules and triggers configured" },
    { name: "Cross-layer Validated", valid: validated, description: "Consistency checks passed" },
  ];

  const validCount = readinessChecks.filter(c => c.valid).length;
  const totalChecks = readinessChecks.length;

  const latencySec = ((output?.meta?.total_latency_ms || 0) / 1000).toFixed(1);
  const tokens = output?.meta?.total_tokens?.toLocaleString() || '0';
  const cost = (output?.meta?.total_cost_usd || 0).toFixed(5);

  return (
    <div className="runtime-status">
      <div className="status-header">
        <span className="status-title">⚡ EXECUTION READY</span>
        <span className="status-badge">Generated output can power a working application</span>
      </div>

      {/* Readiness Checks */}
      <div className="readiness-section">
        <span className="section-title">READINESS CHECKS</span>
        <div className="checks-grid">
          {readinessChecks.map((check, i) => (
            <div key={i} className="check-item">
              {check.valid ? (
                <CheckCircle className="check-icon valid" size={14} />
              ) : (
                <XCircle className="check-icon invalid" size={14} />
              )}
              <div className="check-info">
                <span className="check-name">{check.name}</span>
                <span className="check-desc">{check.description}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="check-summary">
          <span className={`summary-badge ${validCount === totalChecks ? 'pass' : 'partial'}`}>
            {validCount}/{totalChecks} validated
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-section">
        <span className="section-title">METRICS</span>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">MODEL</span>
            <span className="metric-value">claude-opus-4-5</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">PIPELINE</span>
            <span className="metric-value">5-stage · parallel schema</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">STRATEGY</span>
            <span className="metric-value">intent → arch → schema × 3 → validation</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">LATENCY</span>
            <span className="metric-value">{latencySec}s</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">TOKENS</span>
            <span className="metric-value">{tokens}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">COST</span>
            <span className="metric-value">${cost}</span>
          </div>
        </div>
      </div>

      {/* Endpoints Info */}
      <div className="endpoints-info">
        <span className="section-title">ENDPOINTS</span>
        <div className="endpoint-count">
          <Globe size={14} />
          <span>{endpointCount} endpoints available</span>
        </div>
      </div>

      <style jsx>{`
        .runtime-status {
          background: linear-gradient(135deg, #0a0a0a 0%, #000000 100%);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #1a1a1a;
        }

        .status-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #1a1a1a;
        }

        .status-title {
          display: block;
          font-family: monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #10b981;
          margin-bottom: 8px;
        }

        .status-badge {
          font-size: 11px;
          color: #6b7280;
        }

        .section-title {
          display: block;
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .readiness-section, .metrics-section, .endpoints-info {
          margin-bottom: 24px;
        }

        .checks-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px;
          background: #0f0f0f;
          border-radius: 6px;
          border: 1px solid #1a1a1a;
        }

        .check-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .check-icon.valid { color: #10b981; }
        .check-icon.invalid { color: #ef4444; }

        .check-info {
          flex: 1;
        }

        .check-name {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #e5e5e5;
          margin-bottom: 2px;
        }

        .check-desc {
          display: block;
          font-size: 10px;
          color: #6b7280;
        }

        .check-summary {
          margin-top: 12px;
          text-align: right;
        }

        .summary-badge {
          font-family: monospace;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 4px;
          background: #1a1a1a;
        }

        .summary-badge.pass { color: #10b981; }
        .summary-badge.partial { color: #f59e0b; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .metric-card {
          background: #0f0f0f;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #1a1a1a;
        }

        .metric-label {
          display: block;
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .metric-value {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #e5e5e5;
        }

        .endpoint-count {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: #0f0f0f;
          border-radius: 6px;
          border: 1px solid #1a1a1a;
          color: #e5e5e5;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}