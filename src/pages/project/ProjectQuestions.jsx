import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, HelpCircle } from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const CATEGORIES = ['All', 'Architecture', 'Database', 'Security', 'API Design', 'Performance', 'Infrastructure'];

const ProjectQuestions = () => {
  const { id } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  const project = projects.find(p => p.id === id);
  const questionsList = project?.questions || [];

  if (!project || questionsList.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        {project && <ProjectNav projectId={project.id} />}
        <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
          <EmptyState
            icon={<HelpCircle size={24} className="text-accent" />}
            title="No project-specific questions yet."
            description="Analyze your repository to discover the questions an interviewer is most likely to ask."
            actionLabel="Connect Repository"
            onAction={() => navigate('/projects/new')}
            className="py-16 max-w-xl"
          />
        </div>
      </div>
    );
  }

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
            {questionsList.length} Questions Ingested
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

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by priority">
            {[
              { id: 'all', label: 'All probabilities' },
              { id: 'high_probability', label: 'High probability (≥85%)' },
              { id: 'hard', label: 'Hard difficulty' },
            ].map(f => (
              <button
                key={f.id}
                className={`text-xs font-medium rounded-full px-3.5 py-1.5 transition-all cursor-pointer border ${
                  statusFilter === f.id
                    ? 'bg-accent-subtle border-accent-border text-accent font-semibold shadow-xs'
                    : 'bg-bg-elevated border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border hover:bg-bg-overlay'
                }`}
                onClick={() => setStatusFilter(f.id)}
                aria-pressed={statusFilter === f.id}
              >
                {f.label}
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
};

export default ProjectQuestions;
