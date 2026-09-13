// ============================================================
// RepoInterview AI — AI Question Generation Test Suite
// Verifies:
// 1. Generation across all 8 required categories
// 2. Strict schema verification for each question
// 3. Prompt template formatting
// 4. AI Service fallback & API integration
// 5. Controller endpoint handling
// ============================================================

import assert from 'node:assert';
import { promptTemplates, INTERVIEW_CATEGORIES } from '../server/templates/promptTemplates.js';
import { aiService } from '../server/services/aiService.js';
import { questionController } from '../server/controllers/questionController.js';
import { codeAnalyzerService } from '../server/services/codeAnalyzerService.js';

console.log('🤖 Starting AI Interview Question Generation Test Suite...\n');

// -------------------------------------------------------------
// Sample Repository Analysis Fixture
// -------------------------------------------------------------
const sampleFiles = [
  {
    path: 'package.json',
    content: JSON.stringify({
      name: 'ai-website-builder',
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        express: '^4.18.2',
        mongoose: '^8.0.0',
        jsonwebtoken: '^9.0.0',
        tailwindcss: '^3.4.0',
        zustand: '^4.5.0',
      },
    }),
  },
  {
    path: 'server/server.js',
    content: 'const express = require("express"); const app = express(); app.get("/api/projects", (req, res) => {}); app.post("/api/generate", (req, res) => {});',
  },
  {
    path: 'server/controllers/auth.js',
    content: 'const jwt = require("jsonwebtoken"); exports.login = (req, res) => {};',
  },
];

const analyzedProject = codeAnalyzerService.analyzeRepositoryFiles(
  { name: 'AI Website Builder', description: 'Generates responsive websites with AI' },
  sampleFiles,
  sampleFiles
);

// Format analysisData payload
const analysisData = {
  repository: analyzedProject.project,
  summary: analyzedProject.summary,
  understanding: analyzedProject.analysis,
};

// -------------------------------------------------------------
// 1. PROMPT TEMPLATE VERIFICATION
// -------------------------------------------------------------
console.log('1. Testing Prompt Templates:');

const contextStr = promptTemplates.buildContextString(analysisData);
assert(contextStr.includes('AI Website Builder'), 'Context should contain project name');
assert(contextStr.includes('Next.js'), 'Context should contain frontend framework');
assert(contextStr.includes('Express'), 'Context should contain backend framework');
assert(contextStr.includes('MongoDB'), 'Context should contain database');
assert(contextStr.includes('JWT'), 'Context should contain authentication');
console.log('  ✓ Prompt context builder accurately injected all 5 core stack parameters');

const userPrompt = promptTemplates.getUserPrompt(analysisData);
for (const cat of INTERVIEW_CATEGORIES) {
  assert(userPrompt.includes(cat), `User prompt should request category: ${cat}`);
}
console.log(`  ✓ User prompt explicitly requested all ${INTERVIEW_CATEGORIES.length} interview categories`);

// -------------------------------------------------------------
// 2. GENERATE QUESTIONS ACROSS ALL 8 CATEGORIES
// -------------------------------------------------------------
console.log('\n2. Testing Question Generation & Schema Verification:');

const questions = await aiService.generateInterviewQuestions(analysisData);

assert.strictEqual(questions.length, 8, 'Should generate exactly 8 questions (1 per category)');

const generatedCategories = new Set(questions.map(q => q.category));
for (const expectedCat of INTERVIEW_CATEGORIES) {
  assert(
    generatedCategories.has(expectedCat),
    `Generated questions must include category: ${expectedCat}`
  );
}
console.log('  ✓ Generated questions for all 8 categories:');
for (const q of questions) {
  console.log(`    - [${q.category}] (${q.difficulty}) ${q.question.substring(0, 75)}...`);
}

// -------------------------------------------------------------
// 3. SCHEMA VERIFICATION FOR EACH QUESTION
// -------------------------------------------------------------
console.log('\n3. Testing Strict Schema Verification:');

for (const q of questions) {
  // 1. question
  assert(typeof q.question === 'string' && q.question.trim().length > 10, 'Question must be a non-empty string');
  
  // 2. category
  assert(INTERVIEW_CATEGORIES.includes(q.category), `Invalid category: ${q.category}`);

  // 3. difficulty
  assert(['Easy', 'Medium', 'Hard'].includes(q.difficulty), `Invalid difficulty: ${q.difficulty}`);

  // 4. expectedAnswer
  assert(typeof q.expectedAnswer === 'string' && q.expectedAnswer.trim().length > 20, 'expectedAnswer must be detailed');

  // 5. followUpQuestions
  assert(Array.isArray(q.followUpQuestions), 'followUpQuestions must be an array');
  assert(q.followUpQuestions.length >= 2, 'Must have at least 2 follow-up questions');
  for (const f of q.followUpQuestions) {
    assert(typeof f === 'string' && f.trim().length > 5, 'Each follow-up question must be a string');
  }
}
console.log('  ✓ All 8 questions strictly adhere to { question, category, difficulty, expectedAnswer, followUpQuestions }');

// -------------------------------------------------------------
// 4. CONTROLLER API RESPONSE VERIFICATION
// -------------------------------------------------------------
console.log('\n4. Testing Controller API Endpoint:');

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

await questionController.generateQuestions(
  { body: { analysisData } },
  mockRes,
  mockNext
);

assert.strictEqual(mockRes.statusCode, 200);
assert.strictEqual(mockRes.body.success, true);
assert.strictEqual(mockRes.body.data.totalQuestions, 8);
assert.strictEqual(Object.keys(mockRes.body.data.byCategory).length, 8);
console.log('  ✓ Controller generateQuestions returned 200 OK with categorized question payload');

// Test single category generation
await questionController.generateCategoryQuestions(
  { body: { analysisData, category: 'Security' } },
  mockRes,
  mockNext
);

assert.strictEqual(mockRes.statusCode, 200);
assert.strictEqual(mockRes.body.data.category, 'Security');
assert.strictEqual(mockRes.body.data.questions[0].category, 'Security');
console.log('  ✓ Controller generateCategoryQuestions successfully isolated "Security" question');

console.log('\n✅ All AI Question Generation Tests Passed Successfully!\n');
