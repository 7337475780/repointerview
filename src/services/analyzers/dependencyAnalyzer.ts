// ============================================================
// RepoInterview AI — Dependency Profile Analyzer
// Categorizes packages into domain roles with evidence.
// ============================================================

import type {
  CategorizedDependency,
  DependencyProfile,
  RepositoryIngestionResult,
  TechnologyCategory,
} from '../../types/domain.ts';

const KNOWN_DEPENDENCY_CATEGORIES: Record<string, TechnologyCategory[]> = {
  // Frontend Frameworks & Libraries
  react: ['frontend', 'framework'],
  'react-dom': ['frontend'],
  next: ['frontend', 'backend', 'framework'],
  vue: ['frontend', 'framework'],
  svelte: ['frontend', 'framework'],
  '@angular/core': ['frontend', 'framework'],

  // Backend Frameworks & Routers
  express: ['backend', 'framework', 'api'],
  koa: ['backend', 'framework'],
  fastify: ['backend', 'framework', 'api'],
  nestjs: ['backend', 'framework'],
  '@nestjs/core': ['backend', 'framework'],
  hono: ['backend', 'api'],
  trpc: ['api', 'backend', 'frontend'],
  '@trpc/server': ['api', 'backend'],

  // Databases, ORMs & Drivers
  prisma: ['database', 'orm'],
  '@prisma/client': ['database', 'orm'],
  drizzle: ['database', 'orm'],
  'drizzle-orm': ['database', 'orm'],
  mongoose: ['database', 'orm'],
  typeorm: ['database', 'orm'],
  sequelize: ['database', 'orm'],
  pg: ['database'],
  mysql2: ['database'],
  sqlite3: ['database'],
  better_sqlite3: ['database'],
  mongodb: ['database'],
  ioredis: ['cache', 'database'],
  redis: ['cache', 'database'],
  '@supabase/supabase-js': ['database', 'auth', 'storage'],
  firebase: ['database', 'auth', 'storage'],

  // Authentication
  'next-auth': ['auth'],
  '@auth/core': ['auth'],
  '@clerk/nextjs': ['auth'],
  '@clerk/clerk-react': ['auth'],
  jsonwebtoken: ['auth'],
  passport: ['auth'],
  bcrypt: ['auth'],
  bcryptjs: ['auth'],
  jose: ['auth'],

  // State Management
  zustand: ['state', 'frontend'],
  redux: ['state', 'frontend'],
  '@reduxjs/toolkit': ['state', 'frontend'],
  mobx: ['state', 'frontend'],
  jotai: ['state', 'frontend'],
  recoil: ['state', 'frontend'],
  '@tanstack/react-query': ['state', 'frontend'],

  // Styling & UI
  tailwindcss: ['styling'],
  '@tailwindcss/postcss': ['styling'],
  'styled-components': ['styling'],
  '@emotion/react': ['styling'],
  'framer-motion': ['styling', 'frontend'],
  'lucide-react': ['frontend'],
  '@radix-ui/react-dialog': ['frontend'],

  // AI & LLM SDKs
  openai: ['ai'],
  '@anthropic-ai/sdk': ['ai'],
  '@google/genai': ['ai'],
  '@google/generative-ai': ['ai'],
  langchain: ['ai'],
  '@langchain/core': ['ai'],

  // Testing
  jest: ['testing'],
  vitest: ['testing'],
  mocha: ['testing'],
  cypress: ['testing'],
  playwright: ['testing'],
  '@testing-library/react': ['testing'],

  // Deployment / Infrastructure
  docker: ['deployment'],
  dotenv: ['backend'],
};

export const dependencyAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): DependencyProfile {
    const pkgJsonFile = ingestion.sourceFiles.find(
      f => f.path === 'package.json' || f.path.endsWith('/package.json')
    );

    if (!pkgJsonFile) {
      return {
        totalDependencies: 0,
        totalDevDependencies: 0,
        scripts: {},
        dependencies: [],
      };
    }

    try {
      const parsed = JSON.parse(pkgJsonFile.content);
      const rawDeps = parsed.dependencies || {};
      const rawDevDeps = parsed.devDependencies || {};
      const scripts = parsed.scripts || {};

      const dependencies: CategorizedDependency[] = [];

      for (const [name, version] of Object.entries(rawDeps)) {
        const categories = KNOWN_DEPENDENCY_CATEGORIES[name.toLowerCase()] || ['backend'];
        dependencies.push({
          name,
          version: String(version),
          isDev: false,
          categories,
        });
      }

      for (const [name, version] of Object.entries(rawDevDeps)) {
        const categories = KNOWN_DEPENDENCY_CATEGORIES[name.toLowerCase()] || ['testing'];
        dependencies.push({
          name,
          version: String(version),
          isDev: true,
          categories,
        });
      }

      // Detect package manager from lockfiles in tree
      let packageManager: string | undefined;
      for (const node of ingestion.tree) {
        if (node.path === 'pnpm-lock.yaml') packageManager = 'pnpm';
        else if (node.path === 'yarn.lock') packageManager = 'yarn';
        else if (node.path === 'package-lock.json') packageManager = 'npm';
        else if (node.path === 'bun.lockb' || node.path === 'bun.lock') packageManager = 'bun';
      }

      return {
        packageManager,
        totalDependencies: Object.keys(rawDeps).length,
        totalDevDependencies: Object.keys(rawDevDeps).length,
        scripts,
        dependencies,
      };
    } catch {
      return {
        totalDependencies: 0,
        totalDevDependencies: 0,
        scripts: {},
        dependencies: [],
      };
    }
  },
};
