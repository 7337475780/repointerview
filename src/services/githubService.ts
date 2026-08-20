// ============================================================
// RepoInterview AI — GitHub Integration Service
// Pure unauthenticated public GitHub REST API integration.
// Strictly NO private keys or tokens in client code.
// ============================================================

export interface ParsedGitHubUrl {
  valid: boolean;
  owner?: string;
  repo?: string;
  fullName?: string;
  branch?: string;
  error?: string;
}

export interface GitHubApiError {
  status: number;
  message: string;
  rateLimited: boolean;
  notFound: boolean;
}

export const githubService = {
  /**
   * Parse and validate GitHub URL variants:
   * - https://github.com/owner/repo
   * - https://github.com/owner/repo/
   * - https://github.com/owner/repo.git
   * - github.com/owner/repo
   * - https://github.com/owner/repo/tree/branch-name
   */
  parseUrl(inputUrl: string): ParsedGitHubUrl {
    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.trim()) {
      return { valid: false, error: 'Repository URL is required.' };
    }

    const trimmed = inputUrl.trim();
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;

    try {
      const parsed = new URL(normalized);
      if (!parsed.hostname.includes('github.com')) {
        return {
          valid: false,
          error: 'Only GitHub repositories are supported. Please provide a github.com URL.',
        };
      }

      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (pathSegments.length < 2) {
        return {
          valid: false,
          error: 'Invalid GitHub URL. Format: https://github.com/owner/repository',
        };
      }

      const owner = pathSegments[0];
      const rawRepo = pathSegments[1].replace(/\.git$/, '');

      if (!owner || !rawRepo) {
        return {
          valid: false,
          error: 'Missing owner or repository name in URL.',
        };
      }

      let branch: string | undefined;
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
    } catch {
      return {
        valid: false,
        error: 'Malformed URL. Please check the repository address.',
      };
    }
  },

  /**
   * Fetch repository metadata from GitHub Public API
   */
  async fetchMetadata(owner: string, repo: string) {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      this.handleHttpError(response.status, owner, repo);
    }

    const data = await response.json();

    return {
      id: data.id,
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      description: data.description || '',
      url: data.html_url,
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      primaryLanguage: data.language || 'Unknown',
      sizeKb: data.size || 0,
      isPrivate: data.private || false,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Resolve latest commit SHA for cache identity
   */
  async fetchLatestCommitSha(owner: string, repo: string, branch: string): Promise<string> {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`;

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/vnd.github.v3.sha',
      },
    });

    if (response.ok) {
      const sha = await response.text();
      return sha.trim();
    }

    // Fallback: fetch commit json
    const jsonRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (jsonRes.ok) {
      const data = await jsonRes.json();
      return data.sha;
    }

    return branch; // fallback to branch name if commit resolution fails
  },

  /**
   * Fetch recursive repository tree in a single API call
   */
  async fetchTree(owner: string, repo: string, commitShaOrBranch: string) {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(commitShaOrBranch)}?recursive=1`;

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      this.handleHttpError(response.status, owner, repo);
    }

    const data = await response.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      throw new Error('Repository file tree is empty or corrupted.');
    }

    return data.tree as Array<{
      path: string;
      mode: string;
      type: 'blob' | 'tree';
      sha: string;
      size?: number;
      url?: string;
    }>;
  },

  /**
   * Fetch raw source file text content
   */
  async fetchRawFile(owner: string, repo: string, commitSha: string, path: string): Promise<string> {
    const url = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(commitSha)}/${path}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file content (${response.status}): ${path}`);
    }

    return await response.text();
  },

  /**
   * Translate HTTP status into human-readable error messages
   */
  handleHttpError(status: number, owner: string, repo: string): never {
    if (status === 404) {
      throw new Error(
        `We couldn't access "${owner}/${repo}". Check that the URL is correct and that the repository is publicly accessible.`
      );
    }
    if (status === 403 || status === 429) {
      throw new Error(
        'GitHub API rate limit reached. Please wait a few minutes before trying again.'
      );
    }
    throw new Error(`GitHub API request failed with status code ${status}.`);
  },
};
