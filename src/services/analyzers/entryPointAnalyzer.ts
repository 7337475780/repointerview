// ============================================================
// RepoInterview AI — Entry Point Analyzer
// Identifies frontend, backend, and framework application bootstrap entry points.
// ============================================================

import type { EntryPoint, RepositoryIngestionResult } from '../../types/domain.ts';

const ENTRY_POINT_CANDIDATES: Array<{
  pattern: RegExp;
  type: 'frontend' | 'backend' | 'api' | 'config';
  confidence: number;
  why: string;
}> = [
  { pattern: /^src\/main\.(tsx|jsx|ts|js)$/, type: 'frontend', confidence: 0.95, why: 'Vite/React frontend client bootstrap file' },
  { pattern: /^src\/index\.(tsx|jsx)$/, type: 'frontend', confidence: 0.95, why: 'React DOM root render entry point' },
  { pattern: /^app\/layout\.(tsx|jsx|js)$/, type: 'frontend', confidence: 0.98, why: 'Next.js App Router root layout entry' },
  { pattern: /^src\/app\/layout\.(tsx|jsx|js)$/, type: 'frontend', confidence: 0.98, why: 'Next.js App Router root layout entry' },
  { pattern: /^pages\/_app\.(tsx|jsx|js)$/, type: 'frontend', confidence: 0.95, why: 'Next.js Pages Router custom app wrapper' },
  { pattern: /^src\/pages\/_app\.(tsx|jsx|js)$/, type: 'frontend', confidence: 0.95, why: 'Next.js Pages Router custom app wrapper' },
  { pattern: /^(src\/)?server\.(ts|js|mjs)$/, type: 'backend', confidence: 0.95, why: 'Node/Express HTTP server initialization entry' },
  { pattern: /^(src\/)?app\.(ts|js|mjs)$/, type: 'backend', confidence: 0.90, why: 'Express / Koa application setup and middleware bootstrap' },
  { pattern: /^(src\/)?index\.(ts|js|mjs)$/, type: 'backend', confidence: 0.85, why: 'Package or server main entry point' },
  { pattern: /^(main|app|server)\.py$/, type: 'backend', confidence: 0.95, why: 'Python / FastAPI / Flask application entry point' },
  { pattern: /.*Application\.java$/, type: 'backend', confidence: 0.95, why: 'Spring Boot application runner class' },
  { pattern: /^main\.go$/, type: 'backend', confidence: 0.98, why: 'Go application main package entry' },
  { pattern: /^src\/main\.rs$/, type: 'backend', confidence: 0.98, why: 'Rust binary main entry point' },
];

export const entryPointAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];

    for (const node of ingestion.tree) {
      if (node.type !== 'blob') continue;

      for (const candidate of ENTRY_POINT_CANDIDATES) {
        if (candidate.pattern.test(node.path)) {
          entryPoints.push({
            path: node.path,
            type: candidate.type,
            confidence: candidate.confidence,
            confidenceLevel: candidate.confidence >= 0.85 ? 'high' : 'medium',
            whyDetected: candidate.why,
            evidence: [
              {
                filePath: node.path,
                evidenceType: 'code_usage',
                description: `Matches entry point pattern ${node.path}`,
              },
            ],
          });
          break;
        }
      }
    }

    return entryPoints;
  },
};
