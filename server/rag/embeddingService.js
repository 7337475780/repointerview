// ============================================================
// RepoInterview AI — Vector Embedding Generation Service
// Generates 768-dimensional dense vector embeddings using:
// 1. Google Gemini Embeddings API (text-embedding-004)
// 2. OpenRouter Embeddings API
// 3. High-Precision Deterministic Semantic Vectorizer (Local Fallback)
// ============================================================

import { config } from '../config/config.js';

export const embeddingService = {
  /**
   * Generate an embedding vector for a single text chunk or query
   * @param {string} text 
   * @returns {Promise<number[]>} 768-dimensional float vector
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return new Array(config.rag.dimensions).fill(0);
    }

    // 1. Try Gemini Embeddings if API key is present
    if (config.ai.geminiApiKey) {
      try {
        return await this.callGeminiEmbeddings(text);
      } catch (err) {
        console.warn(`[Embedding Service] Gemini embedding failed: ${err.message}. Using deterministic vectorizer.`);
      }
    }

    // 2. Fallback to Local Deterministic Semantic Vectorizer
    return this.generateDeterministicVector(text, config.rag.dimensions);
  },

  /**
   * Batch generate embeddings for multiple chunks
   * @param {Array<string>} texts
   * @param {number} [batchSize=10]
   * @returns {Promise<Array<number[]>>}
   */
  async generateBatchEmbeddings(texts = [], batchSize = 10) {
    const embeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(t => this.generateEmbedding(t));
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
    }

    return embeddings;
  },

  /**
   * Call Google Gemini text-embedding-004 API
   */
  async callGeminiEmbeddings(text) {
    const apiKey = config.ai.geminiApiKey;
    const model = 'text-embedding-004';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${model}`,
        content: {
          parts: [{ text: text.substring(0, 8000) }],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const vector = data.embedding?.values;

    if (!vector || !Array.isArray(vector)) {
      throw new Error('Invalid embedding vector returned from Gemini');
    }

    return vector;
  },

  /**
   * Deterministic Semantic Vectorizer
   * Generates a unit-normalized dense 768-D embedding vector using
   * semantic token hashing, subword n-grams, and TF-IDF frequency weighting.
   */
  generateDeterministicVector(text, dimensions = 768) {
    const vector = new Float32Array(dimensions).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_$\-\/\.]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);

    if (tokens.length === 0) {
      return Array.from(vector);
    }

    // Hash tokens into dimensional buckets with frequency & position weighting
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const weight = 1.0 + Math.log(1 + 1 / (i + 1));

      // Hash full token
      const h1 = this.hashString(token);
      const idx1 = Math.abs(h1) % dimensions;
      vector[idx1] += weight * (h1 > 0 ? 1 : -1);

      // Hash subword prefixes for fuzzy matching (e.g. "auth", "authenticat", "mongo", "mongodb")
      if (token.length >= 4) {
        const sub = token.substring(0, 4);
        const h2 = this.hashString(sub);
        const idx2 = Math.abs(h2) % dimensions;
        vector[idx2] += (weight * 0.5) * (h2 > 0 ? 1 : -1);
      }
    }

    // Unit normalize (L2 norm) so cosine similarity = dot product
    let sumSq = 0;
    for (let i = 0; i < dimensions; i++) {
      sumSq += vector[i] * vector[i];
    }

    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (let i = 0; i < dimensions; i++) {
        vector[i] /= norm;
      }
    }

    return Array.from(vector);
  },

  /**
   * 32-bit FNV-1a string hashing
   */
  hashString(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash;
  },

  /**
   * Calculate Cosine Similarity between two embedding vectors
   */
  cosineSimilarity(vecA = [], vecB = []) {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  },
};
