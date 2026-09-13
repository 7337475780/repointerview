// ============================================================
// RepoInterview AI — RAG Controller
// ============================================================

import { ragQuestionService } from '../rag/ragQuestionService.js';
import { retrievalService } from '../rag/retrievalService.js';
import { vectorStoreService } from '../rag/vectorStoreService.js';
import { ValidationError } from '../middleware/errorHandler.js';

export const ragController = {
  /**
   * POST /api/rag/index
   * Chunk and index repository files into MongoDB Atlas Vector Search
   */
  async indexRepository(req, res, next) {
    try {
      const { repositoryId, files = [] } = req.body;

      if (!repositoryId) {
        throw new ValidationError('repositoryId is required in request body.');
      }

      if (!Array.isArray(files) || files.length === 0) {
        throw new ValidationError('files array with path and content is required.');
      }

      const result = await ragQuestionService.indexRepository(repositoryId, files);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/rag/search
   * Semantic Vector Search endpoint
   */
  async search(req, res, next) {
    try {
      const { repositoryId, query, topK = 5 } = req.body;

      if (!query) {
        throw new ValidationError('query string is required.');
      }

      const matches = await retrievalService.retrieveContext(repositoryId, query, { topK });

      return res.status(200).json({
        success: true,
        data: {
          query,
          repositoryId: repositoryId || 'all',
          totalMatches: matches.length,
          matches,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/rag/generate-questions
   * Generate RAG-grounded interview questions with code evidence trails
   */
  async generateRAGQuestions(req, res, next) {
    try {
      const { analysisData, files = [], options = {} } = req.body;

      if (!analysisData) {
        throw new ValidationError('analysisData is required.');
      }

      const result = await ragQuestionService.generateRAGQuestions(analysisData, files, options);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/rag/status
   * Vector store connection & index status
   */
  getStatus(req, res) {
    const stats = vectorStoreService.getStats();
    return res.status(200).json({
      success: true,
      data: {
        service: 'MongoDB Atlas Vector Search Service',
        status: 'UP',
        ...stats,
      },
    });
  },
};
