import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitBranch, Sun, Moon, Command } from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';

const Nav = ({ theme, onToggleTheme, onOpenPalette }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-[200] h-14 w-full transition-all duration-200 border-b ${
        scrolled
          ? 'bg-bg-base/85 backdrop-blur-md border-border shadow-sm'
          : 'bg-transparent border-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-text-primary group" aria-label="RepoInterview AI home">
          <div
            className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-text-primary shadow-xs transition-transform duration-150 group-hover:scale-105"
            aria-hidden="true"
          >
            <GitBranch size={16} />
          </div>
          <span className="font-semibold text-sm tracking-tight text-text-primary">RepoInterview</span>
          <span className="text-2xs font-bold uppercase tracking-wider bg-bg-elevated text-text-tertiary px-1.5 py-0.5 rounded border border-border-subtle">
            AI
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 bg-bg-surface/80 border border-border-subtle p-1 rounded-full" aria-label="Main navigation">
          {[
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/questions', label: 'Questions' },
            { path: '/architecture', label: 'Architecture' },
            { path: '/interview', label: 'Interview' },
          ].map(({ path, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
                  active
                    ? 'bg-bg-elevated text-text-primary font-medium shadow-xs border border-border-subtle'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Tooltip content="Command palette" shortcut="⌘K" placement="bottom">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-colors"
              onClick={onOpenPalette}
              aria-label="Open command palette"
              id="cmd-palette-trigger"
            >
              <Command size={15} />
            </button>
          </Tooltip>

          <Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'} placement="bottom">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-colors"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </Tooltip>

          <div className="h-4 w-px bg-border-subtle mx-1" aria-hidden="true" />

          <Link to="/interview">
            <Button variant="primary" size="sm">
              Start interview
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Nav;
