// ============================================================
// RepoInterview AI — RAG Architecture & Vector Search Test Suite
// Verifies:
// 1. Document chunking with line tracking & symbol extraction
// 2. 768-D embedding generation & cosine similarity
// 3. MongoDB Atlas Vector Search / In-Memory Vector Store
// 4. Semantic context retrieval with score ranking
// 5. RAG-grounded question generation with code evidence
// ============================================================

import assert from 'node:assert';
import { chunkingService } from '../server/rag/chunkingService.js';
import { embeddingService } from '../server/rag/embeddingService.js';
import { vectorStoreService } from '../server/rag/vectorStoreService.js';
import { retrievalService } from '../server/rag/retrievalService.js';
import { ragQuestionService } from '../server/rag/ragQuestionService.js';
import { ragController } from '../server/controllers/ragController.js';

console.log('⚡ Starting RAG Architecture & Vector Search Test Suite...\n');

// -------------------------------------------------------------
// Sample Repository Files Fixture
// -------------------------------------------------------------
const sampleFiles = [
  {
    path: 'server/controllers/authController.js',
    category: 'source',
    content: `
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');

      exports.login = async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
          expiresIn: '15m',
        });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        return res.json({ success: true, token });
      };

      exports.logout = (req, res) => {
        res.clearCookie('token');
        return res.json({ success: true });
      };
    `,
  },
  {
    path: 'server/models/User.js',
    category: 'source',
    content: `
      const mongoose = require('mongoose');
      const bcrypt = require('bcryptjs');

      const UserSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        createdAt: { type: Date, default: Date.now },
      });

      UserSchema.methods.comparePassword = async function(candidate) {
        return bcrypt.compare(candidate, this.password);
      };

      module.exports = mongoose.model('User', UserSchema);
    `,
  },
  {
    path: 'server/routes/api.js',
    category: 'source',
    content: `
      const express = require('express');
      const router = express.Router();
      const auth = require('../controllers/authController');

      router.post('/auth/login', auth.login);
      router.post('/auth/logout', auth.logout);
      router.get('/users/profile', (req, res) => res.json({ user: req.user }));

      module.exports = router;
    `,
  },
];

// -------------------------------------------------------------
// 1. DOCUMENT CHUNKING VERIFICATION
// -------------------------------------------------------------
console.log('1. Testing Document Chunking:');

const repoId = 'test-org/ai-auth-api';
const chunks = chunkingService.chunkRepository(sampleFiles, repoId, { chunkSize: 500, chunkOverlap: 80 });

assert(chunks.length >= 3, 'Should generate at least 3 chunks from 3 files');
for (const chunk of chunks) {
  assert(chunk.repositoryId === repoId, 'Chunk must contain repositoryId');
  assert(chunk.filePath, 'Chunk must specify filePath');
  assert(chunk.startLine >= 1, 'startLine must be >= 1');
  assert(chunk.endLine >= chunk.startLine, 'endLine must be >= startLine');
  assert(typeof chunk.content === 'string' && chunk.content.length > 0, 'Chunk content must be non-empty string');
}

console.log(`  ✓ Generated ${chunks.length} structured code chunks with line ranges:`);
for (const c of chunks) {
  console.log(`    - \`${c.filePath}\` (Lines ${c.startLine}-${c.endLine}) [${c.charCount} chars, symbols: ${c.symbols.join(', ') || 'none'}]`);
}

// -------------------------------------------------------------
// 2. EMBEDDINGS & COSINE SIMILARITY VERIFICATION
// -------------------------------------------------------------
console.log('\n2. Testing Embedding Generation & Cosine Similarity:');

const authQueryText = 'JWT authentication token and login route';
const dbQueryText = 'MongoDB User mongoose schema and password hashing';
const unrelatedQueryText = 'Kubernetes ingress helm charts';

const vAuth = await embeddingService.generateEmbedding(authQueryText);
const vDb = await embeddingService.generateEmbedding(dbQueryText);
const vUnrelated = await embeddingService.generateEmbedding(unrelatedQueryText);

assert.strictEqual(vAuth.length, 768, 'Embedding vector must be 768 dimensions');
assert.strictEqual(vDb.length, 768, 'Embedding vector must be 768 dimensions');

const authToAuthChunk = embeddingService.cosineSimilarity(
  vAuth,
  await embeddingService.generateEmbedding(sampleFiles[0].content)
);

const authToUnrelated = embeddingService.cosineSimilarity(vAuth, vUnrelated);

console.log(`  ✓ Similarity (Auth Query <-> Auth Code): ${(authToAuthChunk * 100).toFixed(1)}%`);
console.log(`  ✓ Similarity (Auth Query <-> Unrelated): ${(authToUnrelated * 100).toFixed(1)}%`);
assert(authToAuthChunk > authToUnrelated, 'Semantic query must have higher similarity to relevant code than unrelated text');

// -------------------------------------------------------------
// 3. VECTOR STORAGE & INDEXING VERIFICATION
// -------------------------------------------------------------
console.log('\n3. Testing Vector Storage (MongoDB Atlas & In-Memory Store):');

const indexResult = await ragQuestionService.indexRepository(repoId, sampleFiles);
assert.strictEqual(indexResult.repositoryId, repoId);
assert(indexResult.totalChunks >= 3);

const stats = vectorStoreService.getStats(repoId);
console.log('  ✓ Vector Store Status:', JSON.stringify(stats));

// -------------------------------------------------------------
// 4. CONTEXT RETRIEVAL & RE-RANKING VERIFICATION
// -------------------------------------------------------------
console.log('\n4. Testing Semantic Context Retrieval:');

const retrievedAuth = await retrievalService.retrieveContext(repoId, 'JWT token signing and cookie security', { topK: 2 });
assert(retrievedAuth.length > 0, 'Should retrieve matching chunks');
assert.strictEqual(retrievedAuth[0].filePath, 'server/controllers/authController.js', 'Top match for auth query must be authController.js');
console.log(`  ✓ Top Retrieved Chunk: \`${retrievedAuth[0].filePath}\` (Lines ${retrievedAuth[0].startLine}-${retrievedAuth[0].endLine}, Score: ${retrievedAuth[0].score})`);

const retrievedDb = await retrievalService.retrieveContext(repoId, 'Mongoose Schema unique index and bcrypt password compare', { topK: 2 });
assert(retrievedDb.length > 0);
assert.strictEqual(retrievedDb[0].filePath, 'server/models/User.js', 'Top match for database query must be User.js');
console.log(`  ✓ Top Retrieved Chunk: \`${retrievedDb[0].filePath}\` (Lines ${retrievedDb[0].startLine}-${retrievedDb[0].endLine}, Score: ${retrievedDb[0].score})`);

const formattedPromptContext = retrievalService.formatContextForPrompt(retrievedAuth);
assert(formattedPromptContext.includes('server/controllers/authController.js'));
assert(formattedPromptContext.includes('Evidence Chunk [1]'));
console.log('  ✓ Formatted markdown context block ready for LLM prompt grounding');

// -------------------------------------------------------------
// 5. RAG-GROUNDED QUESTION GENERATION VERIFICATION
// -------------------------------------------------------------
console.log('\n5. Testing End-to-End RAG Question Generation:');

const analysisData = {
  repository: { name: 'AI Auth API', fullName: repoId },
  summary: {
    projectName: 'AI Auth API',
    frontend: 'React',
    backend: 'Express',
    database: 'MongoDB (Mongoose)',
    authentication: 'JWT (JSON Web Tokens)',
    architecturePattern: 'Layered MVC Backend Architecture',
  },
  understanding: {
    apiStructure: {
      sampleEndpoints: [{ method: 'POST', path: '/auth/login', file: 'server/routes/api.js' }],
    },
    libraries: [{ name: 'Mongoose', category: 'Database' }],
  },
};

const ragOutput = await ragQuestionService.generateRAGQuestions(analysisData, sampleFiles, {
  categories: ['Security', 'Database', 'API'],
});

assert.strictEqual(ragOutput.totalQuestions, 3, 'Should generate 3 RAG questions');
for (const q of ragOutput.questions) {
  assert(q.question, 'Question text required');
  assert(q.expectedAnswer, 'Expected answer required');
  assert(Array.isArray(q.evidenceFiles) && q.evidenceFiles.length > 0, 'Must include evidenceFiles');
  console.log(`  ✓ [${q.category}] ${q.question.substring(0, 70)}...`);
  console.log(`    ↳ Grounded in: ${q.evidenceFiles.map(e => `${e.filePath}:${e.lines}`).join(', ')}`);
}

// -------------------------------------------------------------
// 6. RAG CONTROLLER ENDPOINT VERIFICATION
// -------------------------------------------------------------
console.log('\n6. Testing RAG Controller Endpoints:');

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

let nextErr = null;
const mockNext = (err) => { nextErr = err; };

// Controller search
await ragController.search(
  { body: { repositoryId: repoId, query: 'Mongoose User schema unique index', topK: 1 } },
  mockRes,
  mockNext
);

assert.strictEqual(mockRes.statusCode, 200);
assert.strictEqual(mockRes.body.data.totalMatches, 1);
assert.strictEqual(mockRes.body.data.matches[0].filePath, 'server/models/User.js');
console.log('  ✓ Controller POST /api/rag/search returned 200 OK with top match server/models/User.js');

console.log('\n✅ All RAG Architecture & Vector Search Tests Passed Successfully!\n');
