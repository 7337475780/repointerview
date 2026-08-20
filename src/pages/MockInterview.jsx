import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Send, SkipForward, ThumbsUp, ThumbsDown } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { QUESTIONS } from '../data/fixtures';

const TOTAL = 6;

const INTERVIEWER_PERSONA = {
  name: 'Alex',
  role: 'Senior Engineer',
};

const MockInterview = () => {
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'good' | 'needs-work'

  const currentQ = QUESTIONS[questionIndex % QUESTIONS.length];
  const progress = ((questionIndex + 1) / TOTAL) * 100;

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    // Simulate feedback
    setTimeout(() => {
      setFeedback(answer.length > 100 ? 'good' : 'needs-work');
    }, 600);
  };

  const handleNext = () => {
    if (questionIndex + 1 >= TOTAL) {
      navigate('/dashboard');
      return;
    }
    setQuestionIndex(i => i + 1);
    setAnswer('');
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSkip = () => {
    if (questionIndex + 1 >= TOTAL) {
      navigate('/dashboard');
      return;
    }
    setQuestionIndex(i => i + 1);
    setAnswer('');
    setSubmitted(false);
    setFeedback(null);
  };

  const handleExit = () => {
    if (window.confirm('Exit interview? Your progress will not be saved.')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col" role="main">
      {/* Top bar */}
      <div className="sticky top-0 z-[200] flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-base/90 backdrop-blur-md">
        <button
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary hover:bg-bg-elevated px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          onClick={handleExit}
          aria-label="Exit interview"
        >
          <X size={15} />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-4 flex-1 max-w-xs mx-auto" aria-label={`Question ${questionIndex + 1} of ${TOTAL}`}>
          <span className="font-mono text-xs text-text-tertiary whitespace-nowrap">
            Question {questionIndex + 1} / {TOTAL}
          </span>
          <div
            className="flex-1 h-1 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle"
            role="progressbar"
            aria-valuenow={questionIndex + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL}
          >
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.0, 0, 0.2, 1] }}
            />
          </div>
        </div>

        <button
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary hover:bg-bg-elevated px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          onClick={handleSkip}
          aria-label="Skip question"
        >
          <SkipForward size={14} />
          <span>Skip</span>
        </button>
      </div>

      {/* Interview stage */}
      <div className="flex-1 flex flex-col items-center px-6 py-12 max-w-2xl mx-auto w-full gap-8">
        {/* Interviewer */}
        <div className="flex items-center gap-3 self-start" aria-label="Interviewer">
          <div
            className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-sm font-semibold text-accent"
            aria-hidden="true"
          >
            <span>A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary">{INTERVIEWER_PERSONA.name}</span>
            <span className="text-xs text-text-tertiary">{INTERVIEWER_PERSONA.role}</span>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            className="w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.0, 0, 0.2, 1] }}
          >
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  currentQ.difficulty === 'hard' ? 'error' : currentQ.difficulty === 'medium' ? 'warning' : 'success'
                }
                size="sm"
              >
                {currentQ.difficulty}
              </Badge>
              <Badge variant="neutral" size="sm">
                {currentQ.category}
              </Badge>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
              {currentQ.question}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Response area */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="input"
              className="w-full flex flex-col gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary" htmlFor="mi-answer">
                Your answer
              </label>
              <textarea
                id="mi-answer"
                className="w-full bg-bg-elevated border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-2xl p-5 text-sm sm:text-base text-text-primary placeholder:text-text-disabled leading-relaxed resize-none outline-none transition-all shadow-sm"
                placeholder="Walk me through your thinking. Focus on the why behind your decisions, tradeoffs considered, and real code details..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                rows={6}
                autoFocus
                aria-label="Your answer"
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-text-disabled">
                  {answer.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<Send size={13} />}
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                >
                  Submit answer
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              className="w-full flex flex-col gap-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* User's answer */}
              <div className="bg-bg-elevated border border-border rounded-2xl p-5 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-text-disabled">Your answer</span>
                <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
              </div>

              {/* AI Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`flex items-start gap-4 p-5 rounded-2xl border ${
                      feedback === 'good'
                        ? 'bg-success/10 border-success/30 text-text-primary'
                        : 'bg-warning/10 border-warning/30 text-text-primary'
                    }`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        feedback === 'good' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}
                      aria-hidden="true"
                    >
                      {feedback === 'good' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {feedback === 'good' ? 'Strong architectural response' : 'Needs more technical depth'}
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {feedback === 'good'
                          ? 'You addressed the core tradeoffs and justified the decision clearly with concrete details from the implementation.'
                          : 'Try to explain the specific tradeoffs you considered — why this choice over alternatives? Reference concrete database schemas or RPC routes.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <Button variant="primary" size="md" onClick={handleNext}>
                  {questionIndex + 1 >= TOTAL ? 'Finish interview' : 'Next question'}
                </Button>
                {feedback === 'needs-work' && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setSubmitted(false);
                      setFeedback(null);
                    }}
                  >
                    Try again
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MockInterview;
