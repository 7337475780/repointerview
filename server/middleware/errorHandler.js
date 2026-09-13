// ============================================================
// Centralized Error Handling & Custom Application Error Classes
// ============================================================

export class AppError extends Error {
  /**
   * @param {string} message 
   * @param {number} statusCode 
   * @param {string} [errorCode='APP_ERROR'] 
   * @param {any} [details=null] 
   */
  constructor(message, statusCode = 500, errorCode = 'APP_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message, details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'GitHub API rate limit exceeded. Please provide a GITHUB_TOKEN or try again later.', details = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

export class ExternalApiError extends AppError {
  constructor(message, statusCode = 502, details = null) {
    super(message, statusCode, 'EXTERNAL_API_ERROR', details);
  }
}

/**
 * Express centralized error handling middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred while processing repository analysis.';

  // Structured error logging
  if (statusCode >= 500) {
    console.error(`[ERROR 500] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[WARN ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      details: err.details || null,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  });
}
