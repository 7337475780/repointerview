// ============================================================
// RepoInterview AI — Backend Repository Analysis Test Suite
// Validates:
// 1. URL validation and owner/repo extraction
// 2. File filtering logic (ignoring node_modules, .git, dist, build, images, videos)
// 3. Category extraction (package.json, README.md, source files, config files)
// 4. Controller responses & status codes
// 5. Centralized error handling
// ============================================================

import assert from 'node:assert';
import { githubService } from '../server/services/githubService.js';
import { fileFilterService, IGNORED_DIRECTORIES, IGNORED_EXTENSIONS } from '../server/services/fileFilterService.js';
import { repositoryAnalysisService } from '../server/services/repositoryAnalysisService.js';
import { repositoryController } from '../server/controllers/repositoryController.js';
import { AppError, ValidationError, NotFoundError, RateLimitError } from '../server/middleware/errorHandler.js';

console.log('🧪 Starting Backend Repository Analysis Test Suite...\n');

// -------------------------------------------------------------
// 1. URL VALIDATION & EXTRACTION TESTS
// -------------------------------------------------------------
console.log('1. Testing URL Validation & Owner/Repo Extraction:');

const testCases = [
  { input: 'https://github.com/facebook/react', owner: 'facebook', repo: 'react', branch: undefined },
  { input: 'https://github.com/vercel/next.js/', owner: 'vercel', repo: 'next.js', branch: undefined },
  { input: 'https://github.com/tailwindlabs/tailwindcss.git', owner: 'tailwindlabs', repo: 'tailwindcss', branch: undefined },
  { input: 'github.com/expressjs/express', owner: 'expressjs', repo: 'express', branch: undefined },
  { input: 'https://github.com/facebook/react/tree/main', owner: 'facebook', repo: 'react', branch: 'main' },
  { input: 'https://github.com/facebook/react/tree/feature/auth-v2', owner: 'facebook', repo: 'react', branch: 'feature/auth-v2' },
];

for (const tc of testCases) {
  const res = githubService.parseUrl(tc.input);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.owner, tc.owner);
  assert.strictEqual(res.repo, tc.repo);
  assert.strictEqual(res.fullName, `${tc.owner}/${tc.repo}`);
  assert.strictEqual(res.branch, tc.branch);
  console.log(`  ✓ Validated ${tc.input} -> owner: ${tc.owner}, repo: ${tc.repo}`);
}

// Test Invalid URLs
const invalidInputs = [
  '',
  '   ',
  'https://gitlab.com/user/project',
  'https://github.com',
  'https://github.com/onlyowner',
  'not-a-url',
];

for (const inv of invalidInputs) {
  assert.throws(
    () => githubService.parseUrl(inv),
    (err) => err instanceof ValidationError || err.statusCode === 400,
    `Should reject invalid input: "${inv}"`
  );
  console.log(`  ✓ Correctly rejected invalid URL: "${inv}"`);
}

// -------------------------------------------------------------
// 2. FILE FILTERING LOGIC (IGNORED DIRECTORIES & EXTENSIONS)
// -------------------------------------------------------------
console.log('\n2. Testing File Filtering Logic (Ignored Directories & Extensions):');

// A. Verify ignored directories
const ignoredDirectoryFiles = [
  { path: 'node_modules/express/index.js', type: 'blob' },
  { path: 'node_modules/@types/react/index.d.ts', type: 'blob' },
  { path: '.git/config', type: 'blob' },
  { path: '.git/HEAD', type: 'blob' },
  { path: 'dist/bundle.js', type: 'blob' },
  { path: 'dist/index.html', type: 'blob' },
  { path: 'build/static/js/main.js', type: 'blob' },
  { path: '.next/server/pages/index.js', type: 'blob' },
  { path: 'coverage/lcov-report/index.html', type: 'blob' },
  { path: '__pycache__/app.cpython-39.pyc', type: 'blob' },
  { path: '.venv/lib/python3.9/site-packages/flask.py', type: 'blob' },
];

for (const node of ignoredDirectoryFiles) {
  const check = fileFilterService.shouldIgnore(node);
  assert.strictEqual(check.ignore, true, `Should ignore directory path: ${node.path}`);
  assert.strictEqual(check.reason, 'IGNORED_DIRECTORY');
}
console.log(`  ✓ Successfully ignored all ${ignoredDirectoryFiles.length} files in ignored directories (node_modules, .git, dist, build, etc.)`);

// B. Verify ignored media and binaries (Images & Videos)
const ignoredMediaAndBinaryFiles = [
  // Images
  { path: 'assets/logo.png', type: 'blob' },
  { path: 'public/hero.jpg', type: 'blob' },
  { path: 'src/images/banner.jpeg', type: 'blob' },
  { path: 'favicon.ico', type: 'blob' },
  { path: 'icon.svg', type: 'blob' },
  { path: 'graphic.webp', type: 'blob' },
  { path: 'sample.gif', type: 'blob' },
  // Videos
  { path: 'demo.mp4', type: 'blob' },
  { path: 'preview.webm', type: 'blob' },
  { path: 'walkthrough.mov', type: 'blob' },
  { path: 'intro.avi', type: 'blob' },
  { path: 'screencast.mkv', type: 'blob' },
  // Binaries / Lockfiles
  { path: 'document.pdf', type: 'blob' },
  { path: 'archive.zip', type: 'blob' },
  { path: 'package-lock.json', type: 'blob' },
  { path: 'pnpm-lock.yaml', type: 'blob' },
  { path: 'app.min.js', type: 'blob' },
];

for (const node of ignoredMediaAndBinaryFiles) {
  const check = fileFilterService.shouldIgnore(node);
  assert.strictEqual(check.ignore, true, `Should ignore media/binary path: ${node.path}`);
}
console.log(`  ✓ Successfully ignored all ${ignoredMediaAndBinaryFiles.length} image, video, binary, and minified files`);

// -------------------------------------------------------------
// 3. EXTRACTION & CATEGORIZATION (package.json, README, source, config)
// -------------------------------------------------------------
console.log('\n3. Testing Category Extraction:');

const rawFixtureTree = [
  // Ignored
  { path: 'node_modules/react/index.js', type: 'blob', size: 5000 },
  { path: '.git/HEAD', type: 'blob', size: 40 },
  { path: 'dist/bundle.js', type: 'blob', size: 100000 },
  { path: 'build/index.html', type: 'blob', size: 4000 },
  { path: 'public/logo.png', type: 'blob', size: 45000 },
  { path: 'demo/walkthrough.mp4', type: 'blob', size: 5000000 },
  { path: 'package-lock.json', type: 'blob', size: 85000 },
  // Allowed - package.json
  { path: 'package.json', type: 'blob', size: 1200, sha: 'sha_pkg' },
  { path: 'packages/core/package.json', type: 'blob', size: 800, sha: 'sha_pkg_core' },
  // Allowed - README
  { path: 'README.md', type: 'blob', size: 3400, sha: 'sha_readme' },
  // Allowed - Config files
  { path: 'vite.config.ts', type: 'blob', size: 900, sha: 'sha_vite' },
  { path: 'tsconfig.json', type: 'blob', size: 600, sha: 'sha_ts' },
  { path: 'tailwind.config.js', type: 'blob', size: 1100, sha: 'sha_tw' },
  { path: 'Dockerfile', type: 'blob', size: 450, sha: 'sha_dock' },
  { path: 'prisma/schema.prisma', type: 'blob', size: 1500, sha: 'sha_prisma' },
  // Allowed - Source files
  { path: 'src/main.tsx', type: 'blob', size: 850, sha: 'sha_main' },
  { path: 'src/App.tsx', type: 'blob', size: 2300, sha: 'sha_app' },
  { path: 'src/server/index.ts', type: 'blob', size: 1800, sha: 'sha_srv' },
  { path: 'src/server/routes/users.ts', type: 'blob', size: 2100, sha: 'sha_route' },
  { path: 'src/server/controllers/auth.ts', type: 'blob', size: 3200, sha: 'sha_ctrl' },
  { path: 'src/models/User.ts', type: 'blob', size: 1200, sha: 'sha_usr' },
  { path: 'src/components/Header.jsx', type: 'blob', size: 1400, sha: 'sha_hdr' },
];

const categorized = fileFilterService.filterAndCategorize(rawFixtureTree);

assert.strictEqual(categorized.packageJsonFiles.length, 2, 'Should extract 2 package.json files');
assert.strictEqual(categorized.readmeFiles.length, 1, 'Should extract 1 README.md');
assert.strictEqual(categorized.configFiles.length, 5, 'Should extract 5 configuration files');
assert.strictEqual(categorized.sourceFiles.length, 7, 'Should extract 7 source files');
assert.strictEqual(categorized.ignoredFiles.length, 7, 'Should ignore 7 noise/media files');

console.log('  ✓ Extracted package.json manifests:');
categorized.packageJsonFiles.forEach(f => console.log(`    - ${f.path} (priority: ${f.priority})`));

console.log('  ✓ Extracted README:');
categorized.readmeFiles.forEach(f => console.log(`    - ${f.path} (priority: ${f.priority})`));

console.log('  ✓ Extracted Configuration files:');
categorized.configFiles.forEach(f => console.log(`    - ${f.path} (priority: ${f.priority})`));

console.log('  ✓ Extracted Source files:');
categorized.sourceFiles.forEach(f => console.log(`    - ${f.path} (priority: ${f.priority})`));

// -------------------------------------------------------------
// 4. CONTROLLER & ERROR HANDLING TESTS
// -------------------------------------------------------------
console.log('\n4. Testing Controller & Error Handling:');

// Test Controller validateUrl success
const mockRes = {
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = data;
    return this;
  },
};

let nextCalledWith = null;
const mockNext = (err) => { nextCalledWith = err; };

repositoryController.validateUrl(
  { body: { url: 'https://github.com/expressjs/express' } },
  mockRes,
  mockNext
);

assert.strictEqual(mockRes.statusCode, 200);
assert.strictEqual(mockRes.body.success, true);
assert.strictEqual(mockRes.body.data.owner, 'expressjs');
assert.strictEqual(mockRes.body.data.repo, 'express');
console.log('  ✓ Controller validateUrl returned 200 with extracted owner and repo');

// Test Controller validateUrl validation error
nextCalledWith = null;
repositoryController.validateUrl(
  { body: { url: 'https://notgithub.com/invalid' } },
  mockRes,
  mockNext
);
assert(nextCalledWith instanceof ValidationError);
assert.strictEqual(nextCalledWith.statusCode, 400);
console.log('  ✓ Controller properly passed ValidationError (HTTP 400) to next middleware');

// Test Error classes
const notFound = new NotFoundError('Repo not found');
assert.strictEqual(notFound.statusCode, 404);
assert.strictEqual(notFound.errorCode, 'NOT_FOUND');

const rateLimit = new RateLimitError();
assert.strictEqual(rateLimit.statusCode, 429);
assert.strictEqual(rateLimit.errorCode, 'RATE_LIMIT_EXCEEDED');
console.log('  ✓ Verified NotFoundError (404) and RateLimitError (429) structures');

// -------------------------------------------------------------
// 5. INTELLIGENCE EXTRACTION TEST
// -------------------------------------------------------------
console.log('\n5. Testing Intelligence Extraction from Categorized Files:');

const fakeExtracted = [
  {
    path: 'package.json',
    category: 'package_json',
    content: JSON.stringify({
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        pg: '^8.11.0',
        prisma: '^5.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
    }),
  },
  {
    path: 'README.md',
    category: 'readme',
    content: '# Express PostgreSQL API\nProduction ready backend service.',
  },
  {
    path: 'prisma/schema.prisma',
    category: 'config',
    content: 'datasource db { provider = "postgresql" }',
  },
];

const intel = repositoryAnalysisService.extractIntelligence(
  { primaryLanguage: 'TypeScript' },
  categorized,
  fakeExtracted
);

assert(intel.detectedTechnologies.includes('Express.js'), 'Should detect Express.js');
assert(intel.detectedTechnologies.includes('PostgreSQL'), 'Should detect PostgreSQL');
assert(intel.detectedTechnologies.includes('Prisma ORM'), 'Should detect Prisma ORM');
assert(intel.detectedTechnologies.includes('TypeScript'), 'Should detect TypeScript');
assert.strictEqual(intel.hasReadme, true);
assert.strictEqual(intel.hasPackageJson, true);
assert.strictEqual(intel.hasConfigFiles, true);

console.log('  ✓ Detected technologies from package.json & configs:', intel.detectedTechnologies.join(', '));

console.log('\n✅ All Backend Repository Analysis Tests Passed Successfully!\n');
