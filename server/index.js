// ============================================================
// RepoInterview AI — Express Backend Application
// ============================================================

import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import repositoryRoutes from './routes/repositoryRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import { errorHandler, NotFoundError } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (config.nodeEnv !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// API Routes
app.use('/api/repository', repositoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api', repositoryRoutes); // Support alias /api/analyze, /api/validate

// Root info route
app.get('/', (req, res) => {
  res.json({
    name: 'RepoInterview AI - Repository Analysis Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/repository/health',
      validate: 'POST /api/repository/validate { url }',
      tree: 'POST /api/repository/tree { url }',
      analyze: 'POST /api/repository/analyze { url, options? }',
    },
  });
});

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on this server.`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`\n🚀 RepoInterview Backend Analysis Server running on http://localhost:${PORT}`);
    console.log(`   - Health check: http://localhost:${PORT}/api/repository/health`);
    console.log(`   - Analyze: POST http://localhost:${PORT}/api/repository/analyze\n`);
  });
}

export default app;
