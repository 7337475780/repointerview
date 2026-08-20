import { useParams } from 'react-router-dom';
import { BarChart3, TrendingUp, ShieldCheck, Database, Server, Cpu, Layers } from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import { useProject } from '../../context/ProjectContext';

const DOMAIN_BREAKDOWN = [
  { domain: 'System Architecture', score: 82, icon: Layers, status: 'strong', questions: 6 },
  { domain: 'Database & Data Modeling', score: 48, icon: Database, status: 'weak', questions: 5 },
  { domain: 'Security & Auth', score: 55, icon: ShieldCheck, status: 'moderate', questions: 4 },
  { domain: 'API Design & Protocols', score: 78, icon: Server, status: 'strong', questions: 6 },
  { domain: 'Caching & Performance', score: 62, icon: Cpu, status: 'moderate', questions: 4 },
];

const ProjectAnalytics = () => {
  const { id } = useParams();
  const { projects } = useProject();

  const project = projects.find(p => p.id === id) || projects[0];

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
              Readiness distribution and knowledge evaluation across engineering domains.
            </p>
          </div>
          <Badge variant="success" size="sm">
            Readiness Index: {project.analysisScore}%
          </Badge>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Domain Breakdown Cards */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
              Domain Competency Breakdown
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {DOMAIN_BREAKDOWN.map(item => {
                const Icon = item.icon;
                const isWeak = item.status === 'weak';
                const isStrong = item.status === 'strong';
                return (
                  <div
                    key={item.domain}
                    className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-accent">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{item.domain}</p>
                          <p className="text-2xs text-text-tertiary">{item.questions} predicted questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={isStrong ? 'success' : isWeak ? 'error' : 'warning'} size="xs">
                          {isStrong ? 'Strong' : isWeak ? 'Needs Attention' : 'Moderate'}
                        </Badge>
                        <span className="font-mono text-base font-bold text-text-primary">{item.score}%</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.score}%`,
                          background: isStrong
                            ? 'var(--color-success)'
                            : isWeak
                            ? 'var(--color-error)'
                            : 'var(--color-warning)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations Side Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Recommended Focus
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Prioritize practicing database transaction isolation and query optimization tradeoffs before interview rounds.
              </p>
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                <span className="text-2xs font-mono text-text-tertiary">Target questions:</span>
                <span className="text-xs font-medium text-accent">↳ PostgreSQL vs MongoDB architectural tradeoffs</span>
                <span className="text-xs font-medium text-accent">↳ Redis caching invalidation jitter strategies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
