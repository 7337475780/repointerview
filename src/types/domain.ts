// ============================================================
// RepoInterview AI — Domain Types & Interfaces
// Core type definitions for Phase 1 Product Foundation
// ============================================================

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionCategory =
  | 'Architecture'
  | 'API Design'
  | 'Database'
  | 'Security'
  | 'Performance'
  | 'Infrastructure'
  | 'State Management'
  | 'Testing'
  | 'Scalability'
  | 'Tradeoffs';

export type PreparationStatus = 'unprepared' | 'practicing' | 'prepared' | 'must_prepare';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tier: 'free' | 'pro' | 'team';
  createdAt: string;
}

export interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'orm' | 'cache' | 'auth' | 'api' | 'styling' | 'storage' | 'deployment' | 'language';
  version?: string;
  color: string;
  confidenceScore: number;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'api' | 'service' | 'database' | 'cache' | 'external';
  x: number;
  y: number;
  description: string;
  sourceFile?: string;
  technologies?: string[];
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  protocol?: 'HTTP' | 'WebSocket' | 'RPC' | 'SQL' | 'gRPC' | 'Redis';
  direction?: 'unidirectional' | 'bidirectional';
  description?: string;
}

export interface ArchitectureMap {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  lastGeneratedAt: string;
}

export interface CodeEvidence {
  filename: string;
  language: string;
  startLine?: number;
  endLine?: number;
  highlightLines: number[];
  code: string;
  rationale?: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  category?: string;
  intent?: string;
}

export interface Question {
  id: string;
  projectId: string;
  question: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  probability: number; // 0 - 100
  tags: string[];
  whyAsked: string;
  strongAnswer: string;
  evidence: CodeEvidence;
  followUp: string[];
  status?: PreparationStatus;
  userNotes?: string;
}

export type AnalysisStepStatus = 'pending' | 'active' | 'done' | 'failed';

export interface AnalysisPipelineStep {
  id: string;
  label: string;
  status: AnalysisStepStatus;
  durationMs?: number;
}

export interface RepositoryStats {
  totalFiles: number;
  linesOfCode: number;
  testCoverage: number;
  apiRoutes: number;
  components: number;
  dbTables: number;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  stars?: number;
  forks?: number;
  description: string;
  primaryLanguage: string;
}

export interface Project {
  id: string;
  repository: Repository;
  createdAt: string;
  lastAnalyzedAt: string;
  status: 'idle' | 'analyzing' | 'ready' | 'error';
  analysisScore: number; // 0 - 100
  techStack: Technology[];
  stats: RepositoryStats;
  architecture: ArchitectureMap;
  questionsCount: number;
}

export type MockInterviewMode = 'standard' | 'deep_dive' | 'defense' | 'rapid_fire';

export interface MockInterviewConfig {
  projectId: string;
  mode: MockInterviewMode;
  difficulty: Difficulty | 'mixed';
  questionCount: number;
  focusCategories?: QuestionCategory[];
}

export interface CandidateAnswer {
  questionId: string;
  questionText: string;
  response: string;
  submittedAt: string;
  evaluation?: {
    score: number; // 0 - 100
    verdict: 'strong' | 'needs_work' | 'missed_key_points';
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestedImprovements: string[];
  };
}

export interface MockInterviewSession {
  id: string;
  projectId: string;
  mode: MockInterviewMode;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  questions: Question[];
  currentQuestionIndex: number;
  answers: CandidateAnswer[];
  overallScore?: number;
  feedbackSummary?: string;
}

export interface DomainScore {
  domain: string;
  score: number; // 0 - 100
  questionsCount: number;
  status: 'strong' | 'moderate' | 'weak';
}

export interface InterviewAnalytics {
  projectId: string;
  overallReadiness: number;
  sessionsCompleted: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  domainScores: DomainScore[];
  scoreHistory: { date: string; score: number }[];
  recommendedTopics: string[];
}
