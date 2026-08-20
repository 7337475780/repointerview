import { NavLink } from 'react-router-dom';
import {
  FileCode2,
  Network,
  HelpCircle,
  Code2,
  PlaySquare,
  BarChart2,
} from 'lucide-react';

const ProjectNav = ({ projectId }) => {
  const tabs = [
    { path: `/projects/${projectId}`, label: 'Overview', icon: FileCode2, end: true },
    { path: `/projects/${projectId}/architecture`, label: 'Architecture', icon: Network },
    { path: `/projects/${projectId}/questions`, label: 'Questions', icon: HelpCircle },
    { path: `/projects/${projectId}/evidence`, label: 'Evidence', icon: Code2 },
    { path: `/projects/${projectId}/mock`, label: 'Mock Interview', icon: PlaySquare },
    { path: `/projects/${projectId}/analytics`, label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="border-b border-border-subtle bg-bg-surface/40 px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
        {tabs.map(({ path, label, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-bg-elevated text-accent font-semibold border border-border-subtle shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-elevated/40'
              }`
            }
          >
            <Icon size={14} className="flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default ProjectNav;
