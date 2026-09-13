import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ShieldCheck,
  Database,
  Server,
  Cpu,
  Layers,
  Sparkles,
  Network,
  Code2,
  FileCode2,
} from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const UPCOMING_METRICS = [
  { domain: 'System Architecture & Modularity', icon: Layers, description: 'Evaluation of layered boundaries, dependency inversion, and directory roles' },
  { domain: 'Database & Data Modeling', icon: Database, description: 'Assessment of schema design, relational modeling, and query tradeoffs' },
  { domain: 'Security & Authentication', icon: ShieldCheck, description: 'Coverage of auth strategies, credential isolation, and sensitive paths' },
  { domain: 'API Design & Protocols', icon: Server, description: 'Analysis of REST routes, input validation, and HTTP status handling' },
  { domain: 'Performance & Optimization', icon: Cpu, description: 'Inspection of caching layers, asset pipelines, and potential bottlenecks' },
];

const ProjectAnalytics = () => {
  const { id } = useParams();
  const { projects, activeProject } = useProject();
  const navigate = useNavigate();

  const project = (id ? projects.find(p => p.id === id) : null) || activeProject || projects[0] || null;

  if (!project) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <EmptyState
          title="Project not found"
          description="The requested repository project does not exist in your workspace."
          actionLabel="View all projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  const intelligence = project.intelligence;
  const isAnalyzed = Boolean(intelligence) || project.status === 'ANALYZED' || project.status === 'READY';

  if (isAnalyzed) {
    const techCount = intelligence?.technologies?.length || project.techStack?.length || 0;
    const apiRoutesCount = intelligence?.apiSurface?.endpointsCount || project.stats?.apiRoutes || 0;
    const dbModelsCount = intelligence?.database?.models?.length || project.stats?.dbTables || 0;
    const filesCount = project.stats?.totalFiles || intelligence?.importantFiles?.length || 0;

    return (
      <div className="flex flex-col min-h-full">
        <ProjectNav projectId={project.id} />

        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Knowledge Radar</p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Interview analytics</h1>
              <p className="text-sm text-text-secondary mt-1">
                Readiness distribution and knowledge evaluation for <code className="text-accent font-mono text-xs">{project.repository.fullName}</code>
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              Activates in Phase 4 & 5
            </Badge>
          </div>

          {/* Phase 4/5 Readiness Notice */}
          <div className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-accent flex-shrink-0">
                <BarChart3 size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-text-primary">Interview Readiness Radar</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Analytics will become available once interview questions (Phase 4) and mock interview practice sessions (Phase 5) are generated.
                </p>
              </div>
            </div>

            {/* Ingested Baseline Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Scanned Files
                </span>
                <span className="font-mono text-xl font-bold text-text-primary">
                  {filesCount}
                </span>
              </div>

              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Technologies
                </span>
                <span className="font-mono text-xl font-bold text-accent">
                  {techCount}
                </span>
              </div>

              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                  API Routes
                </span>
                <span className="font-mono text-xl font-bold text-text-primary">
                  {apiRoutesCount}
                </span>
              </div>

              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Database Models
                </span>
                <span className="font-mono text-xl font-bold text-text-primary">
                  {dbModelsCount}
                </span>
              </div>
            </div>

            {/* Upcoming Competency Framework Preview */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                Targeted Competency Domains (Phase 4 & 5)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {UPCOMING_METRICS.map(m => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.domain}
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-text-primary">{m.domain}</span>
                        <span className="text-2xs text-text-tertiary">{m.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FileCode2 size={14} />}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                View Overview
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Network size={14} />}
                onClick={() => navigate(`/projects/${project.id}/architecture`)}
              >
                View Architecture
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Code2 size={14} />}
                onClick={() => navigate(`/projects/${project.id}/evidence`)}
              >
                Inspect Evidence
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <ProjectNav projectId={project.id} />
      <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
        <EmptyState
          icon={<BarChart3 size={24} className="text-accent" />}
          title="Repository analysis is not available yet."
          description="Connect and analyze your repository to unlock codebase intelligence and interview metrics."
          actionLabel="Connect Repository"
          onAction={() => navigate('/projects/new')}
          className="py-16 max-w-xl"
        />
      </div>
    </div>
  );
};

export default ProjectAnalytics;
