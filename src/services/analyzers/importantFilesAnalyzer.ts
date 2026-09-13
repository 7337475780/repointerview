// ============================================================
// RepoInterview AI — Important Files Ranking Analyzer
// Deterministically ranks key files for understanding repository architecture.
// ============================================================

import type { ImportantFile, RepositoryIngestionResult } from '../../types/domain.ts';

export const importantFilesAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): ImportantFile[] {
    const importantFiles: ImportantFile[] = [];

    for (const file of ingestion.sourceFiles) {
      const p = file.path.toLowerCase();
      const basename = p.split('/').pop() || '';

      if (basename === 'package.json') {
        importantFiles.push({
          path: file.path,
          category: 'Configuration',
          rank: 100,
          explanation: 'Project manifest declaring dependencies, runtime scripts, and module definitions.',
        });
      } else if (p.endsWith('.prisma') || p.endsWith('schema.sql')) {
        importantFiles.push({
          path: file.path,
          category: 'Database',
          rank: 95,
          explanation: 'Data store schema declaring entities, fields, relational constraints, and indexes.',
        });
      } else if (p === 'src/server.ts' || p === 'server.js' || p === 'app/layout.tsx' || p === 'src/main.tsx') {
        importantFiles.push({
          path: file.path,
          category: 'Entry Point',
          rank: 90,
          explanation: 'Primary application initialization and runtime bootstrap file.',
        });
      } else if (p.includes('auth') || p.includes('session')) {
        importantFiles.push({
          path: file.path,
          category: 'Authentication',
          rank: 88,
          explanation: 'Security handling, token verification, and user authentication logic.',
        });
      } else if (p.includes('/api/') || p.includes('/routes/')) {
        importantFiles.push({
          path: file.path,
          category: 'API',
          rank: 85,
          explanation: 'HTTP route definitions, request validation, and endpoint handlers.',
        });
      } else if (p.includes('/services/') || p.includes('/usecases/')) {
        importantFiles.push({
          path: file.path,
          category: 'Core Logic',
          rank: 80,
          explanation: 'Core business domain logic, workflows, and service operations.',
        });
      } else if (basename.startsWith('readme')) {
        importantFiles.push({
          path: file.path,
          category: 'Documentation',
          rank: 75,
          explanation: 'High-level project documentation, architecture overview, and setup guide.',
        });
      } else if (basename.includes('.config.') || basename === 'dockerfile' || basename.startsWith('docker-compose')) {
        importantFiles.push({
          path: file.path,
          category: 'Deployment',
          rank: 70,
          explanation: 'Build tooling, containerization, or runtime environment configuration.',
        });
      }
    }

    // Sort deterministically descending by rank, then alphabetically by path
    return importantFiles.sort((a, b) => b.rank - a.rank || a.path.localeCompare(b.path));
  },
};
