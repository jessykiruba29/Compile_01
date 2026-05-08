'use client';
import { useState, useCallback } from 'react';
import type { CompilerOutput } from '@/types';

interface JsonViewerProps {
  output: CompilerOutput | null;
}

type TabId = 'overview' | 'intent' | 'design' | 'db_schema' | 'api_schema' | 'ui_schema' | 'validation' | 'full';

const TABS: { id: TabId; label: string; short: string }[] = [
  { id: 'overview',   label: 'Overview',     short: 'OVR'  },
  { id: 'intent',     label: 'Intent',       short: 'INT'  },
  { id: 'design',     label: 'Design',       short: 'ARCH' },
  { id: 'db_schema',  label: 'DB Schema',    short: 'DB'   },
  { id: 'api_schema', label: 'API Schema',   short: 'API'  },
  { id: 'ui_schema',  label: 'UI Schema',    short: 'UI'   },
  { id: 'validation', label: 'Validation',   short: 'VAL'  },
  { id: 'full',       label: 'Full Output',  short: 'FULL' },
];

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'token-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'token-key' : 'token-string';
        } else if (/true|false/.test(match)) {
          cls = 'token-bool';
        } else if (/null/.test(match)) {
          cls = 'token-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

function getTabData(output: CompilerOutput, tab: TabId): unknown {
  if (!output) return null;
  switch (tab) {
    case 'overview':   return null;
    case 'intent':     return output.intent;
    case 'design':     return output.design;
    case 'db_schema':  return output.schemas?.db_schema;
    case 'api_schema': return output.schemas?.api_schema;
    case 'ui_schema':  return output.schemas?.ui_schema;
    case 'validation': return output.validation;
    case 'full':       return output;
    default:           return null;
  }
}

function OverviewPanel({ output }: { output: CompilerOutput }) {
  const intent = output.intent as { app_type?: string; features?: string[]; roles?: string[]; entities?: string[] } | undefined;
  const validation = output.validation as { passed?: boolean; issues?: { severity: string; layer: string; issue: string; repaired: boolean }[]; repaired_count?: number } | undefined;
  const issues = validation?.issues || [];
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  // Safely get meta values with fallbacks
  const meta = output.meta as { generated_at?: number; total_latency_ms?: number; total_tokens?: number; total_cost_usd?: number } | undefined;
  const generatedAt = meta?.generated_at ? new Date(meta.generated_at * 1000).toLocaleTimeString() : new Date().toLocaleTimeString();
  const totalLatencyMs = meta?.total_latency_ms || 0;
  const totalTokens = meta?.total_tokens || 0;
  const totalCostUsd = meta?.total_cost_usd || 0;

  return (
    <div className="overview-panel">
      <div className="overview-hero">
        <div className="overview-app-name">
          <span className="overview-label">APP</span>
          <h2 className="overview-name">{intent?.app_type || 'Compiled Application'}</h2>
        </div>
        <div className={`execution-badge ${output.execution_ready ? 'ready' : 'not-ready'}`}>
          {output.execution_ready ? '✓ EXECUTION READY' : '⚠ REVIEW REQUIRED'}
        </div>
      </div>

      <div className="overview-grid">
        {/* Entities */}
        {intent?.entities && intent.entities.length > 0 && (
          <div className="overview-card">
            <span className="overview-card-title">ENTITIES</span>
            <div className="tag-list">
              {intent.entities.map((e: string) => (
                <span key={e} className="tag tag-entity">{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {intent?.features && intent.features.length > 0 && (
          <div className="overview-card">
            <span className="overview-card-title">FEATURES</span>
            <div className="tag-list">
              {intent.features.map((f: string) => (
                <span key={f} className="tag tag-feature">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Roles */}
        {intent?.roles && intent.roles.length > 0 && (
          <div className="overview-card">
            <span className="overview-card-title">ROLES</span>
            <div className="tag-list">
              {intent.roles.map((r: string) => (
                <span key={r} className="tag tag-role">{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Validation summary */}
        <div className="overview-card">
          <span className="overview-card-title">VALIDATION</span>
          <div className="validation-summary">
            <div className="val-item">
              <span className="val-count err">{errors.length}</span>
              <span className="val-label">errors</span>
            </div>
            <div className="val-item">
              <span className="val-count warn">{warnings.length}</span>
              <span className="val-label">warnings</span>
            </div>
            <div className="val-item">
              <span className="val-count rep">{validation?.repaired_count || 0}</span>
              <span className="val-label">repaired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="meta-row">
        <span className="meta-item">
          <span className="meta-key">generated</span>
          <span className="meta-val">{generatedAt}</span>
        </span>
        <span className="meta-item">
          <span className="meta-key">latency</span>
          <span className="meta-val">{(totalLatencyMs / 1000).toFixed(1)}s</span>
        </span>
        <span className="meta-item">
          <span className="meta-key">tokens</span>
          <span className="meta-val">{totalTokens.toLocaleString()}</span>
        </span>
        <span className="meta-item">
          <span className="meta-key">cost</span>
          <span className="meta-val">${totalCostUsd.toFixed(5)}</span>
        </span>
      </div>

      <style jsx>{`
        .overview-panel { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        .overview-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .overview-label { font-family: monospace; font-size: 9px; letter-spacing: 0.14em; color: #6b7280; display: block; margin-bottom: 4px; }
        .overview-name { font-size: 22px; font-weight: 700; color: #ffffff; }

        .execution-badge {
          font-family: monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          padding: 6px 12px; border-radius: 4px; flex-shrink: 0; white-space: nowrap;
        }
        .execution-badge.ready    { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .execution-badge.not-ready { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }

        .overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .overview-card {
          background: #0f0f0f; border: 1px solid #1f1f1f; border-radius: 4px; padding: 12px;
        }
        .overview-card-title { font-family: monospace; font-size: 9px; letter-spacing: 0.12em; color: #6b7280; display: block; margin-bottom: 8px; }

        .tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .tag { font-family: monospace; font-size: 10px; padding: 2px 8px; border-radius: 3px; }
        .tag-entity  { background: rgba(34,211,238,0.08); color: #06b6d4; border: 1px solid rgba(34,211,238,0.15); }
        .tag-feature { background: rgba(245,158,11,0.08); color: #f59e0b; border: 1px solid rgba(245,158,11,0.15); }
        .tag-role    { background: rgba(16,185,129,0.08); color: #10b981; border: 1px solid rgba(16,185,129,0.15); }

        .validation-summary { display: flex; gap: 16px; }
        .val-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .val-count { font-family: monospace; font-size: 20px; font-weight: 700; line-height: 1; }
        .val-count.err  { color: #ef4444; }
        .val-count.warn { color: #f59e0b; }
        .val-count.rep  { color: #10b981; }
        .val-label { font-family: monospace; font-size: 9px; color: #6b7280; letter-spacing: 0.06em; }

        .meta-row { display: flex; gap: 16px; flex-wrap: wrap; padding-top: 4px; border-top: 1px solid #1f1f1f; }
        .meta-item { display: flex; gap: 6px; align-items: center; }
        .meta-key { font-family: monospace; font-size: 10px; color: #6b7280; letter-spacing: 0.06em; }
        .meta-val { font-family: monospace; font-size: 10px; color: #9ca3af; }
      `}</style>
    </div>
  );
}

export default function JsonViewer({ output }: JsonViewerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!output) return;
    const data = getTabData(output, activeTab) ?? output;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output, activeTab]);

  const handleExport = useCallback(() => {
    if (!output) return;
    const dataStr = JSON.stringify(output, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compiler-output-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const tabData = output ? getTabData(output, activeTab) : null;
  const jsonStr = tabData ? JSON.stringify(tabData, null, 2) : '';

  return (
    <div className="json-viewer-wrapper">
      <div className="jv-header">
        <div className="tab-strip">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={!output}
            >
              {tab.short}
            </button>
          ))}
        </div>
        {output && (
          <div className="jv-actions">
            <button className="btn-ghost jv-btn" onClick={handleCopy}>
              {copied ? '✓ COPIED' : 'COPY'}
            </button>
            <button className="btn-ghost jv-btn" onClick={handleExport}>
              📥 EXPORT
            </button>
          </div>
        )}
      </div>

      <div className="jv-content">
        {!output ? (
          <div className="jv-empty">
            <div className="jv-empty-icon">{ '{  }' }</div>
            <div className="jv-empty-text">Output will appear here after compilation</div>
          </div>
        ) : activeTab === 'overview' ? (
          <OverviewPanel output={output} />
        ) : (
          <div className="json-code-wrapper">
            <pre
              className="json-code code-block"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonStr) }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .json-viewer-wrapper {
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .jv-header {
          display: flex;
          align-items: stretch;
          border-bottom: 1px solid #1f1f1f;
          background: #0f0f0f;
          overflow-x: auto;
          flex-shrink: 0;
        }

        .tab-strip {
          flex: 1;
          display: flex;
          gap: 2px;
          padding: 6px;
        }

        .tab-item {
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .tab-item.active {
          background: #1a1a1a;
          color: #10b981;
        }

        .tab-item:hover:not(:disabled) {
          background: #1a1a1a;
          color: #e5e5e5;
        }

        .tab-item:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .jv-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-left: 1px solid #1f1f1f;
          flex-shrink: 0;
        }

        .jv-btn {
          font-family: monospace;
          font-size: 10px;
          padding: 5px 10px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #9ca3af;
          border-radius: 4px;
          cursor: pointer;
        }

        .jv-btn:hover {
          background: #2a2a2a;
          color: #e5e5e5;
        }

        .jv-content {
          flex: 1;
          overflow: auto;
          min-height: 0;
        }

        .jv-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          padding: 40px;
        }

        .jv-empty-icon {
          font-family: monospace;
          font-size: 36px;
          color: #6b7280;
        }

        .jv-empty-text {
          font-family: monospace;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }

        .json-code-wrapper {
          padding: 16px;
        }

        .json-code {
          white-space: pre;
          font-size: 12px;
          line-height: 1.7;
          font-family: monospace;
          color: #e5e5e5;
          margin: 0;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}