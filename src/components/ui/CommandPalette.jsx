import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GitBranch, MessageSquare, Play, Network, BarChart2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { id: 'search', label: 'Search questions', icon: <Search size={14} />, category: 'Search', shortcut: '/', path: '/questions' },
  { id: 'start-interview', label: 'Start mock interview', icon: <Play size={14} />, category: 'Interview', shortcut: null, path: '/interview' },
  { id: 'analyze', label: 'Analyze repository', icon: <GitBranch size={14} />, category: 'Repository', shortcut: null, path: '/dashboard' },
  { id: 'questions', label: 'Browse all questions', icon: <MessageSquare size={14} />, category: 'Questions', shortcut: null, path: '/questions' },
  { id: 'architecture', label: 'Open architecture view', icon: <Network size={14} />, category: 'Repository', shortcut: null, path: '/architecture' },
  { id: 'analytics', label: 'View analytics', icon: <BarChart2 size={14} />, category: 'Dashboard', shortcut: null, path: '/dashboard' },
  { id: 'dashboard', label: 'Go to dashboard', icon: <BarChart2 size={14} />, category: 'Navigate', shortcut: null, path: '/dashboard' },
];

const CommandPalette = ({ open, onClose, onToggleTheme, theme }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const execute = useCallback((cmd) => {
    if (cmd.path) navigate(cmd.path);
    if (cmd.id === 'toggle-theme') onToggleTheme?.();
    onClose();
  }, [navigate, onClose, onToggleTheme]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault();
        execute(filtered[selected]);
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, filtered, selected, execute, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector(`[data-idx="${selected}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const categories = [...new Set(filtered.map(c => c.category))];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[401] flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-lg bg-bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col pointer-events-auto"
              role="dialog"
              aria-label="Command palette"
              aria-modal="true"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.0, 0, 0.2, 1] }}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-bg-surface">
                <Search className="text-text-tertiary flex-shrink-0" size={15} aria-hidden="true" />
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent border-none outline-none font-sans text-sm text-text-primary placeholder:text-text-disabled"
                  type="text"
                  placeholder="Search commands..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  aria-label="Command search"
                  aria-autocomplete="list"
                  aria-expanded="true"
                />
                {query && (
                  <button
                    className="text-text-disabled hover:text-text-primary p-1 rounded transition-colors"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
                <kbd className="font-mono text-2xs bg-bg-elevated text-text-tertiary px-1.5 py-0.5 rounded border border-border-subtle">
                  Esc
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-2" ref={listRef} role="listbox">
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                    No commands match <strong>{query}</strong>
                  </div>
                )}
                {categories.map(cat => {
                  const catCommands = filtered.filter(c => c.category === cat);
                  const startIdx = filtered.indexOf(catCommands[0]);
                  return (
                    <div key={cat} className="flex flex-col gap-0.5">
                      <div className="text-2xs font-semibold uppercase tracking-widest text-text-disabled px-3 py-1">
                        {cat}
                      </div>
                      {catCommands.map((cmd, i) => {
                        const idx = startIdx + i;
                        const isSel = selected === idx;
                        return (
                          <button
                            key={cmd.id}
                            data-idx={idx}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                              isSel
                                ? 'bg-accent/15 text-accent font-medium'
                                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                            }`}
                            role="option"
                            aria-selected={isSel}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setSelected(idx)}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={isSel ? 'text-accent' : 'text-text-tertiary'} aria-hidden="true">
                                {cmd.icon}
                              </span>
                              <span>{cmd.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {cmd.shortcut && (
                                <kbd className="font-mono text-2xs bg-bg-elevated text-text-tertiary px-1.5 py-0.5 rounded border border-border-subtle">
                                  {cmd.shortcut}
                                </kbd>
                              )}
                              {isSel && (
                                <span className="text-xs text-accent font-mono" aria-hidden="true">
                                  ↵
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 px-4 py-2.5 bg-bg-elevated border-t border-border-subtle text-xs text-text-tertiary">
                <span className="inline-flex items-center gap-1">
                  <kbd className="font-mono text-2xs bg-bg-surface px-1 py-0.5 rounded border border-border-subtle">↑↓</kbd> Navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="font-mono text-2xs bg-bg-surface px-1 py-0.5 rounded border border-border-subtle">↵</kbd> Select
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="font-mono text-2xs bg-bg-surface px-1 py-0.5 rounded border border-border-subtle">Esc</kbd> Close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
