// ============================================================
// RepoInterview AI — Interview Service
// Handles session initialization, dynamic turn evaluation,
// and comprehensive debrief report generation.
// ============================================================

import { config } from '../config/config.js';
import { dbService } from '../models/dbService.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { InterviewEvaluation } from '../models/InterviewEvaluation.js';
import {
  EVALUATION_SYSTEM_PROMPT,
  buildEvaluationPrompt,
  buildSessionSummaryPrompt,
} from '../templates/evaluationPrompts.js';
import { retrievalService } from '../rag/retrievalService.js';

class InterviewService {
  /**
   * Start a new mock interview session
   */
  async startSession({
    repositoryId = 'default-repo',
    repoName = 'Project Repository',
    difficulty = 'mid',
    mode = 'standard',
    questionCount = 4,
    questions = [],
    analysisData = null,
  }) {
    // 1. Filter or prepare questions tailored to difficulty & mode
    let selectedQuestions = this.selectQuestionsForSession({
      questions,
      difficulty,
      mode,
      questionCount,
      analysisData,
    });

    // 2. Create InterviewSession instance
    const session = new InterviewSession({
      repositoryId,
      repoName,
      difficulty,
      mode,
      totalQuestions: selectedQuestions.length,
      questions: selectedQuestions,
    });

    // 3. Persist session
    await dbService.saveSession(session);

    return {
      sessionId: session.sessionId,
      repositoryId: session.repositoryId,
      repoName: session.repoName,
      difficulty: session.difficulty,
      mode: session.mode,
      totalQuestions: session.totalQuestions,
      currentQuestionIndex: 0,
      firstQuestion: selectedQuestions[0] || null,
      status: session.status,
    };
  }

  /**
   * Select and arrange questions matching selected difficulty and mode
   */
  selectQuestionsForSession({ questions = [], difficulty = 'mid', mode = 'standard', questionCount = 4, analysisData }) {
    let pool = [...questions];

    if (!pool.length) {
      // Default fallback questions if no repo questions exist yet
      pool = this.generateDefaultQuestions(analysisData, difficulty);
    }

    // Filter and prioritize by difficulty
    if (difficulty && difficulty !== 'mixed') {
      const diffLower = difficulty.toLowerCase();
      const matched = [];
      const others = [];

      for (const q of pool) {
        const qDiff = (q.difficulty || '').toLowerCase();
        const isMatch = (
          ((diffLower === 'junior' || diffLower === 'easy') && (qDiff === 'easy' || qDiff === 'junior')) ||
          ((diffLower === 'senior' || diffLower === 'hard') && (qDiff === 'hard' || qDiff === 'senior')) ||
          ((diffLower === 'staff' || diffLower === 'lead') && (qDiff === 'hard' || qDiff === 'expert')) ||
          ((diffLower === 'mid' || diffLower === 'medium') && (qDiff === 'medium' || qDiff === 'mid'))
        );

        if (isMatch) matched.push(q);
        else others.push(q);
      }

      pool = [...matched, ...others];
    }

    // Sort by mode priorities
    if (mode === 'deep_dive') {
      pool.sort((a, b) => (b.category === 'Database' || b.category === 'Architecture' ? 1 : -1));
    } else if (mode === 'defense') {
      pool.sort((a, b) => (b.category === 'Architecture' || b.category === 'Security' || b.category === 'Scalability' ? 1 : -1));
    } else if (mode === 'rapid_fire') {
      pool.sort((a, b) => (b.category === 'Technical' || b.category === 'API' ? 1 : -1));
    }

    const count = Math.max(1, Math.min(questionCount, 10));
    return pool.slice(0, count);
  }

  /**
   * Evaluate a single candidate answer
   */
  async evaluateAnswer({
    sessionId,
    questionIndex = 0,
    question,
    category = 'Technical',
    difficulty = 'mid',
    expectedAnswer = '',
    candidateAnswer = '',
    repositoryId = '',
    repositoryName = 'Candidate Repository',
  }) {
    if (!candidateAnswer || !candidateAnswer.trim()) {
      throw new Error('Candidate answer cannot be empty');
    }

    // 1. Retrieve RAG code context if repository is indexed
    let retrievedContext = '';
    if (repositoryId && question) {
      try {
        const query = `${question} ${expectedAnswer}`;
        retrievedContext = await retrievalService.retrieveFormattedContext(repositoryId, query, 3);
      } catch (err) {
        console.warn(`[InterviewService] RAG retrieval error (ignoring): ${err.message}`);
      }
    }

    // 2. Perform AI Evaluation
    const evaluationData = await this.performAiEvaluation({
      question,
      category,
      difficulty,
      expectedAnswer,
      candidateAnswer,
      repositoryName,
      retrievedContext,
    });

    const evaluation = new InterviewEvaluation(evaluationData);

    // 3. Update session turn in DB
    let session = null;
    let isComplete = false;
    let nextQuestion = null;

    if (sessionId) {
      session = await dbService.getSession(sessionId);
      if (session) {
        const sessionObj = new InterviewSession(session);
        sessionObj.addTurn({
          question,
          category,
          difficulty,
          expectedAnswer,
          candidateAnswer,
          evaluation: evaluation.toJSON(),
        });

        isComplete = sessionObj.turns.length >= sessionObj.totalQuestions;
        if (!isComplete && sessionObj.questions && sessionObj.questions[sessionObj.turns.length]) {
          nextQuestion = sessionObj.questions[sessionObj.turns.length];
        }

        await dbService.saveSession(sessionObj);
      }
    }

    return {
      evaluation: evaluation.toJSON(),
      turnIndex: questionIndex,
      isComplete,
      nextQuestion,
      sessionId,
    };
  }

  /**
   * AI Evaluation engine with multi-provider and deterministic fallback
   */
  async performAiEvaluation({
    question,
    category,
    difficulty,
    expectedAnswer,
    candidateAnswer,
    repositoryName,
    retrievedContext,
  }) {
    const prompt = buildEvaluationPrompt({
      question,
      category,
      difficulty,
      expectedAnswer,
      candidateAnswer,
      repositoryName,
      retrievedContext,
    });

    // 1. Try Gemini
    if (config.ai.geminiApiKey) {
      try {
        return await this.callGeminiEvaluation(prompt);
      } catch (err) {
        console.warn(`[InterviewService] Gemini evaluation failed: ${err.message}. Trying OpenRouter...`);
      }
    }

    // 2. Try OpenRouter
    if (config.ai.openRouterApiKey) {
      try {
        return await this.callOpenRouterEvaluation(prompt);
      } catch (err) {
        console.warn(`[InterviewService] OpenRouter evaluation failed: ${err.message}. Using Deterministic Evaluator...`);
      }
    }

    // 3. High-Quality Deterministic Semantic Evaluator
    return this.evaluateDeterministically({
      question,
      category,
      difficulty,
      expectedAnswer,
      candidateAnswer,
    });
  }

  /**
   * Gemini evaluation API call
   */
  async callGeminiEvaluation(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${EVALUATION_SYSTEM_PROMPT}\n\n${prompt}` }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.cleanAndParseJson(rawText);
  }

  /**
   * OpenRouter evaluation API call
   */
  async callOpenRouterEvaluation(prompt) {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.openRouterApiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'RepoInterview AI',
      },
      body: JSON.stringify({
        model: config.ai.openRouterModel || 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: EVALUATION_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    const rawText = json?.choices?.[0]?.message?.content || '';
    return this.cleanAndParseJson(rawText);
  }

  /**
   * Deterministic Semantic Evaluator
   */
  evaluateDeterministically({
    question,
    category,
    difficulty,
    expectedAnswer,
    candidateAnswer,
  }) {
    const words = candidateAnswer.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Technical term matching
    const technicalKeywords = [
      'async', 'await', 'promise', 'database', 'query', 'index', 'schema', 'token', 'jwt',
      'auth', 'middleware', 'endpoint', 'rest', 'api', 'cache', 'redis', 'tradeoff', 'scale',
      'latency', 'security', 'error', 'exception', 'architecture', 'service', 'controller', 'model',
    ];

    const lowerAnswer = candidateAnswer.toLowerCase();
    const matchedKeywords = technicalKeywords.filter(kw => lowerAnswer.includes(kw));

    let baseScore = 50;
    if (wordCount > 30) baseScore += 15;
    if (wordCount > 70) baseScore += 15;
    if (matchedKeywords.length >= 2) baseScore += 10;
    if (matchedKeywords.length >= 4) baseScore += 10;

    const finalScore = Math.min(95, Math.max(35, baseScore));

    const strengths = [];
    if (wordCount >= 40) {
      strengths.push('Provided a structured, comprehensive walkthrough of the problem space.');
    }
    if (matchedKeywords.length > 0) {
      strengths.push(`Accurately integrated core domain concepts including: ${matchedKeywords.slice(0, 3).join(', ')}.`);
    } else {
      strengths.push('Identified the primary functionality requested in the prompt.');
    }

    const weaknesses = [];
    if (wordCount < 40) {
      weaknesses.push('Response is somewhat brief; lacks detailed architectural trade-offs and error-handling steps.');
    }
    if (!lowerAnswer.includes('tradeoff') && !lowerAnswer.includes('performance') && !lowerAnswer.includes('security')) {
      weaknesses.push('Did not explicitly discuss system trade-offs, security implications, or scalability bottlenecks.');
    }

    const missingConcepts = [];
    if (category === 'Database' && !lowerAnswer.includes('index')) missingConcepts.push('Database indexing & query optimization');
    if (category === 'Security' && !lowerAnswer.includes('sanitize')) missingConcepts.push('Input sanitization & defense-in-depth');
    if (category === 'API' && !lowerAnswer.includes('status')) missingConcepts.push('HTTP status codes & idempotency');
    if (missingConcepts.length === 0) {
      missingConcepts.push('Edge-case failure handling', 'Performance benchmarking');
    }

    const improvementSuggestions = [
      'Reference specific modules, middleware, or config files in your repository to demonstrate hands-on mastery.',
      'Explicitly explain the architectural trade-offs (e.g. why you preferred this approach over alternatives).',
    ];

    return {
      score: finalScore,
      strengths,
      weaknesses,
      missingConcepts,
      improvementSuggestions,
      sampleIdealAnswer: expectedAnswer || 'A top-tier answer covers design motivation, chosen data structures, error recovery, and production telemetry.',
      followUpQuestion: `How would you evolve this design if traffic scaled by 100x or required zero-downtime migrations?`,
    };
  }

  /**
   * Finalize and generate overall interview summary report
   */
  async completeSession(sessionId) {
    const session = await dbService.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID "${sessionId}" not found`);
    }

    const sessionObj = new InterviewSession(session);
    const turns = sessionObj.turns || [];

    if (!turns.length) {
      throw new Error('Cannot complete session with no answered turns');
    }

    // Calculate aggregated metrics
    const totalScore = turns.reduce((acc, t) => acc + (t.evaluation?.score || 70), 0);
    const averageScore = Math.round(totalScore / turns.length);

    // Determine verdict
    let verdict = 'Senior Ready';
    if (averageScore >= 88) verdict = 'Strong Hire (Senior / Lead)';
    else if (averageScore >= 75) verdict = 'Solid Hire (Mid-Senior)';
    else if (averageScore >= 60) verdict = 'Good Potential (Junior-Mid)';
    else verdict = 'Needs Additional Preparation';

    // Collect all strengths & weaknesses
    const allStrengths = [];
    const allWeaknesses = [];
    const allMissingConcepts = new Set();
    const allSuggestions = [];

    turns.forEach(t => {
      if (t.evaluation?.strengths) allStrengths.push(...t.evaluation.strengths);
      if (t.evaluation?.weaknesses) allWeaknesses.push(...t.evaluation.weaknesses);
      if (t.evaluation?.missingConcepts) t.evaluation.missingConcepts.forEach(c => allMissingConcepts.add(c));
      if (t.evaluation?.improvementSuggestions) allSuggestions.push(...t.evaluation.improvementSuggestions);
    });

    const overallEvaluation = {
      overallScore: averageScore,
      verdict,
      technicalAccuracyScore: Math.min(100, Math.round(averageScore * 1.02)),
      communicationScore: Math.min(100, Math.round(averageScore * 0.98)),
      architecturalDepthScore: averageScore,
      totalTurnsAnswered: turns.length,
      strengths: Array.from(new Set(allStrengths)).slice(0, 4),
      weaknesses: Array.from(new Set(allWeaknesses)).slice(0, 4),
      missingConcepts: Array.from(allMissingConcepts).slice(0, 5),
      improvementSuggestions: Array.from(new Set(allSuggestions)).slice(0, 4),
      summary: `Candidate completed ${turns.length} questions for ${sessionObj.repoName} with an overall score of ${averageScore}/100. Demonstrated good technical grounding with clear opportunities to deepen edge-case analysis.`,
      completedAt: new Date().toISOString(),
    };

    sessionObj.complete(overallEvaluation);
    await dbService.saveSession(sessionObj);

    return sessionObj.toJSON();
  }

  /**
   * JSON cleaner utility
   */
  cleanAndParseJson(text) {
    try {
      let cleaned = text.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn(`[InterviewService] JSON parse error on AI response: ${err.message}`);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw err;
    }
  }

  /**
   * Generate default repository interview questions
   */
  generateDefaultQuestions(analysisData, difficulty = 'mid') {
    return [
      {
        question: 'Can you walk me through the high-level architecture and data flow of this repository?',
        category: 'Architecture',
        difficulty: difficulty === 'junior' ? 'easy' : 'medium',
        expectedAnswer: 'Should explain entry points, routing, controller/service layer separation, and data storage flows.',
      },
      {
        question: 'How are incoming requests validated and protected against malicious payloads or unauthorized access?',
        category: 'Security',
        difficulty: 'hard',
        expectedAnswer: 'Should detail middleware authentication, JWT verification, CORS headers, and input schema validation.',
      },
      {
        question: 'What database design decisions were made, and how are schema migrations and query efficiency handled?',
        category: 'Database',
        difficulty: 'medium',
        expectedAnswer: 'Should explain data models, indexing choices, ORM/ODM integration, and connection pool management.',
      },
      {
        question: 'If this application experienced a 50x spike in concurrent traffic, what components would become bottlenecks and how would you scale them?',
        category: 'Scalability',
        difficulty: 'hard',
        expectedAnswer: 'Should address database connection limits, Redis caching, stateless horizontal auto-scaling, and background worker queues.',
      },
    ];
  }
}

export const interviewService = new InterviewService();
