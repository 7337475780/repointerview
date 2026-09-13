import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  github: {
    token: process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '',
    userAgent: 'RepoInterview-AI-Backend/1.0.0',
    apiBaseUrl: 'https://api.github.com',
    rawBaseUrl: 'https://raw.githubusercontent.com',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
    provider: process.env.AI_PROVIDER || 'auto', // 'gemini', 'openrouter', or 'auto'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB_NAME || 'repointerview',
    collectionName: process.env.MONGODB_COLLECTION_NAME || 'repository_chunks',
    indexName: process.env.MONGODB_VECTOR_INDEX || 'vector_index',
  },
  rag: {
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1500', 10), // ~350-400 tokens
    chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '200', 10),
    topK: parseInt(process.env.RAG_TOP_K || '5', 10),
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-004',
    dimensions: 768,
  },
  limits: {
    maxSelectedFiles: 50,
    maxFileSizeBytes: 100 * 1024, // 100 KB per file
    maxTotalSizeBytes: 2 * 1024 * 1024, // 2 MB total source payload
    maxTreeNodes: 10000,
  },
};
