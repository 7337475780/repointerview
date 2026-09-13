// ============================================================
// RepoInterview AI — RAG API Routes
// ============================================================

import { Router } from 'express';
import { ragController } from '../controllers/ragController.js';

const router = Router();

// Vector store status
router.get('/status', ragController.getStatus);

// Chunk and Index repository into Vector Search
router.post('/index', ragController.indexRepository);

// Semantic Vector Search
router.post('/search', ragController.search);

// Generate RAG-Grounded Questions
router.post('/generate-questions', ragController.generateRAGQuestions);

export default router;
