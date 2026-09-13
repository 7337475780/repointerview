// ============================================================
// GitHub REST API Integration Service
// Handles URL parsing, metadata lookup, commit tree fetching,
// and file raw content retrieval with rate limiting & error handling.
// ============================================================

import { config } from '../config/config.js';
import {
  ValidationError,
  NotFoundError,
  RateLimitError,
  ExternalApiError,
} from '../middleware/errorHandler.js';

export const githubService = {
  /**
   * Parse and validate GitHub URL variants:
   * - https://github.com/owner/repo
   * - https://github.com/owner/repo/
   * - https://github.com/owner/repo.git
   * - github.com/owner/repo
   * - https://github.com/owner/repo/tree/branch-name
   *
   * @param {string} inputUrl
   * @returns {{ valid: boolean, owner: string, repo: string, fullName: string, branch?: string }}
   */
  parseUrl(inputUrl) {
    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.trim()) {
      throw new ValidationError('Repository URL is required.', { inputUrl });
    }

    const trimmed = inputUrl.trim();
    const normalized = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    let parsed;
    try {
      parsed = new URL(normalized);
    } catch {
      throw new ValidationError('Malformed GitHub repository URL format.', { inputUrl });
    }

    if (!parsed.hostname.includes('github.com')) {
      throw new ValidationError('Only GitHub repositories are supported. Please provide a github.com URL.', {
        hostname: parsed.hostname,
      });
    }

    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    if (pathSegments.length < 2) {
      throw new ValidationError('Invalid GitHub repository path. Format must be https://github.com/owner/repository', {
        pathname: parsed.pathname,
      });
    }

    const owner = pathSegments[0];
    const rawRepo = pathSegments[1].replace(/\.git$/, '');

    if (!owner || !rawRepo) {
      throw new ValidationError('Could not extract owner and repository name from URL.', { inputUrl });
    }

    let branch;
    if (pathSegments.length >= 4 && pathSegments[2] === 'tree') {
      branch = pathSegments.slice(3).join('/');
    }

    return {
      valid: true,
      owner,
      repo: rawRepo,
      fullName: `${owner}/${rawRepo}`,
      branch,
    };
  },

  /**
   * Helper to construct fetch headers
   */
  getHeaders() {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': config.github.userAgent,
    };

    if (config.github.token) {
      headers.Authorization = `token ${config.github.token}`;
    }

    return headers;
  },

  /**
   * Handle HTTP errors from GitHub API
   */
  handleHttpError(response, context = {}) {
    const status = response.status;
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');

    if (status === 403 || status === 429 || rateLimitRemaining === '0') {
      const resetDate = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString() : 'shortly';
      throw new RateLimitError(
        `GitHub API rate limit exceeded. Limit resets at ${resetDate}. Add a GITHUB_TOKEN to .env for 5,000 req/hr.`,
        { ...context, resetDate }
      );
    }

    if (status === 404) {
      throw new NotFoundError(
        `Repository "${context.owner}/${context.repo}" not found. It may be private or deleted.`,
        context
      );
    }

    throw new ExternalApiError(
      `GitHub API request failed with status HTTP ${status}: ${response.statusText}`,
      status,
      context
    );
  },

  /**
   * Fetch repository metadata from GitHub API
   */
  async fetchMetadata(owner, repo) {
    const endpoint = `${config.github.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

    let response;
    try {
      response = await fetch(endpoint, { headers: this.getHeaders() });
    } catch (err) {
      throw new ExternalApiError(`Failed to connect to GitHub API: ${err.message}`);
    }

    if (!response.ok) {
      this.handleHttpError(response, { owner, repo, endpoint });
    }

    const data = await response.json();

    return {
      id: `${owner}/${repo}`,
      name: data.name,
      fullName: data.full_name,
      owner: {
        login: data.owner?.login || owner,
        avatarUrl: data.owner?.avatar_url || '',
      },
      description: data.description || '',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      defaultBranch: data.default_branch || 'main',
      primaryLanguage: data.language || 'Unknown',
      license: data.license?.spdx_id || data.license?.name || null,
      isPrivate: data.private || false,
      isFork: data.fork || false,
      pushedAt: data.pushed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Fetch latest commit SHA for a branch
   */
  async fetchLatestCommitSha(owner, repo, branch = 'main') {
    const endpoint = `${config.github.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`;

    let response;
    try {
      response = await fetch(endpoint, { headers: this.getHeaders() });
    } catch (err) {
      throw new ExternalApiError(`Failed to fetch commit SHA: ${err.message}`);
    }

    if (!response.ok) {
      this.handleHttpError(response, { owner, repo, branch });
    }

    const data = await response.json();
    return data.sha;
  },

  /**
   * Fetch entire repository tree recursively
   */
  async fetchTree(owner, repo, commitSha) {
    const endpoint = `${config.github.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(commitSha)}?recursive=1`;

    let response;
    try {
      response = await fetch(endpoint, { headers: this.getHeaders() });
    } catch (err) {
      throw new ExternalApiError(`Failed to fetch repository tree: ${err.message}`);
    }

    if (!response.ok) {
      this.handleHttpError(response, { owner, repo, commitSha });
    }

    const data = await response.json();

    if (!data.tree || !Array.isArray(data.tree)) {
      throw new ExternalApiError('Invalid tree format received from GitHub API.', 502, { data });
    }

    return data.tree.map(node => ({
      path: node.path,
      type: node.type === 'blob' ? 'blob' : 'tree',
      size: node.size || 0,
      sha: node.sha,
    }));
  },

  /**
   * Fetch raw file content from GitHub
   */
  async fetchFileContent(owner, repo, ref, filePath) {
    const rawUrl = `${config.github.rawBaseUrl}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${filePath}`;

    try {
      const response = await fetch(rawUrl, {
        headers: config.github.token ? { Authorization: `token ${config.github.token}` } : {},
      });

      if (response.ok) {
        return await response.text();
      }
    } catch {
      // Fallback to GitHub REST contents API below
    }

    // Fallback: GitHub REST API contents endpoint
    const apiEndpoint = `${config.github.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(ref)}`;
    const apiResponse = await fetch(apiEndpoint, { headers: this.getHeaders() });

    if (!apiResponse.ok) {
      return null;
    }

    const json = await apiResponse.json();
    if (json.content && json.encoding === 'base64') {
      return Buffer.from(json.content, 'base64').toString('utf-8');
    }

    return null;
  },
};
