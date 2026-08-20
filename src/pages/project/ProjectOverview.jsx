import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Star,
  Clock,
  PlaySquare,
  HelpCircle,
  Network,
  ArrowRight,
  ExternalLink,
  FileCode,
  GitFork,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const ProjectOverview = () => {
  const { id } = useParams();
  const { projects, getActiveIngestion } = useProject();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === id);
  const ingestion = getActiveIngestion();

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

  const isIngested = project.status === 'READY' || project.status === 'READY_WITH_WARNINGS';
  const sourceFiles = ingestion?.sourceFiles || [];
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
                <Badge
                  variant={
                    project.status === 'READY'
                      ? 'success'
                      : project.status === 'READY_WITH_WARNINGS'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="xs"
                >
                  {project.status === 'READY'
                    ? 'Ingestion Complete'
                    : project.status === 'READY_WITH_WARNINGS'
                    ? 'Ingested with Warnings'
                    : 'Pending Ingestion'}
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
              leftIcon={<HelpCircle size={14} />}
              onClick={() => navigate(`/projects/${project.id}/questions`)}
            >
              Questions Bank
            </Button>
          </div>
        </div>

        {/* Real Ingestion Summary Banner */}
        {isIngested && stats && (
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
                Selected for Analysis
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
                Primary Language
              </span>
              <span className="font-mono text-base font-bold text-text-primary truncate">
                {project.repository.primaryLanguage || 'TypeScript'}
              </span>
            </div>
          </div>
        )}

        {/* Ingested Source Files Catalog */}
        {sourceFiles.length > 0 && (
          <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Source Ingestion Payload
                </p>
                <h2 className="text-lg font-bold text-text-primary mt-0.5">
                  Selected High-Relevance Files ({sourceFiles.length})
                </h2>
              </div>
              <span className="text-2xs font-mono text-text-tertiary bg-bg-elevated px-2.5 py-1 rounded-lg border border-border-subtle">
                Ready for Phase 3 AST parsing
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pt-2">
              {sourceFiles.map((file) => (
                <div
                  key={file.path}
                  className="p-3 bg-bg-elevated/70 hover:bg-bg-elevated border border-border-subtle rounded-xl flex items-center justify-between gap-3 text-xs font-mono transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileCode size={14} className="text-accent flex-shrink-0" />
                    <span className="text-text-primary truncate">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xs text-text-tertiary">
                      {Math.round((file.size / 1024) * 10) / 10} KB
                    </span>
                    <span className="text-2xs bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle text-accent font-semibold">
                      score {file.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3 Analysis Callout */}
        <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent flex-shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Repository Ingested & Verified
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                AST parsing, technology detection, and interview question generation will run in Phase 3.
              </p>
            </div>
          </div>
          <Badge variant="neutral" size="sm">
            Phase 3 Ready
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
