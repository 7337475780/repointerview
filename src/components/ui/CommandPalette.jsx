import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GitBranch, MessageSquare, Play, Network, BarChart2, Moon, Sun, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CommandPalette.css';

const COMMANDS = [
  { id: 'search', label: 'Search questions', icon: <Search size={14} />, category: 'Search', shortcut: '/', path: null, action: 'search' },
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
            className="cmd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="cmd-palette"
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.0, 0, 0.2, 1] }}
          >
            <div className="cmd-search">
              <Search className="cmd-search__icon" size={15} aria-hidden="true" />
              <input
                ref={inputRef}
                className="cmd-search__input"
                type="text"
                placeholder="Search commands..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Command search"
                aria-autocomplete="list"
                aria-expanded="true"
              />
              {query && (
                <button className="cmd-search__clear" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
              <kbd className="cmd-search__esc">Esc</kbd>
            </div>

            <div className="cmd-results" ref={listRef} role="listbox">
              {filtered.length === 0 && (
                <div className="cmd-empty">No commands match <strong>{query}</strong></div>
              )}
              {categories.map(cat => {
                const catCommands = filtered.filter(c => c.category === cat);
                const startIdx = filtered.indexOf(catCommands[0]);
                return (
                  <div key={cat} className="cmd-group">
                    <div className="cmd-group__label">{cat}</div>
                    {catCommands.map((cmd, i) => {
                      const idx = startIdx + i;
                      return (
                        <button
                          key={cmd.id}
                          data-idx={idx}
                          className={`cmd-item ${selected === idx ? 'cmd-item--selected' : ''}`}
                          role="option"
                          aria-selected={selected === idx}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setSelected(idx)}
                        >
                          <span className="cmd-item__icon" aria-hidden="true">{cmd.icon}</span>
                          <span className="cmd-item__label">{cmd.label}</span>
                          {cmd.shortcut && <kbd className="cmd-item__shortcut">{cmd.shortcut}</kbd>}
                          <span className="cmd-item__arrow" aria-hidden="true">↵</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="cmd-footer">
              <span className="cmd-footer__hint"><kbd>↑↓</kbd> Navigate</span>
              <span className="cmd-footer__hint"><kbd>↵</kbd> Select</span>
              <span className="cmd-footer__hint"><kbd>Esc</kbd> Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
