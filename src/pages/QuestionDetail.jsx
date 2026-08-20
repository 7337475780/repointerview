import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, BookOpen, Code2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CodeBlock from '../components/ui/CodeBlock';
import { QUESTIONS } from '../data/fixtures';
import './QuestionDetail.css';

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
    <div className="question-detail page">
      <div className="question-detail__inner container">

        {/* Breadcrumb nav */}
        <motion.div
          className="qd-nav"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button className="qd-back" onClick={() => navigate('/questions')} aria-label="Back to questions">
            <ArrowLeft size={14} />
            <span>All questions</span>
          </button>
          {nextQ && (
            <button className="qd-next" onClick={() => navigate(`/questions/${nextQ.id}`)} aria-label="Next question">
              <span>Next</span>
              <span className="qd-next__name">{nextQ.question.slice(0, 40)}…</span>
              <span className="qd-next__arrow" aria-hidden="true">→</span>
            </button>
          )}
        </motion.div>

        <div className="qd-layout">
          {/* Left: main content */}
          <main className="qd-main" role="main">
            {/* Metadata strip */}
            <motion.div
              className="qd-meta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <Badge variant={diff.variant} size="md">{diff.label}</Badge>
              <Badge variant="neutral" size="md">{q.category}</Badge>
              <div className="qd-prob">
                <div
                  className="qd-prob__bar"
                  aria-label={`${q.probability}% probability`}
                  title={`${q.probability}% probability of being asked`}
                >
                  <motion.div
                    className="qd-prob__fill"
                    style={{ background: q.probability >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${q.probability}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </div>
                <span className="qd-prob__label">{q.probability}% likely</span>
              </div>
              <div className="qd-tags">
                {q.tags.map(tag => (
                  <span key={tag} className="qd-tag mono">#{tag}</span>
                ))}
              </div>
            </motion.div>

            {/* The question */}
            <motion.h1
              className="qd-question"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {q.question}
            </motion.h1>

            {/* Why you'll be asked */}
            <motion.section
              className="qd-section"
              aria-labelledby="why-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <div className="qd-section__label">
                <BookOpen size={13} aria-hidden="true" />
                <span id="why-heading">Why you'll be asked this</span>
              </div>
              <p className="qd-section__body">{q.whyAsked}</p>
            </motion.section>

            {/* Strong answer (collapsible) */}
            <motion.section
              className="qd-section qd-section--collapsible"
              aria-labelledby="answer-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <button
                className="qd-section__toggle"
                onClick={() => setAnswerExpanded(e => !e)}
                aria-expanded={answerExpanded}
                aria-controls="answer-body"
              >
                <div className="qd-section__label">
                  <MessageSquare size={13} aria-hidden="true" />
                  <span id="answer-heading">Strong answer</span>
                </div>
                {answerExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                    <p className="qd-section__body qd-answer">{q.strongAnswer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Repository evidence */}
            <motion.section
              className="qd-section"
              aria-labelledby="evidence-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              <button
                className="qd-section__toggle"
                onClick={() => setEvidenceExpanded(e => !e)}
                aria-expanded={evidenceExpanded}
                aria-controls="evidence-body"
              >
                <div className="qd-section__label">
                  <Code2 size={13} aria-hidden="true" />
                  <span id="evidence-heading">Repository evidence</span>
                </div>
                {evidenceExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                    <div className="qd-evidence">
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
          <aside className="qd-sidebar" aria-label="Question details">
            <motion.div
              className="qd-sidebar__section"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <p className="qd-sidebar__title">Follow-up questions</p>
              <ul className="qd-followup-list">
                {q.followUp.map((fq, i) => (
                  <motion.li
                    key={i}
                    className="qd-followup-item"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.07 }}
                  >
                    <span className="qd-followup-item__arrow" aria-hidden="true">›</span>
                    <span>{fq}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="qd-sidebar__section"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="qd-sidebar__title">Practice this question</p>
              <Button variant="primary" size="md" onClick={() => navigate('/interview')} className="w-full">
                Start mock interview
              </Button>
            </motion.div>

            {/* Related questions */}
            <motion.div
              className="qd-sidebar__section"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <p className="qd-sidebar__title">More in {q.category}</p>
              <ul className="qd-related-list">
                {QUESTIONS.filter(rq => rq.category === q.category && rq.id !== q.id).slice(0, 3).map(rq => (
                  <li key={rq.id}>
                    <button
                      className="qd-related-item"
                      onClick={() => navigate(`/questions/${rq.id}`)}
                    >
                      <Badge variant={DifficultyConfig[rq.difficulty].variant} size="xs">{rq.difficulty}</Badge>
                      <span>{rq.question.slice(0, 60)}{rq.question.length > 60 ? '…' : ''}</span>
                    </button>
                  </li>
                ))}
                {QUESTIONS.filter(rq => rq.category === q.category && rq.id !== q.id).length === 0 && (
                  QUESTIONS.filter(rq => rq.id !== q.id).slice(0, 3).map(rq => (
                    <li key={rq.id}>
                      <button
                        className="qd-related-item"
                        onClick={() => navigate(`/questions/${rq.id}`)}
                      >
                        <Badge variant={DifficultyConfig[rq.difficulty].variant} size="xs">{rq.difficulty}</Badge>
                        <span>{rq.question.slice(0, 60)}{rq.question.length > 60 ? '…' : ''}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
