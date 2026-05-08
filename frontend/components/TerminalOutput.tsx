'use client';
import { useEffect, useRef } from 'react';
import type { LogEntry } from '@/types';

interface TerminalOutputProps {
  logs: LogEntry[];
  isActive: boolean;
}

const LEVEL_CLASS: Record<string, string> = {
  info:    'log-info',
  success: 'log-success',
  warn:    'log-warn',
  error:   'log-error',
  debug:   'log-debug',
  stage:   'log-stage',
};

const LEVEL_PREFIX: Record<string, string> = {
  info:    '  ',
  success: '  ',
  warn:    '  ',
  error:   '  ',
  debug:   '  ',
  stage:   '',
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export default function TerminalOutput({ logs, isActive }: TerminalOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [logs]);

  return (
    <div className="terminal-wrapper">
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <span className="terminal-title">compiler.log</span>
        <div className="terminal-right">
          {isActive && (
            <span className="terminal-live">
              <span className="status-dot running" />
              LIVE
            </span>
          )}
          <span className="terminal-count">{logs.length} lines</span>
        </div>
      </div>

      {/* Log lines */}
      <div className="terminal-body">
        {logs.length === 0 ? (
          <div className="terminal-empty">
            <span className="terminal-prompt">$</span>
            <span className="terminal-empty-text cursor">awaiting input</span>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={log.id} className={`log-line ${LEVEL_CLASS[log.level] || 'log-info'}`}
              style={{ animationDelay: `${Math.min(idx * 10, 200)}ms` }}>
              <span className="log-time">{formatTime(log.timestamp)}</span>
              <span className="log-prefix">{LEVEL_PREFIX[log.level]}</span>
              <span className="log-msg">{log.message}</span>
              {log.detail && (
                <span className="log-detail">{log.detail}</span>
              )}
            </div>
          ))
        )}
        {isActive && logs.length > 0 && (
          <div className="terminal-cursor-line">
            <span className="terminal-prompt">$</span>
            <span className="cursor" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <style jsx>{`
        .terminal-wrapper {
          background: #050709;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .terminal-titlebar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .terminal-dots {
          display: flex;
          gap: 5px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot.red    { background: #ff5f57; }
        .dot.yellow { background: #febc2e; }
        .dot.green  { background: #28c840; }

        .terminal-title {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          flex: 1;
          text-align: center;
        }

        .terminal-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .terminal-live {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--amber);
        }

        .terminal-count {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-dim);
        }

        .terminal-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0;
          font-family: var(--font-mono);
          font-size: 11.5px;
          line-height: 1.8;
        }

        .log-line {
          display: flex;
          align-items: baseline;
          gap: 0;
          padding: 0 16px;
          white-space: pre-wrap;
          word-break: break-all;
          animation: fadeIn 0.15s ease-out;
        }

        .log-line:hover {
          background: rgba(255,255,255,0.02);
        }

        .log-time {
          color: var(--text-dim);
          font-size: 10px;
          flex-shrink: 0;
          margin-right: 10px;
          letter-spacing: 0.02em;
        }

        .log-prefix {
          flex-shrink: 0;
        }

        .log-msg {
          flex: 1;
        }

        .log-detail {
          color: var(--text-muted);
          font-size: 10px;
          margin-left: 8px;
          flex-shrink: 0;
        }

        .terminal-empty {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          color: var(--text-dim);
        }

        .terminal-prompt {
          color: var(--amber);
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .terminal-empty-text {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .terminal-cursor-line {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 2px 16px;
        }
      `}</style>
    </div>
  );
}