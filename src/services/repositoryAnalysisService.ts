// ============================================================
// RepoInterview AI — Repository Intelligence Engine (Master Service)
// Pure deterministic analysis. Zero LLM, zero network calls, 100% evidence-backed.
// ============================================================

import type {
  AnalysisWarning,
  RepositoryIngestionResult,
  RepositoryIntelligence,
} from '../types/domain.ts';
import { technologyAnalyzer } from './analyzers/technologyAnalyzer.ts';
import { languageAnalyzer } from './analyzers/languageAnalyzer.ts';
import { dependencyAnalyzer } from './analyzers/dependencyAnalyzer.ts';
import { structureAnalyzer } from './analyzers/structureAnalyzer.ts';
import { entryPointAnalyzer } from './analyzers/entryPointAnalyzer.ts';
import { apiAnalyzer } from './analyzers/apiAnalyzer.ts';
import { databaseAnalyzer } from './analyzers/databaseAnalyzer.ts';
import { authAnalyzer } from './analyzers/authAnalyzer.ts';
import { externalServiceAnalyzer } from './analyzers/externalServiceAnalyzer.ts';
import { deploymentAnalyzer } from './analyzers/deploymentAnalyzer.ts';
import { monorepoAnalyzer } from './analyzers/monorepoAnalyzer.ts';
import { architectureAnalyzer } from './analyzers/architectureAnalyzer.ts';
import { importantFilesAnalyzer } from './analyzers/importantFilesAnalyzer.ts';

export const repositoryAnalysisService = {
  /**
   * Run deterministic intelligence analysis over the ingested repository data.
   */
  analyzeRepository(ingestion: RepositoryIngestionResult): RepositoryIntelligence {
    const startTime = Date.now();

    // 1. Language & Technology Profiling
    const languages = languageAnalyzer.analyze(ingestion);
    const technologies = technologyAnalyzer.analyze(ingestion);
    const dependencies = dependencyAnalyzer.analyze(ingestion);

    // 2. Project Structure & Entry Points
    const structure = structureAnalyzer.analyze(ingestion);
    const entryPoints = entryPointAnalyzer.analyze(ingestion);

    // 3. API Surface & Database
    const apiSurface = apiAnalyzer.analyze(ingestion);
    const database = databaseAnalyzer.analyze(ingestion, technologies);

    // 4. Auth & External Integrations
    const authentication = authAnalyzer.analyze(ingestion);
    const externalServices = externalServiceAnalyzer.analyze(ingestion);
    const deployment = deploymentAnalyzer.analyze(ingestion);
    const monorepo = monorepoAnalyzer.analyze(ingestion);

    // 5. Architecture Graph & Signals
    const { signals: architectureSignals, architectureMap } = architectureAnalyzer.analyze(
      ingestion,
      technologies,
      structure,
      database,
      authentication,
      externalServices,
      monorepo
    );

    // 6. Important Files Ranking
    const importantFiles = importantFilesAnalyzer.analyze(ingestion);

    // 7. Analysis Warnings & Uncertainties
    const warnings: AnalysisWarning[] = [];

    if (!database.hasSchema && database.databaseTechnologies.length > 0) {
      warnings.push({
        type: 'UNRESOLVED_DATABASE_SCHEMA',
        message: 'Database technology detected via dependencies, but no explicit schema file (e.g. Prisma/SQL) was found in candidate files.',
        severity: 'info',
      });
    }

    if (!authentication.detected) {
      warnings.push({
        type: 'NO_AUTH_DETECTED',
        message: 'No standardized authentication libraries (NextAuth, JWT, Passport, Clerk) were identified.',
        severity: 'info',
      });
    }

    if (ingestion.warnings && ingestion.warnings.length > 0) {
      warnings.push({
        type: 'INGESTION_BUDGET_SKIPPED',
        message: `${ingestion.warnings.length} file(s) exceeded the ingestion size limit and were not analyzed in source content.`,
        severity: 'warning',
      });
    }

    const durationMs = Date.now() - startTime;

    return {
      identity: ingestion.identity,
      repository: ingestion.repository,
      technologies,
      languages,
      dependencies,
      structure,
      entryPoints,
      apiSurface,
      database,
      authentication,
      externalServices,
      deployment,
      architectureSignals,
      monorepo,
      importantFiles,
      warnings,
      metadata: {
        analyzedAt: new Date().toISOString(),
        durationMs,
        analyzerVersion: '3.0.0-deterministic',
        filesScanned: ingestion.sourceFiles.length,
      },
      architectureMap,
    };
  },
};
