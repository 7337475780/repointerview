// ============================================================
// RepoInterview AI — Architecture Signal & Topological Graph Analyzer
// Generates conservative architecture signals and concrete graph nodes from verified evidence.
// ============================================================

import type {
  ArchitectureEdge,
  ArchitectureMap,
  ArchitectureNode,
  ArchitectureSignal,
  AuthenticationProfile,
  DatabaseProfile,
  DetectedTechnology,
  ExternalService,
  MonorepoProfile,
  ProjectStructure,
  RepositoryIngestionResult,
} from '../../types/domain.ts';
import { fileGraphAnalyzer } from './fileGraphAnalyzer.ts';

export const architectureAnalyzer = {
  analyze(
    ingestion: RepositoryIngestionResult,
    technologies: DetectedTechnology[],
    structure: ProjectStructure,
    database: DatabaseProfile,
    auth: AuthenticationProfile,
    externalServices: ExternalService[],
    monorepo?: MonorepoProfile
  ): { signals: ArchitectureSignal[]; architectureMap: ArchitectureMap } {
    const signals: ArchitectureSignal[] = [];

    // 1. Build concrete file-level dependency & import topology
    const { nodes: fileNodes, edges: fileEdges } = fileGraphAnalyzer.buildArchitectureGraph(ingestion);

    const nodeMap = new Map<string, ArchitectureNode>();
    for (const n of fileNodes) {
      nodeMap.set(n.id, { ...n });
    }

    const edgeMap = new Map<string, ArchitectureEdge>();
    for (const e of fileEdges) {
      const key = `${e.from}->${e.to}:${e.relationship}`;
      edgeMap.set(key, { ...e });
    }

    const dirPaths = new Set(structure.keyDirectories.map(d => d.path));
    const techNames = new Set(technologies.map(t => t.name));

    // 2. Enrich or connect Database / ORM if detected
    const hasDb = database.databaseTechnologies.length > 0 || database.ormTechnologies.length > 0 || database.hasSchema;
    if (hasDb) {
      const dbTechs = [
        ...database.databaseTechnologies.map(t => t.name),
        ...database.ormTechnologies.map(t => t.name),
      ];
      const dbEvidence = database.models.length > 0 ? [database.models[0].filePath] : ['schema.prisma'];

      if (nodeMap.has('database-layer')) {
        const existing = nodeMap.get('database-layer')!;
        existing.technologies = Array.from(new Set([...(existing.technologies || []), ...dbTechs]));
        existing.description = `Persistent data layer (${dbTechs.join(', ') || 'Database'}) with ${database.models.length} modeled schema(s)`;
      } else {
        nodeMap.set('database-layer', {
          id: 'database-layer',
          label: database.ormTechnologies.some(t => t.name === 'Prisma') ? 'Database (Prisma ORM)' : 'Relational / Document DB',
          type: 'database',
          x: 880,
          y: 340,
          description: `Persistent storage layer (${dbTechs.join(', ') || 'SQL Data Store'}) with ${database.models.length} modeled schema(s)`,
          technologies: dbTechs,
          evidenceFiles: dbEvidence,
          confidence: 0.95,
          confidenceLevel: 'high',
        });
      }

      // Link server/service to database if not already linked
      const sourceId = nodeMap.has('service-layer') ? 'service-layer' : nodeMap.has('server-core') ? 'server-core' : nodeMap.has('router-layer') ? 'router-layer' : null;
      if (sourceId && !edgeMap.has(`${sourceId}->database-layer:PERSISTS_TO`)) {
        edgeMap.set(`${sourceId}->database-layer:PERSISTS_TO`, {
          id: `${sourceId}-persists_to-database-layer`,
          from: sourceId,
          to: 'database-layer',
          source: sourceId,
          target: 'database-layer',
          relationship: 'PERSISTS_TO',
          protocol: 'SQL',
          direction: 'unidirectional',
          confidence: 0.95,
          confidenceLevel: 'high',
          description: `${sourceId} executes queries, transactions, and schema persistence`,
          evidence: `Database client integration backed by ${dbEvidence.join(', ')}`,
          evidenceFiles: dbEvidence,
        });
      }
    }

    // 3. Enrich or connect Auth if detected
    if (auth.detected) {
      const authEvidence = auth.evidence.map(e => e.filePath);
      if (nodeMap.has('auth-layer')) {
        const existing = nodeMap.get('auth-layer')!;
        existing.technologies = Array.from(new Set([...(existing.technologies || []), ...auth.providers, ...auth.strategies]));
      } else {
        nodeMap.set('auth-layer', {
          id: 'auth-layer',
          label: 'Authentication Guard',
          type: 'auth',
          x: 100,
          y: 340,
          description: `Security layer enforcing ${auth.strategies.join(', ') || 'Token/Session authentication'}`,
          technologies: auth.providers.length > 0 ? auth.providers : ['JWT'],
          evidenceFiles: authEvidence.slice(0, 3),
          confidence: auth.confidence || 0.95,
          confidenceLevel: auth.confidenceLevel || 'high',
        });
      }

      const targetServer = nodeMap.has('server-core') ? 'server-core' : nodeMap.has('router-layer') ? 'router-layer' : null;
      if (targetServer && !edgeMap.has(`${targetServer}->auth-layer:AUTHENTICATES_WITH`)) {
        edgeMap.set(`${targetServer}->auth-layer:AUTHENTICATES_WITH`, {
          id: `${targetServer}-authenticates_with-auth-layer`,
          from: targetServer,
          to: 'auth-layer',
          source: targetServer,
          target: 'auth-layer',
          relationship: 'AUTHENTICATES_WITH',
          protocol: 'Auth',
          direction: 'unidirectional',
          confidence: 0.95,
          confidenceLevel: 'high',
          description: `${targetServer} verifies bearer tokens and session security guards`,
          evidence: `Authentication verified via ${authEvidence.slice(0, 2).join(', ')}`,
          evidenceFiles: authEvidence.slice(0, 3),
        });
      }
    }

    // 4. Enrich or connect External Cloud Integrations if detected
    if (externalServices.length > 0) {
      const extEvidence = externalServices.flatMap(s => s.evidence.map(e => e.filePath));
      nodeMap.set('external-integrations', {
        id: 'external-integrations',
        label: 'External Cloud Integrations',
        type: 'external',
        x: 880,
        y: 500,
        description: `External APIs: ${externalServices.map(s => s.name).join(', ')}`,
        technologies: externalServices.map(s => s.name),
        evidenceFiles: extEvidence.slice(0, 3),
        confidence: 0.92,
        confidenceLevel: 'high',
      });

      const sourceId = nodeMap.has('service-layer') ? 'service-layer' : nodeMap.has('server-core') ? 'server-core' : null;
      if (sourceId) {
        edgeMap.set(`${sourceId}->external-integrations:CALLS`, {
          id: `${sourceId}-calls-external-integrations`,
          from: sourceId,
          to: 'external-integrations',
          source: sourceId,
          target: 'external-integrations',
          relationship: 'CALLS',
          protocol: 'HTTP',
          direction: 'unidirectional',
          confidence: 0.92,
          confidenceLevel: 'high',
          description: `${sourceId} communicates with outbound third-party SDKs`,
          evidence: `Outbound service usage in ${extEvidence.slice(0, 2).join(', ')}`,
          evidenceFiles: extEvidence.slice(0, 3),
        });
      }
    }

    // 5. Enrich Monorepo Workspaces if detected
    if (monorepo?.isMonorepo && monorepo.packages.length > 0) {
      const toolLabel = monorepo.tool || 'Workspace';
      nodeMap.set('monorepo-workspace', {
        id: 'monorepo-workspace',
        label: `${toolLabel}`,
        type: 'service',
        x: 100,
        y: 180,
        description: `Multi-package workspace managing ${monorepo.packages.length} package(s)`,
        technologies: monorepo.tool ? [monorepo.tool] : ['Workspaces'],
        evidenceFiles: monorepo.evidence.map(e => e.filePath),
        confidence: 0.96,
        confidenceLevel: 'high',
      });

      monorepo.packages.slice(0, 4).forEach((pkgPath, idx) => {
        const pkgName = pkgPath.split('/').pop() || pkgPath;
        const pkgId = `pkg-${pkgName.replace(/[^a-zA-Z0-9]/g, '-')}`;
        nodeMap.set(pkgId, {
          id: pkgId,
          label: pkgName,
          type: 'service',
          x: 360 + (idx % 2) * 260,
          y: 180 + Math.floor(idx / 2) * 160,
          description: `Internal workspace package: ${pkgPath}`,
          evidenceFiles: [`${pkgPath}/package.json`],
          confidence: 0.95,
          confidenceLevel: 'high',
        });

        edgeMap.set(`monorepo-workspace->${pkgId}:DEPENDS_ON`, {
          id: `monorepo-workspace-depends_on-${pkgId}`,
          from: 'monorepo-workspace',
          to: pkgId,
          source: 'monorepo-workspace',
          target: pkgId,
          relationship: 'DEPENDS_ON',
          protocol: 'Internal',
          direction: 'unidirectional',
          confidence: 0.95,
          confidenceLevel: 'high',
          description: `Workspace distributes and links package ${pkgName}`,
          evidence: `Workspace declaration at ${pkgPath}/package.json`,
          evidenceFiles: [`${pkgPath}/package.json`],
        });
      });
    }

    // 6. Architecture Signals
    if (nodeMap.has('server-core') && nodeMap.has('router-layer')) {
      signals.push({
        type: 'Application & Router Modular Dispatching',
        description: 'Explicit architectural separation between Server Application instantiation and HTTP Route dispatching.',
        confidence: 0.98,
        confidenceLevel: 'high',
        evidence: [
          { filePath: nodeMap.get('server-core')!.evidenceFiles![0] || 'server.js', evidenceType: 'import_statement', description: 'Application imports router layer' },
          { filePath: nodeMap.get('router-layer')!.evidenceFiles![0] || 'router.js', evidenceType: 'route_declaration', description: 'Router handles dispatching' },
        ],
      });
    }

    if (nodeMap.has('middleware-pipeline')) {
      signals.push({
        type: 'Layered Middleware Pipeline',
        description: 'Pre-routing request processing, payload parsing, and error-handling interceptors.',
        confidence: 0.96,
        confidenceLevel: 'high',
        evidence: [
          { filePath: nodeMap.get('middleware-pipeline')!.evidenceFiles![0] || 'middleware', evidenceType: 'code_usage', description: 'Middleware interceptor logic' },
        ],
      });
    }

    if (dirPaths.has('src/controllers') && dirPaths.has('src/services') && dirPaths.has('src/models')) {
      signals.push({
        type: 'Layered MVC Architecture',
        description: 'Distinct separation between Controllers (HTTP handlers), Services (Domain logic), and Models (Data definitions).',
        confidence: 0.92,
        confidenceLevel: 'high',
        evidence: [
          { filePath: 'src/controllers', evidenceType: 'directory_structure', description: 'Controllers folder' },
          { filePath: 'src/services', evidenceType: 'directory_structure', description: 'Services folder' },
          { filePath: 'src/models', evidenceType: 'directory_structure', description: 'Models folder' },
        ],
      });
    }

    if (hasDb && database.models.length > 0) {
      signals.push({
        type: 'Typed Schema Persistence Layer',
        description: `Strongly-typed data modeling with ${database.models.length} entity schemas.`,
        confidence: 0.95,
        confidenceLevel: 'high',
        evidence: [
          { filePath: database.models[0].filePath, evidenceType: 'schema_definition', description: 'Prisma schema file' },
        ],
      });
    }

    if (monorepo?.isMonorepo) {
      signals.push({
        type: 'Multi-Package Monorepo Architecture',
        description: `Organized as a multi-package workspace (${monorepo.tool || 'Workspaces'}) with independent module boundaries.`,
        confidence: 0.95,
        confidenceLevel: 'high',
        evidence: monorepo.evidence || [
          { filePath: 'package.json', evidenceType: 'directory_structure', description: 'Workspace declaration' },
        ],
      });
    }

    return {
      signals,
      architectureMap: {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeMap.values()),
        lastGeneratedAt: new Date().toISOString(),
      },
    };
  },
};
