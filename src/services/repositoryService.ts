import { githubService } from './githubService.ts';
import { ingestionService } from './ingestionService.ts';
import { repositoryAnalysisService } from './repositoryAnalysisService.ts';
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
   * Create a Project instance populated with the ingestion result and deterministic intelligence
   */
  createProjectFromIngestion(ingestion: RepositoryIngestionResult): Project {
    const id = ingestion.repository.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const intelligence = repositoryAnalysisService.analyzeRepository(ingestion);

    const techStack = intelligence.technologies.map(t => ({
      name: t.name,
      category: t.category,
      color: '#D4714A',
      confidenceScore: Math.round(t.confidence * 100),
    }));

    const now = new Date().toISOString();
    const hasWarnings = (ingestion.warnings && ingestion.warnings.length > 0) || (intelligence.warnings && intelligence.warnings.length > 0);

    return {
      id,
      repository: ingestion.repository,
      createdAt: now,
      lastAnalyzedAt: now,
      status: hasWarnings ? 'ANALYSIS_WITH_WARNINGS' : 'ANALYZED',
      analysisScore: 0,
      techStack,
      stats: {
        totalFiles: ingestion.stats.totalDiscoveredFiles,
        linesOfCode: Math.round(ingestion.stats.totalSourceBytes / 35),
        testCoverage: 0,
        apiRoutes: intelligence.apiSurface.endpointsCount,
        components: intelligence.structure.keyDirectories.filter(d => d.role === 'UI Components').length,
        dbTables: intelligence.database.models.length,
      },
      architecture: intelligence.architectureMap,
      questions: [],
      questionsCount: 0,
      ingestion,
      intelligence,
    };
  },
};
