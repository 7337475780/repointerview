import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GitBranch, Plus, PlaySquare, ArrowRight, Sparkles, Shield, BarChart3, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useProject } from '../context/ProjectContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, activeProject } = useProject();

  const hasProjects = projects.length > 0;
  const isAnalyzed = Boolean(activeProject?.intelligence) || activeProject?.status === 'ANALYZED' || activeProject?.status === 'READY';

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border-subtle pb-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">RepoInterview Workspace</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Good morning.
          </h1>
          <p className="text-base text-text-secondary mt-1">
            Ready to defend your project?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/projects/new">
            <Button variant="primary" size="md" leftIcon={<Plus size={14} />}>
              Analyze Repository
            </Button>
          </Link>
        </div>
      </div>

      {!hasProjects ? (
        /* Empty Workspace Experience */
        <div className="flex flex-col gap-8">
          <EmptyState
            icon={<GitBranch size={24} className="text-accent" />}
            title="Your project intelligence starts here."
            description="Connect a GitHub repository and RepoInterview will analyze your codebase and prepare you for the questions that matter."
            actionLabel="Connect Repository"
            onAction={() => navigate('/projects/new')}
            className="py-16 max-w-xl"
          />

          {/* Placeholders for Readiness, Weak Areas & Top Questions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent">
                    <Shield size={16} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Interview Readiness
                  </span>
                </div>
                <span className="text-2xs font-mono text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle">
                  Pending
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your interview readiness will be calculated after we understand your project.
              </p>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent">
                    <BarChart3 size={16} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Areas to Strengthen
                  </span>
                </div>
                <span className="text-2xs font-mono text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle">
                  Pending
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Topic competency breakdown will highlight architecture and tradeoff weak areas.
              </p>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent">
                    <HelpCircle size={16} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Predicted Questions
                  </span>
                </div>
                <span className="text-2xs font-mono text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle">
                  Pending
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Code-calibrated interview questions will be generated after AST analysis.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Connected Project Overview */
        <div className="flex flex-col gap-8">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent flex-shrink-0">
                <GitBranch size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-lg font-bold text-text-primary">
                    {activeProject.repository.fullName}
                  </h2>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {isAnalyzed
                    ? 'Repository analyzed. Deterministic intelligence profile ready.'
                    : 'Repository connected. Analysis queued.'}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => navigate(`/projects/${activeProject.id}`)}
            >
              Open Project Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Interview Readiness
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isAnalyzed
                  ? 'Repository analyzed. Readiness scoring activates in Phase 4/5.'
                  : 'Your interview readiness will be calculated after we understand your project.'}
              </p>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Questions Bank
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isAnalyzed
                  ? 'Phase 3 analysis complete. Question generation scheduled for Phase 4.'
                  : 'No project-specific questions yet.'}
              </p>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Architecture & Evidence
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isAnalyzed
                  ? 'Deterministic topology nodes and code evidence trails ready to inspect.'
                  : 'Interactive simulation ready to test technical defense.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
