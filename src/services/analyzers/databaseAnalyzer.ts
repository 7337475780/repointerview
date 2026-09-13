// ============================================================
// RepoInterview AI — Database & Schema Profile Analyzer
// Extracts database engines, ORMs, cache layers, and structured Prisma schemas.
// ============================================================

import type {
  DatabaseProfile,
  DetectedTechnology,
  RepositoryIngestionResult,
  SchemaModel,
  SchemaField,
} from '../../types/domain.ts';

const PRISMA_MODEL_REGEX = /model\s+([A-Za-z0-9_]+)\s*\{([^}]+)\}/g;

export const databaseAnalyzer = {
  analyze(
    ingestion: RepositoryIngestionResult,
    technologies: DetectedTechnology[]
  ): DatabaseProfile {
    const databaseTechnologies = technologies.filter(t => t.category === 'database');
    const ormTechnologies = technologies.filter(t => t.category === 'orm');
    const cacheTechnologies = technologies.filter(t => t.category === 'cache');

    const models: SchemaModel[] = [];

    // Parse Prisma schema files
    const prismaFiles = ingestion.sourceFiles.filter(f => f.path.endsWith('.prisma'));

    for (const file of prismaFiles) {
      let modelMatch: RegExpExecArray | null;
      while ((modelMatch = PRISMA_MODEL_REGEX.exec(file.content)) !== null) {
        const modelName = modelMatch[1];
        const body = modelMatch[2];

        const fields: SchemaField[] = [];
        const lines = body.split('\n');

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith('//') || line.startsWith('@@')) continue;

          const tokens = line.split(/\s+/);
          if (tokens.length >= 2) {
            const fieldName = tokens[0];
            const fieldType = tokens[1];
            const isId = line.includes('@id');
            const isOptional = fieldType.endsWith('?');
            const isList = fieldType.endsWith('[]');

            fields.push({
              name: fieldName,
              type: fieldType,
              isId,
              isOptional,
              isList,
            });
          }
        }

        models.push({
          name: modelName,
          filePath: file.path,
          fields,
          relationsCount: fields.filter(f => f.isList || f.type.charAt(0) === f.type.charAt(0).toUpperCase()).length,
        });
      }
    }

    return {
      databaseTechnologies,
      ormTechnologies,
      cacheTechnologies,
      models,
      hasSchema: models.length > 0 || prismaFiles.length > 0,
    };
  },
};
