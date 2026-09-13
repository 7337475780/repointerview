// ============================================================
// RepoInterview AI — Project Structure Analyzer
// Identifies directory roles and structural design patterns.
// ============================================================

import type { DirectoryRole, ProjectStructure, RepositoryIngestionResult } from '../../types/domain.ts';

const DIRECTORY_ROLE_DEFINITIONS: Record<string, { role: string; description: string }> = {
  'src/components': { role: 'UI Components', description: 'Modular, reusable frontend UI components' },
  components: { role: 'UI Components', description: 'Modular, reusable frontend UI components' },
  'src/pages': { role: 'Page Views', description: 'Top-level page route components (Pages Router)' },
  pages: { role: 'Page Views', description: 'Top-level page route components (Pages Router)' },
  'app/api': { role: 'API Routes', description: 'Backend HTTP API route handlers (Next.js App Router)' },
  'src/app': { role: 'Application Shell', description: 'App router layout, routing, and entry shell' },
  app: { role: 'Application Shell', description: 'App router layout, routing, and entry shell' },
  'src/services': { role: 'Service Layer', description: 'Core domain services and business logic' },
  services: { role: 'Service Layer', description: 'Core domain services and business logic' },
  'src/routes': { role: 'API Routers', description: 'Express / REST endpoint router definitions' },
  routes: { role: 'API Routers', description: 'Express / REST endpoint router definitions' },
  'src/controllers': { role: 'Controllers', description: 'HTTP request handlers and response formatters' },
  controllers: { role: 'Controllers', description: 'HTTP request handlers and response formatters' },
  'src/models': { role: 'Domain Models', description: 'Database entities, ORM schemas, and data structures' },
  models: { role: 'Domain Models', description: 'Database entities, ORM schemas, and data structures' },
  'src/middleware': { role: 'Middleware', description: 'Request interceptors, authentication guards, and logging' },
  middleware: { role: 'Middleware', description: 'Request interceptors, authentication guards, and logging' },
  'src/hooks': { role: 'Custom Hooks', description: 'Client-side stateful hooks and utility logic' },
  hooks: { role: 'Custom Hooks', description: 'Client-side stateful hooks and utility logic' },
  'src/lib': { role: 'Shared Libraries', description: 'Core internal client utilities, DB clients, and helpers' },
  lib: { role: 'Shared Libraries', description: 'Core internal client utilities, DB clients, and helpers' },
  'src/utils': { role: 'Utilities', description: 'Pure helper functions and formatters' },
  utils: { role: 'Utilities', description: 'Pure helper functions and formatters' },
  prisma: { role: 'Database Schema', description: 'Prisma data modeling, migrations, and seed scripts' },
  database: { role: 'Database Layer', description: 'Database connections, migrations, and queries' },
  db: { role: 'Database Layer', description: 'Database connections, migrations, and queries' },
  public: { role: 'Static Assets', description: 'Public static files, icons, and fonts' },
  tests: { role: 'Test Suite', description: 'Automated unit, integration, and E2E test specs' },
  '__tests__': { role: 'Test Suite', description: 'Automated unit, integration, and E2E test specs' },
  test: { role: 'Test Suite', description: 'Automated unit, integration, and E2E test specs' },
};

export const structureAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): ProjectStructure {
    const dirMap = new Map<string, { role: string; description: string; paths: string[] }>();

    for (const node of ingestion.tree) {
      const parts = node.path.split('/');
      if (parts.length <= 1) continue;

      // Check single and 2-level directory prefixes
      const prefix1 = parts[0];
      const prefix2 = parts.length > 2 ? `${parts[0]}/${parts[1]}` : null;

      if (prefix2 && DIRECTORY_ROLE_DEFINITIONS[prefix2]) {
        const def = DIRECTORY_ROLE_DEFINITIONS[prefix2];
        if (!dirMap.has(prefix2)) {
          dirMap.set(prefix2, { ...def, paths: [] });
        }
        if (dirMap.get(prefix2)!.paths.length < 5) {
          dirMap.get(prefix2)!.paths.push(node.path);
        }
      } else if (DIRECTORY_ROLE_DEFINITIONS[prefix1]) {
        const def = DIRECTORY_ROLE_DEFINITIONS[prefix1];
        if (!dirMap.has(prefix1)) {
          dirMap.set(prefix1, { ...def, paths: [] });
        }
        if (dirMap.get(prefix1)!.paths.length < 5) {
          dirMap.get(prefix1)!.paths.push(node.path);
        }
      }
    }

    const keyDirectories: DirectoryRole[] = Array.from(dirMap.entries()).map(([path, data]) => ({
      path,
      role: data.role,
      description: data.description,
      evidencePaths: data.paths,
    }));

    // Pattern inference
    let pattern = 'Standard Modular Structure';
    const paths = new Set(keyDirectories.map(d => d.path));

    if (paths.has('app/api') || (paths.has('app') && paths.has('src/app'))) {
      pattern = 'Next.js App Router Architecture';
    } else if (paths.has('src/controllers') && paths.has('src/services') && paths.has('src/models')) {
      pattern = 'Layered MVC Architecture (Controller-Service-Model)';
    } else if (paths.has('src/components') && paths.has('src/pages')) {
      pattern = 'Component-Driven Frontend Architecture';
    } else if (paths.has('routes') && paths.has('services')) {
      pattern = 'Service-Oriented REST Architecture';
    }

    return {
      pattern,
      keyDirectories,
    };
  },
};
