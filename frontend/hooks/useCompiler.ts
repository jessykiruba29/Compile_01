'use client';
import { useState, useCallback, useRef } from 'react';
import type { CompilerState, PipelineStage, LogEntry, CompileMetrics, CompilerOutput } from '@/types';

const STAGE_DEFS = [
  { id: 'intent',       index: 0, label: 'Intent Extraction',     sublabel: 'Parse & classify user input' },
  { id: 'architecture', index: 1, label: 'System Design',         sublabel: 'Entities, flows, architecture' },
  { id: 'schema_gen',   index: 2, label: 'Schema Generation',     sublabel: 'DB · API · Auth (parallel)' },
  { id: 'validation',   index: 3, label: 'Validation & Repair',   sublabel: 'Consistency checks + auto-fix' },
  { id: 'runtime',      index: 4, label: 'Runtime Execution',     sublabel: 'Boot services and routes' },
];

function makeId() { return Math.random().toString(36).slice(2, 9); }

function makeLog(level: LogEntry['level'], message: string, detail?: string): LogEntry {
  return { id: makeId(), timestamp: Date.now(), level, message, detail };
}

const initialStages = (): PipelineStage[] =>
  STAGE_DEFS.map(d => ({ ...d, status: 'idle', logs: [] }));

export function useCompiler() {
  const [state, setState] = useState<CompilerState>({
    phase: 'idle',
    stages: initialStages(),
    output: null,
    metrics: null,
    error: null,
    activeTab: 'overview',
  });

  const logsRef = useRef<LogEntry[]>([]);
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([]);

  const pushLog = useCallback((log: LogEntry) => {
    logsRef.current = [...logsRef.current, log];
    setGlobalLogs([...logsRef.current]);
  }, []);

  const updateStage = useCallback((id: string, patch: Partial<PipelineStage>) => {
    setState(prev => ({
      ...prev,
      stages: prev.stages.map(s => s.id === id ? { ...s, ...patch } : s),
    }));
  }, []);

  const compile = useCallback(async (prompt: string) => {
    logsRef.current = [];
    setGlobalLogs([]);

    setState(prev => ({
      ...prev,
      phase: 'compiling',
      stages: initialStages(),
      output: null,
      metrics: null,
      error: null,
    }));

    pushLog(makeLog('stage', '▶  Compiler initialized'));
    pushLog(makeLog('info', `Input: "${prompt.slice(0, 80)}${prompt.length > 80 ? '…' : ''}"`));
    pushLog(makeLog('debug', 'Launching multi-stage generation pipeline'));

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let msg: { event: string; data: unknown };
          try { msg = JSON.parse(raw); } catch { continue; }

          const { event, data } = msg;
          const d = data as Record<string, unknown>;

          if (event === 'stage_start') {
            const stageId = d.id as string;
            const def = STAGE_DEFS.find(x => x.id === stageId);
            pushLog(makeLog('stage', `[${(def?.index ?? 0) + 1}/${STAGE_DEFS.length}] ${d.label} — running`));
            updateStage(stageId, { status: 'running' });
          }

          if (event === 'stage_complete') {
            const stageId = d.id as string;
            const def = STAGE_DEFS.find(x => x.id === stageId);
            const label = (def?.label || (d.label as string) || stageId) as string;
            const detailParts = [d.latency_ms ? `${d.latency_ms}ms` : null, d.tokens ? `${d.tokens} tokens` : null]
              .filter(Boolean)
              .join(' · ');
            pushLog(makeLog('success', `✓  ${label} completed`, detailParts || undefined));
            updateStage(stageId, {
              status: 'success',
              durationMs: d.latency_ms as number,
              tokens: d.tokens as number,
              output: d.output,
            });
          }

          if (event === 'log') {
            const level = (d.level as string) || 'info';
            const message = (d.message as string) || '';
            const mappedLevel =
              level === 'warning' ? 'warn' :
              level === 'success' ? 'success' :
              level === 'error' ? 'error' :
              'info';
            if (message) {
              pushLog(makeLog(mappedLevel as LogEntry['level'], message));
            }
          }

          if (event === 'complete') {
            const output = d.output as CompilerOutput;
            const metrics = d.metrics as CompileMetrics;

            pushLog(makeLog('stage', '── Validation pass complete ──'));
            const issues = output.validation?.issues || [];
            if (issues.length === 0) {
              pushLog(makeLog('success', '✓  All cross-layer checks passed'));
            } else {
              issues.forEach((issue: { severity: string; layer: string; field: string; issue: string; repaired: boolean }) => {
                const sev = issue.severity;
                const level = sev === 'error' ? 'error' : sev === 'warning' ? 'warn' : 'success';
                pushLog(makeLog(
                  level,
                  `${issue.severity.toUpperCase()} [${issue.layer}] ${issue.field}: ${issue.issue}`,
                  issue.repaired ? `Repaired: ${issue.issue}` : undefined
                ));
              });
            }

            pushLog(makeLog('stage', `▶▶ Compilation complete`));
            pushLog(makeLog('success', `Total: ${metrics.total_latency_ms}ms · ${metrics.total_tokens} tokens · $${metrics.cost_usd.toFixed(5)}`));
            pushLog(makeLog(
              output.execution_ready ? 'success' : 'warn',
              output.execution_ready ? '✓  Output is EXECUTION READY' : '⚠  Output requires manual review'
            ));

            setState(prev => ({
              ...prev,
              phase: 'done',
              output,
              metrics,
            }));
          }

          if (event === 'error') {
            const msg = d.message as string;
            pushLog(makeLog('error', `✗  Pipeline error: ${msg}`));
            setState(prev => ({ ...prev, phase: 'error', error: msg }));
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      pushLog(makeLog('error', `✗  Fatal: ${msg}`));
      setState(prev => ({ ...prev, phase: 'error', error: msg }));
    }
  }, [pushLog, updateStage]);

  const reset = useCallback(() => {
    logsRef.current = [];
    setGlobalLogs([]);
    setState({
      phase: 'idle',
      stages: initialStages(),
      output: null,
      metrics: null,
      error: null,
      activeTab: 'overview',
    });
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  return { state, globalLogs, compile, reset, setActiveTab };
}