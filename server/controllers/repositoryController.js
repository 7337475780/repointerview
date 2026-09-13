// ============================================================
// Repository Analysis Controller
// Handles incoming HTTP requests for repository validation,
// tree categorization, and full content analysis.
// ============================================================

import { repositoryAnalysisService } from '../services/repositoryAnalysisService.js';
import { fileFilterService } from '../services/fileFilterService.js';
import { githubService } from '../services/githubService.js';

export const repositoryController = {
  /**
   * POST /api/repository/analyze
   * Full repository analysis endpoint
   */
  async analyzeRepository(req, res, next) {
    try {
      const { url, options = {} } = req.body;
      const result = await repositoryAnalysisService.analyze(url, options);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/repository/validate
   * Fast URL validation and owner/repo extraction endpoint
   */
  validateUrl(req, res, next) {
    try {
      const { url } = req.body;
      const parsed = repositoryAnalysisService.validateUrl(url);

      return res.status(200).json({
        success: true,
        data: {
          valid: true,
          owner: parsed.owner,
          repo: parsed.repo,
          fullName: parsed.fullName,
          branch: parsed.branch || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/repository/tree
   * Fetches metadata, commit tree, and categorized file structure without full content downloading
   */
  async getTree(req, res, next) {
    try {
      const { url, branch } = req.body;
      const parsed = githubService.parseUrl(url);
      const { owner, repo } = parsed;

      const metadata = await githubService.fetchMetadata(owner, repo);
      const targetBranch = branch || parsed.branch || metadata.defaultBranch;
      const commitSha = await githubService.fetchLatestCommitSha(owner, repo, targetBranch);
      const rawTree = await githubService.fetchTree(owner, repo, commitSha);
      const categorized = fileFilterService.filterAndCategorize(rawTree);

      return res.status(200).json({
        success: true,
        data: {
          repository: {
            ...metadata,
            selectedBranch: targetBranch,
            commitSha: commitSha.substring(0, 7),
          },
          summary: categorized.summary,
          categories: {
            packageJson: categorized.packageJsonFiles,
            readme: categorized.readmeFiles,
            config: categorized.configFiles,
            source: categorized.sourceFiles,
          },
          ignoredFilesCount: categorized.ignoredFiles.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repository/health
   * Health check endpoint
   */
  getHealth(req, res) {
    return res.status(200).json({
      success: true,
      data: {
        service: 'RepoInterview Analysis API',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    });
  },
};
