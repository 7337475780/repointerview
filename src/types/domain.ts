// ============================================================
// RepoInterview AI — Domain Types & Interfaces
// Pure domain models for Repository Ingestion & Deterministic Intelligence
// ============================================================

export type RepositoryLifecycleStatus =
  | 'NOT_CONNECTED'
  | 'CONNECTED'
  | 'QUEUED'
  | 'INGESTED'
  | 'ANALYZING'
  | 'ANALYZED'
  | 'READY'
  | 'READY_WITH_WARNINGS'
  | 'ANALYSIS_WITH_WARNINGS'
  | 'ANALYSIS_FAILED'
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

// ============================================================
// PHASE 3 DETERMINISTIC REPOSITORY INTELLIGENCE MODELS
// ============================================================

export type EvidenceType =
  | 'dependency_declaration'
  | 'import_statement'
  | 'code_usage'
  | 'schema_definition'
  | 'route_declaration'
  | 'config_file'
  | 'directory_structure'
  | 'env_var'
  | 'manifest_script';

export interface FindingEvidence {
  filePath: string;
  evidenceType: EvidenceType;
  description: string;
  snippet?: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type TechnologyCategory =
  | 'language'
  | 'framework'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'orm'
  | 'cache'
  | 'auth'
  | 'api'
  | 'styling'
  | 'storage'
  | 'deployment'
  | 'testing'
  | 'state'
  | 'ai'
  | 'build_tool'
  | 'package_manager'
  | 'runtime';

export interface DetectedTechnology {
  name: string;
  category: TechnologyCategory;
  version?: string;
  confidence: number; // 0.0 -> 1.0
  confidenceLevel: ConfidenceLevel;
  whyDetected: string;
  evidence: FindingEvidence[];
}

export interface LanguageDistribution {
  language: string;
  percentage: number;
  fileCount: number;
  totalBytes: number;
  color?: string;
}

export interface CategorizedDependency {
  name: string;
  version: string;
  isDev: boolean;
  categories: TechnologyCategory[];
  description?: string;
}

export interface DependencyProfile {
  packageManager?: string;
  totalDependencies: number;
  totalDevDependencies: number;
  scripts: Record<string, string>;
  dependencies: CategorizedDependency[];
}

export interface DirectoryRole {
  path: string;
  role: string;
  description: string;
  evidencePaths: string[];
}

export interface ProjectStructure {
  pattern: string; // e.g. "Standard Layered Structure", "Next.js App Router Structure"
  keyDirectories: DirectoryRole[];
}

export interface EntryPoint {
  path: string;
  type: 'frontend' | 'backend' | 'api' | 'config' | 'cli' | 'desktop';
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  whyDetected: string;
  evidence: FindingEvidence[];
}

export interface DetectedApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'USE' | 'ALL' | 'DYNAMIC';
  path: string;
  filePath: string;
  framework: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  evidence: FindingEvidence;
}

export interface ApiSurface {
  detected: boolean;
  framework?: string;
  endpointsCount: number;
  routes: DetectedApiRoute[];
}

export interface SchemaField {
  name: string;
  type: string;
  isId?: boolean;
  isOptional?: boolean;
  isList?: boolean;
  relationTo?: string;
}

export interface SchemaModel {
  name: string;
  filePath: string;
  fields: SchemaField[];
  relationsCount: number;
}

export interface DatabaseProfile {
  databaseTechnologies: DetectedTechnology[];
  ormTechnologies: DetectedTechnology[];
  cacheTechnologies: DetectedTechnology[];
  models: SchemaModel[];
  hasSchema: boolean;
}

export interface AuthenticationProfile {
  detected: boolean;
  strategies: string[]; // e.g. "JWT", "OAuth", "NextAuth", "Session"
  providers: string[]; // e.g. "Clerk", "Firebase Auth", "Passport"
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  whyDetected: string;
  evidence: FindingEvidence[];
}

export interface ExternalService {
  name: string;
  purpose: string;
  status: 'dependency_only' | 'service_usage_detected';
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  whyDetected: string;
  evidence: FindingEvidence[];
}

export interface DeploymentProfile {
  containerized: boolean;
  platforms: string[]; // e.g. "Docker", "Vercel", "Netlify", "GitHub Actions"
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  whyDetected: string;
  evidence: FindingEvidence[];
}

export interface ArchitectureSignal {
  type: string; // e.g. "Layered MVC Separation", "Client/Server Separation", "Monorepo Structure"
  description: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  evidence: FindingEvidence[];
}

export interface MonorepoProfile {
  isMonorepo: boolean;
  tool?: string; // "Turborepo", "pnpm workspaces", "Nx", "Lerna"
  packages: string[];
  evidence: FindingEvidence[];
}

export interface ImportantFile {
  path: string;
  category: 'Architecture' | 'Configuration' | 'Entry Point' | 'Authentication' | 'API' | 'Database' | 'Core Logic' | 'Frontend' | 'Deployment' | 'Documentation';
  rank: number;
  explanation: string;
}

export interface AnalysisWarning {
  type: string;
  message: string;
  severity: 'info' | 'warning';
}

export interface AnalysisMetadata {
  analyzedAt: string;
  durationMs: number;
  analyzerVersion: string;
  filesScanned: number;
}

export interface RepositoryIntelligence {
  identity: string; // owner/repo@commitSha
  repository: Repository;
  technologies: DetectedTechnology[];
  languages: LanguageDistribution[];
  dependencies: DependencyProfile;
  structure: ProjectStructure;
  entryPoints: EntryPoint[];
  apiSurface: ApiSurface;
  database: DatabaseProfile;
  authentication: AuthenticationProfile;
  externalServices: ExternalService[];
  deployment: DeploymentProfile;
  architectureSignals: ArchitectureSignal[];
  monorepo: MonorepoProfile;
  importantFiles: ImportantFile[];
  warnings: AnalysisWarning[];
  metadata: AnalysisMetadata;
  // Generated Deterministic Architecture Graph
  architectureMap: ArchitectureMap;
}

// ============================================================
// PROJECT MODEL
// ============================================================

export interface Technology {
  name: string;
  category: TechnologyCategory;
  version?: string;
  color: string;
  confidenceScore: number;
}

export type ArchitectureNodeType =
  | 'frontend'
  | 'server'
  | 'router'
  | 'api'
  | 'middleware'
  | 'controller'
  | 'service'
  | 'database'
  | 'cache'
  | 'auth'
  | 'external'
  | 'queue'
  | 'worker'
  | 'config'
  | 'test'
  | 'shared_library'
  | 'deployment'
  | 'storage';

export type ArchitectureRelationshipType =
  | 'IMPORTS'
  | 'USES'
  | 'REGISTERS'
  | 'ROUTES_TO'
  | 'CALLS'
  | 'PERSISTS_TO'
  | 'AUTHENTICATES_WITH'
  | 'CONNECTS_TO'
  | 'TESTS'
  | 'DEPENDS_ON';

export interface ArchitectureNode {
  id: string;
  label: string;
  type: ArchitectureNodeType;
  x: number;
  y: number;
  description: string;
  technologies?: string[];
  evidenceFiles?: string[];
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
}

export interface ArchitectureEdge {
  id?: string;
  from: string;
  to: string;
  source?: string;
  target?: string;
  relationship?: ArchitectureRelationshipType;
  protocol?: 'HTTP' | 'WebSocket' | 'RPC' | 'SQL' | 'gRPC' | 'Redis' | 'Auth' | 'Internal';
  direction?: 'unidirectional' | 'bidirectional';
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  description?: string;
  evidence?: string;
  evidenceFiles?: string[];
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
  intelligence?: RepositoryIntelligence;
}
