'use client';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PromptBox from '@/components/PromptBox';
import PipelineVisualizer from '@/components/PipelineVisualizer';
import TerminalOutput from '@/components/TerminalOutput';
import JsonViewer from '@/components/JsonViewer';
import MetricsPanel from '@/components/MetricsPanel';
import ValidationLogs from '@/components/ValidationLogs';
import RuntimeStatus from '@/components/RuntimeStatus';
import { useCompiler } from '@/hooks/useCompiler';
import SplashScreen from '@/components/SplashScreen';


type RightPanelTab = 'output' | 'metrics' | 'validation' | 'runtime';

export default function Home() {
  const { state, globalLogs, compile, reset } = useCompiler();
  const [rightTab, setRightTab] = useState<RightPanelTab>('output');

  const isCompiling = state.phase === 'compiling';
  const isDone = state.phase === 'done' || state.phase === 'error';

  const RIGHT_TABS: { id: RightPanelTab; label: string }[] = [
    { id: 'output',     label: 'OUTPUT'     },
    { id: 'metrics',    label: 'METRICS'    },
    { id: 'validation', label: 'VALIDATION' },
    { id: 'runtime',    label: 'RUNTIME'    },
  ];
    
const [showSplash, setShowSplash] = useState(true);

if (showSplash) {
  return <SplashScreen onComplete={() => setShowSplash(false)} />;
}


  return (
    <div className="app-shell">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-mark">
            <span className="logo-bracket">[</span>
            <span className="logo-text">C</span>
            <span className="logo-bracket">]</span>
          </div>
          <div className="topbar-title-group">
            <span className="topbar-product">Compile_01</span>
            <span className="topbar-version">v1.0</span>
          </div>
          <div className="topbar-sep" />
          <span className="topbar-desc">Natural Language → Audit-Ready Architectures</span>
        </div>

        <div className="topbar-right">
          <div className="topbar-status">
            <span className={`status-dot ${isCompiling ? 'running' : isDone ? 'success' : 'idle'}`} />
            <span className="topbar-status-text">
              {isCompiling ? 'COMPILING' : isDone && state.phase === 'done' ? 'READY' : state.phase === 'error' ? 'ERROR' : 'IDLE'}
            </span>
          </div>
          <div className="topbar-sep" />
          <span className="topbar-stage-count">
            {state.stages.filter(s => s.status === 'success').length}/{state.stages.length} STAGES
          </span>
        </div>
      </header>

      {/* ── Main body ────────────────────────────────────────────────── */}
      <main className="main-body">

        {/* ── LEFT COLUMN: Input + Pipeline ──────────────────────────── */}
        <aside className="col-left">
          {/* Input */}
          <section className="left-section left-input">
            <div className="section-header">
              <span className="section-label">
                <span className="section-step">01</span>
                INPUT
              </span>
            </div>
            <PromptBox
              onCompile={compile}
              onReset={reset}
              isCompiling={isCompiling}
              isDone={isDone}
            />
          </section>

          {/* Pipeline */}
          <section className="left-section left-pipeline">
            <div className="section-header">
              <span className="section-label">
                <span className="section-step">02</span>
                PIPELINE
              </span>
              <span className="section-sublabel">5-stage compilation</span>
            </div>
            <PipelineVisualizer stages={state.stages} />
          </section>
        </aside>

        {/* ── CENTER COLUMN: Terminal ─────────────────────────────────── */}
        <section className="col-center">
          <div className="section-header">
            <span className="section-label">
              <span className="section-step">03</span>
              COMPILER LOG
            </span>
            <span className="section-sublabel">{globalLogs.length} lines</span>
          </div>
          <div className="center-terminal">
            <TerminalOutput logs={globalLogs} isActive={isCompiling} />
          </div>
        </section>

        {/* ── RIGHT COLUMN: Output panels ────────────────────────────── */}
        <section className="col-right">
          <div className="right-header">
            <div className="right-tab-strip">
              {RIGHT_TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`right-tab ${rightTab === tab.id ? 'active' : ''}`}
                  onClick={() => setRightTab(tab.id)}
                >
                  {tab.label}
                  {tab.id === 'validation' && state.output && (
                    <span className={`tab-badge ${(state.output.validation as { passed?: boolean })?.passed !== false ? 'green' : 'red'}`}>
                      {(state.output.validation as { issues?: unknown[] })?.issues?.length || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="right-content">
            {rightTab === 'output'     && <JsonViewer output={state.output} />}
            {rightTab === 'metrics'    && <MetricsPanel output={state.output} />}
            {rightTab === 'validation' && <ValidationLogs output={state.output} />}
            {rightTab === 'runtime'    && <RuntimeStatus output={state.output} />}
          </div>
        </section>
      </main>

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <footer className="statusbar">
        <div className="statusbar-left">
          
          <span className="sb-divider" />
          <span className="statusbar-item">
            <span className="sb-key">PIPELINE</span>
            <span className="sb-val">   5-stage · parallel schema</span>
          </span>
          <span className="sb-divider" />
          <span className="statusbar-item">
            <span className="sb-key">STRATEGY</span>
            <span className="sb-val">intent → arch → schema × 3 → validation</span>
          </span>
        </div>
        <div className="statusbar-right">
          {state.metrics && (
            <>
              <span className="statusbar-item highlight">
                <span className="sb-key">LATENCY</span>
                <span className="sb-val cyan">{(state.metrics.total_latency_ms / 1000).toFixed(1)}s</span>
              </span>
              <span className="sb-divider" />
              <span className="statusbar-item highlight">
                <span className="sb-key">TOKENS</span>
                <span className="sb-val amber">{state.metrics.total_tokens.toLocaleString()}</span>
              </span>
              <span className="sb-divider" />
              <span className="statusbar-item highlight">
                <span className="sb-key">COST</span>
                <span className="sb-val">${state.metrics.cost_usd.toFixed(5)}</span>
              </span>
            </>
          )}
          {state.error && (
            <span className="statusbar-error">✗ {state.error}</span>
          )}
        </div>
      </footer>

      <style jsx>{`
        /* ─── Shell ─────────────────────────────────────────────────────────── */
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-void);
          position: relative;
        }

        /* Grid background */
        .app-shell::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }

        /* Vignette */
        .app-shell::after {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, var(--bg-void) 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* ─── Topbar ─────────────────────────────────────────────────────────── */
        .topbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 48px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-dim);
          flex-shrink: 0;
        }

        .topbar-left, .topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-mark {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .logo-bracket {
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 300;
          color: var(--amber);
          line-height: 1;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.1em;
          padding: 0 2px;
        }

        .topbar-title-group {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .topbar-product {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }
        .topbar-version {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--amber);
          background: var(--amber-glow);
          padding: 1px 5px;
          border-radius: 3px;
          border: 1px solid rgba(245,158,11,0.2);
        }

        .topbar-sep {
          width: 1px;
          height: 16px;
          background: var(--border-dim);
        }

        .topbar-desc {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .topbar-status {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .topbar-status-text {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }

        .topbar-stage-count {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--text-dim);
          letter-spacing: 0.08em;
        }

        /* ─── Main Body ──────────────────────────────────────────────────────── */
        .main-body {
          position: relative;
          z-index: 1;
          flex: 1;
          display: grid;
          grid-template-columns: 300px 1fr 440px;
          gap: 0;
          overflow: hidden;
          min-height: 0;
        }

        /* ─── Columns ────────────────────────────────────────────────────────── */
        .col-left {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-subtle);
          overflow-y: auto;
          background: rgba(8,10,14,0.6);
        }

        .col-center {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-subtle);
          background: rgba(5,7,9,0.8);
          overflow: hidden;
        }

        .col-right {
          display: flex;
          flex-direction: column;
          background: rgba(8,10,14,0.6);
          overflow: hidden;
        }

        /* ─── Section headers ────────────────────────────────────────────────── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(13,17,23,0.8);
          flex-shrink: 0;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-step {
          color: var(--amber);
          font-size: 15px;
        }

        .section-sublabel {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--text-dim);
          text-align: right;
        }

        /* ─── Left panels ────────────────────────────────────────────────────── */
        .left-section {
          flex-shrink: 0;
        }

        .left-input {
          border-bottom: 1px solid var(--border-subtle);
        }

        .left-input .section-header,
        .left-pipeline .section-header {
          background: transparent;
          border-bottom: none;
        }

        .left-input > :last-child,
        .left-pipeline > :last-child {
          margin: 0 12px 12px;
        }

        /* ─── Center terminal ────────────────────────────────────────────────── */
        .center-terminal {
          flex: 1;
          overflow: hidden;
          padding: 12px;
          min-height: 0;
        }

        /* ─── Right panel ────────────────────────────────────────────────────── */
        .right-header {
          flex-shrink: 0;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
        }

        .right-tab-strip {
          display: flex;
          overflow-x: auto;
        }

        .right-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .right-tab:hover {
          color: var(--text-secondary);
          background: var(--bg-hover);
        }

        .right-tab.active {
          color: var(--amber);
          border-bottom-color: var(--amber);
          background: var(--amber-glow);
        }

        .tab-badge {
          font-size: 13px;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 700;
        }
        .tab-badge.green { background: var(--green-glow); color: var(--green); }
        .tab-badge.red   { background: rgba(239,68,68,0.1); color: var(--red); }

        .right-content {
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* ─── Status bar ─────────────────────────────────────────────────────── */
        .statusbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 28px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
          overflow: hidden;
        }

        .statusbar-left, .statusbar-right {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .statusbar-item {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
        }

        .sb-key {
          font-family: var(--font-mono);
          font-size: 15px;
          letter-spacing: 0.1em;
          color: var(--text-dim);
        }

        .sb-val {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--text-muted);
        }

        .sb-val.cyan  { color: var(--cyan); }
        .sb-val.amber { color: var(--amber); }

        .sb-divider {
          width: 1px;
          height: 12px;
          background: var(--border-subtle);
        }

        .statusbar-error {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--red);
          padding: 0 12px;
        }
      `}</style>
    </div>
  );
}