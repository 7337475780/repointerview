// ============================================================
// RepoInterview AI — Score-based File Filter & Selection Service
// Filters out noise, scores architecture/code relevance, and selects
// the top files within configurable size boundaries.
// ============================================================

import type { FileSkipReason, RepositoryFileNode } from '../types/domain.ts';

export const INGESTION_LIMITS = {
  MAX_SELECTED_FILES: 40,
  MAX_FILE_SIZE_BYTES: 100 * 1024, // 100 KB
  MAX_TOTAL_SOURCE_BYTES: 1.5 * 1024 * 1024, // 1.5 MB
};

const IGNORED_DIRECTORY_NAMES = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  '.next',
  'out',
  'coverage',
  'vendor',
  'target',
  'bin',
  'obj',
  '__pycache__',
  '.venv',
  'venv',
  '.turbo',
  '.idea',
  '.vscode',
  'tmp',
  'temp',
  '.husky',
  'public',
  'assets',
  'static',
]);

const IGNORED_EXTENSIONS = new Set([
  // Images
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'svg', 'bmp', 'tiff',
  // Audio & Video
  'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg',
  // Documents & Binaries
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'tar', 'gz', 'tgz', '7z', 'rar',
  'wasm', 'exe', 'so', 'dll', 'dylib', 'class', 'pyc', 'jar',
  // Source maps & generated files
  'map', 'min.js', 'min.css', 'd.ts.map',
  // Lockfiles (skipped to prevent downloading megabytes of dependency hashes)
  'lock',
]);

export interface ScoreDetails {
  score: number;
  skipReason?: FileSkipReason;
}

export const fileFilterService = {
  /**
   * Check if path belongs to an ignored directory
   */
  isIgnoredPath(path: string): boolean {
    const parts = path.toLowerCase().split('/');
    return parts.some(part => IGNORED_DIRECTORY_NAMES.has(part));
  },

  /**
   * Check if file has a binary or non-text extension
   */
  isBinaryOrIgnoredExtension(path: string): boolean {
    const lower = path.toLowerCase();
    if (lower.endsWith('.min.js') || lower.endsWith('.min.css')) return true;
    if (lower.endsWith('package-lock.json') || lower.endsWith('pnpm-lock.yaml') || lower.endsWith('yarn.lock')) return true;

    const parts = lower.split('.');
    if (parts.length <= 1) return false;
    const ext = parts[parts.length - 1];
    return IGNORED_EXTENSIONS.has(ext);
  },

  /**
   * Calculate relevance score for a given file path
   * Higher score = higher priority for interview intelligence
   */
  calculateFileScore(path: string, size?: number): ScoreDetails {
    // Check ignored paths
    if (this.isIgnoredPath(path)) {
      return { score: 0, skipReason: 'SKIPPED_IRRELEVANT' };
    }

    // Check ignored extensions
    if (this.isBinaryOrIgnoredExtension(path)) {
      return { score: 0, skipReason: 'SKIPPED_BINARY' };
    }

    // Check size limit if known ahead of time
    if (size !== undefined && size > INGESTION_LIMITS.MAX_FILE_SIZE_BYTES) {
      return { score: 0, skipReason: 'SKIPPED_LARGE_FILE' };
    }

    const lower = path.toLowerCase();
    const basename = lower.split('/').pop() || '';

    // Root manifests & top-level descriptors (100 - 95)
    if (basename === 'package.json') return { score: 100 };
    if (basename.startsWith('readme')) return { score: 95 };

    // Schema & database models (95)
    if (
      lower.includes('prisma/schema.prisma') ||
      basename.endsWith('.prisma') ||
      basename.endsWith('schema.sql') ||
      lower.includes('/migrations/') ||
      basename.includes('.schema.') ||
      basename.includes('.model.') ||
      basename.includes('.entity.')
    ) {
      return { score: 95 };
    }

    // Infrastructure & Docker (90)
    if (
      basename === 'dockerfile' ||
      basename.startsWith('docker-compose') ||
      basename === 'procfile'
    ) {
      return { score: 90 };
    }

    // Auth & Session files (90)
    if (lower.includes('auth') || lower.includes('session') || lower.includes('jwt')) {
      return { score: 90 };
    }

    // Backend API routes, routers, and handlers (90)
    if (
      lower.includes('/api/') ||
      lower.includes('/routes/') ||
      lower.includes('/routers/') ||
      lower.includes('/controllers/') ||
      lower.includes('/endpoints/') ||
      lower.includes('/server/') ||
      lower.includes('/trpc/') ||
      lower.includes('/graphql/')
    ) {
      return { score: 90 };
    }

    // Server & Application entry points (90)
    if (
      basename === 'server.ts' ||
      basename === 'server.js' ||
      basename === 'app.ts' ||
      basename === 'app.js' ||
      basename === 'main.ts' ||
      basename === 'main.js' ||
      basename === 'index.ts' ||
      basename === 'index.js'
    ) {
      return { score: 90 };
    }

    // Framework & tool configuration (85)
    if (
      basename === 'tsconfig.json' ||
      basename.includes('.config.') ||
      basename === 'vite.config.js' ||
      basename === 'vite.config.ts' ||
      basename === 'next.config.js' ||
      basename === 'next.config.mjs' ||
      basename === 'tailwind.config.js' ||
      basename === 'tailwind.config.ts'
    ) {
      return { score: 85 };
    }

    // Core business services & domain logic (80)
    if (lower.includes('/services/') || lower.includes('/usecases/') || lower.includes('/domain/')) {
      return { score: 80 };
    }

    // Middleware & Security interceptors (80)
    if (lower.includes('middleware') || lower.includes('guard') || lower.includes('interceptor')) {
      return { score: 80 };
    }

    // Frontend State & Navigation (75)
    if (
      lower.includes('/store/') ||
      lower.includes('/context/') ||
      lower.includes('/pages/') ||
      lower.includes('/app/')
    ) {
      return { score: 75 };
    }

    // React/Vue/UI Components (60)
    if (lower.includes('/components/') || lower.includes('/views/')) {
      return { score: 60 };
    }

    // Utilities & Libraries (50)
    if (lower.includes('/lib/') || lower.includes('/utils/') || lower.includes('/helpers/')) {
      return { score: 50 };
    }

    // Tests (40)
    if (lower.includes('/test/') || lower.includes('/tests/') || lower.includes('__tests__') || basename.includes('.test.') || basename.includes('.spec.')) {
      return { score: 40 };
    }

    // Default code file
    return { score: 30 };
  },

  /**
   * Process raw Git tree nodes, score them, and select the top N candidate files
   */
  selectRelevantFiles(tree: Array<{ path: string; mode: string; type: string; sha: string; size?: number }>): RepositoryFileNode[] {
    const scoredNodes: RepositoryFileNode[] = [];

    for (const item of tree) {
      // Only inspect blobs (files)
      if (item.type !== 'blob') continue;

      const { score, skipReason } = this.calculateFileScore(item.path, item.size);

      scoredNodes.push({
        path: item.path,
        mode: item.mode,
        type: 'blob',
        sha: item.sha,
        size: item.size,
        score,
        selected: false,
        skipReason,
      });
    }

    // Filter valid candidate files (score > 0 and no skipReason)
    const validCandidates = scoredNodes.filter(n => n.score > 0 && !n.skipReason);

    // Sort descending by relevance score
    validCandidates.sort((a, b) => b.score - a.score);

    // Pick top MAX_SELECTED_FILES
    const selectedPaths = new Set(
      validCandidates.slice(0, INGESTION_LIMITS.MAX_SELECTED_FILES).map(n => n.path)
    );

    // Mark selected in the full nodes array
    return scoredNodes.map(node => ({
      ...node,
      selected: selectedPaths.has(node.path),
    }));
  },

  /**
   * Detect programming language from file path extension
   */
  detectLanguage(path: string): string {
    const lower = path.toLowerCase();
    if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
    if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs')) return 'javascript';
    if (lower.endsWith('.py')) return 'python';
    if (lower.endsWith('.go')) return 'go';
    if (lower.endsWith('.rs')) return 'rust';
    if (lower.endsWith('.java')) return 'java';
    if (lower.endsWith('.cpp') || lower.endsWith('.c') || lower.endsWith('.h')) return 'cpp';
    if (lower.endsWith('.prisma')) return 'prisma';
    if (lower.endsWith('.sql')) return 'sql';
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
    if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'css';
    if (lower.endsWith('.html')) return 'html';
    if (lower.endsWith('.dockerfile') || lower.endsWith('dockerfile')) return 'dockerfile';
    return 'plaintext';
  },
};
