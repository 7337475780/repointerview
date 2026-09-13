// ============================================================
// RepoInterview AI — Interview Routes
// ============================================================

import { Router } from 'express';
import { interviewController } from '../controllers/interviewController.js';

const router = Router();

// Start a new mock interview session
router.post('/start', (req, res, next) => interviewController.startSession(req, res, next));

// Evaluate a candidate answer for an active question
router.post('/evaluate', (req, res, next) => interviewController.evaluateAnswer(req, res, next));

// Finalize and complete the interview session
router.post('/complete', (req, res, next) => interviewController.completeSession(req, res, next));

// Retrieve session details & report
router.get('/session/:sessionId', (req, res, next) => interviewController.getSession(req, res, next));

// Retrieve past sessions for a repository
router.get('/repository/:repositoryId', (req, res, next) => interviewController.getRepositorySessions(req, res, next));

export default router;
