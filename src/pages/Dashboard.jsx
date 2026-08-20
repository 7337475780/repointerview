import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Star, Clock, Play, ChevronRight, TrendingUp, TrendingDown, BarChart2, ExternalLink } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { REPO, QUESTIONS, RECENT_INTERVIEWS, WEAK_AREAS } from '../data/fixtures';
import './Dashboard.css';

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
      if (start >= target) { setVal(target); clearInterval(timer); return; }
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
    <div className="readiness-ring" ref={ref}>
      <svg viewBox="0 0 120 120" className="readiness-ring__svg" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.2, ease: [0.0, 0, 0.2, 1], delay: 0.2 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <div className="readiness-ring__label">
        <span className="readiness-ring__score" style={{ color: scoreColor }}>
          <AnimatedScore target={score} />
        </span>
        <span className="readiness-ring__sub">/ 100</span>
      </div>
    </div>
  );
};

// Question card for dashboard
const DashboardQuestionCard = ({ q, index }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      className="dq-card"
      onClick={() => navigate(`/questions/${q.id}`)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      aria-label={`View question: ${q.question}`}
    >
      <div className="dq-card__header">
        <Badge variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'} size="xs">{q.difficulty}</Badge>
        <Badge variant="neutral" size="xs">{q.category}</Badge>
        <span className="dq-card__prob">
          <span
            className="dq-card__prob-dot"
            style={{ background: q.probability >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          {q.probability}%
        </span>
      </div>
      <p className="dq-card__q">{q.question}</p>
      <ChevronRight size={13} className="dq-card__arrow" aria-hidden="true" />
    </motion.button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard page">
      {/* === PROJECT HEADER === */}
      <section className="proj-header">
        <div className="container proj-header__inner">
          <div className="proj-header__left">
            <div className="proj-header__title-row">
              <div className="proj-header__repo-icon" aria-hidden="true">
                <GitBranch size={16} />
              </div>
              <div>
                <div className="proj-header__name-row">
                  <h1 className="proj-header__name">{REPO.fullName}</h1>
                  <a href={REPO.url} target="_blank" rel="noopener noreferrer" className="proj-header__link" aria-label="Open repository on GitHub">
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="proj-header__desc">{REPO.description}</p>
              </div>
            </div>
            <div className="proj-header__meta">
              <span className="proj-meta-item">
                <Star size={12} />
                {REPO.stars.toLocaleString()}
              </span>
              <span className="proj-meta-sep" aria-hidden="true" />
              <span className="proj-meta-item">
                <Clock size={12} />
                Analyzed {REPO.lastAnalyzed}
              </span>
            </div>
            <div className="proj-header__stack">
              {REPO.techStack.map(tech => (
                <span key={tech.name} className="proj-tech" style={{ '--dot-color': tech.color }}>
                  <span className="proj-tech__dot" aria-hidden="true" />
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
          <div className="proj-header__actions">
            <Button variant="primary" size="md" leftIcon={<Play size={13} />} onClick={() => navigate('/interview')}>
              Start interview
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/architecture')}>
              View architecture
            </Button>
          </div>
        </div>
      </section>

      {/* === STATS ROW === */}
      <section className="stats-row" aria-label="Repository statistics">
        <div className="container">
          <div className="stats-grid">
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
                className="stat-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <span className="stat-item__value">{stat.value}</span>
                <span className="stat-item__label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === MAIN GRID === */}
      <div className="container dash-grid">

        {/* -- Interview readiness -- */}
        <section className="dash-card readiness-card" aria-labelledby="readiness-heading">
          <div className="dash-card__header">
            <h2 className="dash-card__title" id="readiness-heading">Interview readiness</h2>
          </div>
          <div className="readiness-body">
            <ReadinessRing score={REPO.analysisScore} />
            <div className="readiness-details">
              <p className="readiness-details__status">
                {REPO.analysisScore >= 75 ? 'Ready to interview' : 'Keep practicing'}
              </p>
              <p className="readiness-details__hint">Based on {QUESTIONS.length} questions analyzed from your codebase.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/interview')}>
                Practice now
              </Button>
            </div>
          </div>
        </section>

        {/* -- Weak areas -- */}
        <section className="dash-card weak-card" aria-labelledby="weak-heading">
          <div className="dash-card__header">
            <h2 className="dash-card__title" id="weak-heading">Areas to strengthen</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/questions')}>View all</Button>
          </div>
          <div className="weak-list">
            {WEAK_AREAS.map((area, i) => (
              <motion.div
                key={area.topic}
                className="weak-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className="weak-item__header">
                  <span className="weak-item__topic">{area.topic}</span>
                  <span className="weak-item__score" style={{ color: area.score < 60 ? 'var(--color-error-text)' : 'var(--color-warning-text)' }}>
                    {area.score}
                  </span>
                </div>
                <div className="weak-item__bar-bg">
                  <motion.div
                    className="weak-item__bar-fill"
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
        <section className="dash-card recent-card" aria-labelledby="recent-heading">
          <div className="dash-card__header">
            <h2 className="dash-card__title" id="recent-heading">Recent interviews</h2>
            <BarChart2 size={14} className="dash-card__header-icon" aria-hidden="true" />
          </div>
          {RECENT_INTERVIEWS.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__title">Your interview lab is empty.</p>
              <p className="empty-state__desc">Connect a repository and start your first session.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/interview')}>Start interview</Button>
            </div>
          ) : (
            <div className="recent-list">
              {RECENT_INTERVIEWS.map((iv, i) => (
                <motion.div
                  key={iv.id}
                  className="recent-item"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                >
                  <div className="recent-item__date mono">{iv.date}</div>
                  <div className="recent-item__info">
                    <span>{iv.questionsAnswered} questions · {iv.duration}</span>
                    <span className="recent-item__weak">↳ {iv.weakArea}</span>
                  </div>
                  <div className="recent-item__score">
                    <span className="recent-item__score-val">{iv.score}</span>
                    <span className={`recent-item__delta ${iv.improvement >= 0 ? 'recent-item__delta--up' : 'recent-item__delta--down'}`}>
                      {iv.improvement >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {Math.abs(iv.improvement)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* === TOP QUESTIONS === */}
      <section className="container top-questions" aria-labelledby="questions-heading">
        <div className="top-questions__header">
          <div>
            <p className="section-label">Top questions</p>
            <h2 id="questions-heading" className="top-questions__title">Most likely to be asked</h2>
          </div>
          <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={13} />} onClick={() => navigate('/questions')}>
            All {QUESTIONS.length} questions
          </Button>
        </div>
        <div className="top-questions__grid">
          {QUESTIONS.slice(0, 4).map((q, i) => (
            <DashboardQuestionCard key={q.id} q={q} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
