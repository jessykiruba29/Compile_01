'use client';
import type { PipelineStage } from '@/types';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  activeStageId?: string;
}

const STATUS_CONFIG = {
  idle:    { color: 'var(--text-dim)',    bg: 'var(--bg-elevated)',  label: 'IDLE',    icon: '○' },
  running: { color: 'var(--amber)',       bg: 'var(--amber-glow)',   label: 'RUNNING', icon: '◎' },
  success: { color: 'var(--green)',       bg: 'var(--green-glow)',   label: 'DONE',    icon: '✓' },
  error:   { color: 'var(--red)',         bg: 'var(--red-glow)',     label: 'ERROR',   icon: '✗' },
  skipped: { color: 'var(--text-muted)',  bg: 'transparent',         label: 'SKIP',    icon: '–' },
};

function formatMs(ms?: number) {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function PipelineVisualizer({ stages }: PipelineVisualizerProps) {
  const totalStages = stages.length;
  const completedStages = stages.filter(s => s.status === 'success').length;
  const progressPct = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <div className="pipeline-wrapper">
      {/* Header */}
      <div className="pipeline-header">
        <div className="pipeline-title-row">
          <span className="pipeline-title-label">PIPELINE</span>
          <span className="pipeline-progress-text">
            {completedStages}/{totalStages}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Stages */}
      <div className="stages-list">
        {stages.map((stage, idx) => {
          const cfg = STATUS_CONFIG[stage.status];
          const isRunning = stage.status === 'running';
          const isDone = stage.status === 'success';

          return (
            <div key={stage.id} className={`stage-row ${stage.status}`}>
              {/* Connector line */}
              {idx < stages.length - 1 && (
                <div className="connector-wrapper">
                  <div className={`connector-line ${isDone ? 'done' : ''}`} />
                </div>
              )}

              {/* Left: index + icon */}
              <div className="stage-left">
                <div className={`stage-icon-wrap ${isRunning ? 'running-anim' : ''}`}
                  style={{ borderColor: cfg.color, background: cfg.bg }}>
                  <span className="stage-icon" style={{ color: cfg.color }}>
                    {isRunning ? (
                      <span className="spin-ring">⟳</span>
                    ) : cfg.icon}
                  </span>
                </div>
                <span className="stage-index" style={{ color: cfg.color }}>
                  {String(stage.index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Right: info */}
              <div className="stage-right">
                <div className="stage-top-row">
                  <span className="stage-label">{stage.label}</span>
                  <div className="stage-badges">
                    {stage.durationMs && (
                      <span className="stage-badge time">{formatMs(stage.durationMs)}</span>
                    )}
                    <span className="stage-status-badge" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <span className="stage-sublabel">{stage.sublabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .pipeline-wrapper {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          overflow: hidden;
        }

        .pipeline-header {
          padding: 12px 16px 10px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
        }

        .pipeline-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .pipeline-title-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }

        .pipeline-progress-text {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--amber);
        }

        .stages-list {
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .stage-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 16px;
          position: relative;
          transition: background 0.15s;
          cursor: default;
        }

        .stage-row:hover {
          background: var(--bg-hover);
        }

        .stage-row.running {
          background: var(--amber-glow);
        }

        .connector-wrapper {
          position: absolute;
          left: 28px;
          top: 42px;
          height: 20px;
          z-index: 0;
        }

        .connector-line {
          width: 1px;
          height: 100%;
          background: var(--border-subtle);
        }

        .connector-line.done {
          background: var(--green);
          opacity: 0.3;
        }

        .stage-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          z-index: 1;
        }

        .stage-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .stage-icon-wrap.running-anim {
          box-shadow: 0 0 0 3px var(--amber-glow);
        }

        .stage-icon {
          font-size: 11px;
          line-height: 1;
        }

        .spin-ring {
          display: inline-block;
          animation: spin-slow 1.2s linear infinite;
          font-size: 13px;
        }

        .stage-index {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.04em;
        }

        .stage-right {
          flex: 1;
          min-width: 0;

        .architecture-flow {
          border-top: 1px solid var(--border-subtle);
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-secondary);
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
          text-align: left;
        }
        }

        .stage-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 2px;
        }

        .stage-label {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .stage-badges {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }

        .stage-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.04em;
          padding: 2px 5px;
          border-radius: 3px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
        }

        .stage-badge.time   { color: var(--cyan); }
        .stage-badge.tokens { color: var(--text-muted); }

        .stage-status-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .stage-sublabel {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}