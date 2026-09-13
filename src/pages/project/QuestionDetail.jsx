import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, BookOpen, Code2, PlaySquare } from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CodeBlock from '../../components/ui/CodeBlock';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const DifficultyConfig = {
  easy: { variant: 'success', label: 'Easy' },
  medium: { variant: 'warning', label: 'Medium' },
  hard: { variant: 'error', label: 'Hard' },
};

const QuestionDetail = () => {
  const { id: projectId, questionId } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();

  const [answerExpanded, setAnswerExpanded] = useState(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(true);
  const [candidateNotes, setCandidateNotes] = useState('');

  const project = (projectId ? projects.find(p => p.id === projectId) : null) || projects[0] || null;
  const questions = project?.questions || [];
  const q = questions.find(item => item.id === questionId);

  if (!project || !q) {
    return (
      <div className="flex flex-col min-h-full">
        {project && <ProjectNav projectId={project.id} />}
        <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
          <EmptyState
            title="Question not found"
            description="Ensure the repository is connected and analyzed to generate project-specific questions."
            actionLabel="View all questions"
            onAction={() => navigate(project ? `/projects/${project.id}/questions` : '/projects')}
          />
        </div>
      </div>
    );
  }

  const diff = DifficultyConfig[q.difficulty] || DifficultyConfig.medium;
  const currentIndex = questions.findIndex(item => item.id === q.id);
  const nextQ = questions[currentIndex + 1];

  return (
    <div className="flex flex-col min-h-full">
      <ProjectNav projectId={project.id} />

      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}/questions`)}
          >
            <ArrowLeft size={14} />
            <span>All predicted questions</span>
          </button>
          {nextQ && (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary bg-bg-elevated/60 hover:bg-bg-elevated border border-border-subtle px-3 py-1.5 rounded-lg transition-all cursor-pointer max-w-xs truncate"
              onClick={() => navigate(`/projects/${project.id}/questions/${nextQ.id}`)}
            >
              <span>Next:</span>
              <span className="truncate">{nextQ.question}</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Question Header & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Area */}
          <main className="lg:col-span-8 flex flex-col gap-8">
            {/* Metadata Strip */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={diff.variant} size="md">
                {diff.label}
              </Badge>
              <Badge variant="neutral" size="md">
                {q.category}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${q.probability}%`,
                      background: q.probability >= 85 ? 'var(--color-success)' : 'var(--color-warning)',
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-text-tertiary">{q.probability}% probability</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                {(q.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="font-mono text-2xs text-text-disabled bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Question Heading */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
              {q.question}
            </h1>

            {/* Why You Will Be Asked */}
            {q.whyAsked && (
              <section className="flex flex-col gap-3 bg-bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  <BookOpen size={14} className="text-accent" aria-hidden="true" />
                  <span>Interviewer Rationale</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{q.whyAsked}</p>
              </section>
            )}

            {/* Candidate Practice Box */}
            <section className="flex flex-col gap-3 bg-bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <label htmlFor="defense-notes" className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Your Technical Defense & Talking Points
              </label>
              <textarea
                id="defense-notes"
                className="w-full bg-bg-elevated border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl p-4 text-sm text-text-primary placeholder:text-text-disabled outline-none leading-relaxed resize-none"
                placeholder="Draft your key arguments, tradeoffs, alternatives considered, and edge cases here..."
                rows={4}
                value={candidateNotes}
                onChange={e => setCandidateNotes(e.target.value)}
              />
            </section>

            {/* Model / Expected Answer (Collapsible) */}
            {(q.expectedAnswer || q.strongAnswer) && (
              <section className="flex flex-col border border-border-subtle rounded-2xl overflow-hidden bg-bg-surface/50 shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-bg-elevated/40 transition-colors"
                  onClick={() => setAnswerExpanded(e => !e)}
                  aria-expanded={answerExpanded}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    <MessageSquare size={14} className="text-accent" aria-hidden="true" />
                    <span>Model Answer & Tradeoff Analysis</span>
                  </div>
                  {answerExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <AnimatePresence initial={false}>
                  {answerExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="p-6 pt-0 border-t border-border-subtle bg-bg-elevated/30">
                        <p className="text-sm text-text-secondary leading-relaxed pl-4 border-l-2 border-accent my-3">
                          {q.expectedAnswer || q.strongAnswer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* Repository Evidence */}
            {q.evidence && (
              <section className="flex flex-col border border-border-subtle rounded-2xl overflow-hidden bg-bg-surface/50 shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-bg-elevated/40 transition-colors"
                  onClick={() => setEvidenceExpanded(e => !e)}
                  aria-expanded={evidenceExpanded}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    <Code2 size={14} className="text-accent" aria-hidden="true" />
                    <span>Repository Evidence</span>
                  </div>
                  {evidenceExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <AnimatePresence initial={false}>
                  {evidenceExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="p-6 pt-0">
                        <CodeBlock
                          code={q.evidence.code}
                          language={q.evidence.language}
                          filename={q.evidence.filename}
                          highlightLines={q.evidence.highlightLines || []}
                          collapsible={false}
                          lineNumbers={true}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Follow-up Questions */}
            {((q.followUpQuestions && q.followUpQuestions.length > 0) || (q.followUp && q.followUp.length > 0)) && (
              <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-3">
                  Expected Follow-ups
                </p>
                <ul className="flex flex-col gap-3">
                  {(q.followUpQuestions || q.followUp || []).map((fq, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                      <span className="text-accent font-bold" aria-hidden="true">
                        ›
                      </span>
                      <span>{fq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practice CTA */}
            <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Interactive Simulation</p>
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlaySquare size={14} />}
                onClick={() => navigate(`/projects/${project.id}/mock`)}
                className="w-full"
              >
                Practice in mock interview
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
