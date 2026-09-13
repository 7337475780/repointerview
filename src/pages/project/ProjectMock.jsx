import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlaySquare,
  Sparkles,
  ShieldAlert,
  Flame,
  X,
  Send,
  SkipForward,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
} from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const MODES = [
  {
    id: 'standard',
    title: 'Standard Round',
    description: 'Balanced mix of architecture, implementation tradeoffs, and system design questions.',
    icon: PlaySquare,
  },
  {
    id: 'deep_dive',
    title: 'Technical Deep Dive',
    description: 'Drills deep into code-level patterns, concurrency, database queries, and edge cases.',
    icon: Sparkles,
  },
  {
    id: 'defense',
    title: 'Project Defense',
    description: 'Challenging questions pushing you to defend library choices, tech stack, and scalability decisions.',
    icon: ShieldAlert,
  },
  {
    id: 'rapid_fire',
    title: 'Rapid Fire',
    description: 'Fast-paced, concise conceptual and architectural questions with strict time targets.',
    icon: Flame,
  },
];

const ProjectMock = () => {
  const { id: projectId } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === projectId) || projects[0];

  // Setup state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState('standard');
  const [selectedDifficulty, setSelectedDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(4);

  // Live session state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isAnalyzed = Boolean(project?.intelligence) || project?.status === 'ANALYZED' || project?.status === 'READY';

  if (!project || !project.questions || project.questions.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        {project && <ProjectNav projectId={project.id} />}
        <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
          {isAnalyzed ? (
            <EmptyState
              icon={<PlaySquare size={24} className="text-accent" />}
              title="Mock interview simulation unlocks in Phase 5."
              description="Your repository is analyzed. Mock interview simulations will become active after question generation in Phase 4."
              actionLabel="View Project Overview"
              onAction={() => navigate(`/projects/${project.id}`)}
              className="py-16 max-w-xl"
            />
          ) : (
            <EmptyState
              icon={<PlaySquare size={24} className="text-accent" />}
              title="Repository analysis is required for mock interviews."
              description="Connect and analyze your repository to prepare for simulated interview rounds."
              actionLabel="Connect Repository"
              onAction={() => navigate('/projects/new')}
              className="py-16 max-w-xl"
            />
          )}
        </div>
      </div>
    );
  }

  const activeQuestions = project.questions.slice(0, questionCount);
  const currentQ = activeQuestions[questionIndex % activeQuestions.length] || project.questions[0];
  const progress = ((questionIndex + 1) / questionCount) * 100;

  const handleStartSession = () => {
    setSessionStarted(true);
    setQuestionIndex(0);
    setAnswer('');
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setFeedback(answer.length > 80 ? 'good' : 'needs_work');
    }, 500);
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 >= questionCount) {
      setSessionStarted(false);
      return;
    }
    setQuestionIndex(i => i + 1);
    setAnswer('');
    setSubmitted(false);
    setFeedback(null);
  };

  return (
    <div className="flex flex-col min-h-full">
      {!sessionStarted && <ProjectNav projectId={project.id} />}

      {!sessionStarted ? (
        /* Setup / Configuration Screen */
        <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 w-full">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Simulation Studio</p>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Mock Interview</h1>
            <p className="text-sm text-text-secondary mt-1">
              Configure an adaptive interview session based on <code className="text-accent font-mono text-xs">{project.repository.fullName}</code>
            </p>
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-8 shadow-sm">
            {/* Mode selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Select Interview Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MODES.map(mode => {
                  const isSelected = selectedMode === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={`flex flex-col gap-2 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-accent-subtle border-accent-border text-text-primary shadow-xs'
                          : 'bg-bg-elevated border-border hover:border-border-strong text-text-secondary'
                      }`}
                      onClick={() => setSelectedMode(mode.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isSelected ? 'text-accent' : 'text-text-tertiary'} />
                        <span className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                          {mode.title}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Number of Questions
                </label>
                <div className="flex items-center gap-2">
                  {[3, 4, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        questionCount === num
                          ? 'bg-accent-subtle border-accent-border text-accent'
                          : 'bg-bg-elevated border-border text-text-tertiary hover:text-text-primary'
                      }`}
                      onClick={() => setQuestionCount(num)}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Difficulty Level
                </label>
                <div className="flex items-center gap-2">
                  {['easy', 'medium', 'hard', 'mixed'].map(diff => (
                    <button
                      key={diff}
                      type="button"
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer capitalize ${
                        selectedDifficulty === diff
                          ? 'bg-accent-subtle border-accent-border text-accent font-semibold'
                          : 'bg-bg-elevated border-border text-text-tertiary hover:text-text-primary'
                      }`}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="border-t border-border-subtle pt-6 flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-mono">
                Estimated duration: ~{questionCount * 3} minutes
              </span>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={15} />}
                onClick={handleStartSession}
              >
                Begin session
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Immersive Live Session Screen */
        <div className="min-h-screen bg-bg-base flex flex-col" role="main">
          {/* Top Bar */}
          <div className="sticky top-0 z-[200] flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-base/90 backdrop-blur-md">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary hover:bg-bg-elevated px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              onClick={() => {
                if (window.confirm('Exit interview session?')) setSessionStarted(false);
              }}
            >
              <X size={15} />
              <span>Exit Session</span>
            </button>

            <div className="flex items-center gap-4 flex-1 max-w-xs mx-auto">
              <span className="font-mono text-xs text-text-tertiary whitespace-nowrap">
                Question {questionIndex + 1} of {questionCount}
              </span>
              <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary hover:bg-bg-elevated px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              onClick={handleNextQuestion}
            >
              <SkipForward size={14} />
              <span>Skip</span>
            </button>
          </div>

          {/* Stage */}
          <div className="flex-1 flex flex-col items-center px-6 py-12 max-w-2xl mx-auto w-full gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={questionIndex}
                className="w-full flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={currentQ.difficulty === 'hard' ? 'error' : 'warning'} size="sm">
                    {currentQ.difficulty}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {currentQ.category}
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
                  {currentQ.question}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Answer Input */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="input"
                  className="w-full flex flex-col gap-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                >
                  <label htmlFor="interview-answer" className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Your Response
                  </label>
                  <textarea
                    id="interview-answer"
                    className="w-full bg-bg-elevated border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-2xl p-5 text-sm sm:text-base text-text-primary placeholder:text-text-disabled leading-relaxed resize-none outline-none transition-all shadow-sm"
                    placeholder="Walk me through your design, tradeoffs, alternatives, and concrete code details..."
                    rows={6}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-text-disabled">
                      {answer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<Send size={13} />}
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim()}
                    >
                      Submit response
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="feedback"
                  className="w-full flex flex-col gap-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-bg-elevated border border-border rounded-2xl p-5 flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-disabled">Your response</span>
                    <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
                  </div>

                  {feedback && (
                    <motion.div
                      className={`flex items-start gap-4 p-5 rounded-2xl border ${
                        feedback === 'good'
                          ? 'bg-success/10 border-success-border text-text-primary'
                          : 'bg-warning/10 border-warning-border text-text-primary'
                      }`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          feedback === 'good' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {feedback === 'good' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {feedback === 'good' ? 'Solid technical defense' : 'Good attempt — needs more architectural depth'}
                        </p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {feedback === 'good'
                            ? 'You justified your decisions with concrete tradeoffs and mentioned relevant source files.'
                            : 'Consider detailing why you chose this pattern over standard alternatives and how it scales.'}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button variant="primary" size="md" onClick={handleNextQuestion}>
                      {questionIndex + 1 >= questionCount ? 'Complete interview' : 'Next question'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMock;
