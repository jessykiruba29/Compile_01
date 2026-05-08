'use client';
import type { CompilerOutput } from '@/types';

interface MetricsPanelProps {
  output: CompilerOutput | null;
}

export default function MetricsPanel({ output }: MetricsPanelProps) {
  if (!output || !output.meta) {
    return (
      <div className="metrics-empty">
        <span>Metrics will appear after compilation</span>
        <style jsx>{`
          .metrics-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px;
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--text-dim);
          }
        `}</style>
      </div>
    );
  }

  const metrics = output.meta as {
    total_latency_ms?: number;
    total_tokens?: number;
    total_cost_usd?: number;
    stage_latencies?: Record<string, number>;
    stage_tokens?: Record<string, number>;
  };

  const totalLatency = metrics.total_latency_ms || 0;
  const totalTokens = metrics.total_tokens || 0;
  const totalCost = metrics.total_cost_usd || 0;
  
  // Safe calculations
  const stageLatencies = metrics.stage_latencies || {};
  const stageTokens = metrics.stage_tokens || {};
  
  const maxLatency = Object.keys(stageLatencies).length > 0 
    ? Math.max(...Object.values(stageLatencies)) 
    : 1;
    
  const maxTokens = Object.keys(stageTokens).length > 0 
    ? Math.max(...Object.values(stageTokens)) 
    : 1;

  return (
    <div className="metrics-panel">
      {/* Summary Cards */}
      <div className="metrics-summary">
        <div className="metric-card">
          <span className="metric-label">TOTAL LATENCY</span>
          <span className="metric-value">{(totalLatency / 1000).toFixed(1)}s</span>
          <span className="metric-unit">seconds</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">TOTAL TOKENS</span>
          <span className="metric-value">{totalTokens.toLocaleString()}</span>
          <span className="metric-unit">tokens</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">TOTAL COST</span>
          <span className="metric-value">${totalCost.toFixed(5)}</span>
          <span className="metric-unit">USD</span>
        </div>
      </div>

      {/* Stage Latency Chart */}
      {Object.keys(stageLatencies).length > 0 && (
        <div className="metrics-section">
          <span className="section-title">STAGE LATENCY</span>
          <div className="bar-chart">
            {Object.entries(stageLatencies).map(([stage, latency]) => (
              <div key={stage} className="bar-row">
                <span className="bar-label">{stage}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ width: `${(latency as number / maxLatency) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{latency}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Tokens Chart */}
      {Object.keys(stageTokens).length > 0 && (
        <div className="metrics-section">
          <span className="section-title">TOKENS PER STAGE</span>
          <div className="bar-chart">
            {Object.entries(stageTokens).map(([stage, tokens]) => (
              <div key={stage} className="bar-row">
                <span className="bar-label">{stage}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill tokens"
                    style={{ width: `${((tokens as number) / maxTokens) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{tokens.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .metrics-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          height: 100%;
        }

        .metrics-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .metric-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--text-dim);
        }

        .metric-value {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-unit {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
        }

        .metrics-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--text-dim);
        }

        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-label {
          font-family: var(--font-mono);
          font-size: 10px;
          width: 80px;
          flex-shrink: 0;
          color: var(--text-secondary);
        }

        .bar-container {
          flex: 1;
          height: 24px;
          background: var(--border-subtle);
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--cyan);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .bar-fill.tokens {
          background: var(--purple);
        }

        .bar-value {
          font-family: var(--font-mono);
          font-size: 10px;
          width: 60px;
          text-align: right;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}