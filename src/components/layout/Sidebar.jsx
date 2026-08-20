import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  HelpCircle,
  PlaySquare,
  BarChart3,
  Settings as SettingsIcon,
  ChevronDown,
  Plus,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import Badge from '../ui/Badge';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderGit2 },
  { path: '/questions', label: 'Questions', icon: HelpCircle },
  { path: '/interview', label: 'Mock Interviews', icon: PlaySquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { projects, activeProject, setActiveProjectId } = useProject();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-bg-surface border-r border-border flex flex-col z-[301] transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Application sidebar"
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-border-subtle flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-text-primary group"
            aria-label="RepoInterview AI home"
            onClick={onCloseMobile}
          >
            <div
              className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-text-primary shadow-xs transition-transform group-hover:scale-105"
              aria-hidden="true"
            >
              <GitBranch size={16} />
            </div>
            <span className="font-semibold text-sm tracking-tight">RepoInterview</span>
            <span className="text-2xs font-bold uppercase tracking-wider bg-bg-elevated text-text-tertiary px-1.5 py-0.5 rounded border border-border-subtle">
              AI
            </span>
          </Link>
        </div>

        {/* Project Switcher Dropdown */}
        <div className="p-3 border-b border-border-subtle relative">
          <button
            type="button"
            className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-bg-elevated hover:bg-bg-overlay border border-border transition-colors text-left cursor-pointer"
            onClick={() => setSwitcherOpen(s => !s)}
            aria-expanded={switcherOpen}
            aria-label="Switch active repository"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-5 h-5 rounded-md bg-accent-subtle border border-accent-border flex items-center justify-center text-accent flex-shrink-0">
                <GitBranch size={12} />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {activeProject ? activeProject.repository.fullName : 'No repository'}
                </p>
                <p className="text-2xs text-text-disabled font-mono">
                  {activeProject && activeProject.status === 'ready' ? 'Ready for interview' : 'Not analyzed'}
                </p>
              </div>
            </div>
            <ChevronDown size={14} className="text-text-tertiary flex-shrink-0" />
          </button>

          {switcherOpen && (
            <div className="absolute top-full left-3 right-3 mt-1.5 bg-bg-surface border border-border rounded-xl shadow-lg p-1.5 z-50 flex flex-col gap-1">
              <p className="text-2xs font-semibold uppercase tracking-widest text-text-disabled px-2.5 py-1">
                Repositories
              </p>
              {projects.map(p => (
                <button
                  key={p.id}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    p.id === activeProject?.id
                      ? 'bg-accent-subtle text-accent font-semibold'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setSwitcherOpen(false);
                    navigate(`/projects/${p.id}`);
                    onCloseMobile?.();
                  }}
                >
                  <span className="truncate">{p.repository.fullName}</span>
                  {p.status === 'ready' && <Badge variant="success" size="xs">Ready</Badge>}
                </button>
              ))}
              <div className="h-px bg-border-subtle my-0.5" />
              <Link
                to="/projects/new"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-accent hover:bg-accent-subtle transition-colors"
                onClick={() => {
                  setSwitcherOpen(false);
                  onCloseMobile?.();
                }}
              >
                <Plus size={13} />
                <span>Connect new repository</span>
              </Link>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto" aria-label="Main menu">
          <p className="text-2xs font-semibold uppercase tracking-widest text-text-disabled px-3 py-1">
            Workspace
          </p>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-bg-elevated text-accent font-semibold border border-border-subtle shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer / Status Area */}
        <div className="p-4 border-t border-border-subtle bg-bg-surface flex flex-col gap-2">
          <div className="flex items-center justify-between text-2xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Repo Intelligence</span>
            </span>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
