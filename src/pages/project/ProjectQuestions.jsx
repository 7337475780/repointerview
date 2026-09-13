import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Network,
  Code2,
  FileCode2,
  CheckCircle2,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const CATEGORIES = ['All', 'Architecture', 'Database', 'Security', 'API Design', 'Performance', 'Infrastructure'];

const ProjectQuestions = () => {
  const { id } = useParams();
  const { projects, activeProject } = useProject();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const questionsList = project.questions || [];
  const intelligence = project.intelligence;
  const isAnalyzed = Boolean(intelligence) || project.status === 'ANALYZED' || project.status === 'READY';

  // If questions exist (Phase 4), show questions list
  if (questionsList.length > 0) {
    const filtered = questionsList.filter(q => {
      const matchSearch =
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || q.category.toLowerCase() === category.toLowerCase();
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'high_probability'
          ? q.probability >= 85
          : statusFilter === 'hard'
          ? q.difficulty === 'hard'
          : true;
      return matchSearch && matchCat && matchStatus;
    });

    return (
      <div className="flex flex-col min-h-full">
        <ProjectNav projectId={project.id} />

        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Question Radar</p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Predicted interview questions</h1>
              <p className="text-sm text-text-secondary mt-1">
                Questions calibrated to the technical decisions in <code className="text-accent font-mono text-xs">{project.repository.fullName}</code>
              </p>
            </div>
            <span className="text-xs font-mono text-text-tertiary bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-subtle self-start">
              {questionsList.length} Questions Available
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-bg-elevated border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 rounded-xl px-4 py-2 max-w-lg transition-all shadow-xs">
              <Search size={15} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
              <input
                type="search"
                className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-disabled"
                placeholder="Search by topic, architecture tier, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search questions"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`text-xs font-medium rounded-full px-3.5 py-1.5 transition-all cursor-pointer border ${
                    category === cat
                      ? 'bg-accent-subtle border-accent-border text-accent font-semibold shadow-xs'
                      : 'bg-bg-elevated border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border hover:bg-bg-overlay'
                  }`}
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question Rows */}
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching questions"
              description="No predicted questions match your active filter criteria."
              actionLabel="Reset filters"
              onAction={() => {
                setSearch('');
                setCategory('All');
                setStatusFilter('all');
              }}
            />
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle border-t border-border-subtle mt-2">
              {filtered.map((q, i) => (
                <motion.button
                  key={q.id}
                  className="w-full flex items-center justify-between gap-6 py-5 px-3 -mx-3 rounded-xl text-left cursor-pointer transition-all duration-150 hover:bg-bg-elevated/70 group"
                  onClick={() => navigate(`/projects/${project.id}/questions/${q.id}`)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'}
                        size="xs"
                      >
                        {q.difficulty}
                      </Badge>
                      <Badge variant="neutral" size="xs">
                        {q.category}
                      </Badge>
                    </div>
                    <p className="text-base font-medium text-text-primary leading-snug group-hover:text-accent transition-colors">
                      {q.question}
                    </p>
                    {q.evidence && (
                      <p className="font-mono text-xs text-text-disabled">↳ {q.evidence.filename}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-semibold font-mono text-text-primary">{q.probability}%</span>
                      <span className="text-2xs text-text-disabled uppercase">probability</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-text-disabled group-hover:text-accent group-hover:translate-x-1 transition-all"
                      aria-hidden="true"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If analyzed but questions not generated yet (Phase 3 Complete -> Phase 4 Next)
  if (isAnalyzed) {
    const techCount = intelligence?.technologies?.length || project.techStack?.length || 0;
    const apiRoutesCount = intelligence?.apiSurface?.endpointsCount || project.stats?.apiRoutes || 0;
    const dbModelsCount = intelligence?.database?.models?.length || project.stats?.dbTables || 0;
    const importantFilesCount = intelligence?.importantFiles?.length || 0;

    return (
      <div className="flex flex-col min-h-full">
        <ProjectNav projectId={project.id} />

        <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Question Radar</p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Predicted interview questions</h1>
              <p className="text-sm text-text-secondary mt-1">
                Interview question generator for <code className="text-accent font-mono text-xs">{project.repository.fullName}</code>
              </p>
            </div>
            <Badge variant="success" size="sm">
              Phase 3 Analysis Complete
            </Badge>
          </div>

          {/* Primary Intelligence Readiness Card */}
          <motion.div
            className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success-subtle border border-success-border flex items-center justify-center text-success flex-shrink-0 mt-1">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold text-text-primary">Your repository is analyzed.</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  RepoInterview has identified the technologies, architecture, APIs, database, integrations, and important code paths in this project.
                </p>
              </div>
            </div>

            {/* Extracted Foundation Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                  <Layers size={13} className="text-accent" />
                  Technologies
                </span>
                <span className="font-mono text-lg font-bold text-text-primary">
                  {techCount}
                </span>
                <span className="text-2xs text-text-disabled truncate">
                  {project.techStack?.map(t => t.name).slice(0, 2).join(', ') || 'Detected'}
                </span>
              </div>

              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                  <Network size={13} className="text-accent" />
                  API Endpoints
                </span>
                <span className="font-mono text-lg font-bold text-text-primary">
                  {apiRoutesCount}
                </span>
                <span className="text-2xs text-text-disabled">Static HTTP routes</span>
              </div>

              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                  <Database size={13} className="text-accent" />
                  Data Models
                </span>
                <span className="font-mono text-lg font-bold text-text-primary">
                  {dbModelsCount}
                </span>
                <span className="text-2xs text-text-disabled">Schemas & tables</span>
              </div>

              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                  <Code2 size={13} className="text-accent" />
                  Important Files
                </span>
                <span className="font-mono text-lg font-bold text-text-primary">
                  {importantFilesCount}
                </span>
                <span className="text-2xs text-text-disabled">Key code paths</span>
              </div>
            </div>

            {/* Next Step Banner */}
            <div className="border border-accent-border/40 bg-accent-subtle/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Interview question generation is the next step.</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Phase 4 will generate targeted, code-calibrated interview questions based on the technical decisions in this repository.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="border-t border-border-subtle pt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FileCode2 size={14} />}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Overview
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Network size={14} />}
                  onClick={() => navigate(`/projects/${project.id}/architecture`)}
                >
                  Architecture Map
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
          </motion.div>
        </div>
      </div>
    );
  }

  // Not analyzed state
  return (
    <div className="flex flex-col min-h-full">
      <ProjectNav projectId={project.id} />
      <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
        <EmptyState
          icon={<HelpCircle size={24} className="text-accent" />}
          title="Repository analysis is not available yet."
          description="Connect and analyze your repository to discover the architectural decisions and questions an interviewer is most likely to ask."
          actionLabel="Connect Repository"
          onAction={() => navigate('/projects/new')}
          className="py-16 max-w-xl"
        />
      </div>
    </div>
  );
};

export default ProjectQuestions;
