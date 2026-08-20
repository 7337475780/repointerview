import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import './CodeBlock.css';

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
    <div className="codeblock">
      <div className="codeblock__header">
        <div className="codeblock__breadcrumb">
          {filename && (
            <>
              <span className="codeblock__filename">{filename}</span>
              <span className="codeblock__lang">{language}</span>
            </>
          )}
          {!filename && <span className="codeblock__lang">{language}</span>}
        </div>
        <div className="codeblock__actions">
          {collapsible && (
            <button
              className="codeblock__action-btn"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expand code' : 'Collapse code'}
            >
              {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              <span>{collapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}
          <button
            className="codeblock__action-btn"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="codeblock__body">
          <pre className="codeblock__pre">
            <code className="codeblock__code">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`codeblock__line ${highlightLines.includes(idx + 1) ? 'codeblock__line--highlight' : ''}`}
                >
                  {lineNumbers && (
                    <span className="codeblock__lineno" aria-hidden="true">{idx + 1}</span>
                  )}
                  <span className="codeblock__content">{line || '\u200B'}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
