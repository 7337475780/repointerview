// ============================================================
// Repository Analysis API Routes
// ============================================================

import { Router } from 'express';
import { repositoryController } from '../controllers/repositoryController.js';
import { validateAnalyzeRequest } from '../middleware/validator.js';

const router = Router();

// Health check
router.get('/health', repositoryController.getHealth);

// Validate URL & extract owner/repo
router.post('/validate', validateAnalyzeRequest, repositoryController.validateUrl);

// Get tree and filtered categorization
router.post('/tree', validateAnalyzeRequest, repositoryController.getTree);

// Full repository analysis
router.post('/analyze', validateAnalyzeRequest, repositoryController.analyzeRepository);

export default router;
