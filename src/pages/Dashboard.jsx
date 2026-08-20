import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Star, Clock, Play, ChevronRight, TrendingUp, TrendingDown, BarChart2, ExternalLink } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { REPO, QUESTIONS, RECENT_INTERVIEWS, WEAK_AREAS } from '../data/fixtures';

// Animated score counter
const AnimatedScore = ({ target, suffix = '' }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
        return;
      }
      setVal(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{val}{suffix}</span>;
};

// Readiness ring
const ReadinessRing = ({ score }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setProgress(score / 100), 200);
    return () => clearTimeout(timer);
  }, [inView, score]);

  const scoreColor = score >= 75 ? 'var(--color-success)' : score >= 55 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center" ref={ref}>
      <svg viewBox="0 0 120 120" className="w-32 h-32 transform -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.2, ease: [0.0, 0, 0.2, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-sans leading-none" style={{ color: scoreColor }}>
          <AnimatedScore target={score} />
        </span>
        <span className="text-xs text-text-tertiary mt-1">/ 100</span>
      </div>
    </div>
  );
};

// Question card for dashboard
const DashboardQuestionCard = ({ q, index }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      className="w-full bg-bg-surface border border-border hover:border-border-strong rounded-xl p-5 text-left cursor-pointer flex flex-col gap-3 transition-all duration-150 relative group shadow-sm hover:shadow-md"
      onClick={() => navigate(`/questions/${q.id}`)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      aria-label={`View question: ${q.question}`}
    >
      <div className="flex items-center gap-2">
        <Badge variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'} size="xs">
          {q.difficulty}
        </Badge>
        <Badge variant="neutral" size="xs">
          {q.category}
        </Badge>
        <span className="ml-auto text-xs text-text-tertiary flex items-center gap-1.5 font-mono">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: q.probability >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          {q.probability}%
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2">{q.question}</p>
      <div className="flex items-center justify-between mt-auto pt-2 text-xs text-text-tertiary">
        <span className="font-mono text-2xs truncate max-w-[200px]">↳ {q.evidence.filename}</span>
        <ChevronRight
          size={14}
          className="text-text-disabled group-hover:text-accent group-hover:translate-x-0.5 transition-all"
          aria-hidden="true"
        />
      </div>
    </motion.button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-16">
      {/* === PROJECT HEADER === */}
      <section className="border-b border-border-subtle py-8 bg-gradient-to-b from-bg-elevated/40 to-bg-base">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-start gap-3.5">
              <div
                className="w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-accent flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <GitBranch size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-2xl font-semibold tracking-normal text-text-primary">
                    {REPO.fullName}
                  </h1>
                  <a
                    href={REPO.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-tertiary hover:text-accent transition-colors"
                    aria-label="Open repository on GitHub"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-sm text-text-tertiary mt-1">{REPO.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <Star size={13} />
                {REPO.stars.toLocaleString()}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
              <span className="flex items-center gap-1">
                <Clock size={13} />
                Analyzed {REPO.lastAnalyzed}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {REPO.techStack.map(tech => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-bg-elevated border border-border-subtle rounded-md px-2.5 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tech.color }} aria-hidden="true" />
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            <Button variant="primary" size="md" leftIcon={<Play size={14} />} onClick={() => navigate('/interview')}>
              Start interview
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/architecture')}>
              View architecture
            </Button>
          </div>
        </div>
      </section>

      {/* === STATS ROW === */}
      <section className="py-6 border-b border-border-subtle bg-bg-surface/30" aria-label="Repository statistics">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border-subtle border border-border-subtle rounded-xl overflow-hidden shadow-xs">
            {[
              { label: 'Total files', value: REPO.stats.totalFiles.toLocaleString() },
              { label: 'Lines of code', value: `${(REPO.stats.linesOfCode / 1000).toFixed(1)}k` },
              { label: 'API routes', value: REPO.stats.apiRoutes },
              { label: 'Components', value: REPO.stats.components },
              { label: 'DB tables', value: REPO.stats.dbTables },
              { label: 'Test coverage', value: `${REPO.stats.testCoverage}%` },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col gap-1 p-4 bg-bg-base hover:bg-bg-elevated/80 transition-colors"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <span className="text-2xl font-semibold text-text-primary tracking-tight font-sans">
                  {stat.value}
                </span>
                <span className="text-xs text-text-tertiary">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === MAIN GRID === */}
      <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        {/* -- Interview readiness -- */}
        <section
          className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col p-6 items-center text-center gap-6"
          aria-labelledby="readiness-heading"
        >
          <div className="w-full flex items-center justify-between border-b border-border-subtle pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary" id="readiness-heading">
              Interview readiness
            </h2>
            <Badge variant={REPO.analysisScore >= 75 ? 'success' : 'warning'} size="xs">
              {REPO.analysisScore >= 75 ? 'Ready' : 'In Progress'}
            </Badge>
          </div>

          <ReadinessRing score={REPO.analysisScore} />

          <div className="flex flex-col items-center gap-2">
            <p className="text-base font-semibold text-text-primary">
              {REPO.analysisScore >= 75 ? 'Ready for technical rounds' : 'Focus on weak areas'}
            </p>
            <p className="text-xs text-text-tertiary max-w-[240px]">
              Based on {QUESTIONS.length} predicted questions analyzing your codebase.
            </p>
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={() => navigate('/interview')}>
            Start practice session
          </Button>
        </section>

        {/* -- Weak areas -- */}
        <section
          className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col p-6 gap-5"
          aria-labelledby="weak-heading"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary" id="weak-heading">
              Areas to strengthen
            </h2>
            <button
              onClick={() => navigate('/questions')}
              className="text-xs text-accent hover:text-accent-hover transition-colors font-medium cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {WEAK_AREAS.map((area, i) => (
              <motion.div
                key={area.topic}
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium truncate max-w-[200px]">{area.topic}</span>
                  <span
                    className="font-mono font-semibold"
                    style={{
                      color: area.score < 60 ? 'var(--color-error-text)' : 'var(--color-warning-text)',
                    }}
                  >
                    {area.score}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: area.score < 60 ? 'var(--color-error)' : 'var(--color-warning)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${area.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.0, 0, 0.2, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -- Recent interviews -- */}
        <section
          className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col p-6 gap-4"
          aria-labelledby="recent-heading"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary" id="recent-heading">
              Recent sessions
            </h2>
            <BarChart2 size={16} className="text-text-tertiary" aria-hidden="true" />
          </div>

          {RECENT_INTERVIEWS.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm text-text-tertiary">No past interviews recorded yet.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/interview')}>
                Start first session
              </Button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle">
              {RECENT_INTERVIEWS.map((iv, i) => (
                <motion.div
                  key={iv.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-2xs text-text-disabled">{iv.date}</span>
                    <span className="text-text-primary font-medium">
                      {iv.questionsAnswered} questions · {iv.duration}
                    </span>
                    <span className="text-text-tertiary text-2xs">↳ {iv.weakArea}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-lg font-semibold font-mono text-text-primary">{iv.score}</span>
                    <span
                      className={`flex items-center gap-0.5 font-mono text-2xs ${
                        iv.improvement >= 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {iv.improvement >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(iv.improvement)} pts
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* === TOP QUESTIONS === */}
      <section className="max-w-7xl mx-auto px-6 pt-12" aria-labelledby="questions-heading">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Curated Questions</p>
            <h2 id="questions-heading" className="text-2xl font-semibold text-text-primary tracking-tight mt-1">
              Top predicted questions
            </h2>
          </div>
          <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={13} />} onClick={() => navigate('/questions')}>
            All {QUESTIONS.length} questions
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUESTIONS.slice(0, 4).map((q, i) => (
            <DashboardQuestionCard key={q.id} q={q} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
