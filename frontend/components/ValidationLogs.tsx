'use client';
import type { CompilerOutput } from '@/types';

interface ValidationLogsProps {
  output: CompilerOutput | null;
}

export default function ValidationLogs({ output }: ValidationLogsProps) {
  if (!output) {
    return (
      <div className="val-empty">
        <span>Validation results appear after compilation</span>
        <style jsx>{`
          .val-empty { display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; }
          span { font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
        `}</style>
      </div>
    );
  }

  const validation = output.validation as {
    passed?: boolean;
    issues?: Array<{ layer: string; field: string; issue: string; severity: string; repaired: boolean; repair_action?: string }>;
    repaired_count?: number;
    summary?: string;
  };

  const issues = validation?.issues || [];
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  return (
    <div className="val-wrapper">
      {/* Status header */}
      <div className={`val-status-bar ${validation?.passed ? 'pass' : 'fail'}`}>
        <span className="val-status-icon">{validation?.passed ? '✓' : '✗'}</span>
        <span className="val-status-text">
          {validation?.passed ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}
        </span>
        <div className="val-status-counts">
          {errors.length > 0 && <span className="val-count-badge error">{errors.length} errors</span>}
          {warnings.length > 0 && <span className="val-count-badge warning">{warnings.length} warnings</span>}
          {(validation?.repaired_count || 0) > 0 && (
            <span className="val-count-badge repaired">{validation?.repaired_count} repaired</span>
          )}
        </div>
      </div>

      {validation?.summary && (
        <div className="val-summary">{validation.summary}</div>
      )}

      {/* Issues list */}
      {issues.length === 0 ? (
        <div className="val-all-clear">
          <span className="val-check">✓</span>
          <div className="val-clear-text">
            <span className="val-clear-title">All cross-layer checks passed</span>
            <span className="val-clear-sub">API ↔ DB · UI ↔ API · Auth roles · Field types</span>
          </div>
        </div>
      ) : (
        <div className="val-issues">
          {issues.map((issue, i) => (
            <div key={i} className={`val-issue ${issue.severity} ${issue.repaired ? 'repaired' : ''}`}>
              <div className="issue-header">
                <span className={`issue-severity ${issue.severity}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className="issue-layer">[{issue.layer}]</span>
                <span className="issue-field">{issue.field}</span>
                {issue.repaired && (
                  <span className="issue-repaired-badge">REPAIRED</span>
                )}
              </div>
              <p className="issue-description">{issue.issue}</p>
              {issue.repair_action && (
                <p className="issue-repair">
                  <span className="repair-label">→ FIX:</span> {issue.repair_action}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .val-wrapper { display: flex; flex-direction: column; gap: 0; overflow-y: auto; height: 100%; }

        .val-status-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; flex-shrink: 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .val-status-bar.pass { background: var(--green-glow); }
        .val-status-bar.fail { background: var(--red-glow); }

        .val-status-icon { font-size: 14px; font-weight: bold; }
        .val-status-bar.pass .val-status-icon { color: var(--green); }
        .val-status-bar.fail .val-status-icon { color: var(--red); }

        .val-status-text {
          font-family: var(--font-mono); font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; flex: 1;
        }
        .val-status-bar.pass .val-status-text { color: var(--green); }
        .val-status-bar.fail .val-status-text { color: var(--red); }

        .val-status-counts { display: flex; gap: 6px; }
        .val-count-badge {
          font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.06em;
          padding: 2px 7px; border-radius: 3px; font-weight: 600;
        }
        .val-count-badge.error    { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
        .val-count-badge.warning  { background: var(--amber-glow); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
        .val-count-badge.repaired { background: var(--green-glow); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }

        .val-summary {
          padding: 10px 16px; font-size: 12px; color: var(--text-secondary);
          border-bottom: 1px solid var(--border-subtle); flex-shrink: 0;
          font-family: var(--font-mono);
        }

        .val-all-clear {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 16px;
        }
        .val-check { font-size: 24px; color: var(--green); }
        .val-clear-text { display: flex; flex-direction: column; gap: 3px; }
        .val-clear-title { font-family: var(--font-body); font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .val-clear-sub   { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }

        .val-issues { display: flex; flex-direction: column; gap: 0; overflow-y: auto; }

        .val-issue {
          padding: 12px 16px; border-bottom: 1px solid var(--border-subtle);
          transition: background 0.15s;
        }
        .val-issue.error {
          border-left: 3px solid #ef4444;
          background: rgba(239,68,68,0.05);
        }
        .val-issue.warning {
          border-left: 3px solid #f59e0b;
          background: rgba(245,158,11,0.05);
        }
        .val-issue.success {
          border-left: 3px solid #10b981;
          background: rgba(16,185,129,0.05);
        }
        .val-issue:hover { background: var(--bg-hover); }
        .val-issue.repaired { opacity: 0.75; }

        .issue-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }

        .issue-severity {
          font-family: var(--font-mono); font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; padding: 2px 6px; border-radius: 3px;
        }
        .issue-severity.error   { background: rgba(239,68,68,0.15);  color: var(--red);   border: 1px solid rgba(239,68,68,0.2); }
        .issue-severity.warning { background: var(--amber-glow); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
        .issue-severity.success { background: var(--green-glow); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }

        .issue-layer {
          font-family: var(--font-mono); font-size: 10px; color: var(--cyan);
        }
        .issue-field {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary); flex: 1;
        }

        .issue-repaired-badge {
          font-family: var(--font-mono); font-size: 9px; color: var(--green);
          background: var(--green-glow); border: 1px solid rgba(16,185,129,0.2);
          padding: 1px 6px; border-radius: 3px; letter-spacing: 0.08em;
        }

        .issue-description {
          font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 4px;
        }

        .issue-repair {
          font-family: var(--font-mono); font-size: 11px; color: var(--green); line-height: 1.5;
        }
        .repair-label { color: var(--green); font-weight: 600; }
      `}</style>
    </div>
  );
}