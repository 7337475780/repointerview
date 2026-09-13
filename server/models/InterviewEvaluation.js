// ============================================================
// RepoInterview AI — Interview Evaluation Data Model & Validator
// ============================================================

/**
 * Validates and normalizes an answer evaluation payload.
 * Expected schema:
 * {
 *   score: number (0-100),
 *   strengths: string[],
 *   weaknesses: string[],
 *   missingConcepts: string[],
 *   improvementSuggestions: string[],
 *   sampleIdealAnswer: string,
 *   followUpQuestion?: string
 * }
 */
export class InterviewEvaluation {
  constructor(data = {}) {
    this.score = typeof data.score === 'number' ? Math.max(0, Math.min(100, Math.round(data.score))) : 70;
    this.strengths = Array.isArray(data.strengths) && data.strengths.length > 0
      ? data.strengths.filter(s => typeof s === 'string' && s.trim().length > 0)
      : ['Addressed the main question prompt cleanly.'];
    this.weaknesses = Array.isArray(data.weaknesses) && data.weaknesses.length > 0
      ? data.weaknesses.filter(w => typeof w === 'string' && w.trim().length > 0)
      : ['Could incorporate deeper architectural tradeoffs and performance implications.'];
    this.missingConcepts = Array.isArray(data.missingConcepts)
      ? data.missingConcepts.filter(c => typeof c === 'string' && c.trim().length > 0)
      : [];
    this.improvementSuggestions = Array.isArray(data.improvementSuggestions) && data.improvementSuggestions.length > 0
      ? data.improvementSuggestions.filter(s => typeof s === 'string' && s.trim().length > 0)
      : ['Reference specific files or modules in your repository to demonstrate deep familiarity.'];
    this.sampleIdealAnswer = typeof data.sampleIdealAnswer === 'string' && data.sampleIdealAnswer.trim()
      ? data.sampleIdealAnswer.trim()
      : 'A senior response clearly identifies the chosen architectural patterns, justifies library choices with tradeoffs, and explains edge-case handling.';
    this.followUpQuestion = typeof data.followUpQuestion === 'string' ? data.followUpQuestion.trim() : null;
    this.evaluatedAt = data.evaluatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      score: this.score,
      strengths: this.strengths,
      weaknesses: this.weaknesses,
      missingConcepts: this.missingConcepts,
      improvementSuggestions: this.improvementSuggestions,
      sampleIdealAnswer: this.sampleIdealAnswer,
      followUpQuestion: this.followUpQuestion,
      evaluatedAt: this.evaluatedAt,
    };
  }
}
