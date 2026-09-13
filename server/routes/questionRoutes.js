// ============================================================
// AI Interview Question Generation API Routes
// ============================================================

import { Router } from 'express';
import { questionController } from '../controllers/questionController.js';

const router = Router();

// Generate questions across all 8 categories
router.post('/generate', questionController.generateQuestions);

// Generate questions for a specific category
router.post('/category', questionController.generateCategoryQuestions);

export default router;
