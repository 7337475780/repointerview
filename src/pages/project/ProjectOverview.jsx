import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Star,
  GitFork,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Network,
} from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import TechnologyGrid from '../../components/intelligence/TechnologyGrid';
import LanguageBreakdown from '../../components/intelligence/LanguageBreakdown';
import ApiSurfaceTable from '../../components/intelligence/ApiSurfaceTable';
import DatabaseSchemaViewer from '../../components/intelligence/DatabaseSchemaViewer';
import FindingInspector from '../../components/intelligence/FindingInspector';
import { useProject } from '../../context/ProjectContext';
import { repositoryAnalysisService } from '../../services/repositoryAnalysisService';

const ProjectOverview = () => {
  const { id } = useParams();
  const { projects, getActiveIngestion } = useProject();
  const navigate = useNavigate();

  const project = (id ? projects.find(p => p.id === id) : null) || projects[0] || null;
  const ingestion = getActiveIngestion(project?.id);

  // If intelligence is not cached yet, compute it deterministically on the fly
  let intelligence = project?.intelligence;
  if (!intelligence && ingestion) {
    try {
      intelligence = repositoryAnalysisService.analyzeRepository(ingestion);
    } catch {}
  }

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

  const stats = ingestion?.stats;

  return (
    <div className="flex flex-col min-h-full">
      {/* Project Sub-navigation Tabs */}
      <ProjectNav projectId={project.id} />

      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border-subtle pb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-accent flex-shrink-0 mt-1 shadow-xs">
              <GitBranch size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-mono text-2xl font-bold tracking-tight text-text-primary">
                  {project.repository.fullName}
                </h1>
                <a
                  href={project.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-accent transition-colors"
                  aria-label="Open on GitHub"
                >
                  <ExternalLink size={14} />
                </a>
                <Badge variant="success" size="xs">
                  Analysis Complete
                </Badge>
              </div>

              {project.repository.description && (
                <p className="text-sm text-text-secondary mt-1 max-w-2xl">{project.repository.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-text-tertiary mt-3 font-mono flex-wrap">
                {project.repository.stars !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star size={12} />
                    {project.repository.stars.toLocaleString()} stars
                  </span>
                )}
                {project.repository.forks !== undefined && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} />
                      {project.repository.forks.toLocaleString()} forks
                    </span>
                  </>
                )}
                <span>·</span>
                <span>Branch: {project.repository.defaultBranch}</span>
                {project.repository.commitSha && (
                  <>
                    <span>·</span>
                    <span className="text-2xs bg-bg-elevated px-1.5 py-0.5 rounded border border-border-subtle">
                      SHA: {project.repository.commitSha.slice(0, 7)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Network size={14} />}
              onClick={() => navigate(`/projects/${project.id}/architecture`)}
            >
              View Architecture
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<HelpCircle size={14} />}
              onClick={() => navigate(`/projects/${project.id}/questions`)}
            >
              Questions Bank
            </Button>
          </div>
        </div>

        {/* Real Ingestion Summary Banner */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1 shadow-xs">
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                Discovered Files
              </span>
              <span className="font-mono text-xl font-bold text-text-primary">
                {stats.totalDiscoveredFiles}
              </span>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1 shadow-xs">
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                Ingested Source Files
              </span>
              <span className="font-mono text-xl font-bold text-accent">
                {stats.fetchedFilesCount} <span className="text-xs text-text-disabled">/ {stats.selectedFilesCount}</span>
              </span>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1 shadow-xs">
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                Total Ingested Size
              </span>
              <span className="font-mono text-xl font-bold text-text-primary">
                {Math.round(stats.totalSourceBytes / 1024)} KB
              </span>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1 shadow-xs">
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                Architecture Pattern
              </span>
              <span className="font-mono text-xs font-bold text-text-primary truncate">
                {intelligence?.structure?.pattern || 'Standard Modular'}
              </span>
            </div>
          </div>
        )}

        {/* Source Language Distribution */}
        {intelligence?.languages && (
          <LanguageBreakdown languages={intelligence.languages} />
        )}

        {/* Detected Technology Stack */}
        {intelligence?.technologies && (
          <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                Deterministic Technology Profile
              </span>
              <h2 className="text-lg font-bold text-text-primary mt-0.5">
                Verified Technology Stack ({intelligence.technologies.length})
              </h2>
            </div>
            <TechnologyGrid technologies={intelligence.technologies} />
          </div>
        )}

        {/* Statically Detected API Surface */}
        {intelligence?.apiSurface && (
          <ApiSurfaceTable apiSurface={intelligence.apiSurface} />
        )}

        {/* Database & ORM Schemas */}
        {intelligence?.database && (
          <DatabaseSchemaViewer database={intelligence.database} />
        )}

        {/* What RepoInterview Discovered (Finding Inspector) */}
        {intelligence && (
          <FindingInspector intelligence={intelligence} />
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
