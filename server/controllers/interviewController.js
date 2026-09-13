// ============================================================
// RepoInterview AI — Interview Controller
// API request handlers for Mock Interview Sessions & Evaluations
// ============================================================

import { interviewService } from '../services/interviewService.js';
import { dbService } from '../models/dbService.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

export class InterviewController {
  /**
   * POST /api/interview/start
   * Start a new mock interview session
   */
  async startSession(req, res, next) {
    try {
      const {
        repositoryId,
        repoName,
        difficulty = 'mid',
        mode = 'standard',
        questionCount = 4,
        questions = [],
        analysisData,
      } = req.body;

      const session = await interviewService.startSession({
        repositoryId,
        repoName,
        difficulty,
        mode,
        questionCount: parseInt(questionCount, 10) || 4,
        questions,
        analysisData,
      });

      res.status(201).json({
        success: true,
        message: `Mock interview session started (${session.difficulty} difficulty, ${session.mode} mode)`,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/interview/evaluate
   * Evaluate a candidate's answer for an active question
   */
  async evaluateAnswer(req, res, next) {
    try {
      const {
        sessionId,
        questionIndex = 0,
        question,
        category = 'Technical',
        difficulty = 'mid',
        expectedAnswer = '',
        candidateAnswer = '',
        repositoryId = '',
        repositoryName = '',
      } = req.body;

      if (!question || typeof question !== 'string') {
        throw new ValidationError('Field "question" is required and must be a string.');
      }

      if (!candidateAnswer || typeof candidateAnswer !== 'string' || !candidateAnswer.trim()) {
        throw new ValidationError('Field "candidateAnswer" is required and cannot be blank.');
      }

      const result = await interviewService.evaluateAnswer({
        sessionId,
        questionIndex: parseInt(questionIndex, 10) || 0,
        question,
        category,
        difficulty,
        expectedAnswer,
        candidateAnswer,
        repositoryId,
        repositoryName,
      });

      res.status(200).json({
        success: true,
        message: 'Answer evaluated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/interview/complete
   * Complete and finalize an interview session
   */
  async completeSession(req, res, next) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        throw new ValidationError('Field "sessionId" is required.');
      }

      const completedSession = await interviewService.completeSession(sessionId);

      res.status(200).json({
        success: true,
        message: 'Interview session completed and overall report generated.',
        data: completedSession,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/interview/session/:sessionId
   * Retrieve session history and report
   */
  async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      const session = await dbService.getSession(sessionId);
      if (!session) {
        throw new NotFoundError(`Session "${sessionId}" not found.`);
      }

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/interview/repository/:repositoryId
   * Retrieve past interview sessions for repository
   */
  async getRepositorySessions(req, res, next) {
    try {
      const { repositoryId } = req.params;
      const sessions = await dbService.getSessionsByRepository(repositoryId);

      res.status(200).json({
        success: true,
        data: {
          repositoryId,
          totalSessions: sessions.length,
          sessions,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const interviewController = new InterviewController();
