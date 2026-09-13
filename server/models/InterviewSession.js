// ============================================================
// RepoInterview AI — Interview Session Data Model
// ============================================================

import { randomUUID } from 'crypto';

export class InterviewSession {
  constructor(data = {}) {
    this.sessionId = data.sessionId || `session_${randomUUID()}`;
    this.repositoryId = data.repositoryId || 'default-repo';
    this.repoName = data.repoName || 'Project Repository';
    this.difficulty = data.difficulty || 'mid'; // 'junior' | 'mid' | 'senior' | 'staff' | 'easy' | 'medium' | 'hard'
    this.mode = data.mode || 'standard'; // 'standard' | 'deep_dive' | 'defense' | 'rapid_fire'
    this.totalQuestions = data.totalQuestions || (data.questions ? data.questions.length : 4);
    this.currentQuestionIndex = data.currentQuestionIndex || 0;
    this.status = data.status || 'IN_PROGRESS'; // 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
    this.questions = Array.isArray(data.questions) ? data.questions : [];
    this.turns = Array.isArray(data.turns) ? data.turns : [];
    this.overallEvaluation = data.overallEvaluation || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  addTurn(turnData) {
    this.turns.push({
      turnIndex: this.turns.length,
      questionId: turnData.questionId || `q_${this.turns.length + 1}`,
      question: turnData.question,
      category: turnData.category || 'Technical',
      difficulty: turnData.difficulty || this.difficulty,
      expectedAnswer: turnData.expectedAnswer || '',
      candidateAnswer: turnData.candidateAnswer || '',
      evaluation: turnData.evaluation || null,
      timestamp: new Date().toISOString(),
    });
    this.currentQuestionIndex = this.turns.length;
    this.updatedAt = new Date().toISOString();
  }

  complete(overallEvaluation) {
    this.status = 'COMPLETED';
    this.overallEvaluation = overallEvaluation;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      repositoryId: this.repositoryId,
      repoName: this.repoName,
      difficulty: this.difficulty,
      mode: this.mode,
      totalQuestions: this.totalQuestions,
      currentQuestionIndex: this.currentQuestionIndex,
      status: this.status,
      questions: this.questions,
      turns: this.turns,
      overallEvaluation: this.overallEvaluation,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
