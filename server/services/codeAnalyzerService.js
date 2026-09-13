// ============================================================
// RepoInterview AI — Master Code Analyzer & Repository Understanding Engine
// Analyzes extracted repository files and synthesizes:
// 1. Programming languages
// 2. Frameworks
// 3. Libraries
// 4. Database technologies
// 5. Authentication methods
// 6. Project architecture
// 7. Important modules
// 8. API structure
// & Generates formatted Project Summary
// ============================================================

import { technologyDetector } from './technologyDetector.js';
import { architectureExtractor } from './architectureExtractor.js';

export const codeAnalyzerService = {
  /**
   * Run full code analysis on extracted repository files
   * @param {object} repositoryMetadata Basic repository info { name, fullName, description, ... }
   * @param {Array<object>} files Extracted files with path and content
   * @param {Array<object>} [allTreeNodes=[]] Full list of discovered repository nodes
   * @returns {object} Comprehensive repository understanding object & formatted summary
   */
  analyzeRepositoryFiles(repositoryMetadata = {}, files = [], allTreeNodes = []) {
    const projectName = repositoryMetadata.name || repositoryMetadata.fullName || 'Repository Project';
    const effectiveFiles = files && files.length > 0 ? files : allTreeNodes;

    // 1-5. Technology Detection (Languages, Frameworks, Databases, Auth, Libraries)
    const techProfile = technologyDetector.analyze(effectiveFiles);

    // 6. Project Architecture Extraction
    const architecture = architectureExtractor.extractArchitecturePattern(
      allTreeNodes.length > 0 ? allTreeNodes : effectiveFiles,
      techProfile
    );

    // 7. Important Modules Identification
    const importantModules = architectureExtractor.extractImportantModules(effectiveFiles);

    // 8. API Structure & Endpoints Extraction
    const apiStructure = architectureExtractor.extractApiStructure(effectiveFiles);

    // Format Project Summary
    const summary = this.generateProjectSummary({
      projectName,
      techProfile,
      architecture,
      importantModules,
      apiStructure,
    });

    return {
      project: {
        name: projectName,
        fullName: repositoryMetadata.fullName || projectName,
        description: repositoryMetadata.description || '',
      },
      summary,
      analysis: {
        languages: techProfile.languages,
        frameworks: techProfile.frameworks,
        libraries: techProfile.libraries,
        databases: techProfile.databases,
        authentication: techProfile.authentication,
        architecture,
        importantModules,
        apiStructure,
      },
    };
  },

  /**
   * Generate clean structured and formatted text Project Summary
   */
  generateProjectSummary({ projectName, techProfile, architecture, importantModules, apiStructure }) {
    const frontend = techProfile.frameworks.primaryFrontend || (techProfile.languages.primary === 'HTML' ? 'Vanilla Web' : 'None / Internal');
    const backend = techProfile.frameworks.primaryBackend || (techProfile.frameworks.primaryFrontend === 'Next.js' ? 'Next.js API Routes' : 'None / Client-side');
    
    let database = techProfile.databases.primaryDatabase || 'None / External API';
    if (techProfile.databases.primaryOrm) {
      database = `${database} (${techProfile.databases.primaryOrm})`;
    }

    const authentication = techProfile.authentication.primaryMethod !== 'None / Custom'
      ? `${techProfile.authentication.primaryMethod} (${techProfile.authentication.primaryName})`
      : 'None Detected';

    // Formatted multi-line text representation matching the requested specification
    const textFormatted = [
      `Project:\n${projectName}`,
      `\nFrontend:\n${frontend}`,
      `\nBackend:\n${backend}`,
      `\nDatabase:\n${database}`,
      `\nAuthentication:\n${techProfile.authentication.primaryName || 'None'}`,
      `\nArchitecture:\n${architecture.pattern}`,
    ].join('\n');

    return {
      projectName,
      frontend,
      backend,
      database,
      authentication: techProfile.authentication.primaryName || 'None',
      authenticationMethod: techProfile.authentication.primaryMethod,
      architecturePattern: architecture.pattern,
      primaryLanguage: techProfile.languages.primary,
      totalEndpoints: apiStructure.endpointsCount,
      totalImportantModules: importantModules.length,
      textFormatted,
    };
  },
};
