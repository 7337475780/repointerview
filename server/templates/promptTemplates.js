// ============================================================
// RepoInterview AI — Prompt Templates for Interview Question Generation
// Generates contextual prompts across 8 interview categories
// based on deterministic repository understanding data.
// ============================================================

export const INTERVIEW_CATEGORIES = [
  'Project Explanation',
  'Technical',
  'Database',
  'API',
  'Architecture',
  'Security',
  'Scalability',
  'HR Project',
];

export const promptTemplates = {
  /**
   * Build complete repository context string from analysis data
   */
  buildContextString(analysisData = {}) {
    const summary = analysisData.summary || {};
    const understanding = analysisData.understanding || {};
    const repository = analysisData.repository || {};

    const projectName = summary.projectName || repository.name || 'Repository Project';
    const frontend = summary.frontend || 'Not specified';
    const backend = summary.backend || 'Not specified';
    const database = summary.database || 'Not specified';
    const auth = summary.authentication || 'Not specified';
    const architecture = summary.architecturePattern || 'Modular Application';
    const language = summary.primaryLanguage || 'JavaScript/TypeScript';

    // Extract sample endpoints
    const endpoints = (understanding.apiStructure?.sampleEndpoints || [])
      .map(e => `${e.method} ${e.path} (in ${e.file})`)
      .slice(0, 8);

    // Extract important modules
    const modules = (understanding.importantModules || [])
      .map(m => `- [${m.role}] ${m.name} (${m.path}): ${m.description}`)
      .slice(0, 8);

    // Extract libraries
    const libraries = (understanding.libraries || [])
      .map(l => `${l.name} (${l.category})`)
      .slice(0, 10);

    return `
PROJECT CONTEXT:
- Name: ${projectName}
- Description: ${repository.description || 'Modern fullstack application'}
- Primary Language: ${language}
- Frontend Framework: ${frontend}
- Backend Framework: ${backend}
- Database & ORM: ${database}
- Authentication Method: ${auth}
- Architecture Style: ${architecture}

KEY MODULES & FILES:
${modules.length > 0 ? modules.join('\n') : '- Standard application components'}

DISCOVERED API ENDPOINTS:
${endpoints.length > 0 ? endpoints.map(e => `- ${e}`).join('\n') : '- REST / RPC interface'}

DETECTED LIBRARIES & TOOLS:
${libraries.length > 0 ? libraries.join(', ') : 'Standard ecosystem utilities'}
`.trim();
  },

  /**
   * Main System Prompt for LLMs (Gemini / OpenRouter)
   */
  getSystemPrompt() {
    return `You are an elite Senior Staff Software Engineer and Technical Hiring Manager conducting a rigorous engineering interview based on a candidate's actual GitHub repository.

Your task is to generate realistic, in-depth interview questions grounded specifically in the candidate's repository architecture, libraries, APIs, and data models.

You must generate questions covering these 8 distinct categories:
1. Project Explanation (High-level overview, business problems, technology choices and trade-offs)
2. Technical (Deep technical mechanisms in the chosen language/frameworks, state management, edge cases)
3. Database (Schema design, indexing, queries, migrations, ORM usage, data consistency)
4. API (HTTP methods, REST/GraphQL/tRPC design, route structure, request validation, error contracts)
5. Architecture (System separation, design patterns, module boundaries, data flow between client and server)
6. Security (Authentication flows, token storage, injection prevention, CSRF/CORS, authorization)
7. Scalability (Concurrency, caching with Redis/memory, rate limiting, bottlenecks, load distribution)
8. HR Project (Behavioral and ownership questions: challenges faced, technical trade-offs, debugging nightmares)

CRITICAL INSTRUCTIONS:
- Every question must directly reference the actual technologies, files, or endpoints discovered in the project context.
- Avoid generic textbook questions. Ground the questions in their actual code choices.
- Output MUST be strictly valid JSON without markdown wrapping.`;
  },

  /**
   * User Prompt for generating the question collection
   */
  getUserPrompt(analysisData, options = {}) {
    const contextStr = this.buildContextString(analysisData);
    const requestedCategories = options.categories || INTERVIEW_CATEGORIES;
    const questionsPerCategory = options.countPerCategory || 1;

    return `
Given the following repository analysis data:

${contextStr}

Generate ${questionsPerCategory} high-quality interview question(s) for EACH of the following categories:
${requestedCategories.map(c => `- ${c}`).join('\n')}

For EVERY question, you must provide:
1. "question": The exact interview question as asked by the interviewer.
2. "category": Must be one of: ${INTERVIEW_CATEGORIES.map(c => `"${c}"`).join(', ')}.
3. "difficulty": "Easy", "Medium", or "Hard".
4. "expectedAnswer": A comprehensive senior-level answer outlining what a strong candidate should articulate (mentioning specific architectural patterns, trade-offs, and failure modes).
5. "followUpQuestions": An array of 2-3 probing follow-up questions to drill deeper into the candidate's answer.

OUTPUT FORMAT REQUIREMENTS:
Return ONLY a valid JSON object matching this exact structure:
{
  "questions": [
    {
      "question": "...",
      "category": "Project Explanation",
      "difficulty": "Medium",
      "expectedAnswer": "...",
      "followUpQuestions": ["...", "..."]
    }
  ]
}
`.trim();
  },
};
