import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GitBranch, Star, Clock, PlaySquare, HelpCircle, Network, ArrowRight, ExternalLink } from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';
import { QUESTIONS } from '../../data/fixtures';

const ProjectOverview = () => {
  const { id } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === id) || projects[0];

  if (!project) {
    return (
      <div className="p-8">
        <EmptyState
          title="Project not found"
          description="The requested repository project does not exist."
          actionLabel="View all projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  const isReady = project.status === 'ready';

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
              <div className="flex items-center gap-3">
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
                <Badge variant={isReady ? 'success' : 'warning'} size="xs">
                  {isReady ? 'Analysis Ready' : 'Pending Ingestion'}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary mt-1 max-w-2xl">{project.repository.description}</p>
              <div className="flex items-center gap-4 text-xs text-text-tertiary mt-3 font-mono">
                {project.repository.stars !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star size={12} />
                    {project.repository.stars.toLocaleString()} stars
                  </span>
                )}
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Analyzed {project.lastAnalyzedAt}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlaySquare size={14} />}
              onClick={() => navigate(`/projects/${project.id}/mock`)}
            >
              Start mock interview
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Network size={14} />}
              onClick={() => navigate(`/projects/${project.id}/architecture`)}
            >
              View architecture
            </Button>
          </div>
        </div>

        {/* Not analyzed empty state */}
        {!isReady ? (
          <EmptyState
            icon={<HelpCircle size={22} className="text-accent" />}
            title="Repository analysis pending"
            description="Repository intelligence, tech stack detection, and question prediction will appear here once the repository analysis pipeline runs."
            actionLabel="Browse sample questions"
            onAction={() => navigate('/questions')}
          />
        ) : (
          <>
            {/* Tech Stack & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Stack overview */}
              <div className="md:col-span-8 bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Detected Technology Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map(tech => (
                    <span
                      key={tech.name}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-bg-elevated border border-border-subtle rounded-md px-3 py-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tech.color }} />
                      <span>{tech.name}</span>
                      <span className="text-2xs text-text-disabled uppercase ml-1">({tech.category})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Readiness Score Card */}
              <div className="md:col-span-4 bg-bg-surface border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Interview Readiness
                </span>
                <span className="text-4xl font-bold font-sans text-success">
                  {project.analysisScore}%
                </span>
                <p className="text-xs text-text-secondary">
                  Ready for system design & implementation rounds.
                </p>
              </div>
            </div>

            {/* Quick Question Preview */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Predicted Questions</p>
                  <h2 className="text-xl font-bold text-text-primary mt-0.5">High probability questions</h2>
                </div>
                <Link to={`/projects/${project.id}/questions`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>
                    View all {project.questionsCount}
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUESTIONS.slice(0, 4).map((q, i) => (
                  <motion.div
                    key={q.id}
                    className="bg-bg-surface border border-border hover:border-border-strong rounded-xl p-5 flex flex-col gap-3 transition-all cursor-pointer shadow-sm group"
                    onClick={() => navigate(`/projects/${project.id}/questions/${q.id}`)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={q.difficulty === 'hard' ? 'error' : 'warning'} size="xs">
                        {q.difficulty}
                      </Badge>
                      <Badge variant="neutral" size="xs">
                        {q.category}
                      </Badge>
                      <span className="ml-auto font-mono text-xs text-text-tertiary">{q.probability}% likely</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary leading-snug group-hover:text-accent transition-colors">
                      {q.question}
                    </p>
                    <p className="font-mono text-2xs text-text-disabled mt-auto">↳ {q.evidence.filename}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
