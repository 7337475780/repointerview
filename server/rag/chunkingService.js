// ============================================================
// RepoInterview AI — Code-Aware Document Chunking Service
// Splits source code and markdown into semantically coherent
// chunks with line-range tracking, symbol extraction, and metadata.
// ============================================================

import { config } from '../config/config.js';

export const chunkingService = {
  /**
   * Chunk a single file content into semantically rich chunks
   * @param {object} file { path, content, category, size }
   * @param {string} repositoryId Identifier for the repository
   * @param {object} [options={}]
   * @returns {Array<object>} List of chunk objects
   */
  chunkFile(file, repositoryId = 'default-repo', options = {}) {
    if (!file || !file.content || typeof file.content !== 'string') {
      return [];
    }

    const filePath = file.path;
    const content = file.content;
    const lines = content.split('\n');
    const chunkSize = options.chunkSize || config.rag.chunkSize;
    const chunkOverlap = options.chunkOverlap || config.rag.chunkOverlap;

    const chunks = [];
    let currentChunkLines = [];
    let currentChunkCharCount = 0;
    let startLine = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLength = line.length + 1; // +1 for newline

      // Check if adding this line exceeds the chunk size
      if (currentChunkCharCount + lineLength > chunkSize && currentChunkLines.length > 0) {
        const chunkText = currentChunkLines.join('\n');
        const endLine = startLine + currentChunkLines.length - 1;

        chunks.push(
          this.createChunkObject({
            repositoryId,
            filePath,
            content: chunkText,
            startLine,
            endLine,
            chunkIndex: chunks.length,
            fileCategory: file.category || 'source',
          })
        );

        // Slide window by overlapping lines
        const overlapLines = this.calculateOverlapLines(currentChunkLines, chunkOverlap);
        startLine = endLine - overlapLines.length + 1;
        currentChunkLines = [...overlapLines, line];
        currentChunkCharCount = currentChunkLines.reduce((acc, l) => acc + l.length + 1, 0);
      } else {
        currentChunkLines.push(line);
        currentChunkCharCount += lineLength;
      }
    }

    // Flush any remaining lines
    if (currentChunkLines.length > 0) {
      const chunkText = currentChunkLines.join('\n');
      const endLine = startLine + currentChunkLines.length - 1;

      chunks.push(
        this.createChunkObject({
          repositoryId,
          filePath,
          content: chunkText,
          startLine,
          endLine,
          chunkIndex: chunks.length,
          fileCategory: file.category || 'source',
        })
      );
    }

    return chunks;
  },

  /**
   * Chunk an entire repository collection of files
   * @param {Array<object>} files List of extracted files
   * @param {string} repositoryId
   * @returns {Array<object>} Array of all chunks
   */
  chunkRepository(files = [], repositoryId = 'default-repo', options = {}) {
    const allChunks = [];

    for (const file of files) {
      const fileChunks = this.chunkFile(file, repositoryId, options);
      allChunks.push(...fileChunks);
    }

    return allChunks;
  },

  /**
   * Helper to calculate overlap lines preserving line boundaries
   */
  calculateOverlapLines(lines, targetOverlapChars) {
    const overlap = [];
    let count = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (count + line.length > targetOverlapChars && overlap.length > 0) {
        break;
      }
      overlap.unshift(line);
      count += line.length + 1;
    }

    return overlap;
  },

  /**
   * Construct standard chunk document schema
   */
  createChunkObject({ repositoryId, filePath, content, startLine, endLine, chunkIndex, fileCategory }) {
    const chunkId = `${repositoryId}:${filePath}:${startLine}-${endLine}`;
    const detectedSymbols = this.extractCodeSymbols(content, filePath);

    return {
      chunkId,
      repositoryId,
      filePath,
      startLine,
      endLine,
      lineCount: endLine - startLine + 1,
      charCount: content.length,
      content,
      fileCategory,
      symbols: detectedSymbols,
      header: `// File: ${filePath} (Lines ${startLine}-${endLine})`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Extract key declared functions, classes, routes, or models in chunk
   */
  extractCodeSymbols(content, filePath) {
    const symbols = [];

    // Functions: function foo(), const foo = () =>, def foo():
    const fnRegex = /(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+([a-zA-Z0-9_]+)\s*\()/g;
    let match;
    while ((match = fnRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3];
      if (name && !symbols.includes(name)) symbols.push(`fn:${name}`);
    }

    // Classes / Interfaces / Models
    const classRegex = /(?:class|interface|type|model)\s+([a-zA-Z0-9_$]+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      if (match[1] && !symbols.includes(match[1])) symbols.push(`class:${match[1]}`);
    }

    // Routes
    const routeRegex = /(?:app|router)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    while ((match = routeRegex.exec(content)) !== null) {
      symbols.push(`route:${match[1].toUpperCase()} ${match[2]}`);
    }

    return symbols.slice(0, 8);
  },
};
