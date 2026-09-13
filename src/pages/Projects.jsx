import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch, Plus, Star, ArrowRight, ExternalLink } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useProject } from '../context/ProjectContext';

const Projects = () => {
  const { projects, setActiveProjectId } = useProject();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Repository Catalog</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mt-1">Projects</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your connected codebases and interview preparation intelligence.
          </p>
        </div>
        <Link to="/projects/new">
          <Button variant="primary" size="md" leftIcon={<Plus size={14} />}>
            Analyze new repository
          </Button>
        </Link>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<GitBranch size={22} className="text-accent" />}
          title="Your project intelligence starts here."
          description="Connect a GitHub repository and RepoInterview will analyze your codebase and prepare you for the questions that matter."
          actionLabel="Connect Repository"
          onAction={() => navigate('/projects/new')}
          className="py-16 max-w-xl"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              className="bg-bg-surface border border-border hover:border-border-strong rounded-2xl p-6 flex flex-col gap-5 shadow-sm transition-all duration-150 group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-accent flex-shrink-0">
                    <GitBranch size={18} />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-text-primary truncate max-w-[180px]">
                      {project.repository.fullName}
                    </h3>
                    <p className="text-2xs text-text-tertiary">
                      {project.lastAnalyzedAt
                        ? `Analyzed ${new Date(project.lastAnalyzedAt).toLocaleDateString()}`
                        : 'Recently analyzed'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    project.status === 'ANALYSIS_WITH_WARNINGS'
                      ? 'warning'
                      : project.status === 'ANALYZED' || project.status === 'READY' || project.intelligence
                      ? 'success'
                      : 'neutral'
                  }
                  size="xs"
                >
                  {project.status === 'ANALYSIS_WITH_WARNINGS'
                    ? 'With warnings'
                    : project.status === 'ANALYZED' || project.status === 'READY' || project.intelligence
                    ? 'Analyzed'
                    : 'Pending'}
                </Badge>
              </div>

              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {project.repository.description}
              </p>

              {/* Stack Preview */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.techStack.slice(0, 4).map(tech => (
                    <span
                      key={tech.name}
                      className="inline-flex items-center gap-1 text-2xs font-medium text-text-tertiary bg-bg-elevated border border-border-subtle rounded-md px-2 py-0.5"
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: tech.color }} />
                      {tech.name}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="text-2xs text-text-disabled self-center">
                      +{project.techStack.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="border-t border-border-subtle pt-4 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono">
                  {project.repository.stars !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star size={12} />
                      {project.repository.stars.toLocaleString()}
                    </span>
                  )}
                  <span>·</span>
                  <span>{project.questionsCount} questions</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight size={13} />}
                  onClick={() => {
                    setActiveProjectId(project.id);
                    navigate(`/projects/${project.id}`);
                  }}
                >
                  Open workspace
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
