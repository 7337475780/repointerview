import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, BookOpen, Code2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CodeBlock from '../components/ui/CodeBlock';
import { QUESTIONS } from '../data/fixtures';

const DifficultyConfig = {
  easy: { variant: 'success', label: 'Easy' },
  medium: { variant: 'warning', label: 'Medium' },
  hard: { variant: 'error', label: 'Hard' },
};

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answerExpanded, setAnswerExpanded] = useState(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(true);

  const q = QUESTIONS.find(q => q.id === id) || QUESTIONS[0];
  const diff = DifficultyConfig[q.difficulty];
  const currentIndex = QUESTIONS.findIndex(q2 => q2.id === q.id);
  const nextQ = QUESTIONS[currentIndex + 1];

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Breadcrumb nav */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            onClick={() => navigate('/questions')}
            aria-label="Back to questions"
          >
            <ArrowLeft size={14} />
            <span>All questions</span>
          </button>
          {nextQ && (
            <button
              className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary bg-bg-elevated/60 hover:bg-bg-elevated border border-border-subtle px-3 py-1.5 rounded-lg transition-all cursor-pointer max-w-xs"
              onClick={() => navigate(`/questions/${nextQ.id}`)}
              aria-label="Next question"
            >
              <span>Next</span>
              <span className="text-text-tertiary truncate">{nextQ.question}</span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: main content */}
          <main className="lg:col-span-8 flex flex-col gap-8" role="main">
            {/* Metadata strip */}
            <motion.div
              className="flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <Badge variant={diff.variant} size="md">
                {diff.label}
              </Badge>
              <Badge variant="neutral" size="md">
                {q.category}
              </Badge>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-20 h-1.5 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle"
                  aria-label={`${q.probability}% probability`}
                  title={`${q.probability}% probability of being asked`}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: q.probability >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${q.probability}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </div>
                <span className="text-xs text-text-tertiary font-mono">{q.probability}% likely</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                {q.tags.map(tag => (
                  <span key={tag} className="font-mono text-2xs text-text-disabled bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* The question */}
            <motion.h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {q.question}
            </motion.h1>

            {/* Why you'll be asked */}
            <motion.section
              className="flex flex-col gap-3 bg-bg-surface/50 border border-border-subtle p-5 rounded-2xl"
              aria-labelledby="why-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                <BookOpen size={14} className="text-accent" aria-hidden="true" />
                <span id="why-heading">Why you'll be asked this</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{q.whyAsked}</p>
            </motion.section>

            {/* Strong answer (collapsible) */}
            <motion.section
              className="flex flex-col border border-border-subtle rounded-2xl overflow-hidden bg-bg-surface/30"
              aria-labelledby="answer-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-bg-elevated/40 transition-colors"
                onClick={() => setAnswerExpanded(e => !e)}
                aria-expanded={answerExpanded}
                aria-controls="answer-body"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  <MessageSquare size={14} className="text-accent" aria-hidden="true" />
                  <span id="answer-heading">Strong answer</span>
                </div>
                {answerExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <AnimatePresence initial={false}>
                {answerExpanded && (
                  <motion.div
                    id="answer-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.0, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="p-5 pt-0 border-t border-border-subtle bg-bg-elevated/30">
                      <p className="text-sm text-text-secondary leading-relaxed pl-4 border-l-2 border-accent my-3">
                        {q.strongAnswer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Repository evidence */}
            <motion.section
              className="flex flex-col border border-border-subtle rounded-2xl overflow-hidden bg-bg-surface/30"
              aria-labelledby="evidence-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-bg-elevated/40 transition-colors"
                onClick={() => setEvidenceExpanded(e => !e)}
                aria-expanded={evidenceExpanded}
                aria-controls="evidence-body"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  <Code2 size={14} className="text-accent" aria-hidden="true" />
                  <span id="evidence-heading">Repository evidence</span>
                </div>
                {evidenceExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <AnimatePresence initial={false}>
                {evidenceExpanded && (
                  <motion.div
                    id="evidence-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.0, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="p-5 pt-0">
                      <CodeBlock
                        code={q.evidence.code}
                        language={q.evidence.language}
                        filename={q.evidence.filename}
                        highlightLines={q.evidence.highlightLines}
                        collapsible={false}
                        lineNumbers={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </main>

          {/* Right sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6" aria-label="Question details">
            <motion.div
              className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-3">
                Follow-up questions
              </p>
              <ul className="flex flex-col gap-3">
                {q.followUp.map((fq, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.07 }}
                  >
                    <span className="text-accent font-bold" aria-hidden="true">
                      ›
                    </span>
                    <span>{fq}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Practice this question</p>
              <Button variant="primary" size="md" onClick={() => navigate('/interview')} className="w-full">
                Start mock interview
              </Button>
            </motion.div>

            {/* Related questions */}
            <motion.div
              className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-3">
                More in {q.category}
              </p>
              <ul className="flex flex-col gap-2">
                {QUESTIONS.filter(rq => rq.id !== q.id)
                  .slice(0, 3)
                  .map(rq => (
                    <li key={rq.id}>
                      <button
                        className="w-full flex items-start gap-2 p-2.5 rounded-lg text-left text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                        onClick={() => navigate(`/questions/${rq.id}`)}
                      >
                        <Badge variant={DifficultyConfig[rq.difficulty].variant} size="xs">
                          {rq.difficulty}
                        </Badge>
                        <span className="truncate flex-1">{rq.question}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
