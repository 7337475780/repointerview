// ============================================================
// Repository Analysis Service
// Orchestrates URL validation, GitHub tree fetching, file filtering,
// category extraction (package.json, README.md, source files, config files),
// and structural intelligence extraction.
// ============================================================

import { githubService } from './githubService.js';
import { fileFilterService } from './fileFilterService.js';
import { codeAnalyzerService } from './codeAnalyzerService.js';
import { config } from '../config/config.js';
import { ValidationError } from '../middleware/errorHandler.js';

export const repositoryAnalysisService = {
  /**
   * Validate a GitHub repository URL and extract owner/repo
   * @param {string} url 
   */
  validateUrl(url) {
    return githubService.parseUrl(url);
  },

  /**
   * Perform end-to-end repository analysis
   * @param {string} url GitHub repository URL
   * @param {object} [options={}] Optional configuration overrides
   */
  async analyze(url, options = {}) {
    const startTime = Date.now();

    // 1. Validate repository URL & extract owner/repo
    const parsed = githubService.parseUrl(url);
    const { owner, repo } = parsed;
    const requestedBranch = options.branch || parsed.branch;

    // 2. Fetch repository metadata via GitHub API
    const metadata = await githubService.fetchMetadata(owner, repo);
    const targetBranch = requestedBranch || metadata.defaultBranch;

    // 3. Fetch latest commit SHA and full recursive tree
    const commitSha = await githubService.fetchLatestCommitSha(owner, repo, targetBranch);
    const rawTree = await githubService.fetchTree(owner, repo, commitSha);

    if (!rawTree || rawTree.length === 0) {
      throw new ValidationError('Repository tree is empty or could not be retrieved.', { owner, repo });
    }

    // 4. Filter unnecessary files (node_modules, .git, dist, build, images, videos, etc.)
    // and categorize into package.json, README.md, source files, config files
    const categorized = fileFilterService.filterAndCategorize(rawTree);

    // 5. Select key files to download content
    const maxFilesToFetch = options.maxFiles || config.limits.maxSelectedFiles;
    const filesToFetch = this.selectFilesForContentExtraction(categorized, maxFilesToFetch);

    // 6. Fetch content concurrently with controlled batching
    const extractedFilesWithContent = await this.fetchContentsInBatches(
      owner,
      repo,
      commitSha,
      filesToFetch
    );

    // 7. Run Repository Understanding Engine (8 dimensions + Project Summary)
    const understanding = codeAnalyzerService.analyzeRepositoryFiles(
      metadata,
      extractedFilesWithContent,
      rawTree
    );

    const totalDurationMs = Date.now() - startTime;

    return {
      repository: {
        ...metadata,
        selectedBranch: targetBranch,
        commitSha: commitSha.substring(0, 7),
        fullCommitSha: commitSha,
      },
      summary: understanding.summary,
      understanding: understanding.analysis,
      extracted: {
        packageJson: extractedFilesWithContent.filter(f => f.category === 'package_json'),
        readme: extractedFilesWithContent.find(f => f.category === 'readme') || null,
        configFiles: extractedFilesWithContent.filter(f => f.category === 'config'),
        sourceFiles: extractedFilesWithContent.filter(f => f.category === 'source'),
      },
      fileTree: {
        summary: categorized.summary,
        categorizedCounts: categorized.summary.categoryCounts,
        allExtractedFiles: [
          ...categorized.packageJsonFiles,
          ...categorized.readmeFiles,
          ...categorized.configFiles,
          ...categorized.sourceFiles,
        ],
        ignoredFilesCount: categorized.ignoredFiles.length,
      },
      stats: {
        discoveredNodes: rawTree.length,
        ignoredFiles: categorized.ignoredFiles.length,
        totalExtractedFiles: categorized.summary.totalExtracted,
        contentFetchedFiles: extractedFilesWithContent.length,
        durationMs: totalDurationMs,
      },
    };
  },

  /**
   * Select top priority files for content downloading within limits
   */
  selectFilesForContentExtraction(categorized, maxFiles) {
    const selected = [];

    // Always include package.json manifests (top priority)
    for (const f of categorized.packageJsonFiles) {
      if (selected.length < maxFiles) selected.push(f);
    }

    // Always include README
    for (const f of categorized.readmeFiles) {
      if (selected.length < maxFiles && !selected.some(s => s.path === f.path)) {
        selected.push(f);
      }
    }

    // Include top configuration files
    for (const f of categorized.configFiles) {
      if (selected.length < maxFiles && !selected.some(s => s.path === f.path)) {
        selected.push(f);
      }
    }

    // Include top source files sorted by priority
    for (const f of categorized.sourceFiles) {
      if (selected.length < maxFiles && !selected.some(s => s.path === f.path)) {
        selected.push(f);
      }
    }

    return selected;
  },

  /**
   * Concurrently fetch contents in batches of 5 to respect rate limits
   */
  async fetchContentsInBatches(owner, repo, commitSha, files, batchSize = 5) {
    const results = [];

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const promises = batch.map(async file => {
        try {
          const content = await githubService.fetchFileContent(owner, repo, commitSha, file.path);
          return {
            ...file,
            content: content || '',
            hasContent: Boolean(content),
            linesCount: content ? content.split('\n').length : 0,
          };
        } catch {
          return {
            ...file,
            content: '',
            hasContent: false,
            linesCount: 0,
          };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  },

  /**
   * Extract lightweight deterministic intelligence from manifests, configs, and file tree
   */
  extractIntelligence(metadata, categorized, extractedFiles) {
    const technologies = new Set();
    const frameworks = [];
    const dependencies = [];

    // Parse package.json if available
    const rootPkg = extractedFiles.find(f => f.path === 'package.json');
    if (rootPkg && rootPkg.content) {
      try {
        const pkgData = JSON.parse(rootPkg.content);
        const allDeps = {
          ...(pkgData.dependencies || {}),
          ...(pkgData.devDependencies || {}),
        };

        for (const dep of Object.keys(allDeps)) {
          dependencies.push(dep);

          if (dep === 'react') { technologies.add('React'); frameworks.push('React'); }
          if (dep === 'next') { technologies.add('Next.js'); frameworks.push('Next.js'); }
          if (dep === 'vue') { technologies.add('Vue.js'); frameworks.push('Vue.js'); }
          if (dep === 'svelte') { technologies.add('Svelte'); frameworks.push('Svelte'); }
          if (dep === 'express') { technologies.add('Express.js'); frameworks.push('Express.js'); }
          if (dep === 'fastify') { technologies.add('Fastify'); frameworks.push('Fastify'); }
          if (dep === 'tailwindcss') technologies.add('Tailwind CSS');
          if (dep === 'prisma' || dep === '@prisma/client') technologies.add('Prisma ORM');
          if (dep === 'typeorm') technologies.add('TypeORM');
          if (dep === 'mongoose') technologies.add('Mongoose (MongoDB)');
          if (dep === 'pg' || dep === 'postgres') technologies.add('PostgreSQL');
          if (dep === 'redis' || dep === 'ioredis') technologies.add('Redis');
          if (dep === 'typescript') technologies.add('TypeScript');
        }
      } catch {
        // Ignored if invalid JSON
      }
    }

    // Infer from primary language
    if (metadata.primaryLanguage) {
      technologies.add(metadata.primaryLanguage);
    }

    // Detect config signals
    for (const f of categorized.configFiles) {
      if (f.path.includes('docker') || f.path.includes('Dockerfile')) technologies.add('Docker');
      if (f.path.includes('vite.config')) technologies.add('Vite');
      if (f.path.includes('tailwind.config')) technologies.add('Tailwind CSS');
      if (f.path.includes('tsconfig')) technologies.add('TypeScript');
      if (f.path.includes('schema.prisma')) technologies.add('Prisma ORM');
    }

    return {
      primaryLanguage: metadata.primaryLanguage,
      detectedTechnologies: Array.from(technologies),
      frameworks,
      totalDependencies: dependencies.length,
      sampleDependencies: dependencies.slice(0, 15),
      hasReadme: categorized.readmeFiles.length > 0,
      hasPackageJson: categorized.packageJsonFiles.length > 0,
      hasConfigFiles: categorized.configFiles.length > 0,
    };
  },
};
