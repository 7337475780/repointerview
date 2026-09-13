import { ValidationError } from './errorHandler.js';

/**
 * Validates repository URL request body
 */
export function validateAnalyzeRequest(req, res, next) {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return next(new ValidationError('GitHub repository URL is required in request body.', {
      expected: { url: 'https://github.com/owner/repo' },
      received: req.body,
    }));
  }

  next();
}
