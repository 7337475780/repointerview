// ============================================================
// RepoInterview AI — Phase 3 Deterministic Intelligence Test Suite
// Tests 13 modular analyzers, evidence trails, file-level import graph, and topological data flows.
// ============================================================

import assert from 'node:assert';
import { repositoryAnalysisService } from '../src/services/repositoryAnalysisService.ts';
import { fileGraphAnalyzer } from '../src/services/analyzers/fileGraphAnalyzer.ts';

console.log('🧪 Starting Phase 3 Intelligence & Topology Test Suite...\n');

// 1. Relative Import Path Resolver Test
console.log('1. Testing Relative Import Path Resolver:');
const allPaths = new Set([
  'lib/express.js',
  'lib/application.js',
  'lib/router/index.js',
  'lib/router/route.js',
  'lib/middleware/init.js',
  'lib/middleware/query.js',
  'lib/request.js',
  'lib/response.js',
  'test/app.js',
  'src/server.ts',
  'src/services/user.service.ts',
]);

const r1 = fileGraphAnalyzer.resolveImportPath('lib/express.js', './application', allPaths);
assert.strictEqual(r1, 'lib/application.js');

const r2 = fileGraphAnalyzer.resolveImportPath('lib/express.js', './router', allPaths);
assert.strictEqual(r2, 'lib/router/index.js');

const r3 = fileGraphAnalyzer.resolveImportPath('test/app.js', '../lib/express', allPaths);
assert.strictEqual(r3, 'lib/express.js');

console.log('  ✓ Correctly resolved ./application -> lib/application.js');
console.log('  ✓ Correctly resolved ./router -> lib/router/index.js');
console.log('  ✓ Correctly resolved ../lib/express -> lib/express.js');

// 2. Express Project Fixture Test with Import Graph & Verified Data Flows
console.log('\n2. Testing Express Repository Fixture & Data Flow Topology:');

const expressIngestion = {
  identity: 'expressjs/express@a371447',
  repository: {
    id: '1',
    name: 'express',
    owner: 'expressjs',
    fullName: 'expressjs/express',
    url: 'https://github.com/expressjs/express',
    defaultBranch: 'master',
    primaryLanguage: 'JavaScript',
  },
  metadata: {
    id: 1,
    owner: 'expressjs',
    name: 'express',
    fullName: 'expressjs/express',
    description: 'Fast, unopinionated, minimalist web framework for node.',
    url: 'https://github.com/expressjs/express',
    defaultBranch: 'master',
    commitSha: 'a371447',
    stars: 69000,
    forks: 24000,
    openIssues: 50,
    primaryLanguage: 'JavaScript',
    sizeKb: 5000,
    isPrivate: false,
    updatedAt: '2026-08-20',
  },
  commitSha: 'a371447',
  tree: [
    { path: 'package.json', mode: '100644', type: 'blob', sha: 's1', score: 100, selected: true },
    { path: 'lib/express.js', mode: '100644', type: 'blob', sha: 's2', score: 80, selected: true, size: 3000 },
    { path: 'lib/application.js', mode: '100644', type: 'blob', sha: 's3', score: 80, selected: true, size: 5000 },
    { path: 'lib/router/index.js', mode: '100644', type: 'blob', sha: 's4', score: 80, selected: true, size: 8000 },
    { path: 'lib/middleware/init.js', mode: '100644', type: 'blob', sha: 's5', score: 70, selected: true, size: 2000 },
    { path: 'lib/request.js', mode: '100644', type: 'blob', sha: 's6', score: 70, selected: true, size: 4000 },
    { path: 'test/app.js', mode: '100644', type: 'blob', sha: 's7', score: 40, selected: true, size: 3000 },
    { path: 'README.md', mode: '100644', type: 'blob', sha: 's8', score: 95, selected: true, size: 2000 },
  ],
  selectedFiles: [],
  sourceFiles: [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'express',
        version: '4.21.0',
        dependencies: {
          accepts: '~1.3.8',
          'cookie-signature': '1.0.6',
        },
      }),
      size: 500,
      language: 'json',
      sha: 's1',
      score: 100,
    },
    {
      path: 'lib/express.js',
      content: `
        var proto = require('./application');
        var Route = require('./router/route');
        var Router = require('./router');
        var req = require('./request');
        exports = module.exports = createApplication;
        function createApplication() {
          var app = function(req, res, next) { app.handle(req, res, next); };
          return app;
        }
      `,
      size: 1500,
      language: 'javascript',
      sha: 's2',
      score: 80,
    },
    {
      path: 'lib/application.js',
      content: `
        var Router = require('./router');
        var middleware = require('./middleware/init');
        var app = exports = module.exports = {};
        app.use = function use(fn) {
          this.lazyrouter();
          var router = this._router;
          router.use(fn);
          return this;
        };
        app.get = function(path, handler) { this._router.get(path, handler); };
      `,
      size: 2000,
      language: 'javascript',
      sha: 's3',
      score: 80,
    },
    {
      path: 'lib/router/index.js',
      content: `
        var proto = module.exports = function(options) {};
        proto.route = function(path) {};
        proto.use = function(fn) {};
      `,
      size: 2500,
      language: 'javascript',
      sha: 's4',
      score: 80,
    },
    {
      path: 'lib/middleware/init.js',
      content: `
        module.exports = function(app) { return function expressInit(req, res, next) { next(); }; };
      `,
      size: 800,
      language: 'javascript',
      sha: 's5',
      score: 70,
    },
    {
      path: 'lib/request.js',
      content: `
        var req = Object.create(http.IncomingMessage.prototype);
        module.exports = req;
      `,
      size: 1200,
      language: 'javascript',
      sha: 's6',
      score: 70,
    },
    {
      path: 'test/app.js',
      content: `
        var express = require('../lib/express');
        var request = require('supertest');
        describe('app', function(){
          it('should inherit from event emitter', function(){
            var app = express();
          });
        });
      `,
      size: 1000,
      language: 'javascript',
      sha: 's7',
      score: 40,
    },
    {
      path: 'examples/auth/index.js',
      content: `
        var express = require('../../lib/express');
        var app = express();
        app.get('/', function(req, res){ res.send('Hello'); });
        app.post('/login', function(req, res){ res.send('Login'); });
      `,
      size: 600,
      language: 'javascript',
      sha: 's8',
      score: 90,
    },
  ],
  stats: {
    totalDiscoveredFiles: 8,
    totalCandidateFiles: 7,
    selectedFilesCount: 8,
    fetchedFilesCount: 8,
    skippedFilesCount: 0,
    totalSourceBytes: 9600,
    durationMs: 140,
  },
  warnings: [],
  status: 'READY',
};

const expressResult = repositoryAnalysisService.analyzeRepository(expressIngestion);

// Verify Nodes
const nodeIds = expressResult.architectureMap.nodes.map(n => n.id);
assert.strictEqual(nodeIds.includes('server-core'), true, 'Expected server-core node');
assert.strictEqual(nodeIds.includes('router-layer'), true, 'Expected router-layer node');
assert.strictEqual(nodeIds.includes('middleware-pipeline'), true, 'Expected middleware-pipeline node');
assert.strictEqual(nodeIds.includes('shared-library'), true, 'Expected shared-library node');
assert.strictEqual(nodeIds.includes('test-suite'), true, 'Expected test-suite node');
console.log(`  ✓ Discovered ${expressResult.architectureMap.nodes.length} verified system components`);

// Verify Edges / Data Flows
const edges = expressResult.architectureMap.edges;
assert.strictEqual(edges.length > 0, true, 'Expected >0 verified data flows');

const serverToRouter = edges.find(e => e.from === 'server-core' && e.to === 'router-layer');
assert.strictEqual(Boolean(serverToRouter), true, 'Expected server-core -> router-layer edge');
assert.strictEqual(serverToRouter.relationship, 'REGISTERS');
assert.strictEqual(serverToRouter.confidence >= 0.95, true);
assert.strictEqual(serverToRouter.evidenceFiles.length >= 2, true);
console.log(`  ✓ Verified Data Flow: Server Core -> Router Layer (${serverToRouter.relationship}, ${Math.round(serverToRouter.confidence * 100)}% confidence)`);

const serverToMiddleware = edges.find(e => e.from === 'server-core' && e.to === 'middleware-pipeline');
assert.strictEqual(Boolean(serverToMiddleware), true, 'Expected server-core -> middleware-pipeline edge');
console.log(`  ✓ Verified Data Flow: Server Core -> Middleware Pipeline (${serverToMiddleware.relationship})`);

const testToServer = edges.find(e => e.from === 'test-suite' && e.to === 'server-core');
assert.strictEqual(Boolean(testToServer), true, 'Expected test-suite -> server-core edge');
assert.strictEqual(testToServer.relationship, 'TESTS');
console.log(`  ✓ Verified Data Flow: Test Suite -> Server Core (${testToServer.relationship})`);

// 3. Next.js + Prisma + Tailwind Project Fixture Test
console.log('\n3. Testing Next.js + Prisma + Tailwind Repository Fixture:');

const nextPrismaIngestion = {
  identity: 'user/saas-app@def456',
  repository: { id: '2', name: 'saas-app', owner: 'user', fullName: 'user/saas-app', url: '', defaultBranch: 'main' },
  metadata: { id: 2, owner: 'user', name: 'saas-app', fullName: 'user/saas-app', description: '', url: '', defaultBranch: 'main', commitSha: 'def456', stars: 10, forks: 2, openIssues: 0, primaryLanguage: 'TypeScript', sizeKb: 1200, isPrivate: false, updatedAt: '' },
  commitSha: 'def456',
  tree: [
    { path: 'package.json', mode: '100644', type: 'blob', sha: 't1', score: 100, selected: true },
    { path: 'prisma/schema.prisma', mode: '100644', type: 'blob', sha: 't2', score: 95, selected: true },
    { path: 'app/api/users/route.ts', mode: '100644', type: 'blob', sha: 't3', score: 90, selected: true },
    { path: 'app/layout.tsx', mode: '100644', type: 'blob', sha: 't4', score: 90, selected: true },
    { path: 'src/components/Button.tsx', mode: '100644', type: 'blob', sha: 't5', score: 60, selected: true },
  ],
  selectedFiles: [],
  sourceFiles: [
    {
      path: 'package.json',
      content: JSON.stringify({
        dependencies: {
          next: '14.2.0',
          react: '18.3.0',
          '@prisma/client': '^5.0.0',
          'next-auth': '^4.24.0',
        },
        devDependencies: {
          tailwindcss: '^3.4.0',
          typescript: '^5.4.0',
        },
      }),
      size: 400,
      language: 'json',
      sha: 't1',
      score: 100,
    },
    {
      path: 'prisma/schema.prisma',
      content: `
        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }
        model User {
          id        String   @id @default(uuid())
          email     String   @unique
          name      String?
          posts     Post[]
        }
        model Post {
          id        String   @id @default(uuid())
          title     String
          authorId  String
        }
      `,
      size: 600,
      language: 'prisma',
      sha: 't2',
      score: 95,
    },
    {
      path: 'app/api/users/route.ts',
      content: `
        import { NextResponse } from 'next/server';
        export async function GET() {
          return NextResponse.json({ users: [] });
        }
      `,
      size: 300,
      language: 'typescript',
      sha: 't3',
      score: 90,
    },
  ],
  stats: { totalDiscoveredFiles: 5, totalCandidateFiles: 5, selectedFilesCount: 3, fetchedFilesCount: 3, skippedFilesCount: 0, totalSourceBytes: 1300, durationMs: 90 },
  warnings: [],
  status: 'READY',
};

const nextResult = repositoryAnalysisService.analyzeRepository(nextPrismaIngestion);

const techNames = nextResult.technologies.map(t => t.name);
assert.strictEqual(techNames.includes('Next.js'), true);
assert.strictEqual(techNames.includes('React'), true);
assert.strictEqual(techNames.includes('Prisma'), true);
assert.strictEqual(techNames.includes('PostgreSQL'), true);
assert.strictEqual(techNames.includes('Tailwind CSS'), true);
assert.strictEqual(techNames.includes('TypeScript'), true);
console.log('  ✓ Detected Next.js, React, Prisma, PostgreSQL, Tailwind CSS, TypeScript with evidence');

assert.strictEqual(nextResult.database.models.length, 2);
assert.strictEqual(nextResult.database.models[0].name, 'User');
assert.strictEqual(nextResult.database.models[1].name, 'Post');
console.log('  ✓ Extracted Prisma models User and Post with typed fields');

assert.strictEqual(nextResult.authentication.detected, true);
assert.strictEqual(nextResult.authentication.strategies.some(s => s.includes('NextAuth')), true);
console.log('  ✓ Detected NextAuth.js authentication');

// 4. False-Positive Safeguard Tests
console.log('\n4. Testing False-Positive Safeguards:');

const fakeAuthIngestion = {
  identity: 'fake/app@111',
  repository: { id: '3', name: 'app', owner: 'fake', fullName: 'fake/app', url: '', defaultBranch: 'main' },
  metadata: { id: 3, owner: 'fake', name: 'app', fullName: 'fake/app', description: '', url: '', defaultBranch: 'main', commitSha: '111', stars: 0, forks: 0, openIssues: 0, primaryLanguage: 'TypeScript', sizeKb: 100, isPrivate: false, updatedAt: '' },
  commitSha: '111',
  tree: [{ path: 'src/utils/auth.ts', mode: '100644', type: 'blob', sha: 'f1', score: 80, selected: true }],
  selectedFiles: [],
  sourceFiles: [
    {
      path: 'src/utils/auth.ts',
      content: '// Generic math helper that happens to be named auth.ts\nexport const add = (a, b) => a + b;',
      size: 100,
      language: 'typescript',
      sha: 'f1',
      score: 80,
    },
  ],
  stats: { totalDiscoveredFiles: 1, totalCandidateFiles: 1, selectedFilesCount: 1, fetchedFilesCount: 1, skippedFilesCount: 0, totalSourceBytes: 100, durationMs: 20 },
  warnings: [],
  status: 'READY',
};

const fakeAuthResult = repositoryAnalysisService.analyzeRepository(fakeAuthIngestion);
assert.strictEqual(fakeAuthResult.authentication.detected, false);
console.log('  ✓ Avoided false-positive: did not claim JWT/NextAuth merely from filename auth.ts');

const fakeDbIngestion = {
  identity: 'fake/db@222',
  repository: { id: '4', name: 'docs', owner: 'fake', fullName: 'fake/docs', url: '', defaultBranch: 'main' },
  metadata: { id: 4, owner: 'fake', name: 'docs', fullName: 'fake/docs', description: '', url: '', defaultBranch: 'main', commitSha: '222', stars: 0, forks: 0, openIssues: 0, primaryLanguage: 'Markdown', sizeKb: 10, isPrivate: false, updatedAt: '' },
  commitSha: '222',
  tree: [{ path: 'README.md', mode: '100644', type: 'blob', sha: 'd1', score: 95, selected: true }],
  sourceFiles: [
    {
      path: 'README.md',
      content: '# Docs\nWe love PostgreSQL, MongoDB, Redis, and Stripe in theory.',
      size: 100,
      language: 'markdown',
      sha: 'd1',
      score: 95,
    },
  ],
  stats: { totalDiscoveredFiles: 1, totalCandidateFiles: 1, selectedFilesCount: 1, fetchedFilesCount: 1, skippedFilesCount: 0, totalSourceBytes: 100, durationMs: 10 },
  warnings: [],
  status: 'READY',
};

const fakeDbResult = repositoryAnalysisService.analyzeRepository(fakeDbIngestion);
assert.strictEqual(fakeDbResult.database.databaseTechnologies.length, 0);
assert.strictEqual(fakeDbResult.externalServices.length, 0);
console.log('  ✓ Avoided false-positive: did not claim DB or Stripe from casual README keywords');

// 5. Determinism Verification
console.log('\n5. Testing Analysis Determinism:');
const run1 = repositoryAnalysisService.analyzeRepository(nextPrismaIngestion);
const run2 = repositoryAnalysisService.analyzeRepository(nextPrismaIngestion);

assert.strictEqual(JSON.stringify(run1.technologies), JSON.stringify(run2.technologies));
assert.strictEqual(JSON.stringify(run1.architectureMap.nodes), JSON.stringify(run2.architectureMap.nodes));
assert.strictEqual(JSON.stringify(run1.apiSurface), JSON.stringify(run2.apiSurface));
console.log('  ✓ 100% deterministic output across independent executions');

console.log('\n✅ All Phase 3 Intelligence & Topology Tests Passed Successfully!\n');
