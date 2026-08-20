import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ArrowRight, CheckCircle2, ChevronRight, Terminal, Network, MessageSquare, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { QUESTIONS, REPO } from '../data/fixtures';
import './Landing.css';

// --- Hero animation sequence ---
const HERO_PHASES = [
  'idle',       // just the input
  'analyzing',  // progress steps
  'stack',      // tech stack appears
  'graph',      // architecture graph
  'question',   // interview question
];

const TECH_STACK = [
  { name: 'Next.js 14', color: '#4ADE80' },
  { name: 'PostgreSQL', color: '#A78BFA' },
  { name: 'Prisma ORM', color: '#60A5FA' },
  { name: 'NextAuth.js', color: '#FBBF24' },
  { name: 'tRPC', color: '#D4714A' },
  { name: 'Redis', color: '#F87171' },
  { name: 'AWS S3', color: '#38BDF8' },
  { name: 'TypeScript', color: '#60A5FA' },
];

const PROGRESS_STAGES = [
  'Reading repository structure',
  'Detecting technologies',
  'Understanding architecture',
  'Mapping API surface',
  'Preparing interview questions',
];

// Simple typing animation hook
const useTypewriter = (text, speed = 45, active = true) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, active]);
  return displayed;
};

// --- Mini architecture graph for hero ---
const MINI_NODES = [
  { id: 'fe', label: 'Next.js', x: 50, y: 20, color: '#4ADE80' },
  { id: 'api', label: 'tRPC', x: 25, y: 55, color: '#D4714A' },
  { id: 'auth', label: 'Auth', x: 75, y: 55, color: '#FBBF24' },
  { id: 'db', label: 'PostgreSQL', x: 15, y: 88, color: '#A78BFA' },
  { id: 'cache', label: 'Redis', x: 50, y: 88, color: '#F87171' },
  { id: 'ext', label: 'OpenAI', x: 82, y: 25, color: '#60A5FA' },
];
const MINI_EDGES = [
  ['fe', 'api'], ['fe', 'auth'], ['fe', 'ext'],
  ['api', 'db'], ['api', 'cache'], ['auth', 'cache'],
];

const HeroGraph = ({ visible }) => (
  <svg
    viewBox="0 0 100 100"
    className="hero-graph"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid meet"
  >
    {MINI_EDGES.map(([from, to], i) => {
      const a = MINI_NODES.find(n => n.id === from);
      const b = MINI_NODES.find(n => n.id === to);
      return (
        <motion.line
          key={i}
          x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={a.color}
          strokeWidth="0.6"
          strokeOpacity="0.35"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
        />
      );
    })}
    {MINI_NODES.map((node, i) => (
      <motion.g key={node.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: `${node.x}% ${node.y}%` }}
      >
        <circle cx={node.x} cy={node.y} r="4.5" fill={node.color} fillOpacity="0.15" stroke={node.color} strokeWidth="0.8" />
        <circle cx={node.x} cy={node.y} r="2" fill={node.color} />
        <text x={node.x} y={node.y + 8} textAnchor="middle" fontSize="4" fill="#B0A49A" fontFamily="var(--font-mono)">{node.label}</text>
      </motion.g>
    ))}
  </svg>
);

// --- Animated feature step card ---
const FeatureStep = ({ number, title, description, icon, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className="feature-step"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.0, 0, 0.2, 1] }}
    >
      <div className="feature-step__number">{number}</div>
      <div className="feature-step__icon">{icon}</div>
      <h3 className="feature-step__title">{title}</h3>
      <p className="feature-step__desc">{description}</p>
    </motion.div>
  );
};

// --- Sample question card for landing ---
const SampleQuestionCard = ({ q }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className="sample-question"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.0, 0, 0.2, 1] }}
    >
      <div className="sample-question__meta">
        <Badge variant={q.difficulty === 'hard' ? 'error' : 'warning'} size="sm">{q.difficulty}</Badge>
        <Badge variant="neutral" size="sm">{q.category}</Badge>
        <span className="sample-question__prob">
          <span className="sample-question__prob-dot" style={{ background: q.probability > 80 ? '#4ADE80' : '#FBBF24' }} />
          {q.probability}% likely
        </span>
      </div>
      <p className="sample-question__text">"{q.question}"</p>
      <p className="sample-question__hint">— Detected from <code>prisma/schema.prisma</code></p>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const heroRef = useRef(null);
  const repoUrl = 'github.com/alexchen/notionify';
  const typedUrl = useTypewriter(repoUrl, 40, phase === 0);

  // Drive the animation sequence
  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase(1), 2800));         // start analysis
    // tick stages
    PROGRESS_STAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setStageIndex(i), 2800 + i * 700));
    });
    timers.push(setTimeout(() => setPhase(2), 2800 + PROGRESS_STAGES.length * 700)); // show stack
    timers.push(setTimeout(() => setPhase(3), 2800 + PROGRESS_STAGES.length * 700 + 1000)); // show graph
    timers.push(setTimeout(() => setPhase(4), 2800 + PROGRESS_STAGES.length * 700 + 2200)); // show question
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="landing">
      {/* ===== HERO ===== */}
      <section className="hero" ref={heroRef} aria-label="Product hero">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__glow" />
        </div>

        <div className="container hero__content">
          <motion.div
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="hero__eyebrow-dot" />
            <span>Repository-aware interview preparation</span>
          </motion.div>

          <motion.h1
            className="hero__headline"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your GitHub repository.
            <br />
            <span className="hero__headline-accent">Your technical interviewer.</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Understand your project. Predict the questions.
            <br />
            Practice defending every technical decision.
          </motion.p>

          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />} onClick={() => navigate('/dashboard')}>
              Analyze my repository
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/interview')}>
              See a demo interview
            </Button>
          </motion.div>
        </div>

        {/* --- Interactive product preview --- */}
        <motion.div
          className="hero__preview container"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <div className="product-preview">
            {/* URL input */}
            <div className="preview-url-bar">
              <div className="preview-url-bar__dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <div className="preview-url-bar__input">
                <GitBranch size={12} className="preview-url-bar__icon" />
                <span className="preview-url-bar__text mono">
                  {typedUrl}
                  <span className="preview-url-bar__cursor" aria-hidden="true" />
                </span>
              </div>
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.div
                    className="preview-url-bar__status"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="preview-url-bar__pulse" />
                    <span>Analyzing</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content area */}
            <div className="preview-body">
              {/* Left: progress + stack */}
              <div className="preview-left">
                {/* Progress stages */}
                <AnimatePresence mode="wait">
                  {phase >= 1 && phase < 3 && (
                    <motion.div
                      key="progress"
                      className="preview-section"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="preview-section__label">Analyzing repository</p>
                      <div className="preview-stages">
                        {PROGRESS_STAGES.map((stage, i) => (
                          <motion.div
                            key={stage}
                            className={`preview-stage ${i <= stageIndex ? 'preview-stage--done' : i === stageIndex + 1 ? 'preview-stage--active' : 'preview-stage--pending'}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.04 }}
                          >
                            <span className="preview-stage__icon" aria-hidden="true">
                              {i < stageIndex ? '✓' : i === stageIndex ? '●' : '○'}
                            </span>
                            <span>{stage}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tech stack */}
                <AnimatePresence>
                  {phase >= 2 && (
                    <motion.div
                      key="stack"
                      className="preview-section"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="preview-section__label">Technologies detected</p>
                      <div className="preview-stack">
                        {TECH_STACK.map((tech, i) => (
                          <motion.span
                            key={tech.name}
                            className="preview-tech"
                            style={{ '--tech-color': tech.color }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                          >
                            <span className="preview-tech__dot" />
                            {tech.name}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Question card */}
                <AnimatePresence>
                  {phase >= 4 && (
                    <motion.div
                      key="question"
                      className="preview-section preview-question-card"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="preview-question-card__header">
                        <Badge variant="warning" size="xs">Medium</Badge>
                        <Badge variant="neutral" size="xs">Database</Badge>
                        <span className="preview-question-card__prob">92% likely</span>
                      </div>
                      <p className="preview-question-card__q">
                        "Why did you choose PostgreSQL over MongoDB for this project?"
                      </p>
                      <p className="preview-question-card__source mono">↳ prisma/schema.prisma</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: architecture graph */}
              <div className="preview-right">
                <AnimatePresence>
                  {phase >= 3 && (
                    <motion.div
                      className="preview-arch"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="preview-section__label">Architecture</p>
                      <HeroGraph visible={phase >= 3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works" aria-labelledby="how-heading">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-label" id="how-heading">How it works</p>
            <h2 className="section-title">From repository to interview-ready</h2>
            <p className="section-desc">Three steps. Zero prep guesswork.</p>
          </motion.div>

          <div className="feature-steps">
            <FeatureStep
              number="01"
              icon={<GitBranch size={18} />}
              title="Connect your repository"
              description="Paste a GitHub URL. RepoInterview AI reads your codebase: structure, dependencies, architecture, patterns, and technical decisions."
              delay={0}
            />
            <FeatureStep
              number="02"
              icon={<Network size={18} />}
              title="Receive an architecture map"
              description="The system identifies your tech stack, maps relationships between services, and understands the decisions encoded in your code."
              delay={0.1}
            />
            <FeatureStep
              number="03"
              icon={<MessageSquare size={18} />}
              title="Practice with precision"
              description="Interview questions are generated from your actual technical decisions — not generic templates. Practice defending what you built."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURE HIGHLIGHT ===== */}
      <section className="features" aria-labelledby="features-heading">
        <div className="container">
          <div className="feature-row">
            <motion.div
              className="feature-row__text"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
            >
              <p className="section-label">Questions</p>
              <h2>Interview questions from your actual code</h2>
              <p>Every question traces back to a specific technical decision in your repository — a schema choice, an API pattern, an architectural tradeoff. You know why you'll be asked it before you are.</p>
              <ul className="feature-list">
                {['Probability score based on code analysis', 'Evidence linked to exact file and line', 'Follow-up questions pre-generated', 'Difficulty calibrated to your stack'].map(item => (
                  <li key={item} className="feature-list__item">
                    <CheckCircle2 size={14} className="feature-list__check" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="md" rightIcon={<ChevronRight size={14} />} onClick={() => navigate('/questions')}>
                Browse sample questions
              </Button>
            </motion.div>
            <motion.div
              className="feature-row__visual"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <SampleQuestionCard q={QUESTIONS[0]} />
              <SampleQuestionCard q={QUESTIONS[2]} />
            </motion.div>
          </div>

          <div className="feature-divider" aria-hidden="true" />

          <div className="feature-row feature-row--reverse">
            <motion.div
              className="feature-row__text"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
            >
              <p className="section-label">Mock Interview</p>
              <h2>A focused interview environment</h2>
              <p>Not a quiz. A real interview simulation. The AI interviewer leads, adapts based on your answers, and gives structured feedback on your technical depth and communication.</p>
              <ul className="feature-list">
                {['Immersive, distraction-free interface', 'AI adapts to your answer quality', 'Scored on clarity, depth, and accuracy', 'Timestamped review after each session'].map(item => (
                  <li key={item} className="feature-list__item">
                    <CheckCircle2 size={14} className="feature-list__check" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="md" rightIcon={<ChevronRight size={14} />} onClick={() => navigate('/interview')}>
                Start a mock interview
              </Button>
            </motion.div>
            <motion.div
              className="feature-row__visual"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="interview-preview-card">
                <div className="interview-preview-card__progress">
                  <span className="mono">Question 3 / 12</span>
                  <div className="interview-preview-card__bar">
                    <div className="interview-preview-card__fill" style={{ width: '25%' }} />
                  </div>
                </div>
                <p className="interview-preview-card__q">
                  Walk me through your authentication architecture using NextAuth.js. Specifically, how do you handle session invalidation?
                </p>
                <div className="interview-preview-card__response">
                  <span className="section-label">Your answer</span>
                  <div className="interview-preview-card__cursor" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="container">
          <motion.div
            className="cta-inner"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
          >
            <div className="cta-icon" aria-hidden="true">
              <Zap size={24} />
            </div>
            <h2 id="cta-heading">Your interview lab is empty.</h2>
            <p>Connect a GitHub repository and we'll map the project before your interviewer does.</p>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />} onClick={() => navigate('/dashboard')}>
              Analyze repository
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer" role="contentinfo">
        <div className="container landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="nav__logo-icon" style={{ width: 22, height: 22 }} aria-hidden="true">
              <GitBranch size={12} />
            </div>
            <span className="landing-footer__name">RepoInterview AI</span>
          </div>
          <p className="landing-footer__copy">Built for engineers. Refined for the moment it matters most.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
