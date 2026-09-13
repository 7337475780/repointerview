// ============================================================
// RepoInterview AI — Context Retrieval & Prompt Grounding Service
// Retrieves top-K semantically relevant code chunks from Vector Search
// and formats grounded context for LLM prompt injection.
// ============================================================

import { embeddingService } from './embeddingService.js';
import { vectorStoreService } from './vectorStoreService.js';
import { config } from '../config/config.js';

export const retrievalService = {
  /**
   * Retrieve relevant code chunks for a given query text
   * @param {string} repositoryId
   * @param {string} query
   * @param {object} [options={}]
   * @returns {Promise<Array<object>>}
   */
  async retrieveContext(repositoryId, query, options = {}) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const topK = options.topK || config.rag.topK;

    // 1. Generate query embedding vector
    const queryVector = await embeddingService.generateEmbedding(query);

    // 2. Perform Vector Search (MongoDB Atlas / In-Memory)
    const matches = await vectorStoreService.searchVector(repositoryId, queryVector, {
      topK,
      minScore: options.minScore || 0.05,
    });

    return matches;
  },

  /**
   * Format retrieved chunks into a clean, markdown-grounded context block
   * @param {Array<object>} retrievedChunks
   * @returns {string}
   */
  formatContextForPrompt(retrievedChunks = []) {
    if (!retrievedChunks.length) {
      return 'No specific code chunks retrieved for this topic.';
    }

    return retrievedChunks
      .map((chunk, index) => {
        const header = `### Evidence Chunk [${index + 1}] — \`${chunk.filePath}\` (Lines ${chunk.startLine}-${chunk.endLine}) [Relevance: ${Math.round((chunk.score || 1) * 100)}%]`;
        const codeBlock = `\`\`\`${this.inferLanguage(chunk.filePath)}\n${chunk.content}\n\`\`\``;
        return `${header}\n${codeBlock}`;
      })
      .join('\n\n');
  },

  /**
   * Infer programming language for fenced markdown code block
   */
  inferLanguage(filePath = '') {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const map = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'jsx',
      py: 'python',
      go: 'go',
      java: 'java',
      rs: 'rust',
      sql: 'sql',
      prisma: 'prisma',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
    };
    return map[ext] || '';
  },
};
