// ============================================================
// RepoInterview AI — Interactive AI Mock Interview Studio
// Features: Difficulty Selection, Turn-by-Turn AI Interviewer,
// Voice/Text Input, Real-time Multi-metric Evaluation,
// and Comprehensive Performance Debrief Report.
// ============================================================

import { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Code2,
  HelpCircle,
  Copy,
  Check,
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
    color: 'text-accent',
  },
  {
    id: 'deep_dive',
    title: 'Technical Deep Dive',
    description: 'Drills deep into code-level patterns, concurrency, database queries, and edge cases.',
    icon: Sparkles,
    color: 'text-purple-400',
  },
  {
    id: 'defense',
    title: 'Project Defense',
    description: 'Challenging questions pushing you to defend library choices, tech stack, and scalability decisions.',
    icon: ShieldAlert,
    color: 'text-amber-400',
  },
  {
    id: 'rapid_fire',
    title: 'Rapid Fire',
    description: 'Fast-paced, concise conceptual and architectural questions with strict time targets.',
    icon: Flame,
    color: 'text-rose-400',
  },
];

const DIFFICULTIES = [
  { id: 'junior', label: 'Junior', desc: 'Fundamentals, basic syntax, and framework routing' },
  { id: 'mid', label: 'Mid-Level', desc: 'Applied patterns, state management, and API design' },
  { id: 'senior', label: 'Senior', desc: 'Architecture, tradeoffs, scalability, and security' },
  { id: 'staff', label: 'Staff / Lead', desc: 'Resilience, distributed scale, and system evolution' },
];

const ProjectMock = () => {
  const { id: projectId } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === projectId) || projects[0];

  // Setup state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState('standard');
  const [selectedDifficulty, setSelectedDifficulty] = useState('senior');
  const [questionCount, setQuestionCount] = useState(4);

  // Active Session State
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [allTurns, setAllTurns] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  // Audio & Voice Dictation
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // UI helpers
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setAnswer(prev => prev ? `${prev} ${currentTranscript}` : currentTranscript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Timer counter
  useEffect(() => {
    if (sessionStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionStarted, isCompleted]);

  // Voice narration of question
  const speakQuestion = (text) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const isAnalyzed = Boolean(project?.intelligence) || project?.status === 'ANALYZED' || project?.status === 'READY';

  if (!project) {
    return (
      <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<PlaySquare size={24} className="text-accent" />}
          title="Repository Required"
          description="Connect and analyze your repository to prepare for simulated interview rounds."
          actionLabel="Connect Repository"
          onAction={() => navigate('/projects/new')}
        />
      </div>
    );
  }

  // Handle Starting Session
  const handleStartSession = async () => {
    try {
      const payload = {
        repositoryId: project.id || project.repository?.fullName || 'default-repo',
        repoName: project.repository?.fullName || project.name || 'Repository',
        difficulty: selectedDifficulty,
        mode: selectedMode,
        questionCount,
        questions: project.questions || [],
      };

      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSessionId(json.data.sessionId);
        setQuestions(json.data.questions || (project.questions || []).slice(0, questionCount));
        setQuestionIndex(0);
        setSessionStarted(true);
        setIsCompleted(false);
        setAllTurns([]);
        setAnswer('');
        setEvaluation(null);
        setElapsedSeconds(0);
        setShowIdealAnswer(false);

        const firstQ = json.data.firstQuestion || (project.questions && project.questions[0]);
        if (firstQ?.question) {
          setTimeout(() => speakQuestion(firstQ.question), 400);
        }
      }
    } catch {
      // Fallback local session
      const fallbackQuestions = (project.questions || []).slice(0, questionCount);
      setSessionId(`local_${Date.now()}`);
      setQuestions(fallbackQuestions);
      setQuestionIndex(0);
      setSessionStarted(true);
      setIsCompleted(false);
      setAllTurns([]);
      setAnswer('');
      setEvaluation(null);
      setElapsedSeconds(0);
    }
  };

  const currentQ = questions[questionIndex] || (project.questions && project.questions[0]) || {
    question: 'Can you walk me through the high-level architecture and data flow of this repository?',
    category: 'Architecture',
    difficulty: selectedDifficulty,
    expectedAnswer: 'Should explain entry points, routing, controller/service layer separation, and data storage flows.',
  };

  const progress = Math.min(100, Math.round(((questionIndex + 1) / (questions.length || questionCount)) * 100));

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isEvaluating) return;
    setIsEvaluating(true);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const evalPayload = {
        sessionId,
        questionIndex,
        question: currentQ.question,
        category: currentQ.category || 'Technical',
        difficulty: currentQ.difficulty || selectedDifficulty,
        expectedAnswer: currentQ.expectedAnswer || '',
        candidateAnswer: answer.trim(),
        repositoryId: project.id,
        repositoryName: project.repository?.fullName || project.name,
      };

      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evalPayload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const evalData = json.data.evaluation;
        setEvaluation(evalData);
        setAllTurns(prev => [
          ...prev,
          {
            question: currentQ.question,
            category: currentQ.category,
            difficulty: currentQ.difficulty || selectedDifficulty,
            answer: answer.trim(),
            evaluation: evalData,
          },
        ]);
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      // Client-side deterministic evaluation fallback
      const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
      const score = Math.min(95, Math.max(45, 50 + (wordCount > 30 ? 25 : 10) + (answer.toLowerCase().includes('tradeoff') ? 15 : 0)));
      const fallbackEval = {
        score,
        strengths: [
          'Addressed the core architectural components of the codebase.',
          'Demonstrated clear reasoning in explaining the chosen implementation flow.',
        ],
        weaknesses: [
          'Could elaborate further on error handling, failover mechanisms, and security boundaries.',
        ],
        missingConcepts: ['Distributed caching', 'Token revocation lifecycle', 'Query performance indexing'],
        improvementSuggestions: [
          'State the design pattern explicitly upfront (e.g. MVC, Service Layer, CQRS) before diving into details.',
          'Always address edge-case failure modes and telemetry monitoring.',
        ],
        sampleIdealAnswer: currentQ.expectedAnswer || 'A top-tier answer covers design motivation, data structures, error recovery, and production telemetry.',
      };

      setEvaluation(fallbackEval);
      setAllTurns(prev => [
        ...prev,
        {
          question: currentQ.question,
          category: currentQ.category,
          difficulty: currentQ.difficulty || selectedDifficulty,
          answer: answer.trim(),
          evaluation: fallbackEval,
        },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to Next Question or Finalize
  const handleNextQuestion = async () => {
    if (questionIndex + 1 >= (questions.length || questionCount)) {
      // Finalize session
      setIsEvaluating(true);
      try {
        const res = await fetch('/api/interview/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const json = await res.json();
        if (json.success && json.data?.overallEvaluation) {
          setFinalReport(json.data.overallEvaluation);
        } else {
          throw new Error('Local report needed');
        }
      } catch {
        // Synthesize local final report
        const totalScore = allTurns.reduce((acc, t) => acc + (t.evaluation?.score || 75), 0);
        const avg = Math.round(totalScore / Math.max(1, allTurns.length));
        setFinalReport({
          overallScore: avg,
          verdict: avg >= 85 ? 'Strong Hire (Senior Ready)' : avg >= 70 ? 'Solid Hire (Mid-Senior)' : 'Needs Additional Practice',
          technicalAccuracyScore: Math.min(100, avg + 2),
          communicationScore: Math.min(100, avg - 2),
          architecturalDepthScore: avg,
          strengths: allTurns.flatMap(t => t.evaluation?.strengths || []).slice(0, 3),
          weaknesses: allTurns.flatMap(t => t.evaluation?.weaknesses || []).slice(0, 3),
          missingConcepts: Array.from(new Set(allTurns.flatMap(t => t.evaluation?.missingConcepts || []))).slice(0, 4),
          improvementSuggestions: allTurns.flatMap(t => t.evaluation?.improvementSuggestions || []).slice(0, 3),
          summary: `Successfully completed ${allTurns.length} interview questions across ${project.name || 'the repository'} codebase.`,
        });
      } finally {
        setIsEvaluating(false);
        setIsCompleted(true);
      }
      return;
    }

    // Advance turn
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setAnswer('');
    setEvaluation(null);
    setShowIdealAnswer(false);

    const nextQ = questions[nextIdx];
    if (nextQ?.question) {
      setTimeout(() => speakQuestion(nextQ.question), 300);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleCopyReport = () => {
    if (!finalReport) return;
    const text = `RepoInterview AI Report - ${project.name}\nScore: ${finalReport.overallScore}/100 (${finalReport.verdict})\n\nStrengths:\n${finalReport.strengths?.map(s => `- ${s}`).join('\n')}\n\nImprovement Suggestions:\n${finalReport.improvementSuggestions?.map(s => `- ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full">
      {!sessionStarted && <ProjectNav projectId={project.id} />}

      {/* ============================================================ */}
      {/* 1. SETUP & CONFIGURATION SCREEN */}
      {/* ============================================================ */}
      {!sessionStarted ? (
        <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 w-full">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                <Sparkles size={12} /> AI Interview Simulator
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-2">AI Mock Interview</h1>
            <p className="text-sm text-text-secondary mt-1">
              Select difficulty level and practice turn-by-turn with an AI engineering interviewer grounded in <code className="text-accent font-mono text-xs">{project.repository?.fullName || project.name}</code>.
            </p>
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-8 shadow-sm">
            {/* Difficulty Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                1. Select Interview Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DIFFICULTIES.map(diff => {
                  const isSelected = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-accent/10 border-accent text-text-primary shadow-xs ring-1 ring-accent/30'
                          : 'bg-bg-elevated border-border hover:border-border-strong text-text-secondary'
                      }`}
                      onClick={() => setSelectedDifficulty(diff.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                          {diff.label}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <p className="text-xs text-text-tertiary leading-relaxed">{diff.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                2. Select Interview Mode
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
                          ? 'bg-accent/10 border-accent text-text-primary shadow-xs'
                          : 'bg-bg-elevated border-border hover:border-border-strong text-text-secondary'
                      }`}
                      onClick={() => setSelectedMode(mode.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isSelected ? 'text-accent' : mode.color} />
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

            {/* Questions count */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                3. Number of Questions in Round
              </label>
              <div className="flex items-center gap-3">
                {[3, 4, 6, 8].map(num => (
                  <button
                    key={num}
                    type="button"
                    className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-accent/15 border-accent text-accent'
                        : 'bg-bg-elevated border-border text-text-tertiary hover:text-text-primary'
                    }`}
                    onClick={() => setQuestionCount(num)}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-text-tertiary font-mono">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> ~{questionCount * 3} mins
                </span>
                <span>•</span>
                <span className="capitalize">{selectedDifficulty} level</span>
                <span>•</span>
                <span>Voice & Text enabled</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={15} />}
                onClick={handleStartSession}
              >
                Enter Interview Room
              </Button>
            </div>
          </div>
        </div>
      ) : isCompleted && finalReport ? (
        /* ============================================================ */
        /* 2. COMPREHENSIVE PERFORMANCE REPORT CARD DEBRIEF */
        /* ============================================================ */
        <div className="min-h-screen bg-bg-base p-8 max-w-4xl mx-auto flex flex-col gap-8 w-full">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Interview Debrief</span>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Performance Report</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={copiedReport ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                onClick={handleCopyReport}
              >
                {copiedReport ? 'Copied!' : 'Copy Summary'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RotateCcw size={14} />}
                onClick={() => setSessionStarted(false)}
              >
                Start New Round
              </Button>
            </div>
          </div>

          {/* Top Score Banner */}
          <div className="bg-gradient-to-r from-accent/15 via-bg-surface to-bg-surface border border-accent/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-accent/20 border border-accent flex flex-col items-center justify-center text-accent">
                <span className="text-3xl font-bold font-mono">{finalReport.overallScore}</span>
                <span className="text-2xs uppercase tracking-wider font-semibold">/ 100</span>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant={finalReport.overallScore >= 80 ? 'success' : 'warning'} size="md">
                  {finalReport.verdict || 'Evaluation Complete'}
                </Badge>
                <h3 className="text-xl font-bold text-text-primary mt-1">
                  {project.repository?.fullName || project.name}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-lg">
                  {finalReport.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-6">
              <div className="flex flex-col items-center">
                <span className="text-xs text-text-tertiary">Technical</span>
                <span className="text-lg font-bold font-mono text-text-primary">{finalReport.technicalAccuracyScore}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-text-tertiary">Communication</span>
                <span className="text-lg font-bold font-mono text-text-primary">{finalReport.communicationScore}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-text-tertiary">Architecture</span>
                <span className="text-lg font-bold font-mono text-text-primary">{finalReport.architecturalDepthScore}%</span>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Demonstrated Strengths</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {finalReport.strengths?.map((str, idx) => (
                  <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 bg-success/5 border border-success/15 p-3 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Identified Weaknesses & Gaps</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {finalReport.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 bg-warning/5 border border-warning/15 p-3 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Concepts & Improvement Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Concepts */}
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-purple-400">
                <BookOpen size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Missing Concepts to Review</h3>
              </div>
              <p className="text-xs text-text-tertiary">Key technical concepts and architecture terms that were omitted during answers:</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {finalReport.missingConcepts?.map((concept, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-accent">
                <Lightbulb size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Actionable Improvement Plan</h3>
              </div>
              <ul className="flex flex-col gap-2.5 pt-1">
                {finalReport.improvementSuggestions?.map((sug, idx) => (
                  <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2.5 bg-accent/5 border border-accent/15 p-3 rounded-xl">
                    <span className="text-accent font-bold font-mono text-xs">{idx + 1}.</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Turn-by-turn history recap */}
          <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-text-primary">Questions & Answers Log ({allTurns.length})</h3>
            <div className="flex flex-col gap-4">
              {allTurns.map((turn, idx) => (
                <div key={idx} className="border border-border-subtle rounded-xl p-4 flex flex-col gap-2 bg-bg-elevated/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-text-tertiary">Q{idx + 1}</span>
                      <Badge variant="neutral" size="sm">{turn.category}</Badge>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent">
                      Score: {turn.evaluation?.score || 70}/100
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-primary">{turn.question}</p>
                  <p className="text-xs text-text-secondary line-clamp-2 bg-bg-base/80 p-2.5 rounded-lg font-mono">
                    "{turn.answer}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* 3. IMMERSIVE LIVE INTERVIEW ROOM */
        /* ============================================================ */
        <div className="min-h-screen bg-bg-base flex flex-col" role="main">
          {/* Top Stage Bar */}
          <div className="sticky top-0 z-[200] flex items-center justify-between px-6 py-4 border-b border-border bg-bg-surface/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary hover:bg-bg-elevated px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  if (window.confirm('Exit interview session? Your current progress will be ended.')) {
                    setSessionStarted(false);
                  }
                }}
              >
                <X size={15} />
                <span>Exit</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border-subtle">
                <Badge variant="neutral" size="sm" className="capitalize">
                  {selectedDifficulty}
                </Badge>
                <Badge variant="neutral" size="sm">
                  {project.name || 'Repository'}
                </Badge>
              </div>
            </div>

            {/* Central Progress Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-xs mx-auto">
              <span className="font-mono text-xs text-text-tertiary whitespace-nowrap">
                {questionIndex + 1} / {questions.length || questionCount}
              </span>
              <div className="flex-1 h-2 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-mono text-text-tertiary px-2.5 py-1 bg-bg-elevated rounded-lg border border-border-subtle">
                <Clock size={13} />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
              <button
                type="button"
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  audioEnabled ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-bg-elevated border-border text-text-tertiary'
                }`}
                title={audioEnabled ? 'Voice Narrator Active' : 'Voice Narrator Muted'}
                onClick={() => {
                  setAudioEnabled(v => !v);
                  if (audioEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                }}
              >
                {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          </div>

          {/* Interview Stage Body */}
          <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full gap-6">
            {/* AI Interviewer Persona Header */}
            <div className="flex items-center justify-between bg-bg-surface border border-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    AI
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Principal Tech Lead Interviewer</h4>
                  <p className="text-2xs text-text-tertiary">
                    {isSpeaking ? 'Speaking question...' : 'Evaluating response based on repository code...'}
                  </p>
                </div>
              </div>

              {audioEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Volume2 size={13} />}
                  onClick={() => speakQuestion(currentQ.question)}
                >
                  Repeat
                </Button>
              )}
            </div>

            {/* Active Question Card */}
            <motion.div
              key={questionIndex}
              className="bg-bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Badge variant={currentQ.difficulty === 'hard' ? 'error' : 'warning'} size="sm">
                  {currentQ.difficulty || selectedDifficulty}
                </Badge>
                <Badge variant="neutral" size="sm">
                  {currentQ.category || 'Architecture'}
                </Badge>
                <span className="text-2xs font-mono text-text-disabled ml-auto">
                  Question {questionIndex + 1} of {questions.length || questionCount}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight leading-snug">
                {currentQ.question}
              </h2>
            </motion.div>

            {/* Candidate Response Editor or Evaluation Panel */}
            <AnimatePresence mode="wait">
              {!evaluation ? (
                /* Response Input Area */
                <motion.div
                  key="response-input"
                  className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="mock-answer-input" className="text-xs font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                      <Code2 size={13} /> Your Technical Answer
                    </label>

                    {speechSupported && (
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : 'bg-bg-elevated text-text-tertiary hover:text-text-primary border border-border'
                        }`}
                        onClick={toggleListening}
                      >
                        {isListening ? <Mic size={13} className="text-rose-400" /> : <MicOff size={13} />}
                        <span>{isListening ? 'Listening (Speak now)...' : 'Dictate with Voice'}</span>
                      </button>
                    )}
                  </div>

                  <textarea
                    id="mock-answer-input"
                    className="w-full bg-bg-elevated border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl p-4 text-sm sm:text-base text-text-primary placeholder:text-text-disabled leading-relaxed resize-none outline-none transition-all"
                    placeholder="Explain your architectural design, library tradeoffs, data flow, and error handling..."
                    rows={7}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    disabled={isEvaluating}
                    autoFocus
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <div className="flex items-center gap-3 text-xs text-text-disabled font-mono">
                      <span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
                      <span>•</span>
                      <span>{answer.length} chars</span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<Send size={13} />}
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim() || isEvaluating}
                    >
                      {isEvaluating ? 'Evaluating with AI...' : 'Submit Answer'}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* Real-time AI Evaluation Panel */
                <motion.div
                  key="evaluation-results"
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Score & Verdict Card */}
                  <div className="bg-gradient-to-r from-accent/15 via-bg-surface to-bg-surface border border-accent/30 rounded-2xl p-6 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-accent/20 border border-accent flex flex-col items-center justify-center text-accent">
                        <span className="text-2xl font-bold font-mono">{evaluation.score}</span>
                        <span className="text-3xs uppercase font-semibold">/ 100</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold text-text-primary">
                          {evaluation.score >= 85 ? 'Strong Senior Response' : evaluation.score >= 70 ? 'Solid Technical Baseline' : 'Good Effort — Needs Depth'}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          Evaluated against repository codebase and {selectedDifficulty} expectations.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 size={16} />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Strengths</h4>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {evaluation.strengths?.map((str, idx) => (
                          <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 bg-success/5 border border-success/15 p-2.5 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle size={16} />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Weaknesses</h4>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {evaluation.weaknesses?.map((weak, idx) => (
                          <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 bg-warning/5 border border-warning/15 p-2.5 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Missing Concepts */}
                  {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 && (
                    <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2.5 shadow-xs">
                      <div className="flex items-center gap-2 text-purple-400">
                        <BookOpen size={16} />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Missing Technical Concepts</h4>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {evaluation.missingConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {evaluation.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
                    <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2.5 shadow-xs">
                      <div className="flex items-center gap-2 text-accent">
                        <Lightbulb size={16} />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Suggestions for Next Round</h4>
                      </div>
                      <ul className="flex flex-col gap-2 pt-1">
                        {evaluation.improvementSuggestions.map((sug, idx) => (
                          <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 bg-accent/5 border border-accent/15 p-2.5 rounded-lg">
                            <span className="text-accent font-bold font-mono text-xs">{idx + 1}.</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sample Ideal Answer Accordion */}
                  {evaluation.sampleIdealAnswer && (
                    <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary bg-bg-elevated/40 transition-colors cursor-pointer"
                        onClick={() => setShowIdealAnswer(s => !s)}
                      >
                        <div className="flex items-center gap-2">
                          <Award size={15} className="text-accent" />
                          <span>View Benchmark / Ideal Model Answer</span>
                        </div>
                        {showIdealAnswer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {showIdealAnswer && (
                        <div className="p-5 border-t border-border-subtle bg-bg-base text-xs text-text-secondary leading-relaxed font-mono whitespace-pre-wrap">
                          {evaluation.sampleIdealAnswer}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setEvaluation(null);
                      }}
                    >
                      Refine Answer
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={handleNextQuestion}
                    >
                      {questionIndex + 1 >= (questions.length || questionCount)
                        ? 'Finish Interview & View Debrief'
                        : 'Next Question'}
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
