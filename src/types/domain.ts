// ============================================================
// RepoInterview AI — Domain Types & Interfaces
// Pure domain models for Repository Ingestion & Interview Preparation
// ============================================================

export type RepositoryLifecycleStatus =
  | 'NOT_CONNECTED'
  | 'CONNECTED'
  | 'QUEUED'
  | 'ANALYZING'
  | 'READY'
  | 'READY_WITH_WARNINGS'
  | 'FAILED';

export type IngestionStep =
  | 'IDLE'
  | 'VALIDATING'
  | 'FETCHING_METADATA'
  | 'FETCHING_TREE'
  | 'SELECTING_FILES'
  | 'FETCHING_FILES'
  | 'READY'
  | 'READY_WITH_WARNINGS'
  | 'FAILED';

export type FileSkipReason =
  | 'SKIPPED_LARGE_FILE'
  | 'SKIPPED_BINARY'
  | 'SKIPPED_GENERATED'
  | 'SKIPPED_IRRELEVANT'
  | 'FETCH_FAILED';

export interface RepositoryMetadata {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  commitSha: string;
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string;
  sizeKb: number;
  isPrivate: boolean;
  updatedAt: string;
}

export interface RepositoryFileNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
  score: number;
  selected: boolean;
  skipReason?: FileSkipReason;
}

export interface RepositorySourceFile {
  path: string;
  content: string;
  size: number;
  language: string;
  sha: string;
  score: number;
}

export interface IngestionWarning {
  path: string;
  reason: FileSkipReason;
  message: string;
}

export interface IngestionStats {
  totalDiscoveredFiles: number;
  totalCandidateFiles: number;
  selectedFilesCount: number;
  fetchedFilesCount: number;
  skippedFilesCount: number;
  totalSourceBytes: number;
  durationMs: number;
}

export interface RepositoryIngestionResult {
  identity: string; // owner/repo@commitSha
  repository: Repository;
  metadata: RepositoryMetadata;
  commitSha: string;
  tree: RepositoryFileNode[];
  selectedFiles: RepositoryFileNode[];
  sourceFiles: RepositorySourceFile[];
  stats: IngestionStats;
  warnings: IngestionWarning[];
  status: 'READY' | 'READY_WITH_WARNINGS' | 'FAILED';
  error?: string;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  commitSha?: string;
  stars?: number;
  forks?: number;
  description?: string;
  primaryLanguage?: string;
  sizeKb?: number;
}

export interface Project {
  id: string;
  repository: Repository;
  createdAt: string;
  lastAnalyzedAt?: string;
  status: RepositoryLifecycleStatus;
  analysisScore: number; // 0 - 100
  techStack: Technology[];
  stats?: RepositoryStats;
  architecture?: ArchitectureMap;
  questions: Question[];
  questionsCount: number;
  ingestion?: RepositoryIngestionResult;
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
  lastGeneratedAt?: string;
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

export interface Question {
  id: string;
  projectId: string;
  question: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  probability: number;
  tags: string[];
  whyAsked: string;
  strongAnswer: string;
  evidence?: CodeEvidence;
  followUp: string[];
}

export interface RepositoryStats {
  totalFiles: number;
  linesOfCode: number;
  testCoverage: number;
  apiRoutes: number;
  components: number;
  dbTables: number;
}
