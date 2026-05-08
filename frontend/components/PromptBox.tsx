'use client';
import { useState, useRef, useEffect } from 'react';

interface PromptBoxProps {
  onCompile: (prompt: string) => void;
  onReset: () => void;
  isCompiling: boolean;
  isDone: boolean;
}

const EXAMPLE_PROMPTS = [
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
  "Create a project management tool like Linear with teams, sprints, issues, priorities, and GitHub integration.",
  "SaaS invoicing app with client management, recurring billing, PDF exports, and Stripe payments.",
  "E-commerce platform with product catalog, inventory, cart, checkout, order tracking, and seller dashboard.",
];

export default function PromptBox({ onCompile, onReset, isCompiling, isDone }: PromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setCharCount(e.target.value.length);
    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  };

  const handleSubmit = () => {
    if (prompt.trim() && !isCompiling) {
      onCompile(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (!isCompiling && !isDone) {
      textareaRef.current?.focus();
    }
  }, [isCompiling, isDone]);

  return (
    <div className="prompt-box-wrapper">
      {/* Header label */}
      <div className="prompt-header">
        <span className="prompt-label">
          <span className="prompt-arrow">▸</span>
          INPUT
        </span>
        <div className="prompt-meta">
          <span className="prompt-shortcut">⌘↵ to compile</span>
          {charCount > 0 && (
            <span className="prompt-chars">{charCount} chars</span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="prompt-field-wrapper">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the application you want to build…"
          className="prompt-textarea"
          disabled={isCompiling}
          rows={3}
        />
        {!prompt && !isCompiling && (
          <div className="prompt-placeholder-hint">
            <span>e.g., "Build a CRM with login, contacts, dashboard, role-based access..."</span>
          </div>
        )}
      </div>

      {/* Examples */}
      {!isCompiling && !isDone && !prompt && (
        <div className="prompt-examples">
          <span className="examples-label">EXAMPLES</span>
          <div className="examples-list">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                className="example-btn"
                onClick={() => {
                  setPrompt(ex);
                  setCharCount(ex.length);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
                  }
                }}
              >
                <span className="example-idx">0{i + 1}</span>
                <span className="example-text">{ex}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="prompt-actions">
        {isDone && (
          <button className="btn-ghost" onClick={onReset}>
            ↺ RESET
          </button>
        )}
        <div className="prompt-actions-right">
          {isCompiling ? (
            <div className="compiling-indicator">
              <span className="status-dot running" />
              <span className="compiling-text">COMPILING</span>
              <span className="compiling-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          ) : (
            <button
              className="btn-primary compile-btn"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isDone}
            >
              <span className="compile-icon">⚡</span>
              COMPILE
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .prompt-box-wrapper {
          background: var(--bg-panel);
          border: 1px solid var(--border-dim);
          border-radius: 6px;
          overflow: hidden;
        }

        .prompt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
        }

        .prompt-label {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .prompt-arrow {
          color: var(--amber);
        }

        .prompt-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .prompt-shortcut, .prompt-chars {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-dim);
          letter-spacing: 0.04em;
        }

        .prompt-field-wrapper {
          position: relative;
        }

        .prompt-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.7;
          padding: 16px 20px;
          resize: none;
          min-height: 90px;
          transition: background 0.15s;
        }

        .prompt-textarea::placeholder {
          color: var(--text-dim);
        }

        .prompt-textarea:focus {
          background: rgba(245, 158, 10, 0.002);
        }

        .prompt-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .prompt-placeholder-hint {
          position: absolute;
          bottom: 12px;
          left: 20px;
          right: 20px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-dim);
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prompt-examples {
          border-top: 1px solid var(--border-subtle);
          padding: 12px 16px;
        }

        .examples-label {
          font-family: var(--font-mono);
          font-size: 13px;
          letter-spacing: 0.14em;
          color: var(--text-dim);
          display: block;
          margin-bottom: 8px;
        }

        .examples-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .example-btn {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 7px 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          width: 100%;
        }

        .example-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-subtle);
        }

        .example-idx {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--amber-dim);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .example-text {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .prompt-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
        }

        .prompt-actions-right {
          margin-left: auto;
        }

        .compiling-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compiling-text {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--amber);
        }

        .compiling-dots {
          font-family: var(--font-mono);
          color: var(--amber);
          font-size: 16px;
          line-height: 1;
        }

        .compiling-dots span {
          animation: blink 1.2s step-end infinite;
          opacity: 0;
        }
        .compiling-dots span:nth-child(1) { animation-delay: 0.0s; }
        .compiling-dots span:nth-child(2) { animation-delay: 0.2s; }
        .compiling-dots span:nth-child(3) { animation-delay: 0.4s; }

        .compile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          font-size: 11px;
        }

        .compile-icon {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}