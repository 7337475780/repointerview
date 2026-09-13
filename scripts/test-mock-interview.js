// ============================================================
// Test Suite: AI Mock Interview System & Evaluation Pipeline
// ============================================================

import assert from 'assert';
import { interviewService } from '../server/services/interviewService.js';
import { dbService } from '../server/models/dbService.js';
import { InterviewSession } from '../server/models/InterviewSession.js';
import { InterviewEvaluation } from '../server/models/InterviewEvaluation.js';
import { interviewController } from '../server/controllers/interviewController.js';

async function runMockInterviewTestSuite() {
  console.log('🎤 Starting AI Mock Interview System Test Suite...\n');

  // 1. Test Session Initialization & Difficulty Selection
  console.log('1. Testing Session Initialization & Difficulty Configuration:');
  const sessionResult = await interviewService.startSession({
    repositoryId: 'test-repo-owner/test-project',
    repoName: 'Test AI Project',
    difficulty: 'senior',
    mode: 'defense',
    questionCount: 3,
  });

  assert.ok(sessionResult.sessionId, 'Session should have a generated sessionId');
  assert.strictEqual(sessionResult.difficulty, 'senior');
  assert.strictEqual(sessionResult.mode, 'defense');
  assert.strictEqual(sessionResult.totalQuestions, 3);
  assert.ok(sessionResult.firstQuestion, 'Should provide first question');
  console.log(`  ✓ Successfully initialized senior defense interview session (ID: ${sessionResult.sessionId})`);
  console.log(`  ✓ Selected Question 1: "${sessionResult.firstQuestion.question.slice(0, 60)}..."`);

  // 2. Test Single-Answer Evaluation
  console.log('\n2. Testing AI Answer Evaluation Engine & Schema Compliance:');
  const sampleAnswer = `
    In this architecture, we implemented an Express middleware layer for JWT validation and role-based access control.
    Incoming requests pass through helmet and rate-limiting middleware before hitting the controller handlers.
    However, we stored tokens in localStorage instead of httpOnly cookies, which represents a potential XSS trade-off,
    and we need to implement Redis for distributed blacklist revocation on logout.
  `;

  const evalResult = await interviewService.evaluateAnswer({
    sessionId: sessionResult.sessionId,
    questionIndex: 0,
    question: sessionResult.firstQuestion.question,
    category: sessionResult.firstQuestion.category,
    difficulty: 'senior',
    expectedAnswer: sessionResult.firstQuestion.expectedAnswer,
    candidateAnswer: sampleAnswer,
    repositoryName: 'Test AI Project',
  });

  assert.ok(evalResult.evaluation, 'Evaluation payload must be returned');
  assert.ok(typeof evalResult.evaluation.score === 'number', 'Score must be a number');
  assert.ok(evalResult.evaluation.score >= 0 && evalResult.evaluation.score <= 100, 'Score must be between 0 and 100');
  assert.ok(Array.isArray(evalResult.evaluation.strengths), 'Strengths must be an array');
  assert.ok(evalResult.evaluation.strengths.length > 0, 'Strengths must not be empty');
  assert.ok(Array.isArray(evalResult.evaluation.weaknesses), 'Weaknesses must be an array');
  assert.ok(Array.isArray(evalResult.evaluation.missingConcepts), 'Missing concepts must be an array');
  assert.ok(Array.isArray(evalResult.evaluation.improvementSuggestions), 'Improvement suggestions must be an array');
  assert.ok(typeof evalResult.evaluation.sampleIdealAnswer === 'string', 'Sample ideal answer must be provided');

  console.log(`  ✓ Answer Evaluated! Score: ${evalResult.evaluation.score}/100`);
  console.log(`  ✓ Identified Strengths (${evalResult.evaluation.strengths.length}): ${evalResult.evaluation.strengths[0]}`);
  console.log(`  ✓ Identified Weaknesses (${evalResult.evaluation.weaknesses.length}): ${evalResult.evaluation.weaknesses[0]}`);
  console.log(`  ✓ Missing Concepts: ${evalResult.evaluation.missingConcepts.join(', ') || 'None'}`);
  console.log(`  ✓ Actionable Suggestion: ${evalResult.evaluation.improvementSuggestions[0]}`);

  // 3. Test Session Completion & Overall Report Generation
  console.log('\n3. Testing Session Finalization & Overall Debrief Report:');
  // Add a second turn to test aggregate report
  await interviewService.evaluateAnswer({
    sessionId: sessionResult.sessionId,
    questionIndex: 1,
    question: 'How are database schema migrations and indexing handled?',
    category: 'Database',
    difficulty: 'senior',
    expectedAnswer: 'Should use compound indexes on frequently queried fields and run migrations with zero downtime.',
    candidateAnswer: 'We use MongoDB schemas with index definitions for user email and repository IDs to ensure O(log N) lookup speed.',
    repositoryName: 'Test AI Project',
  });

  const completedSession = await interviewService.completeSession(sessionResult.sessionId);
  assert.strictEqual(completedSession.status, 'COMPLETED');
  assert.ok(completedSession.overallEvaluation, 'Overall evaluation must be present');
  assert.ok(typeof completedSession.overallEvaluation.overallScore === 'number', 'Overall score must be numeric');
  assert.ok(completedSession.overallEvaluation.verdict, 'Verdict must be present');
  assert.strictEqual(completedSession.overallEvaluation.totalTurnsAnswered, 2);

  console.log(`  ✓ Session Finalized! Overall Score: ${completedSession.overallEvaluation.overallScore}%`);
  console.log(`  ✓ Career Verdict: "${completedSession.overallEvaluation.verdict}"`);
  console.log(`  ✓ Tech Accuracy: ${completedSession.overallEvaluation.technicalAccuracyScore}%, Communication: ${completedSession.overallEvaluation.communicationScore}%`);

  // 4. Test Controller Endpoints via Mock Express Request/Response
  console.log('\n4. Testing Controller API Endpoints:');
  const mockStartReq = {
    body: {
      repositoryId: 'controller-test-repo',
      repoName: 'Express Controller Test',
      difficulty: 'lead',
      mode: 'rapid_fire',
      questionCount: 2,
    },
  };

  let controllerStartRes = {};
  const mockStartRes = {
    status: (code) => {
      controllerStartRes.statusCode = code;
      return {
        json: (data) => {
          controllerStartRes.body = data;
        },
      };
    },
  };

  await interviewController.startSession(mockStartReq, mockStartRes, (err) => { if (err) throw err; });
  assert.strictEqual(controllerStartRes.statusCode, 201);
  assert.strictEqual(controllerStartRes.body.success, true);
  assert.strictEqual(controllerStartRes.body.data.difficulty, 'lead');
  console.log('  ✓ POST /api/interview/start returned HTTP 201 with active session payload');

  console.log('\n✨ All Mock Interview Unit & Integration Tests Passed (100% Success)!\n');
}

runMockInterviewTestSuite().catch((err) => {
  console.error('\n❌ Mock Interview Test Suite Failed:', err);
  process.exit(1);
});
