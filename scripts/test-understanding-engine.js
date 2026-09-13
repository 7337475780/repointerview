// ============================================================
// RepoInterview AI — Repository Understanding Engine Test Suite
// Verifies 8 Core Dimensions & Project Summary Generator:
// 1. Programming languages
// 2. Frameworks
// 3. Libraries
// 4. Database technologies
// 5. Authentication methods
// 6. Project architecture
// 7. Important modules
// 8. API structure
// + Project Summary Generation
// ============================================================

import assert from 'node:assert';
import { technologyDetector } from '../server/services/technologyDetector.js';
import { architectureExtractor } from '../server/services/architectureExtractor.js';
import { codeAnalyzerService } from '../server/services/codeAnalyzerService.js';

console.log('🧠 Starting Repository Understanding Engine Test Suite...\n');

// -------------------------------------------------------------
// Fixture 1: AI Website Builder (Next.js + Express + MongoDB + JWT)
// -------------------------------------------------------------
console.log('1. Testing Fixture: AI Website Builder (Next.js, Express, MongoDB, JWT)');

const aiWebsiteBuilderFiles = [
  {
    path: 'package.json',
    category: 'package_json',
    content: JSON.stringify({
      name: 'ai-website-builder',
      dependencies: {
        next: '^14.1.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        express: '^4.18.2',
        mongoose: '^8.0.0',
        jsonwebtoken: '^9.0.2',
        tailwindcss: '^3.4.0',
        zustand: '^4.5.0',
        zod: '^3.22.0',
        axios: '^1.6.0',
      },
      devDependencies: {
        typescript: '^5.3.0',
        jest: '^29.7.0',
      },
    }),
  },
  {
    path: 'README.md',
    category: 'readme',
    content: '# AI Website Builder\nGenerates full websites from prompt descriptions with custom themes.',
  },
  {
    path: 'tailwind.config.js',
    category: 'config',
    content: 'module.exports = { theme: {} }',
  },
  {
    path: 'server/server.js',
    category: 'source',
    content: `
      const express = require('express');
      const app = express();
      const mongoose = require('mongoose');
      mongoose.connect(process.env.MONGODB_URI);

      app.get('/api/projects', (req, res) => res.json([]));
      app.post('/api/generate', (req, res) => res.json({ status: 'generated' }));
      app.delete('/api/projects/:id', (req, res) => res.json({ deleted: true }));

      app.listen(5000);
    `,
  },
  {
    path: 'server/controllers/authController.js',
    category: 'source',
    content: `
      const jwt = require('jsonwebtoken');
      exports.login = async (req, res) => {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      };
    `,
  },
  {
    path: 'server/models/Website.js',
    category: 'source',
    content: `
      const mongoose = require('mongoose');
      const WebsiteSchema = new mongoose.Schema({ title: String, html: String });
      module.exports = mongoose.model('Website', WebsiteSchema);
    `,
  },
  {
    path: 'client/src/App.tsx',
    category: 'source',
    content: 'import React from "react"; export default function App() { return <div>AI Builder</div>; }',
  },
  {
    path: 'client/src/main.tsx',
    category: 'source',
    content: 'import ReactDOM from "react-dom/client";',
  },
];

const aiTreeNodes = [
  ...aiWebsiteBuilderFiles,
  { path: 'client/package.json' },
  { path: 'server/package.json' },
  { path: 'client/src/components/Header.tsx' },
  { path: 'client/src/components/Canvas.tsx' },
  { path: 'server/routes/api.js' },
];

const result1 = codeAnalyzerService.analyzeRepositoryFiles(
  { name: 'AI Website Builder', fullName: 'user/ai-website-builder' },
  aiWebsiteBuilderFiles,
  aiTreeNodes
);

// 1. Languages
console.log('  [1/8] Programming Languages:');
console.log('    - Primary:', result1.analysis.languages.primary);
assert(result1.analysis.languages.breakdown.some(l => l.language === 'JavaScript' || l.language === 'TypeScript'));

// 2. Frameworks
console.log('  [2/8] Frameworks:');
console.log('    - Frontend:', result1.summary.frontend);
console.log('    - Backend:', result1.summary.backend);
assert.strictEqual(result1.summary.frontend, 'Next.js');
assert.strictEqual(result1.summary.backend, 'Express');

// 3. Libraries
console.log('  [3/8] Libraries Detected:');
const libNames = result1.analysis.libraries.map(l => l.name);
console.log('    -', libNames.join(', '));
assert(libNames.includes('Tailwind CSS'));
assert(libNames.includes('Zustand'));
assert(libNames.includes('Zod'));

// 4. Database
console.log('  [4/8] Database:');
console.log('    - Detected:', result1.summary.database);
assert(result1.summary.database.includes('MongoDB') || result1.summary.database.includes('Mongoose'));

// 5. Authentication
console.log('  [5/8] Authentication:');
console.log('    - Method:', result1.summary.authentication);
assert(result1.summary.authentication.includes('JWT'));

// 6. Architecture
console.log('  [6/8] Architecture Pattern:');
console.log('    - Pattern:', result1.analysis.architecture.pattern);
assert(result1.analysis.architecture.pattern.includes('Client-Server') || result1.analysis.architecture.pattern.includes('Layered'));

// 7. Important Modules
console.log('  [7/8] Important Modules:');
for (const mod of result1.analysis.importantModules.slice(0, 4)) {
  console.log(`    - [${mod.role}] ${mod.name} -> ${mod.path}`);
}
assert(result1.analysis.importantModules.some(m => m.role === 'Entry Point' || m.role === 'Security & Auth'));

// 8. API Structure
console.log('  [8/8] API Structure:');
console.log('    - Type:', result1.analysis.apiStructure.type);
console.log('    - Total Endpoints:', result1.analysis.apiStructure.endpointsCount);
assert.strictEqual(result1.analysis.apiStructure.type, 'REST API');
assert(result1.analysis.apiStructure.endpointsCount >= 3);
const paths = result1.analysis.apiStructure.allEndpoints.map(e => `${e.method} ${e.path}`);
console.log('    - Sample Endpoints:', paths.join(', '));
assert(paths.includes('GET /api/projects'));
assert(paths.includes('POST /api/generate'));
assert(paths.includes('DELETE /api/projects/:id'));

// Project Summary Output Test
console.log('\n  📄 Generated Project Summary:');
console.log('--------------------------------------------------');
console.log(result1.summary.textFormatted);
console.log('--------------------------------------------------');

assert.strictEqual(result1.summary.projectName, 'AI Website Builder');
assert.strictEqual(result1.summary.frontend, 'Next.js');
assert.strictEqual(result1.summary.backend, 'Express');
assert(result1.summary.database.includes('MongoDB'));
assert(result1.summary.authentication.includes('JWT'));

// -------------------------------------------------------------
// Fixture 2: SaaS Dashboard (React + FastAPI + PostgreSQL + NextAuth)
// -------------------------------------------------------------
console.log('\n2. Testing Fixture: Modern SaaS (FastAPI + PostgreSQL + NextAuth)');

const saasFiles = [
  {
    path: 'package.json',
    category: 'package_json',
    content: JSON.stringify({
      dependencies: {
        react: '^18.2.0',
        'next-auth': '^4.24.5',
        '@tanstack/react-query': '^5.0.0',
      },
    }),
  },
  {
    path: 'requirements.txt',
    category: 'package_json',
    content: 'fastapi==0.109.0\nuvicorn==0.27.0\npsycopg2==2.9.9\nsqlalchemy==2.0.25',
  },
  {
    path: 'main.py',
    category: 'source',
    content: `
      from fastapi import FastAPI, Depends
      app = FastAPI()

      @app.get("/users/me")
      def read_current_user():
          return {"user": "active"}

      @app.post("/auth/token")
      def login():
          return {"access_token": "token"}
    `,
  },
  {
    path: 'src/components/Dashboard.jsx',
    category: 'source',
    content: 'import React from "react"; export default function Dashboard() {}',
  },
];

const result2 = codeAnalyzerService.analyzeRepositoryFiles(
  { name: 'SaaS Analytics Platform' },
  saasFiles,
  saasFiles
);

assert.strictEqual(result2.summary.frontend, 'React');
assert.strictEqual(result2.summary.backend, 'FastAPI');
assert(result2.summary.database.includes('PostgreSQL') || result2.summary.database.includes('SQLAlchemy'));
assert(result2.summary.authentication.includes('NextAuth'));
assert.strictEqual(result2.analysis.apiStructure.endpointsCount, 2);
console.log('  ✓ Correctly detected FastAPI backend, React frontend, PostgreSQL db, and NextAuth auth');

console.log('\n✅ All Repository Understanding Engine Tests Passed Successfully!\n');
