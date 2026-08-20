import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Send, SkipForward, ThumbsUp, ThumbsDown } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { QUESTIONS } from '../data/fixtures';
import './MockInterview.css';

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
  const [exiting, setExiting] = useState(false);

  const currentQ = QUESTIONS[questionIndex % QUESTIONS.length];
  const progress = ((questionIndex) / TOTAL) * 100;

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
    setExiting(true);
    setTimeout(() => {
      setQuestionIndex(i => i + 1);
      setAnswer('');
      setSubmitted(false);
      setFeedback(null);
      setExiting(false);
    }, 350);
  };

  const handleSkip = () => {
    if (questionIndex + 1 >= TOTAL) { navigate('/dashboard'); return; }
    setExiting(true);
    setTimeout(() => {
      setQuestionIndex(i => i + 1);
      setAnswer('');
      setSubmitted(false);
      setFeedback(null);
      setExiting(false);
    }, 350);
  };

  const handleExit = () => {
    if (window.confirm('Exit interview? Your progress will not be saved.')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="mock-interview" role="main">
      {/* Top bar */}
      <div className="mi-topbar">
        <button className="mi-exit" onClick={handleExit} aria-label="Exit interview">
          <X size={15} />
          <span>Exit</span>
        </button>

        <div className="mi-progress" aria-label={`Question ${questionIndex + 1} of ${TOTAL}`}>
          <span className="mi-progress__label mono">Question {questionIndex + 1} / {TOTAL}</span>
          <div className="mi-progress__track" role="progressbar" aria-valuenow={questionIndex + 1} aria-valuemin={1} aria-valuemax={TOTAL}>
            <motion.div
              className="mi-progress__fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.0, 0, 0.2, 1] }}
            />
          </div>
        </div>

        <button className="mi-skip" onClick={handleSkip} aria-label="Skip question">
          <SkipForward size={14} />
          <span>Skip</span>
        </button>
      </div>

      {/* Interview stage */}
      <div className="mi-stage">

        {/* Interviewer */}
        <div className="mi-interviewer" aria-label="Interviewer">
          <div className="mi-interviewer__avatar" aria-hidden="true">
            <span>A</span>
          </div>
          <div className="mi-interviewer__info">
            <span className="mi-interviewer__name">{INTERVIEWER_PERSONA.name}</span>
            <span className="mi-interviewer__role">{INTERVIEWER_PERSONA.role}</span>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            className="mi-question-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.0, 0, 0.2, 1] }}
          >
            <div className="mi-question-meta">
              <Badge
                variant={currentQ.difficulty === 'hard' ? 'error' : currentQ.difficulty === 'medium' ? 'warning' : 'success'}
                size="sm"
              >
                {currentQ.difficulty}
              </Badge>
              <Badge variant="neutral" size="sm">{currentQ.category}</Badge>
            </div>
            <p className="mi-question-text">{currentQ.question}</p>
          </motion.div>
        </AnimatePresence>

        {/* Response area */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="input"
              className="mi-response"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className="mi-response__label" htmlFor="mi-answer">
                Your answer
              </label>
              <textarea
                id="mi-answer"
                className="mi-response__textarea"
                placeholder="Walk me through your thinking. Focus on the why behind your decisions..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                rows={6}
                autoFocus
                aria-label="Your answer"
              />
              <div className="mi-response__footer">
                <span className="mi-response__hint mono">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
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
              className="mi-feedback"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* User's answer */}
              <div className="mi-feedback__answer">
                <span className="mi-feedback__answer-label section-label">Your answer</span>
                <p className="mi-feedback__answer-text">{answer}</p>
              </div>

              {/* AI Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`mi-feedback__result mi-feedback__result--${feedback}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {feedback === 'good' ? (
                      <>
                        <div className="mi-feedback__icon mi-feedback__icon--good" aria-hidden="true">
                          <ThumbsUp size={16} />
                        </div>
                        <div>
                          <p className="mi-feedback__title">Strong response</p>
                          <p className="mi-feedback__desc">You addressed the core tradeoffs and justified the decision clearly. Good use of concrete detail from the implementation.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mi-feedback__icon mi-feedback__icon--needs-work" aria-hidden="true">
                          <ThumbsDown size={16} />
                        </div>
                        <div>
                          <p className="mi-feedback__title">Needs more depth</p>
                          <p className="mi-feedback__desc">Try to explain the specific tradeoffs you considered — why this choice over the alternatives? Reference concrete implementation details.</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mi-feedback__actions">
                <Button variant="primary" size="md" onClick={handleNext}>
                  {questionIndex + 1 >= TOTAL ? 'Finish interview' : 'Next question'}
                </Button>
                {feedback === 'needs-work' && (
                  <Button variant="ghost" size="md" onClick={() => { setSubmitted(false); setFeedback(null); }}>
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
