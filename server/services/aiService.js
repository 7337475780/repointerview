// ============================================================
// RepoInterview AI — AI Question Generation Service
// Supports:
// 1. Google Gemini API (gemini-1.5-flash / gemini-1.5-pro)
// 2. OpenRouter API (Claude 3.5 Sonnet, GPT-4o, Llama 3)
// 3. Evidence-Backed Deterministic Fallback Generator
// ============================================================

import { config } from '../config/config.js';
import { promptTemplates, INTERVIEW_CATEGORIES } from '../templates/promptTemplates.js';
import { ExternalApiError, ValidationError } from '../middleware/errorHandler.js';

export const aiService = {
  /**
   * Master Question Generation function
   * @param {object} analysisData Repository analysis payload
   * @param {object} [options={}] Generation options { provider, categories, countPerCategory }
   * @returns {Promise<Array<object>>} List of normalized questions
   */
  async generateInterviewQuestions(analysisData, options = {}) {
    if (!analysisData) {
      throw new ValidationError('Repository analysis data is required for question generation.');
    }

    const requestedProvider = options.provider || config.ai.provider;
    let questions = null;

    // 1. Try Gemini if configured or auto-selected
    if ((requestedProvider === 'gemini' || requestedProvider === 'auto') && config.ai.geminiApiKey) {
      try {
        console.log('🤖 Generating interview questions via Google Gemini API...');
        questions = await this.callGeminiApi(analysisData, options);
      } catch (err) {
        console.warn(`[AI Service] Gemini API call failed: ${err.message}. Falling back...`);
      }
    }

    // 2. Try OpenRouter if configured or auto-selected
    if (!questions && (requestedProvider === 'openrouter' || requestedProvider === 'auto') && config.ai.openRouterApiKey) {
      try {
        console.log('🤖 Generating interview questions via OpenRouter API...');
        questions = await this.callOpenRouterApi(analysisData, options);
      } catch (err) {
        console.warn(`[AI Service] OpenRouter API call failed: ${err.message}. Falling back...`);
      }
    }

    // 3. Deterministic Evidence-Backed Generator (Fallback / Offline / Keyless)
    if (!questions || questions.length === 0) {
      console.log('⚡ Generating evidence-backed deterministic interview questions from repository profile...');
      questions = this.generateDeterministicQuestions(analysisData, options);
    }

    return this.normalizeQuestions(questions);
  },

  /**
   * Call Google Gemini API
   */
  async callGeminiApi(analysisData, options = {}) {
    const apiKey = config.ai.geminiApiKey;
    const model = config.ai.geminiModel || 'gemini-1.5-flash';
    const systemPrompt = promptTemplates.getSystemPrompt();
    const userPrompt = promptTemplates.getUserPrompt(analysisData, options);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new ExternalApiError(`Gemini API error (HTTP ${response.status}): ${errText}`, response.status);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new ExternalApiError('Empty response received from Gemini API.');
    }

    return this.parseJsonResponse(rawText);
  },

  /**
   * Call OpenRouter API
   */
  async callOpenRouterApi(analysisData, options = {}) {
    const apiKey = config.ai.openRouterApiKey;
    const model = config.ai.openRouterModel || 'anthropic/claude-3.5-sonnet';
    const systemPrompt = promptTemplates.getSystemPrompt();
    const userPrompt = promptTemplates.getUserPrompt(analysisData, options);

    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://repointerview.ai',
        'X-Title': 'RepoInterview AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new ExternalApiError(`OpenRouter API error (HTTP ${response.status}): ${errText}`, response.status);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new ExternalApiError('Empty response received from OpenRouter API.');
    }

    return this.parseJsonResponse(rawText);
  },

  /**
   * Safely parse JSON from LLM outputs
   */
  parseJsonResponse(rawText) {
    try {
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
      return [];
    } catch (err) {
      throw new ExternalApiError(`Failed to parse AI JSON response: ${err.message}`);
    }
  },

  /**
   * Deterministic Evidence-Backed Question Generator
   * Crafts high-value, highly specific questions across all 8 categories
   * tailored directly to the repository's analyzed tech stack and architecture.
   */
  generateDeterministicQuestions(analysisData, options = {}) {
    const summary = analysisData.summary || {};
    const understanding = analysisData.understanding || {};
    const repository = analysisData.repository || {};

    const projectName = summary.projectName || repository.name || 'this project';
    const frontend = summary.frontend || 'React';
    const backend = summary.backend || 'Express';
    const database = summary.database || 'MongoDB';
    const auth = summary.authentication || 'JWT';
    const architecture = summary.architecturePattern || 'Client-Server Separation';
    const endpoints = understanding.apiStructure?.sampleEndpoints || [];
    const firstEndpoint = endpoints.length > 0 ? `${endpoints[0].method} ${endpoints[0].path}` : 'the primary REST route';
    const libraries = (understanding.libraries || []).map(l => l.name);

    const requestedCategories = options.categories || INTERVIEW_CATEGORIES;
    const questions = [];

    // 1. Project Explanation
    if (requestedCategories.includes('Project Explanation')) {
      questions.push({
        question: `Can you walk me through the high-level architecture of ${projectName}, explaining why you chose ${frontend} on the frontend and ${backend} for the backend?`,
        category: 'Project Explanation',
        difficulty: 'Medium',
        expectedAnswer: `A strong candidate should explain the business purpose of ${projectName}, why the ${architecture} pattern was selected, how responsibilities are divided between ${frontend} and ${backend}, and the trade-offs considered (e.g., development velocity, SSR/CSR requirements, and deployment complexity).`,
        followUpQuestions: [
          `If you had to rewrite ${projectName} today, what architectural decision would you change?`,
          `How did the choice of ${frontend} influence your state management and component structure?`,
        ],
      });
    }

    // 2. Technical
    if (requestedCategories.includes('Technical')) {
      const stateLib = libraries.find(l => ['Zustand', 'Redux Toolkit', 'TanStack Query'].includes(l)) || 'component state';
      questions.push({
        question: `How do you handle state synchronization and asynchronous data flows in ${frontend} using ${stateLib}?`,
        category: 'Technical',
        difficulty: 'Hard',
        expectedAnswer: `The candidate should articulate how data flows from backend APIs into ${frontend}, how loading, error, and stale states are handled with ${stateLib}, and how race conditions or unnecessary re-renders are mitigated.`,
        followUpQuestions: [
          `How do you prevent duplicate network requests when multiple components mount simultaneously?`,
          `What strategy do you use for optimistic UI updates during data mutations?`,
        ],
      });
    }

    // 3. Database
    if (requestedCategories.includes('Database')) {
      questions.push({
        question: `How is your data modeled in ${database}, and what indexing or query optimization strategies did you apply for read/write performance?`,
        category: 'Database',
        difficulty: 'Medium',
        expectedAnswer: `The candidate should describe the schema relationships, primary/foreign keys or document structure, indexing strategies on frequently queried fields, and how connection pooling or transaction isolation is configured.`,
        followUpQuestions: [
          `How do you handle schema migrations in production without downtime?`,
          `What happens if a database transaction fails midway through a multi-step operation?`,
        ],
      });
    }

    // 4. API
    if (requestedCategories.includes('API')) {
      questions.push({
        question: `Looking at endpoint ${firstEndpoint}, how do you structure request validation, error formatting, and HTTP status codes in your API contract?`,
        category: 'API',
        difficulty: 'Medium',
        expectedAnswer: `The candidate should describe using schema validation (e.g., Zod, Joi), centralized error middleware, returning standardized RFC-compliant error payloads with appropriate HTTP status codes (400, 401, 404, 500), and rate limiting.`,
        followUpQuestions: [
          `How do you maintain backward compatibility when updating API contracts for older clients?`,
          `What is your approach to handling idempotency on critical mutation endpoints?`,
        ],
      });
    }

    // 5. Architecture
    if (requestedCategories.includes('Architecture')) {
      questions.push({
        question: `Your codebase implements a ${architecture}. How do you enforce modular boundaries and dependency inversion between layers?`,
        category: 'Architecture',
        difficulty: 'Hard',
        expectedAnswer: `The candidate should describe the boundary between presentation, business logic, and persistence layers, showing how controllers remain lightweight while domain services orchestrate operations without tight coupling to framework internals.`,
        followUpQuestions: [
          `How do you test domain services in isolation from external dependencies and databases?`,
          `How would you adapt this architecture if you needed to support real-time WebSocket communication?`,
        ],
      });
    }

    // 6. Security
    if (requestedCategories.includes('Security')) {
      questions.push({
        question: `How does your authentication system (${auth}) protect against token theft, CSRF, and injection attacks in ${projectName}?`,
        category: 'Security',
        difficulty: 'Hard',
        expectedAnswer: `The candidate should discuss secure token storage (HttpOnly, Secure, SameSite cookies vs Authorization headers), short-lived access tokens with refresh token rotation, parameterized queries to prevent injection, and CORS policies.`,
        followUpQuestions: [
          `How do you handle instant session revocation if a user's token is compromised?`,
          `Where do you enforce role-based access control (RBAC) across your API routes?`,
        ],
      });
    }

    // 7. Scalability
    if (requestedCategories.includes('Scalability')) {
      questions.push({
        question: `If ${projectName} experienced a 50x spike in concurrent traffic, what would be the first bottleneck, and how would you scale the system?`,
        category: 'Scalability',
        difficulty: 'Hard',
        expectedAnswer: `The candidate should identify potential bottlenecks (database connection limits, CPU-intensive endpoints, un-cached read queries), and propose concrete solutions such as Redis caching, read replicas, horizontal scaling with a load balancer, and edge CDN distribution.`,
        followUpQuestions: [
          `How would you implement caching for dynamic user data without serving stale information?`,
          `What metrics and monitoring tools would you use to detect bottlenecks before users are impacted?`,
        ],
      });
    }

    // 8. HR Project
    if (requestedCategories.includes('HR Project')) {
      questions.push({
        question: `What was the most difficult technical bug or engineering challenge you encountered while building ${projectName}, and how did you resolve it?`,
        category: 'HR Project',
        difficulty: 'Medium',
        expectedAnswer: `The candidate should present a structured STAR response (Situation, Task, Action, Result) explaining the root cause of a complex issue, their debugging methodology (profiling, logs, reproducible test case), the collaborative resolution, and lessons learned.`,
        followUpQuestions: [
          `What trade-off between speed of delivery and code perfection did you have to negotiate?`,
          `How did you prioritize technical debt versus building new features in this repository?`,
        ],
      });
    }

    return questions;
  },

  /**
   * Normalize and validate question objects
   */
  normalizeQuestions(rawQuestions = []) {
    return rawQuestions.map((q, index) => {
      const category = INTERVIEW_CATEGORIES.find(
        c => c.toLowerCase() === (q.category || '').toLowerCase()
      ) || q.category || 'Technical';

      const difficulty = ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
        ? q.difficulty
        : 'Medium';

      const followUps = Array.isArray(q.followUpQuestions) && q.followUpQuestions.length > 0
        ? q.followUpQuestions
        : [
            `Can you elaborate on the performance implications of this approach?`,
            `How would you verify this implementation with automated tests?`,
          ];

      return {
        id: `q-${index + 1}-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        question: q.question || 'Explain your technical approach in this repository.',
        category,
        difficulty,
        expectedAnswer: q.expectedAnswer || 'A thorough explanation covering architecture, tradeoffs, and edge cases.',
        followUpQuestions: followUps,
      };
    });
  },
};
