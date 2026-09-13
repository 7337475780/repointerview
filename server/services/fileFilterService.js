// ============================================================
// File Filtering & Classification Engine
// Filters unnecessary noise (node_modules, .git, dist, build, images, videos)
// and extracts package.json, README.md, source files, and configuration files.
// ============================================================

import { config } from '../config/config.js';

// Directories to completely ignore during extraction
export const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  '.next',
  'out',
  'coverage',
  'vendor',
  'target',
  'bin',
  'obj',
  '__pycache__',
  '.venv',
  'venv',
  '.turbo',
  '.idea',
  '.vscode',
  'tmp',
  'temp',
  '.husky',
  'public',
  'assets',
  'static',
]);

// File extensions to ignore (Images, Videos, Binaries, Audio, Archives)
export const IGNORED_EXTENSIONS = new Set([
  // Images
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'svg', 'bmp', 'tiff', 'psd', 'ai', 'heic', 'raw',
  // Videos
  'mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', '3gp',
  // Audio
  'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma',
  // Archives & Binaries
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', 'tgz', '7z', 'rar', 'bz2', 'xz',
  'wasm', 'exe', 'so', 'dll', 'dylib', 'class', 'pyc', 'jar', 'iso', 'bin',
  // Source maps & minified files
  'map', 'min.js', 'min.css', 'd.ts.map',
  // Lockfiles (skipped from source analysis to prevent downloading megabytes of dependency hashes)
  'lock',
]);

// Source file extensions
export const SOURCE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
  'py', 'pyw',
  'go',
  'java', 'kt', 'kts', 'scala',
  'rs',
  'rb',
  'php',
  'c', 'h', 'cpp', 'hpp', 'cc', 'hh', 'cxx', 'hxx',
  'cs',
  'swift',
  'vue', 'svelte', 'astro',
  'html', 'htm',
  'css', 'scss', 'sass', 'less',
  'sql', 'prisma',
  'graphql', 'gql',
  'proto',
  'sh', 'bash', 'zsh',
]);

// Configuration file patterns
const CONFIG_FILE_PATTERNS = [
  /^vite\.config\.(js|ts|mjs|cjs)$/i,
  /^next\.config\.(js|ts|mjs|cjs)$/i,
  /^tsconfig(\..*)?\.json$/i,
  /^tailwind\.config\.(js|ts|cjs|mjs)$/i,
  /^postcss\.config\.(js|cjs|mjs)$/i,
  /^\.eslintrc(\.(json|js|cjs|yaml|yml))?$/i,
  /^eslint\.config\.(js|ts|mjs|cjs)$/i,
  /^\.prettierrc(\.(json|js|yaml|yml))?$/i,
  /^prettier\.config\.(js|cjs|mjs)$/i,
  /^docker-compose(\..*)?\.ya?ml$/i,
  /^dockerfile(\..*)?$/i,
  /^\.env\.example$/i,
  /^jest\.config\.(js|ts|mjs|cjs)$/i,
  /^vitest\.config\.(js|ts|mjs|cjs)$/i,
  /^webpack\.config\.(js|ts)$/i,
  /^babel\.config\.(js|json)$/i,
  /^\.babelrc(\.json)?$/i,
  /^turbo\.json$/i,
  /^lerna\.json$/i,
  /^angular\.json$/i,
  /^nuxt\.config\.(js|ts)$/i,
  /^deno\.jsonc?$/i,
];

export const fileFilterService = {
  /**
   * Check if a path belongs to an ignored directory
   * @param {string} filePath 
   * @returns {boolean}
   */
  isIgnoredDirectory(filePath) {
    if (!filePath || typeof filePath !== 'string') return false;
    const segments = filePath.toLowerCase().split('/');
    return segments.some(segment => IGNORED_DIRECTORIES.has(segment));
  },

  /**
   * Check if file extension is an image, video, binary, or ignored format
   * @param {string} filePath 
   * @returns {boolean}
   */
  isIgnoredExtension(filePath) {
    if (!filePath || typeof filePath !== 'string') return false;
    const lower = filePath.toLowerCase();

    // Check specific suffixes
    if (lower.endsWith('.min.js') || lower.endsWith('.min.css') || lower.endsWith('.d.ts.map')) {
      return true;
    }
    if (lower.endsWith('package-lock.json') || lower.endsWith('pnpm-lock.yaml') || lower.endsWith('yarn.lock')) {
      return true;
    }

    const segments = lower.split('/');
    const fileName = segments[segments.length - 1];
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) return false;

    const ext = fileName.substring(dotIndex + 1);
    return IGNORED_EXTENSIONS.has(ext);
  },

  /**
   * Determine whether a tree node should be ignored
   * @param {object} node { path, type, size }
   * @returns {{ ignore: boolean, reason?: string }}
   */
  shouldIgnore(node) {
    if (!node || !node.path) {
      return { ignore: true, reason: 'INVALID_NODE' };
    }

    if (node.type === 'tree') {
      return { ignore: true, reason: 'DIRECTORY_NODE' };
    }

    if (this.isIgnoredDirectory(node.path)) {
      return { ignore: true, reason: 'IGNORED_DIRECTORY' };
    }

    if (this.isIgnoredExtension(node.path)) {
      return { ignore: true, reason: 'IGNORED_EXTENSION_OR_BINARY' };
    }

    if (node.size && node.size > config.limits.maxFileSizeBytes) {
      return { ignore: true, reason: 'FILE_SIZE_EXCEEDED' };
    }

    return { ignore: false };
  },

  /**
   * Classify an allowed file into categories:
   * - 'package_json'
   * - 'readme'
   * - 'config'
   * - 'source'
   * - 'other'
   * @param {string} filePath 
   * @returns {string}
   */
  classifyFile(filePath) {
    const lower = filePath.toLowerCase();
    const segments = lower.split('/');
    const fileName = segments[segments.length - 1];

    // 1. package.json or dependency manifests
    if (fileName === 'package.json') {
      return 'package_json';
    }
    if (
      fileName === 'requirements.txt' ||
      fileName === 'pyproject.toml' ||
      fileName === 'gemfile' ||
      fileName === 'cargo.toml' ||
      fileName === 'go.mod' ||
      fileName === 'pom.xml' ||
      fileName === 'build.gradle'
    ) {
      return 'package_json';
    }

    // 2. README.md
    if (fileName === 'readme.md' || fileName === 'readme.txt' || fileName === 'readme.rst' || fileName === 'readme') {
      return 'readme';
    }

    // 3. Configuration files
    const isConfigPattern = CONFIG_FILE_PATTERNS.some(pattern => pattern.test(fileName));
    if (isConfigPattern || lower.includes('/config/') || lower.includes('/configs/')) {
      return 'config';
    }
    if (lower.endsWith('.prisma') || lower.endsWith('schema.prisma') || lower.endsWith('schema.sql')) {
      return 'config';
    }

    // 4. Source files
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex !== -1) {
      const ext = fileName.substring(dotIndex + 1);
      if (SOURCE_EXTENSIONS.has(ext)) {
        return 'source';
      }
    }

    return 'other';
  },

  /**
   * Calculate relevance priority score for extracting file content
   * @param {string} filePath 
   * @param {string} category 
   * @returns {number}
   */
  calculatePriority(filePath, category) {
    const lower = filePath.toLowerCase();
    const segments = lower.split('/');
    const fileName = segments[segments.length - 1];

    if (category === 'package_json') return 100;
    if (category === 'readme') return 95;
    if (category === 'config') return 90;

    // Entry points and core architecture
    if (/^(src\/)?(index|main|app|server)\.(ts|js|jsx|tsx|py|go)$/i.test(filePath)) return 85;
    if (/^(src\/)?(router|routes|api)\//i.test(filePath)) return 80;
    if (/^(src\/)?(controllers|handlers|services)\//i.test(filePath)) return 75;
    if (/^(src\/)?(models|entities|db)\//i.test(filePath)) return 70;
    if (/^(src\/)?(components|views|pages)\//i.test(filePath)) return 60;

    return 50;
  },

  /**
   * Filter and categorize the full repository tree
   * @param {Array<object>} rawTree List of GitHub tree nodes { path, type, size, sha }
   * @returns {object} Categorized file collection and statistics
   */
  filterAndCategorize(rawTree = []) {
    const packageJsonFiles = [];
    const readmeFiles = [];
    const configFiles = [];
    const sourceFiles = [];
    const otherFiles = [];
    const ignoredFiles = [];

    for (const node of rawTree) {
      const { ignore, reason } = this.shouldIgnore(node);

      if (ignore) {
        ignoredFiles.push({
          path: node.path,
          size: node.size || 0,
          reason,
        });
        continue;
      }

      const category = this.classifyFile(node.path);
      const priority = this.calculatePriority(node.path, category);

      const fileItem = {
        path: node.path,
        size: node.size || 0,
        sha: node.sha,
        category,
        priority,
      };

      switch (category) {
        case 'package_json':
          packageJsonFiles.push(fileItem);
          break;
        case 'readme':
          readmeFiles.push(fileItem);
          break;
        case 'config':
          configFiles.push(fileItem);
          break;
        case 'source':
          sourceFiles.push(fileItem);
          break;
        default:
          otherFiles.push(fileItem);
          break;
      }
    }

    // Sort by priority desc, then path asc
    const sortByPriority = (a, b) => b.priority - a.priority || a.path.localeCompare(b.path);

    packageJsonFiles.sort(sortByPriority);
    readmeFiles.sort(sortByPriority);
    configFiles.sort(sortByPriority);
    sourceFiles.sort(sortByPriority);

    const totalDiscovered = rawTree.length;
    const totalIgnored = ignoredFiles.length;
    const totalExtracted =
      packageJsonFiles.length + readmeFiles.length + configFiles.length + sourceFiles.length + otherFiles.length;

    return {
      packageJsonFiles,
      readmeFiles,
      configFiles,
      sourceFiles,
      otherFiles,
      ignoredFiles,
      summary: {
        totalDiscovered,
        totalIgnored,
        totalExtracted,
        categoryCounts: {
          packageJson: packageJsonFiles.length,
          readme: readmeFiles.length,
          config: configFiles.length,
          source: sourceFiles.length,
          other: otherFiles.length,
          ignored: ignoredFiles.length,
        },
      },
    };
  },
};
