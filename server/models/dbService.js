// ============================================================
// RepoInterview AI — Database Persistence Service
// Handles persistence in MongoDB Atlas with In-Memory store fallback
// ============================================================

import { MongoClient } from 'mongodb';
import { config } from '../config/config.js';
import { InterviewSession } from './InterviewSession.js';

class DbService {
  constructor() {
    this.mongoClient = null;
    this.isConnected = false;
    this.inMemorySessions = new Map(); // sessionId -> InterviewSession JSON
  }

  async getCollection() {
    if (!config.mongodb.uri) return null;

    if (this.isConnected && this.mongoClient) {
      return this.mongoClient.db(config.mongodb.dbName).collection('interview_sessions');
    }

    try {
      this.mongoClient = new MongoClient(config.mongodb.uri);
      await this.mongoClient.connect();
      this.isConnected = true;
      return this.mongoClient.db(config.mongodb.dbName).collection('interview_sessions');
    } catch (err) {
      console.warn(`[DbService] MongoDB connection warning: ${err.message}. Using In-Memory Database.`);
      this.isConnected = false;
      return null;
    }
  }

  /**
   * Save or update an interview session
   * @param {InterviewSession|object} session
   */
  async saveSession(session) {
    const sessionData = session instanceof InterviewSession ? session.toJSON() : session;
    const sessionId = sessionData.sessionId;

    // Always update in-memory cache
    this.inMemorySessions.set(sessionId, sessionData);

    const collection = await this.getCollection();
    if (collection) {
      try {
        await collection.updateOne(
          { sessionId },
          { $set: sessionData },
          { upsert: true }
        );
      } catch (err) {
        console.warn(`[DbService] MongoDB save warning: ${err.message}`);
      }
    }

    return sessionData;
  }

  /**
   * Retrieve an interview session by ID
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   */
  async getSession(sessionId) {
    if (this.inMemorySessions.has(sessionId)) {
      return this.inMemorySessions.get(sessionId);
    }

    const collection = await this.getCollection();
    if (collection) {
      try {
        const doc = await collection.findOne({ sessionId });
        if (doc) {
          this.inMemorySessions.set(sessionId, doc);
          return doc;
        }
      } catch (err) {
        console.warn(`[DbService] MongoDB find error: ${err.message}`);
      }
    }

    return null;
  }

  /**
   * List sessions for a repository
   * @param {string} repositoryId
   */
  async getSessionsByRepository(repositoryId) {
    const inMemList = Array.from(this.inMemorySessions.values())
      .filter(s => !repositoryId || s.repositoryId === repositoryId);

    const collection = await this.getCollection();
    if (collection) {
      try {
        const docs = await collection.find(repositoryId ? { repositoryId } : {}).sort({ createdAt: -1 }).toArray();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn(`[DbService] MongoDB query error: ${err.message}`);
      }
    }

    return inMemList;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    this.inMemorySessions.delete(sessionId);
    const collection = await this.getCollection();
    if (collection) {
      try {
        await collection.deleteOne({ sessionId });
      } catch {}
    }
    return true;
  }
}

export const dbService = new DbService();
