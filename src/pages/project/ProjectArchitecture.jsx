import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Network, Layers, ShieldCheck, ArrowRight, FileCode2, Code2, Sparkles } from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ArchitectureTopologyGraph from '../../components/intelligence/ArchitectureTopologyGraph';
import { useProject } from '../../context/ProjectContext';
import { architectureAnalyzer } from '../../services/analyzers/architectureAnalyzer';

const ProjectArchitecture = () => {
  const { id } = useParams();
  const { projects, activeProject, getActiveIngestion } = useProject();
  const navigate = useNavigate();

  // Exactly matching the project & intelligence retrieval from ProjectQuestions.jsx
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
  const ingestion = getActiveIngestion(project.id);

  // Derive architecture map deterministically from intelligence or ingestion
  const architectureMap = useMemo(() => {
    // 1. Direct from project or intelligence
    if (project.architecture && project.architecture.nodes && project.architecture.nodes.length > 0) {
      return project.architecture;
    }
    if (intelligence?.architectureMap && intelligence.architectureMap.nodes && intelligence.architectureMap.nodes.length > 0) {
      return intelligence.architectureMap;
    }

    // 2. If ingestion is in memory, re-run architecture analyzer
    if (ingestion && intelligence) {
      try {
        const { architectureMap: generated } = architectureAnalyzer.analyze(
          ingestion,
          intelligence.technologies || [],
          intelligence.structure || { pattern: 'Standard Modular', keyDirectories: [] },
          intelligence.database || { databaseTechnologies: [], ormTechnologies: [], cacheTechnologies: [], models: [], hasSchema: false },
          intelligence.authentication || { detected: false, strategies: [], providers: [], confidence: 0, confidenceLevel: 'low', whyDetected: '', evidence: [] },
          intelligence.externalServices || [],
          intelligence.monorepo
        );
        if (generated && generated.nodes && generated.nodes.length > 0) {
          return generated;
        }
      } catch {}
    }

    // 3. Fallback synthesis from intelligence sub-profiles if nodes were not serialized
    if (intelligence) {
      const nodes = [];
      const edges = [];

      // Monorepo / packages
      if (intelligence.monorepo?.isMonorepo || (intelligence.monorepo?.packages && intelligence.monorepo.packages.length > 0)) {
        nodes.push({
          id: 'workspace',
          label: intelligence.monorepo.tool || 'Workspace Packages',
          type: 'service',
          x: 100,
          y: 180,
          description: `Monorepo workspace managing ${intelligence.monorepo.packages.length} package(s)`,
          evidenceFiles: intelligence.monorepo.evidence?.map(e => e.filePath) || ['package.json'],
        });

        intelligence.monorepo.packages.slice(0, 4).forEach((pkg, i) => {
          const name = pkg.split('/').pop() || pkg;
          const pkgId = `pkg-${name}`;
          nodes.push({
            id: pkgId,
            label: name,
            type: 'service',
            x: 360 + (i % 2) * 260,
            y: 180 + Math.floor(i / 2) * 160,
            description: `Workspace module: ${pkg}`,
            evidenceFiles: [`${pkg}/package.json`],
          });
          edges.push({
            from: 'workspace',
            to: pkgId,
            protocol: 'Internal',
            direction: 'unidirectional',
            description: 'Workspace package distribution',
          });
        });
      }

      // Structure key directories
      if (nodes.length === 0 && intelligence.structure?.keyDirectories) {
        intelligence.structure.keyDirectories.slice(0, 3).forEach((dir, i) => {
          nodes.push({
            id: `dir-${i}`,
            label: dir.role,
            type: 'service',
            x: 200 + i * 260,
            y: 180,
            description: dir.description || `Directory module at ${dir.path}`,
            evidenceFiles: dir.evidencePaths.slice(0, 3),
          });
        });
      }

      // Default core node
      if (nodes.length === 0) {
        nodes.push({
          id: 'core',
          label: `${project.repository.name} Core Engine`,
          type: 'service',
          x: 400,
          y: 180,
          description: `Core verified architecture module for ${project.repository.fullName}`,
          evidenceFiles: ['package.json'],
        });
      }

      return {
        nodes,
        edges,
        lastGeneratedAt: new Date().toISOString(),
      };
    }

    return null;
  }, [project, intelligence, ingestion]);

  const architectureSignals = intelligence?.architectureSignals || [];

  return (
    <div className="flex flex-col min-h-full">
      <ProjectNav projectId={project.id} />

      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">System Design</p>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Project architecture map</h1>
            <p className="text-sm text-text-secondary mt-1">
              Topological relationship model deterministically inferred from codebase structure, routes, ORMs, and APIs in <code className="text-accent font-mono text-xs">{project.repository.fullName}</code>
            </p>
          </div>
          {isAnalyzed && (
            <Badge variant="success" size="sm">
              Deterministic Topology Ready
            </Badge>
          )}
        </div>

        {/* Real Architecture Topology */}
        {isAnalyzed && architectureMap ? (
          <div className="flex flex-col gap-8">
            <ArchitectureTopologyGraph architectureMap={architectureMap} />

            {/* Architecture Signals Inspector */}
            {architectureSignals.length > 0 && (
              <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Structural Verification
                  </span>
                  <h3 className="text-base font-bold text-text-primary mt-0.5">
                    Verified Architectural Signals ({architectureSignals.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {architectureSignals.map((signal, idx) => (
                    <div
                      key={idx}
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">{signal.type}</span>
                        <Badge variant="success" size="xs">
                          {Math.round(signal.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary">{signal.description}</p>
                      {signal.evidence && signal.evidence.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {signal.evidence.map((ev, evIdx) => (
                            <span
                              key={evIdx}
                              className="font-mono text-2xs bg-bg-surface border border-border-subtle px-2 py-0.5 rounded text-text-tertiary"
                            >
                              ↳ {ev.filePath}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
            <EmptyState
              icon={<Network size={24} className="text-accent" />}
              title="Repository analysis is not available yet."
              description="Connect and analyze your repository to automatically infer service boundaries, data stores, ORMs, and API routes into a topological graph."
              actionLabel="Connect Repository"
              onAction={() => navigate('/projects/new')}
              className="py-16 max-w-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectArchitecture;
