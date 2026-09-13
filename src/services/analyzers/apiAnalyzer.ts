// ============================================================
// RepoInterview AI — Statically Detected API Surface Analyzer
// Detects HTTP endpoints from Express, Next.js App Router, and FastAPI declarations.
// ============================================================

import type { ApiSurface, DetectedApiRoute, RepositoryIngestionResult } from '../../types/domain.ts';

const EXPRESS_ROUTE_REGEX = /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
const FASTAPI_ROUTE_REGEX = /@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;

export const apiAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): ApiSurface {
    const routes: DetectedApiRoute[] = [];
    let framework: string | undefined;

    // 1. Next.js App Router API Routes
    for (const node of ingestion.tree) {
      const match = node.path.match(/^(?:src\/)?app\/api\/(.+)\/route\.(?:ts|js|mjs)$/);
      if (match) {
        framework = 'Next.js App Router';
        const routePath = `/api/${match[1]}`;

        routes.push({
          method: 'ALL',
          path: routePath,
          filePath: node.path,
          framework: 'Next.js App Router',
          confidence: 0.95,
          confidenceLevel: 'high',
          evidence: {
            filePath: node.path,
            evidenceType: 'route_declaration',
            description: `Next.js App Router API endpoint at ${node.path}`,
          },
        });
      }
    }

    // 2. Express & Router calls in source files
    for (const file of ingestion.sourceFiles) {
      // Check Express routes
      let expressMatch: RegExpExecArray | null;
      while ((expressMatch = EXPRESS_ROUTE_REGEX.exec(file.content)) !== null) {
        framework = framework || 'Express';
        const method = expressMatch[1].toUpperCase() as DetectedApiRoute['method'];
        const routePath = expressMatch[2];

        // Deduplicate
        if (!routes.some(r => r.method === method && r.path === routePath && r.filePath === file.path)) {
          routes.push({
            method,
            path: routePath,
            filePath: file.path,
            framework: 'Express',
            confidence: 0.90,
            confidenceLevel: 'high',
            evidence: {
              filePath: file.path,
              evidenceType: 'route_declaration',
              description: `${method} ${routePath} declared in ${file.path}`,
              snippet: expressMatch[0],
            },
          });
        }
      }

      // Check FastAPI routes
      let fastApiMatch: RegExpExecArray | null;
      while ((fastApiMatch = FASTAPI_ROUTE_REGEX.exec(file.content)) !== null) {
        framework = 'FastAPI';
        const method = fastApiMatch[1].toUpperCase() as DetectedApiRoute['method'];
        const routePath = fastApiMatch[2];

        if (!routes.some(r => r.method === method && r.path === routePath && r.filePath === file.path)) {
          routes.push({
            method,
            path: routePath,
            filePath: file.path,
            framework: 'FastAPI',
            confidence: 0.95,
            confidenceLevel: 'high',
            evidence: {
              filePath: file.path,
              evidenceType: 'route_declaration',
              description: `@app.${method.toLowerCase()}("${routePath}") declared in ${file.path}`,
            },
          });
        }
      }
    }

    return {
      detected: routes.length > 0,
      framework,
      endpointsCount: routes.length,
      routes: routes.slice(0, 30), // Top 30 detected endpoints
    };
  },
};
