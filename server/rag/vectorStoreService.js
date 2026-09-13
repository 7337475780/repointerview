// ============================================================
// RepoInterview AI — Vector Database Storage Service
// Powered by MongoDB Atlas Vector Search ($vectorSearch)
// with seamless In-Memory Vector Store fallback.
// ============================================================

import { MongoClient } from 'mongodb';
import { config } from '../config/config.js';
import { embeddingService } from './embeddingService.js';

class VectorStoreService {
  constructor() {
    this.mongoClient = null;
    this.isConnected = false;
    // In-memory vector store cache for offline/fallback/testing
    this.inMemoryChunks = new Map(); // repositoryId -> Array<ChunkDocument>
  }

  /**
   * Connect to MongoDB Atlas (if URI provided)
   */
  async getCollection() {
    if (!config.mongodb.uri) {
      return null;
    }

    if (this.isConnected && this.mongoClient) {
      return this.mongoClient.db(config.mongodb.dbName).collection(config.mongodb.collectionName);
    }

    try {
      this.mongoClient = new MongoClient(config.mongodb.uri);
      await this.mongoClient.connect();
      this.isConnected = true;
      console.log('🍃 Connected to MongoDB Atlas Vector Database');
      return this.mongoClient.db(config.mongodb.dbName).collection(config.mongodb.collectionName);
    } catch (err) {
      console.warn(`[VectorStore] MongoDB Atlas connection error: ${err.message}. Using In-Memory Vector Store.`);
      this.isConnected = false;
      return null;
    }
  }

  /**
   * Upsert chunks and their embeddings for a repository
   * @param {string} repositoryId
   * @param {Array<object>} chunks
   * @returns {Promise<{ storedCount: number, mode: 'atlas' | 'in-memory' }>}
   */
  async storeChunks(repositoryId, chunks = []) {
    if (!chunks.length) return { storedCount: 0, mode: 'in-memory' };

    const collection = await this.getCollection();

    if (collection) {
      try {
        // Delete existing chunks for this repository
        await collection.deleteMany({ repositoryId });

        // Insert new chunk documents with embeddings
        const docs = chunks.map(c => ({
          ...c,
          createdAt: new Date(),
        }));

        await collection.insertMany(docs);
        console.log(`🍃 Stored ${docs.length} chunk embeddings in MongoDB Atlas Vector Search`);

        // Also sync in-memory copy
        this.inMemoryChunks.set(repositoryId, docs);
        return { storedCount: docs.length, mode: 'atlas' };
      } catch (err) {
        console.warn(`[VectorStore] MongoDB insert error: ${err.message}. Saving to In-Memory store.`);
      }
    }

    // In-Memory Vector Storage Fallback
    this.inMemoryChunks.set(repositoryId, chunks);
    return { storedCount: chunks.length, mode: 'in-memory' };
  }

  /**
   * Perform Vector Similarity Search
   * @param {string} repositoryId
   * @param {number[]} queryVector 768-D query embedding
   * @param {object} [options={}] { topK, minScore, filterCategory }
   * @returns {Promise<Array<object>>} Top matching chunks with similarity scores
   */
  async searchVector(repositoryId, queryVector, options = {}) {
    const topK = options.topK || config.rag.topK;
    const minScore = options.minScore || 0.1;
    const collection = await this.getCollection();

    // 1. MongoDB Atlas $vectorSearch Pipeline
    if (collection) {
      try {
        const pipeline = [
          {
            $vectorSearch: {
              index: config.mongodb.indexName,
              path: 'embedding',
              queryVector: queryVector,
              numCandidates: Math.max(topK * 10, 50),
              limit: topK,
              filter: repositoryId ? { repositoryId: { $eq: repositoryId } } : undefined,
            },
          },
          {
            $project: {
              chunkId: 1,
              repositoryId: 1,
              filePath: 1,
              startLine: 1,
              endLine: 1,
              content: 1,
              fileCategory: 1,
              symbols: 1,
              score: { $meta: 'vectorSearchScore' },
            },
          },
        ];

        const cursor = collection.aggregate(pipeline);
        const results = await cursor.toArray();

        if (results && results.length > 0) {
          return results;
        }
      } catch (err) {
        console.warn(`[VectorStore] Atlas $vectorSearch error (${err.message}). Falling back to local vector search.`);
      }
    }

    // 2. In-Memory Vector Search Fallback
    return this.searchInMemory(repositoryId, queryVector, topK, minScore);
  }

  /**
   * In-Memory Cosine Similarity Vector Search
   */
  searchInMemory(repositoryId, queryVector, topK = 5, minScore = 0.05) {
    let candidateChunks = [];

    if (repositoryId && this.inMemoryChunks.has(repositoryId)) {
      candidateChunks = this.inMemoryChunks.get(repositoryId);
    } else {
      for (const chunks of this.inMemoryChunks.values()) {
        candidateChunks.push(...chunks);
      }
    }

    const scored = candidateChunks
      .map(chunk => {
        const score = embeddingService.cosineSimilarity(queryVector, chunk.embedding || []);
        return {
          chunkId: chunk.chunkId,
          repositoryId: chunk.repositoryId,
          filePath: chunk.filePath,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          content: chunk.content,
          fileCategory: chunk.fileCategory,
          symbols: chunk.symbols,
          score: Math.round(score * 1000) / 1000,
        };
      })
      .filter(item => item.score >= minScore)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  /**
   * Get store stats
   */
  getStats(repositoryId) {
    const inMemCount = repositoryId
      ? (this.inMemoryChunks.get(repositoryId) || []).length
      : Array.from(this.inMemoryChunks.values()).reduce((acc, c) => acc + c.length, 0);

    return {
      connectedToAtlas: this.isConnected,
      atlasDatabase: config.mongodb.dbName,
      atlasCollection: config.mongodb.collectionName,
      atlasIndexName: config.mongodb.indexName,
      inMemoryChunksCount: inMemCount,
    };
  }

  /**
   * Close connection on shutdown
   */
  async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.isConnected = false;
    }
  }
}

export const vectorStoreService = new VectorStoreService();
