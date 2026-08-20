// ============================================================
// RepoInterview AI — Phase 2 Automated Tests
// Tests URL parser, score-based file selector, and limits
// ============================================================

import assert from 'node:assert';
import { githubService } from '../src/services/githubService.ts';
import { fileFilterService, INGESTION_LIMITS } from '../src/services/fileFilterService.ts';
import { cacheService } from '../src/services/cacheService.ts';

console.log('🧪 Starting Phase 2 Test Suite...\n');

// 1. GitHub URL Parser Tests
console.log('1. Testing GitHub URL Parser:');

const valid1 = githubService.parseUrl('https://github.com/expressjs/express');
assert.strictEqual(valid1.valid, true);
assert.strictEqual(valid1.owner, 'expressjs');
assert.strictEqual(valid1.repo, 'express');
assert.strictEqual(valid1.fullName, 'expressjs/express');
console.log('  ✓ Standard URL: https://github.com/expressjs/express');

const validWithSlash = githubService.parseUrl('https://github.com/facebook/relay/');
assert.strictEqual(validWithSlash.valid, true);
assert.strictEqual(validWithSlash.owner, 'facebook');
assert.strictEqual(validWithSlash.repo, 'relay');
console.log('  ✓ Trailing slash: https://github.com/facebook/relay/');

const validGitSuffix = githubService.parseUrl('https://github.com/shadcn-ui/ui.git');
assert.strictEqual(validGitSuffix.valid, true);
assert.strictEqual(validGitSuffix.owner, 'shadcn-ui');
assert.strictEqual(validGitSuffix.repo, 'ui');
console.log('  ✓ .git suffix: https://github.com/shadcn-ui/ui.git');

const validNoScheme = githubService.parseUrl('github.com/vercel/next.js');
assert.strictEqual(validNoScheme.valid, true);
assert.strictEqual(validNoScheme.owner, 'vercel');
assert.strictEqual(validNoScheme.repo, 'next.js');
console.log('  ✓ No scheme: github.com/vercel/next.js');

const invalidGitlab = githubService.parseUrl('https://gitlab.com/owner/repo');
assert.strictEqual(invalidGitlab.valid, false);
console.log('  ✓ Rejects non-GitHub URLs (gitlab.com)');

const invalidMalformed = githubService.parseUrl('not a url');
assert.strictEqual(invalidMalformed.valid, false);
console.log('  ✓ Rejects malformed strings');

// 2. Score-based File Selection Tests
console.log('\n2. Testing Score-based File Selector:');

assert.strictEqual(fileFilterService.calculateFileScore('package.json').score, 100);
console.log('  ✓ package.json scored 100');

assert.strictEqual(fileFilterService.calculateFileScore('README.md').score, 95);
console.log('  ✓ README.md scored 95');

assert.strictEqual(fileFilterService.calculateFileScore('prisma/schema.prisma').score, 95);
console.log('  ✓ prisma/schema.prisma scored 95');

assert.strictEqual(fileFilterService.calculateFileScore('Dockerfile').score, 90);
console.log('  ✓ Dockerfile scored 90');

assert.strictEqual(fileFilterService.calculateFileScore('src/server/api/routes.ts').score, 90);
console.log('  ✓ API routes scored 90');

assert.strictEqual(fileFilterService.calculateFileScore('src/lib/auth.ts').score, 90);
console.log('  ✓ Auth files scored 90');

assert.strictEqual(fileFilterService.calculateFileScore('tsconfig.json').score, 85);
console.log('  ✓ tsconfig.json scored 85');

assert.strictEqual(fileFilterService.calculateFileScore('src/services/userService.ts').score, 80);
console.log('  ✓ Services scored 80');

assert.strictEqual(fileFilterService.calculateFileScore('src/components/Header.tsx').score, 60);
console.log('  ✓ Components scored 60');

assert.strictEqual(fileFilterService.calculateFileScore('src/utils/math.ts').score, 50);
console.log('  ✓ Utils scored 50');

assert.strictEqual(fileFilterService.calculateFileScore('src/tests/app.test.ts').score, 40);
console.log('  ✓ Tests scored 40');

// 3. Ignored Files & Folders
console.log('\n3. Testing Ignored Files & Folders:');

assert.strictEqual(fileFilterService.isIgnoredPath('node_modules/react/index.js'), true);
assert.strictEqual(fileFilterService.calculateFileScore('node_modules/react/index.js').skipReason, 'SKIPPED_IRRELEVANT');
console.log('  ✓ Ignored node_modules');

assert.strictEqual(fileFilterService.isIgnoredPath('.next/server/pages/index.js'), true);
console.log('  ✓ Ignored .next');

assert.strictEqual(fileFilterService.isIgnoredPath('dist/bundle.js'), true);
console.log('  ✓ Ignored dist');

assert.strictEqual(fileFilterService.isBinaryOrIgnoredExtension('logo.png'), true);
assert.strictEqual(fileFilterService.calculateFileScore('logo.png').skipReason, 'SKIPPED_BINARY');
console.log('  ✓ Ignored binary png');

assert.strictEqual(fileFilterService.isBinaryOrIgnoredExtension('app.wasm'), true);
console.log('  ✓ Ignored binary wasm');

assert.strictEqual(fileFilterService.isBinaryOrIgnoredExtension('package-lock.json'), true);
console.log('  ✓ Ignored package-lock.json');

// 4. File Size Limits & Selection Cap
console.log('\n4. Testing Safety Bounds & Selection Cap:');

const mockTree = [
  { path: 'package.json', mode: '100644', type: 'blob', sha: 'sha1' },
  { path: 'README.md', mode: '100644', type: 'blob', sha: 'sha2' },
  { path: 'prisma/schema.prisma', mode: '100644', type: 'blob', sha: 'sha3' },
  { path: 'src/server/index.ts', mode: '100644', type: 'blob', sha: 'sha4' },
  { path: 'large-data.json', mode: '100644', type: 'blob', sha: 'sha5', size: 150 * 1024 }, // exceeds 100KB
  { path: 'node_modules/dep/index.js', mode: '100644', type: 'blob', sha: 'sha6' },
  ...Array.from({ length: 60 }, (_, i) => ({
    path: `src/components/Comp${i}.tsx`,
    mode: '100644',
    type: 'blob',
    sha: `comp-sha-${i}`,
  })),
];

const selected = fileFilterService.selectRelevantFiles(mockTree);
const chosen = selected.filter(n => n.selected);

assert.strictEqual(chosen.length, INGESTION_LIMITS.MAX_SELECTED_FILES);
assert.strictEqual(chosen[0].path, 'package.json');
assert.strictEqual(chosen[1].path, 'README.md');
assert.strictEqual(chosen[2].path, 'prisma/schema.prisma');
assert.strictEqual(chosen[3].path, 'src/server/index.ts');

const largeFileNode = selected.find(n => n.path === 'large-data.json');
assert.strictEqual(largeFileNode?.skipReason, 'SKIPPED_LARGE_FILE');
assert.strictEqual(largeFileNode?.selected, false);

console.log(`  ✓ Capped selection to exactly ${INGESTION_LIMITS.MAX_SELECTED_FILES} files`);
console.log('  ✓ Prioritized high-value files at top of selection');
console.log('  ✓ Correctly marked oversized file (>100KB) as SKIPPED_LARGE_FILE');

// 5. Ingestion Cache Tests
console.log('\n5. Testing Cache Identity:');
const identity = cacheService.getIdentity('expressjs', 'express', 'a1b2c3d');
assert.strictEqual(identity, 'expressjs/express@a1b2c3d');
console.log('  ✓ Identity formatted as owner/repo@commitSha');

console.log('\n✅ All Phase 2 Tests Passed Successfully!\n');
