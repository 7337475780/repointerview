import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Command, Plus, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { useProject } from '../../context/ProjectContext';

const AppHeader = ({ onOpenSidebar, theme, onToggleTheme, onOpenPalette }) => {
  const location = useLocation();
  const { activeProject } = useProject();

  // Generate breadcrumbs from route
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return [{ label: 'Dashboard', path: '/dashboard' }];
    }
    if (segments[0] === 'projects') {
      if (segments[1] === 'new') {
        return [
          { label: 'Projects', path: '/projects' },
          { label: 'New Repository', path: '/projects/new' },
        ];
      }
      if (segments[1]) {
        const sub = segments[2] ? segments[2].charAt(0).toUpperCase() + segments[2].slice(1) : 'Overview';
        return [
          { label: 'Projects', path: '/projects' },
          { label: activeProject?.repository.name || segments[1], path: `/projects/${segments[1]}` },
          ...(segments[2] ? [{ label: sub, path: location.pathname }] : []),
        ];
      }
      return [{ label: 'Projects', path: '/projects' }];
    }
    if (segments[0] === 'questions') {
      return [
        { label: 'Questions', path: '/questions' },
        ...(segments[1] ? [{ label: 'Question Detail', path: location.pathname }] : []),
      ];
    }
    if (segments[0] === 'interview') {
      return [{ label: 'Mock Interview', path: '/interview' }];
    }
    if (segments[0] === 'analytics') {
      return [{ label: 'Analytics', path: '/analytics' }];
    }
    if (segments[0] === 'settings') {
      return [{ label: 'Settings', path: '/settings' }];
    }
    return [{ label: segments[0].charAt(0).toUpperCase() + segments[0].slice(1), path: location.pathname }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-[200] h-14 bg-bg-base/85 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-6">
      {/* Left: Mobile toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated cursor-pointer"
          onClick={onOpenSidebar}
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-text-tertiary" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight size={12} className="text-text-disabled" aria-hidden="true" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-text-primary">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="hover:text-text-primary transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Search / Palette trigger, Theme Toggle, New Project CTA */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 bg-bg-elevated hover:bg-bg-overlay border border-border px-3 py-1.5 rounded-lg text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          onClick={onOpenPalette}
          aria-label="Quick search and command menu"
        >
          <Search size={13} />
          <span>Search or jump to...</span>
          <kbd className="font-mono text-2xs bg-bg-surface text-text-disabled px-1.5 py-0.5 rounded border border-border-subtle ml-2">
            ⌘K
          </kbd>
        </button>

        <Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'} placement="bottom">
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-border-subtle mx-1" aria-hidden="true" />

        <Link to="/projects/new">
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />}>
            <span className="hidden sm:inline">Connect</span> Repo
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
