// ============================================================
// RepoInterview AI — Ingestion Cache Service
// In-memory application storage keyed by commit SHA identity.
// Avoids localStorage overflow and duplicate network calls.
// ============================================================

import type { RepositoryIngestionResult } from '../types/domain.ts';

class IngestionCacheService {
  private cache = new Map<string, RepositoryIngestionResult>();

  getIdentity(owner: string, repo: string, commitSha: string): string {
    return `${owner.toLowerCase()}/${repo.toLowerCase()}@${commitSha}`;
  }

  get(owner: string, repo: string, commitSha: string): RepositoryIngestionResult | undefined {
    const key = this.getIdentity(owner, repo, commitSha);
    return this.cache.get(key);
  }

  set(result: RepositoryIngestionResult): void {
    if (result.identity) {
      this.cache.set(result.identity, result);
    }
  }

  has(owner: string, repo: string, commitSha: string): boolean {
    const key = this.getIdentity(owner, repo, commitSha);
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new IngestionCacheService();
