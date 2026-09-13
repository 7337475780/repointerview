// ============================================================
// RepoInterview AI — Language Distribution Analyzer
// Calculates real language distribution strictly from source-code files.
// Excludes non-source config files, lockfiles, and documentation.
// ============================================================

import type { LanguageDistribution, RepositoryIngestionResult } from '../../types/domain.ts';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#B07219',
  Go: '#00ADD8',
  Rust: '#DEA584',
  'C++': '#F34B7D',
  C: '#555555',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Prisma: '#2D3748',
  SQL: '#E38C00',
  Shell: '#89E051',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
};

const EXTENSION_MAP: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  py: 'Python',
  java: 'Java',
  go: 'Go',
  rs: 'Rust',
  cpp: 'C++',
  cc: 'C++',
  c: 'C',
  h: 'C',
  hpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  scss: 'CSS',
  sass: 'CSS',
  less: 'CSS',
  prisma: 'Prisma',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Shell',
  rb: 'Ruby',
  php: 'PHP',
  kt: 'Kotlin',
  swift: 'Swift',
};

export const languageAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): LanguageDistribution[] {
    const counts: Record<string, { fileCount: number; bytes: number }> = {};
    let totalCodeBytes = 0;

    // Inspect all tree nodes
    for (const node of ingestion.tree) {
      if (node.type !== 'blob') continue;

      const path = node.path.toLowerCase();
      // Skip non-source files
      if (
        path.endsWith('.md') ||
        path.endsWith('.json') ||
        path.endsWith('.yml') ||
        path.endsWith('.yaml') ||
        path.endsWith('.lock') ||
        path.endsWith('.txt') ||
        path.endsWith('.xml') ||
        path.endsWith('.gradle') ||
        path.endsWith('.toml') ||
        path.includes('/node_modules/') ||
        path.includes('/dist/') ||
        path.includes('/.next/')
      ) {
        continue;
      }

      const ext = path.split('.').pop() || '';
      const lang = EXTENSION_MAP[ext];

      if (lang) {
        const size = node.size || 500;
        if (!counts[lang]) {
          counts[lang] = { fileCount: 0, bytes: 0 };
        }
        counts[lang].fileCount += 1;
        counts[lang].bytes += size;
        totalCodeBytes += size;
      }
    }

    if (totalCodeBytes === 0) {
      // Fallback: use metadata primaryLanguage if available
      const primary = ingestion.metadata.primaryLanguage || 'JavaScript';
      return [
        {
          language: primary,
          percentage: 100,
          fileCount: ingestion.sourceFiles.length || 1,
          totalBytes: ingestion.stats.totalSourceBytes || 1000,
          color: LANGUAGE_COLORS[primary] || '#60A5FA',
        },
      ];
    }

    const distributions: LanguageDistribution[] = Object.entries(counts).map(
      ([lang, stat]) => ({
        language: lang,
        percentage: Math.round((stat.bytes / totalCodeBytes) * 1000) / 10,
        fileCount: stat.fileCount,
        totalBytes: stat.bytes,
        color: LANGUAGE_COLORS[lang] || '#94A3B8',
      })
    );

    // Sort descending by percentage
    distributions.sort((a, b) => b.percentage - a.percentage);

    return distributions;
  },
};
