import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ArrowRight, CheckCircle2, ChevronRight, Network, MessageSquare, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { QUESTIONS } from '../data/fixtures';

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

const useTypewriter = (text, speed = 45, active = true) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      return;
    }
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

// Mini architecture graph for hero
const MINI_NODES = [
  { id: 'fe', label: 'Next.js', x: 50, y: 20, color: '#4ADE80' },
  { id: 'api', label: 'tRPC', x: 25, y: 55, color: '#D4714A' },
  { id: 'auth', label: 'Auth', x: 75, y: 55, color: '#FBBF24' },
  { id: 'db', label: 'PostgreSQL', x: 15, y: 88, color: '#A78BFA' },
  { id: 'cache', label: 'Redis', x: 50, y: 88, color: '#F87171' },
  { id: 'ext', label: 'OpenAI', x: 82, y: 25, color: '#60A5FA' },
];
const MINI_EDGES = [
  ['fe', 'api'],
  ['fe', 'auth'],
  ['fe', 'ext'],
  ['api', 'db'],
  ['api', 'cache'],
  ['auth', 'cache'],
];

const HeroGraph = ({ visible }) => (
  <svg viewBox="0 0 100 100" className="w-full h-44 block" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    {MINI_EDGES.map(([from, to], i) => {
      const a = MINI_NODES.find(n => n.id === from);
      const b = MINI_NODES.find(n => n.id === to);
      return (
        <motion.line
          key={i}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={a.color}
          strokeWidth="0.8"
          strokeOpacity="0.35"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
        />
      );
    })}
    {MINI_NODES.map((node, i) => (
      <motion.g
        key={node.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: `${node.x}% ${node.y}%` }}
      >
        <circle cx={node.x} cy={node.y} r="4.5" fill={node.color} fillOpacity="0.15" stroke={node.color} strokeWidth="0.8" />
        <circle cx={node.x} cy={node.y} r="2" fill={node.color} />
        <text x={node.x} y={node.y + 8} textAnchor="middle" fontSize="4" fill="#B0A49A" fontFamily="var(--font-mono)">
          {node.label}
        </text>
      </motion.g>
    ))}
  </svg>
);

const FeatureStep = ({ number, title, description, icon, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-4 p-8 bg-bg-surface border border-border rounded-2xl relative shadow-sm"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.0, 0, 0.2, 1] }}
    >
      <div className="font-mono text-3xl font-bold text-text-disabled/40 select-none leading-none">{number}</div>
      <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mt-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </motion.div>
  );
};

const SampleQuestionCard = ({ q }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-3 p-5 bg-bg-elevated border border-border rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.0, 0, 0.2, 1] }}
    >
      <div className="flex items-center gap-2">
        <Badge variant={q.difficulty === 'hard' ? 'error' : 'warning'} size="xs">
          {q.difficulty}
        </Badge>
        <Badge variant="neutral" size="xs">
          {q.category}
        </Badge>
        <span className="ml-auto text-xs text-text-tertiary font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: q.probability > 80 ? '#4ADE80' : '#FBBF24' }} />
          {q.probability}% likely
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary leading-snug">"{q.question}"</p>
      <p className="font-mono text-2xs text-text-disabled">↳ Detected from prisma/schema.prisma</p>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const repoUrl = 'github.com/alexchen/notionify';
  const typedUrl = useTypewriter(repoUrl, 40, phase === 0);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase(1), 2800));
    PROGRESS_STAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setStageIndex(i), 2800 + i * 700));
    });
    timers.push(setTimeout(() => setPhase(2), 2800 + PROGRESS_STAGES.length * 700));
    timers.push(setTimeout(() => setPhase(3), 2800 + PROGRESS_STAGES.length * 700 + 1000));
    timers.push(setTimeout(() => setPhase(4), 2800 + PROGRESS_STAGES.length * 700 + 2200));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative pt-16 pb-20 overflow-hidden" aria-label="Product hero">
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-6">
          <motion.div
            className="inline-flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-full px-3.5 py-1 text-xs text-text-secondary shadow-xs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Repository-aware interview preparation</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary leading-[1.1]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your GitHub repository.
            <br />
            <span className="text-accent">Your technical interviewer.</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Understand your project. Predict the questions.
            <br className="hidden sm:inline" />
            Practice defending every technical decision.
          </motion.p>

          <motion.div
            className="flex items-center gap-4 flex-wrap justify-center pt-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={15} />}
              onClick={() => navigate('/dashboard')}
            >
              Analyze my repository
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/interview')}>
              See a demo interview
            </Button>
          </motion.div>
        </div>

        {/* --- Interactive product preview --- */}
        <motion.div
          className="max-w-5xl mx-auto px-6 mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* URL input bar */}
            <div className="flex items-center gap-4 px-5 py-3.5 bg-bg-elevated/80 border-b border-border-subtle">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-error/50" />
                <span className="w-3 h-3 rounded-full bg-warning/50" />
                <span className="w-3 h-3 rounded-full bg-success/50" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-bg-base border border-border rounded-lg px-3 py-1.5 text-xs text-text-secondary">
                <GitBranch size={13} className="text-text-tertiary flex-shrink-0" />
                <span className="font-mono text-text-primary flex-1">
                  {typedUrl}
                  <span className="inline-block w-1.5 h-3 bg-accent ml-1 align-middle animate-pulse" aria-hidden="true" />
                </span>
              </div>
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.div
                    className="flex items-center gap-1.5 text-xs font-mono text-accent"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    <span>Analyzing</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content area */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: progress + stack */}
              <div className="md:col-span-8 flex flex-col gap-6">
                {/* Progress stages */}
                <AnimatePresence mode="wait">
                  {phase >= 1 && phase < 3 && (
                    <motion.div
                      key="progress"
                      className="flex flex-col gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                        Analyzing repository
                      </p>
                      <div className="flex flex-col gap-2">
                        {PROGRESS_STAGES.map((stage, i) => (
                          <motion.div
                            key={stage}
                            className={`flex items-center gap-2 text-xs font-mono ${
                              i <= stageIndex
                                ? 'text-text-primary'
                                : i === stageIndex + 1
                                ? 'text-accent font-semibold'
                                : 'text-text-disabled'
                            }`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.04 }}
                          >
                            <span className="w-4 text-center font-bold" aria-hidden="true">
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
                      className="flex flex-col gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                        Technologies detected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TECH_STACK.map((tech, i) => (
                          <motion.span
                            key={tech.name}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-bg-elevated border border-border-subtle rounded-md px-2.5 py-1"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tech.color }} />
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
                      className="bg-bg-elevated border border-border rounded-xl p-5 flex flex-col gap-3"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" size="xs">
                          Medium
                        </Badge>
                        <Badge variant="neutral" size="xs">
                          Database
                        </Badge>
                        <span className="ml-auto font-mono text-xs text-text-tertiary">92% likely</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary leading-snug">
                        "Why did you choose PostgreSQL over MongoDB for this project?"
                      </p>
                      <p className="font-mono text-2xs text-text-disabled">↳ prisma/schema.prisma</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: architecture graph */}
              <div className="md:col-span-4 flex flex-col gap-3">
                <AnimatePresence>
                  {phase >= 3 && (
                    <motion.div
                      className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">Architecture</p>
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
      <section className="py-24 border-t border-border-subtle bg-bg-surface/30" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="flex flex-col items-center text-center gap-2 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-accent" id="how-heading">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">From repository to interview-ready</h2>
            <p className="text-sm text-text-secondary">Three steps. Zero prep guesswork.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <section className="py-24 border-t border-border-subtle" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="flex flex-col gap-5"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Questions</p>
              <h2 className="text-3xl font-bold tracking-tight text-text-primary">
                Interview questions from your actual code
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Every question traces back to a specific technical decision in your repository — a schema choice, an API
                pattern, an architectural tradeoff. You know why you'll be asked it before you are.
              </p>
              <ul className="flex flex-col gap-2.5 my-2">
                {[
                  'Probability score based on code analysis',
                  'Evidence linked to exact file and line',
                  'Follow-up questions pre-generated',
                  'Difficulty calibrated to your stack',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="md"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => navigate('/questions')}
                className="self-start -ml-4"
              >
                Browse sample questions
              </Button>
            </motion.div>
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <SampleQuestionCard q={QUESTIONS[0]} />
              <SampleQuestionCard q={QUESTIONS[2]} />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="flex flex-col gap-5 lg:order-2"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Mock Interview</p>
              <h2 className="text-3xl font-bold tracking-tight text-text-primary">A focused interview environment</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Not a quiz. A real interview simulation. The AI interviewer leads, adapts based on your answers, and gives
                structured feedback on your technical depth and communication.
              </p>
              <ul className="flex flex-col gap-2.5 my-2">
                {[
                  'Immersive, distraction-free interface',
                  'AI adapts to your answer quality',
                  'Scored on clarity, depth, and accuracy',
                  'Timestamped review after each session',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="md"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => navigate('/interview')}
                className="self-start -ml-4"
              >
                Start a mock interview
              </Button>
            </motion.div>
            <motion.div
              className="lg:order-1"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-text-tertiary border-b border-border-subtle pb-3">
                  <span className="font-mono">Question 3 / 12</span>
                  <div className="w-24 h-1 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  Walk me through your authentication architecture using NextAuth.js. Specifically, how do you handle session
                  invalidation?
                </p>
                <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle flex flex-col gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-widest text-text-disabled">Your answer</span>
                  <div className="w-2 h-4 bg-accent/60 animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 border-t border-border-subtle bg-gradient-to-b from-bg-base to-bg-surface/50" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            className="flex flex-col items-center gap-5 p-12 bg-bg-surface border border-border rounded-3xl shadow-lg relative overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent" aria-hidden="true">
              <Zap size={24} />
            </div>
            <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-text-primary">
              Your interview lab is empty.
            </h2>
            <p className="text-sm text-text-secondary max-w-md">
              Connect a GitHub repository and we'll map the project before your interviewer does.
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={15} />}
              onClick={() => navigate('/dashboard')}
            >
              Analyze repository
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 border-t border-border-subtle text-xs text-text-tertiary" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center text-text-primary" aria-hidden="true">
              <GitBranch size={12} />
            </div>
            <span className="font-semibold text-text-primary">RepoInterview AI</span>
          </div>
          <p>Built for engineers. Refined for the moment it matters most.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
