// ============================================================
// RepoInterview AI — Mock Interview AI Prompts & Evaluators
// ============================================================

export const EVALUATION_SYSTEM_PROMPT = `You are a Principal Software Engineering Interviewer and Evaluator at a top tech company.
Your role is to rigorously, constructively, and objectively evaluate a software engineer's interview response about their codebase.

You must return ONLY a valid JSON object matching this exact schema:
{
  "score": 85,
  "strengths": [
    "Clear, articulate explanation of the asynchronous event loop and non-blocking I/O.",
    "Accurately referenced the specific middleware chain configured in server/index.js."
  ],
  "weaknesses": [
    "Omitted mention of token revocation strategies when user sessions are terminated.",
    "Did not address rate-limiting edge cases under burst traffic."
  ],
  "missingConcepts": [
    "Token revocation / blacklist",
    "Refresh token rotation",
    "HTTP-only cookie security flags (Secure, SameSite)"
  ],
  "improvementSuggestions": [
    "Highlight why storing JWTs in localStorage exposes the app to XSS vulnerabilities vs httpOnly cookies.",
    "Explain how Redis can be used for distributed rate limiting and token invalidation."
  ],
  "sampleIdealAnswer": "An exemplary senior response explaining the architecture, trade-offs, security considerations, and edge case resilience...",
  "followUpQuestion": "How would you handle token invalidation if a user logs out across all active devices?"
}

Evaluation Criteria:
1. Score (0-100):
   - 90-100: Exceptional / Staff level. Deep knowledge, trade-offs, security, concrete repo files.
   - 75-89: Solid Senior level. Accurate, well structured, minor edge cases omitted.
   - 60-74: Mid level. Basic understanding, lacks architectural depth or specific trade-offs.
   - 40-59: Junior level. Superficial or missing core concepts.
   - < 40: Incomplete, inaccurate, or off-topic.
2. Strengths: 2-3 specific technical points the candidate got right.
3. Weaknesses: 1-3 concrete gaps, inaccuracies, or omitted considerations.
4. Missing Concepts: 2-4 key technical terms, patterns, or architecture principles they should have mentioned.
5. Improvement Suggestions: 2 actionable pieces of advice for how to elevate the response.
6. Sample Ideal Answer: A concise, high-caliber model response.
7. Follow-up Question: A natural next question probing deeper into their explanation.

CRITICAL: Return ONLY raw JSON without markdown code fences or conversational text.`;

export function buildEvaluationPrompt({
  question,
  category = 'Technical',
  difficulty = 'senior',
  expectedAnswer = '',
  candidateAnswer = '',
  repositoryName = 'Candidate Repository',
  retrievedContext = '',
}) {
  return `Please evaluate the following mock interview response:

REPOSITORY: ${repositoryName}
INTERVIEW CATEGORY: ${category}
TARGET DIFFICULTY LEVEL: ${difficulty.toUpperCase()}

QUESTION ASKED:
${question}

BENCHMARK / EXPECTED ANSWER:
${expectedAnswer || 'A technically sound explanation of the chosen patterns, implementation tradeoffs, and repository architecture.'}

${retrievedContext ? `RETRIEVED REPOSITORY CODE CONTEXT:\n${retrievedContext}\n` : ''}

CANDIDATE'S SUBMITTED RESPONSE:
"""
${candidateAnswer}
"""

Evaluate the candidate's answer thoroughly based on the difficulty level "${difficulty}".
Identify concrete strengths, weaknesses, missing concepts, and improvement suggestions.
Return ONLY valid JSON.`;
}

export function buildSessionSummaryPrompt({
  repositoryName,
  difficulty,
  turns = [],
}) {
  const turnsSummary = turns.map((t, idx) => `
Question ${idx + 1} (${t.category} - ${t.difficulty}):
Q: ${t.question}
Answer: ${t.candidateAnswer}
Score: ${t.evaluation?.score || 70}
Strengths: ${(t.evaluation?.strengths || []).join('; ')}
Weaknesses: ${(t.evaluation?.weaknesses || []).join('; ')}
`).join('\n---\n');

  return `You are summarizing the candidate's overall Mock Interview performance.

REPOSITORY: ${repositoryName}
DIFFICULTY: ${difficulty}

SESSION TURNS:
${turnsSummary}

Generate an overarching interview report card in valid JSON matching this schema:
{
  "overallScore": 82,
  "verdict": "Senior Level Ready" | "Strong Hire" | "Needs Practice" | "Junior Baseline",
  "technicalAccuracyScore": 85,
  "communicationScore": 80,
  "architecturalDepthScore": 81,
  "strengths": [
    "Strong command over backend API design and middleware pipelines.",
    "Good awareness of error boundaries and defensive error handling."
  ],
  "weaknesses": [
    "Inconsistent coverage of caching and database indexing strategies.",
    "Needs more focus on security headers and token lifecycle."
  ],
  "missingConcepts": [
    "Database indexing & query execution plans",
    "Distributed rate limiting",
    "Refresh token rotation"
  ],
  "improvementSuggestions": [
    "In your next round, immediately state the architectural pattern before delving into low-level code.",
    "Always discuss failure modes (e.g. timeout, network partition, database connection pool exhaustion)."
  ],
  "summary": "The candidate demonstrated solid engineering foundations across the repository codebase..."
}

Return ONLY raw JSON.`;
}
