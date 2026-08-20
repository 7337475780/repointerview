// ============================================================
// RepoInterview AI — Repository Ingestion Pipeline Service
// Executes real-time validation, metadata, tree mapping,
// scoring selection, and source retrieval with progress callbacks.
// ============================================================

import type {
  IngestionStats,
  IngestionStep,
  IngestionWarning,
  Repository,
  RepositoryIngestionResult,
  RepositorySourceFile,
} from '../types/domain.ts';
import { githubService } from './githubService.ts';
import { fileFilterService, INGESTION_LIMITS } from './fileFilterService.ts';
import { cacheService } from './cacheService.ts';

export interface IngestionProgressEvent {
  step: IngestionStep;
  message: string;
  filesDiscovered?: number;
  filesSelected?: number;
  filesFetched?: number;
  totalFilesToFetch?: number;
  currentFilePath?: string;
  totalBytesDownloaded?: number;
}

export type IngestionProgressCallback = (event: IngestionProgressEvent) => void;

export const ingestionService = {
  /**
   * Run the complete ingestion pipeline for a given GitHub URL
   */
  async ingestRepository(
    inputUrl: string,
    onProgress?: IngestionProgressCallback
  ): Promise<RepositoryIngestionResult> {
    const startTime = Date.now();

    // 1. VALIDATING
    onProgress?.({
      step: 'VALIDATING',
      message: 'Validating GitHub repository URL...',
    });

    const parsed = githubService.parseUrl(inputUrl);
    if (!parsed.valid || !parsed.owner || !parsed.repo) {
      throw new Error(parsed.error || 'Invalid GitHub repository URL.');
    }

    const { owner, repo } = parsed;

    // 2. FETCHING_METADATA
    onProgress?.({
      step: 'FETCHING_METADATA',
      message: `Connecting to GitHub API for ${owner}/${repo}...`,
    });

    const metadata = await githubService.fetchMetadata(owner, repo);

    // 3. FETCHING_TREE & COMMIT SHA
    onProgress?.({
      step: 'FETCHING_TREE',
      message: 'Resolving latest commit SHA and mapping repository tree...',
    });

    const targetBranch = parsed.branch || metadata.defaultBranch;
    const commitSha = await githubService.fetchLatestCommitSha(owner, repo, targetBranch);
    const identity = cacheService.getIdentity(owner, repo, commitSha);

    // Check Cache
    const cached = cacheService.get(owner, repo, commitSha);
    if (cached) {
      onProgress?.({
        step: cached.status,
        message: 'Loaded cached repository snapshot from memory.',
        filesDiscovered: cached.stats.totalDiscoveredFiles,
        filesSelected: cached.stats.selectedFilesCount,
        filesFetched: cached.stats.fetchedFilesCount,
      });
      return cached;
    }

    const rawTree = await githubService.fetchTree(owner, repo, commitSha);

    // 4. SELECTING_FILES
    onProgress?.({
      step: 'SELECTING_FILES',
      message: `Analyzing ${rawTree.length} nodes for architecture & code relevance...`,
      filesDiscovered: rawTree.length,
    });

    const processedTree = fileFilterService.selectRelevantFiles(rawTree);
    const selectedNodes = processedTree.filter(n => n.selected);

    if (selectedNodes.length === 0) {
      throw new Error(
        'No analyzable source code files were found in this repository. It may be empty or contain only unsupported file types.'
      );
    }

    // 5. FETCHING_FILES
    onProgress?.({
      step: 'FETCHING_FILES',
      message: `Retrieving contents for ${selectedNodes.length} key architecture and source files...`,
      filesDiscovered: rawTree.length,
      filesSelected: selectedNodes.length,
      filesFetched: 0,
      totalFilesToFetch: selectedNodes.length,
    });

    const sourceFiles: RepositorySourceFile[] = [];
    const warnings: IngestionWarning[] = [];
    let totalBytesDownloaded = 0;

    for (let i = 0; i < selectedNodes.length; i++) {
      const node = selectedNodes[i];

      // Check total source byte budget
      if (totalBytesDownloaded >= INGESTION_LIMITS.MAX_TOTAL_SOURCE_BYTES) {
        warnings.push({
          path: node.path,
          reason: 'SKIPPED_LARGE_FILE',
          message: 'Total ingestion source payload exceeded 1.5MB budget limit.',
        });
        continue;
      }

      onProgress?.({
        step: 'FETCHING_FILES',
        message: `Reading source file (${i + 1}/${selectedNodes.length}): ${node.path}`,
        filesDiscovered: rawTree.length,
        filesSelected: selectedNodes.length,
        filesFetched: i,
        totalFilesToFetch: selectedNodes.length,
        currentFilePath: node.path,
        totalBytesDownloaded,
      });

      try {
        const textContent = await githubService.fetchRawFile(owner, repo, commitSha, node.path);
        const byteSize = new Blob([textContent]).size;

        if (byteSize > INGESTION_LIMITS.MAX_FILE_SIZE_BYTES) {
          warnings.push({
            path: node.path,
            reason: 'SKIPPED_LARGE_FILE',
            message: `File size (${Math.round(byteSize / 1024)} KB) exceeds individual limit of 100 KB.`,
          });
          continue;
        }

        totalBytesDownloaded += byteSize;
        sourceFiles.push({
          path: node.path,
          content: textContent,
          size: byteSize,
          language: fileFilterService.detectLanguage(node.path),
          sha: node.sha,
          score: node.score,
        });
      } catch (err: any) {
        // Partial ingestion: single file failure does not fail the repository
        warnings.push({
          path: node.path,
          reason: 'FETCH_FAILED',
          message: err?.message || 'Failed to retrieve file content.',
        });
      }
    }

    const durationMs = Date.now() - startTime;
    const finalStatus: 'READY' | 'READY_WITH_WARNINGS' =
      warnings.length > 0 ? 'READY_WITH_WARNINGS' : 'READY';

    const repository: Repository = {
      id: String(metadata.id),
      name: metadata.name,
      owner: metadata.owner,
      fullName: metadata.fullName,
      url: metadata.url,
      defaultBranch: metadata.defaultBranch,
      commitSha,
      stars: metadata.stars,
      forks: metadata.forks,
      description: metadata.description,
      primaryLanguage: metadata.primaryLanguage,
      sizeKb: metadata.sizeKb,
    };

    const stats: IngestionStats = {
      totalDiscoveredFiles: rawTree.length,
      totalCandidateFiles: processedTree.filter(n => n.score > 0).length,
      selectedFilesCount: selectedNodes.length,
      fetchedFilesCount: sourceFiles.length,
      skippedFilesCount: warnings.length,
      totalSourceBytes: totalBytesDownloaded,
      durationMs,
    };

    const result: RepositoryIngestionResult = {
      identity,
      repository,
      metadata,
      commitSha,
      tree: processedTree,
      selectedFiles: selectedNodes,
      sourceFiles,
      stats,
      warnings,
      status: finalStatus,
    };

    // Cache the successful ingestion in memory
    cacheService.set(result);

    onProgress?.({
      step: finalStatus,
      message:
        finalStatus === 'READY_WITH_WARNINGS'
          ? `Repository ingested with ${warnings.length} skipped files. Ready for analysis.`
          : 'Repository successfully ingested. Ready for analysis.',
      filesDiscovered: rawTree.length,
      filesSelected: selectedNodes.length,
      filesFetched: sourceFiles.length,
      totalBytesDownloaded,
    });

    return result;
  },
};
