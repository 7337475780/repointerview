// ============================================================
// AI Interview Question Generation Controller
// ============================================================

import { aiService } from '../services/aiService.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { INTERVIEW_CATEGORIES } from '../templates/promptTemplates.js';

export const questionController = {
  /**
   * POST /api/questions/generate
   * Generates questions across all 8 interview categories
   */
  async generateQuestions(req, res, next) {
    try {
      const { analysisData, options = {} } = req.body;

      if (!analysisData) {
        throw new ValidationError('Repository analysisData is required in request body.', {
          expected: { analysisData: 'Object returned by /api/repository/analyze' },
        });
      }

      const questions = await aiService.generateInterviewQuestions(analysisData, options);

      // Group by category for quick frontend inspection
      const categoriesBreakdown = {};
      for (const cat of INTERVIEW_CATEGORIES) {
        categoriesBreakdown[cat] = questions.filter(q => q.category === cat);
      }

      return res.status(200).json({
        success: true,
        data: {
          projectSummary: analysisData.summary || null,
          totalQuestions: questions.length,
          categories: INTERVIEW_CATEGORIES,
          questions,
          byCategory: categoriesBreakdown,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/questions/category
   * Generates questions for a single specified category
   */
  async generateCategoryQuestions(req, res, next) {
    try {
      const { analysisData, category, options = {} } = req.body;

      if (!analysisData) {
        throw new ValidationError('Repository analysisData is required.');
      }

      if (!category) {
        throw new ValidationError('Interview category is required.');
      }

      const questions = await aiService.generateInterviewQuestions(analysisData, {
        ...options,
        categories: [category],
      });

      return res.status(200).json({
        success: true,
        data: {
          category,
          totalQuestions: questions.length,
          questions,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
