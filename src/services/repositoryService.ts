// ============================================================
// RepoInterview AI — Repository Service Boundary
// Connects UI actions to GitHub ingestion pipeline and project models.
// ============================================================

import { githubService } from './githubService.ts';
import { ingestionService } from './ingestionService.ts';
import type { IngestionProgressCallback } from './ingestionService.ts';
import type { Project, RepositoryIngestionResult } from '../types/domain.ts';

export const repositoryService = {
  /**
   * Validate URL format using GitHub service
   */
  validateUrl(url: string) {
    return githubService.parseUrl(url);
  },

  /**
   * Execute repository ingestion pipeline
   */
  async ingestRepository(
    url: string,
    onProgress?: IngestionProgressCallback
  ): Promise<RepositoryIngestionResult> {
    return await ingestionService.ingestRepository(url, onProgress);
  },

  /**
   * Create a Project instance populated with the ingestion result
   */
  createProjectFromIngestion(ingestion: RepositoryIngestionResult): Project {
    const id = ingestion.repository.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return {
      id,
      repository: ingestion.repository,
      createdAt: new Date().toISOString(),
      status: ingestion.status,
      analysisScore: 0,
      techStack: [
        {
          name: ingestion.metadata.primaryLanguage,
          category: 'language',
          color: '#60A5FA',
          confidenceScore: 100,
        },
      ],
      stats: {
        totalFiles: ingestion.stats.totalDiscoveredFiles,
        linesOfCode: 0,
        testCoverage: 0,
        apiRoutes: 0,
        components: 0,
        dbTables: 0,
      },
      questions: [],
      questionsCount: 0,
      ingestion,
    };
  },
};
