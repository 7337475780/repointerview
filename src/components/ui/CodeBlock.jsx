import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const CodeBlock = ({
  code,
  language = 'typescript',
  filename,
  highlightLines = [],
  collapsible = false,
  defaultCollapsed = false,
  lineNumbers = true,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const lines = code.split('\n');

  return (
    <div className="bg-code-bg border border-code-border rounded-xl overflow-hidden font-mono text-xs my-3 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-surface border-b border-code-border select-none">
        <div className="flex items-center gap-2">
          {filename && (
            <>
              <span className="text-text-primary font-medium">{filename}</span>
              <span className="text-2xs text-text-disabled uppercase tracking-wider">{language}</span>
            </>
          )}
          {!filename && <span className="text-2xs text-text-disabled uppercase tracking-wider">{language}</span>}
        </div>
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary px-2 py-1 rounded transition-colors"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expand code' : 'Collapse code'}
            >
              {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              <span>{collapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}
          <button
            className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary px-2 py-1 rounded transition-colors"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="overflow-x-auto p-3 text-text-secondary leading-relaxed">
          <pre className="m-0 font-mono">
            <code>
              {lines.map((line, idx) => {
                const isHighlight = highlightLines.includes(idx + 1);
                return (
                  <div
                    key={idx}
                    className={`flex items-start px-2 py-0.5 rounded -mx-2 ${
                      isHighlight
                        ? 'bg-accent/10 text-text-primary border-l-2 border-accent pl-1.5'
                        : 'border-l-2 border-transparent'
                    }`}
                  >
                    {lineNumbers && (
                      <span className="w-8 text-right pr-4 text-text-disabled select-none flex-shrink-0" aria-hidden="true">
                        {idx + 1}
                      </span>
                    )}
                    <span className="flex-1 whitespace-pre">{line || '\u200B'}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
