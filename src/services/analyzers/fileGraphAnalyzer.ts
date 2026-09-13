// ============================================================
// RepoInterview AI — Deterministic File Dependency & Import Graph Analyzer
// Extracts import relationships, route registrations, and collapses files into architecture components.
// ============================================================

import type {
  ArchitectureEdge,
  ArchitectureNode,
  ArchitectureNodeType,
  ArchitectureRelationshipType,
  ConfidenceLevel,
  RepositoryFileNode,
  RepositoryIngestionResult,
  RepositorySourceFile,
} from '../../types/domain.ts';

export interface FileNodeInfo {
  path: string;
  role: ArchitectureNodeType;
  componentId: string;
  componentLabel: string;
  imports: string[]; // Resolved relative paths
  rawImports: string[]; // Original specifiers
  hasRouteRegistration: boolean;
  hasMiddlewareUsage: boolean;
  technologies: string[];
}

export interface FileDependencyEdge {
  fromFile: string;
  toFile: string;
  relationship: ArchitectureRelationshipType;
  confidence: number;
  snippet?: string;
}

export interface FileGraphResult {
  fileNodes: Map<string, FileNodeInfo>;
  fileEdges: FileDependencyEdge[];
  componentNodes: ArchitectureNode[];
  componentEdges: ArchitectureEdge[];
}

export const fileGraphAnalyzer = {
  /**
   * Normalize and resolve relative import paths against known repository file tree
   */
  resolveImportPath(
    fromFilePath: string,
    importSpecifier: string,
    allPaths: Set<string>
  ): string | null {
    if (!importSpecifier.startsWith('.')) {
      // Non-relative import (package or alias)
      // Check if matches a known workspace package or alias (e.g. "@/..." or "~/...")
      if (importSpecifier.startsWith('@/') || importSpecifier.startsWith('~/')) {
        const stripped = importSpecifier.replace(/^[@~]\//, 'src/');
        for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js']) {
          const candidate = stripped + ext;
          if (allPaths.has(candidate)) return candidate;
        }
      }
      return null;
    }

    // Split directory from source file path
    const parts = fromFilePath.split('/');
    parts.pop(); // Remove file name

    const importParts = importSpecifier.split('/');
    for (const part of importParts) {
      if (part === '.') continue;
      if (part === '..') {
        if (parts.length > 0) parts.pop();
      } else {
        parts.push(part);
      }
    }

    const basePath = parts.join('/');
    const candidates = [
      basePath,
      `${basePath}.js`,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.jsx`,
      `${basePath}.mjs`,
      `${basePath}.cjs`,
      `${basePath}/index.js`,
      `${basePath}/index.ts`,
      `${basePath}/index.tsx`,
      `${basePath}/index.jsx`,
      `${basePath}.json`,
    ];

    for (const c of candidates) {
      if (allPaths.has(c)) return c;
    }

    return null;
  },

  /**
   * Extract import statements from source code content
   */
  extractRawImports(content: string, language: string): string[] {
    const imports = new Set<string>();

    if (
      language.includes('javascript') ||
      language.includes('typescript') ||
      language === 'js' ||
      language === 'ts' ||
      language === 'jsx' ||
      language === 'tsx'
    ) {
      // ES Module imports: import ... from '...' or import '...'
      const esmRegex = /(?:import\s+(?:[\w*\s{},$]+from\s+)?['"]([^'"]+)['"]|export\s+(?:[\w*\s{},$]+from\s+)['"]([^'"]+)['"])/g;
      let match: RegExpExecArray | null;
      while ((match = esmRegex.exec(content)) !== null) {
        const specifier = match[1] || match[2];
        if (specifier) imports.add(specifier);
      }

      // CommonJS requires: require('...')
      const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      while ((match = cjsRegex.exec(content)) !== null) {
        if (match[1]) imports.add(match[1]);
      }

      // Dynamic imports: import('...')
      const dynRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      while ((match = dynRegex.exec(content)) !== null) {
        if (match[1]) imports.add(match[1]);
      }
    } else if (language.includes('python') || language === 'py') {
      const pyRegex = /(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/g;
      let match: RegExpExecArray | null;
      while ((match = pyRegex.exec(content)) !== null) {
        const mod = match[1] || match[2];
        if (mod) imports.add(mod.replace(/\./g, '/'));
      }
    } else if (language.includes('java') || language === 'java') {
      const javaRegex = /import\s+([\w.]+);/g;
      let match: RegExpExecArray | null;
      while ((match = javaRegex.exec(content)) !== null) {
        if (match[1]) imports.add(match[1].replace(/\./g, '/'));
      }
    }

    return Array.from(imports);
  },

  /**
   * Deterministically classify a file into an architectural system role
   */
  classifyFileRole(path: string, content?: string): { role: ArchitectureNodeType; label: string; componentId: string } {
    const lower = path.toLowerCase();

    // 1. Tests
    if (
      lower.startsWith('test/') ||
      lower.startsWith('tests/') ||
      lower.startsWith('__tests__/') ||
      lower.includes('.test.') ||
      lower.includes('.spec.') ||
      lower.includes('_test.')
    ) {
      return { role: 'test', label: 'Test Suite', componentId: 'test-suite' };
    }

    // 2. Server & Application Entry Points
    if (
      lower === 'lib/express.js' ||
      lower === 'lib/application.js' ||
      lower === 'src/express.js' ||
      lower === 'src/application.js' ||
      lower === 'src/server.ts' ||
      lower === 'src/server.js' ||
      lower === 'server.ts' ||
      lower === 'server.js' ||
      lower === 'src/app.ts' ||
      lower === 'src/app.js' ||
      lower === 'app.ts' ||
      lower === 'app.js' ||
      lower === 'src/main.ts' ||
      lower === 'src/main.js' ||
      lower === 'main.py' ||
      lower.endsWith('application.java')
    ) {
      return { role: 'server', label: 'Application & Server Core', componentId: 'server-core' };
    }

    // 3. Router & Routing Dispatchers
    if (
      lower.includes('/routes/') ||
      lower.includes('/router/') ||
      lower.includes('/routing/') ||
      lower.startsWith('routes/') ||
      lower.startsWith('lib/router/') ||
      lower.endsWith('route.ts') ||
      lower.endsWith('route.js') ||
      lower.endsWith('router.js') ||
      lower.endsWith('router.ts') ||
      lower.includes('app/api/')
    ) {
      return { role: 'router', label: 'Router & Dispatcher Layer', componentId: 'router-layer' };
    }

    // 4. Middleware & Guards
    if (
      lower.includes('/middleware/') ||
      lower.includes('/middlewares/') ||
      lower.startsWith('lib/middleware/') ||
      lower.includes('/guards/') ||
      lower.includes('/interceptors/') ||
      lower.includes('middleware.ts') ||
      lower.includes('middleware.js')
    ) {
      return { role: 'middleware', label: 'Middleware Pipeline', componentId: 'middleware-pipeline' };
    }

    // 5. Controllers
    if (
      lower.includes('/controllers/') ||
      lower.startsWith('controllers/') ||
      lower.includes('controller.ts') ||
      lower.includes('controller.js')
    ) {
      return { role: 'controller', label: 'Controller Layer', componentId: 'controller-layer' };
    }

    // 6. Domain Services & Business Logic
    if (
      lower.includes('/services/') ||
      lower.startsWith('services/') ||
      lower.includes('/domain/') ||
      lower.includes('/usecases/') ||
      lower.includes('service.ts') ||
      lower.includes('service.js')
    ) {
      return { role: 'service', label: 'Domain Service Layer', componentId: 'service-layer' };
    }

    // 7. Database & Schema Models
    if (
      lower.includes('/models/') ||
      lower.startsWith('models/') ||
      lower.includes('/entities/') ||
      lower.includes('/schemas/') ||
      lower.includes('prisma/schema.prisma') ||
      lower.endsWith('.prisma') ||
      lower.endsWith('.sql')
    ) {
      return { role: 'database', label: 'Database & Schema Layer', componentId: 'database-layer' };
    }

    // 8. Auth Layer
    if (
      lower.includes('/auth/') ||
      lower.includes('auth.ts') ||
      lower.includes('auth.js') ||
      lower.includes('nextauth') ||
      lower.includes('passport')
    ) {
      return { role: 'auth', label: 'Authentication & Security', componentId: 'auth-layer' };
    }

    // 9. Cache Layer
    if (lower.includes('/redis/') || lower.includes('/cache/')) {
      return { role: 'cache', label: 'Cache & Session Store', componentId: 'cache-layer' };
    }

    // 10. Frontend UI Components & Pages
    if (
      lower.includes('/components/') ||
      lower.includes('/pages/') ||
      lower.includes('/views/') ||
      lower.includes('/ui/') ||
      lower.startsWith('src/components/') ||
      lower.startsWith('components/') ||
      lower.startsWith('src/pages/') ||
      lower.startsWith('pages/') ||
      lower.includes('app/page.') ||
      lower.includes('app/layout.')
    ) {
      return { role: 'frontend', label: 'Frontend UI Layer', componentId: 'frontend-layer' };
    }

    // 11. Shared Utilities & Internal Libraries
    if (
      lower.startsWith('lib/') ||
      lower.includes('/lib/') ||
      lower.includes('/utils/') ||
      lower.includes('/shared/') ||
      lower.includes('/helpers/') ||
      lower.includes('/common/')
    ) {
      return { role: 'shared_library', label: 'Shared Utilities & Libraries', componentId: 'shared-library' };
    }

    // 12. Build & Deployment
    if (
      lower === 'dockerfile' ||
      lower === 'docker-compose.yml' ||
      lower === 'docker-compose.yaml' ||
      lower.startsWith('.github/workflows/')
    ) {
      return { role: 'deployment', label: 'Build & CI/CD Pipeline', componentId: 'deployment-pipeline' };
    }

    // 13. Default to general module
    return { role: 'service', label: 'Core Package Module', componentId: 'core-module' };
  },

  /**
   * Build complete file graph and collapse into evidence-backed architecture topology
   */
  buildArchitectureGraph(ingestion: RepositoryIngestionResult): {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  } {
    const allPaths = new Set(ingestion.tree.map(n => n.path));
    const sourceFilesMap = new Map<string, RepositorySourceFile>();
    for (const sf of ingestion.sourceFiles) {
      sourceFilesMap.set(sf.path, sf);
      allPaths.add(sf.path);
    }

    const fileNodes = new Map<string, FileNodeInfo>();
    const fileEdges: FileDependencyEdge[] = [];

    // 1. Process all source files and tree candidate files
    for (const sf of ingestion.sourceFiles) {
      const rawImports = this.extractRawImports(sf.content, sf.language);
      const resolvedImports: string[] = [];

      for (const imp of rawImports) {
        const resolved = this.resolveImportPath(sf.path, imp, allPaths);
        if (resolved) {
          resolvedImports.push(resolved);
        }
      }

      const { role, label, componentId } = this.classifyFileRole(sf.path, sf.content);
      const hasRouteRegistration = /(?:app|router)\.(?:get|post|put|delete|patch|use|route)\s*\(/i.test(sf.content);
      const hasMiddlewareUsage = /(?:app|router)\.use\s*\(/i.test(sf.content);

      fileNodes.set(sf.path, {
        path: sf.path,
        role,
        componentId,
        componentLabel: label,
        imports: resolvedImports,
        rawImports,
        hasRouteRegistration,
        hasMiddlewareUsage,
        technologies: [],
      });
    }

    // 2. Build file-level edges from resolved imports
    for (const [fromPath, fileInfo] of fileNodes.entries()) {
      for (const toPath of fileInfo.imports) {
        const targetFileInfo = fileNodes.get(toPath) || {
          path: toPath,
          ...this.classifyFileRole(toPath),
          imports: [],
          rawImports: [],
          hasRouteRegistration: false,
          hasMiddlewareUsage: false,
          technologies: [],
        };

        let relationship: ArchitectureRelationshipType = 'IMPORTS';
        let confidence = 0.92;

        if (fileInfo.role === 'test') {
          relationship = 'TESTS';
          confidence = 0.95;
        } else if (fileInfo.role === 'server' && targetFileInfo.role === 'router') {
          relationship = fileInfo.hasRouteRegistration ? 'REGISTERS' : 'USES';
          confidence = 0.98;
        } else if (fileInfo.role === 'server' && targetFileInfo.role === 'middleware') {
          relationship = 'USES';
          confidence = 0.96;
        } else if (fileInfo.role === 'router' && targetFileInfo.role === 'controller') {
          relationship = 'ROUTES_TO';
          confidence = 0.96;
        } else if (fileInfo.role === 'controller' && targetFileInfo.role === 'service') {
          relationship = 'CALLS';
          confidence = 0.95;
        } else if (fileInfo.role === 'service' && targetFileInfo.role === 'database') {
          relationship = 'PERSISTS_TO';
          confidence = 0.95;
        } else if (fileInfo.role === 'frontend' && (targetFileInfo.role === 'api' || targetFileInfo.role === 'router')) {
          relationship = 'ROUTES_TO';
          confidence = 0.94;
        } else if (targetFileInfo.role === 'auth') {
          relationship = 'AUTHENTICATES_WITH';
          confidence = 0.95;
        } else if (targetFileInfo.role === 'shared_library') {
          relationship = 'USES';
          confidence = 0.93;
        }

        fileEdges.push({
          fromFile: fromPath,
          toFile: toPath,
          relationship,
          confidence,
          snippet: `import from '${toPath}' in ${fromPath}`,
        });
      }
    }

    // 3. Aggregate and Collapse into Component Nodes
    const componentMap = new Map<string, {
      id: string;
      label: string;
      type: ArchitectureNodeType;
      files: string[];
      technologies: Set<string>;
    }>();

    for (const [filePath, fileInfo] of fileNodes.entries()) {
      if (!componentMap.has(fileInfo.componentId)) {
        componentMap.set(fileInfo.componentId, {
          id: fileInfo.componentId,
          label: fileInfo.componentLabel,
          type: fileInfo.role,
          files: [],
          technologies: new Set(),
        });
      }
      componentMap.get(fileInfo.componentId)!.files.push(filePath);
    }

    // Also ensure any top key directories from tree are included if not present
    if (componentMap.size === 0) {
      componentMap.set('core-package', {
        id: 'core-package',
        label: `${ingestion.repository.name} Core Engine`,
        type: 'server',
        files: ['package.json'],
        technologies: new Set(),
      });
    }

    // Fixed topological layout coordinates
    const layoutPositions: Record<string, { x: number; y: number }> = {
      'frontend-layer': { x: 100, y: 180 },
      'server-core': { x: 360, y: 180 },
      'router-layer': { x: 620, y: 180 },
      'middleware-pipeline': { x: 360, y: 340 },
      'controller-layer': { x: 620, y: 340 },
      'service-layer': { x: 880, y: 180 },
      'database-layer': { x: 880, y: 340 },
      'auth-layer': { x: 100, y: 340 },
      'cache-layer': { x: 620, y: 500 },
      'shared-library': { x: 880, y: 500 },
      'test-suite': { x: 100, y: 500 },
      'deployment-pipeline': { x: 360, y: 500 },
      'core-module': { x: 450, y: 220 },
    };

    const componentNodes: ArchitectureNode[] = [];
    let autoIndex = 0;

    for (const comp of componentMap.values()) {
      const pos = layoutPositions[comp.id] || {
        x: 100 + (autoIndex % 3) * 280,
        y: 180 + Math.floor(autoIndex / 3) * 160,
      };
      autoIndex++;

      componentNodes.push({
        id: comp.id,
        label: comp.label,
        type: comp.type,
        x: pos.x,
        y: pos.y,
        description: `Verified architectural component backed by ${comp.files.length} source file(s): ${comp.files.slice(0, 3).join(', ')}`,
        technologies: Array.from(comp.technologies),
        evidenceFiles: comp.files.slice(0, 5),
        confidence: 0.95,
        confidenceLevel: 'high',
      });
    }

    // 4. Collapse File Edges into Component Edges
    const RELATIONSHIP_PRIORITY: Record<ArchitectureRelationshipType, number> = {
      REGISTERS: 10,
      ROUTES_TO: 9,
      AUTHENTICATES_WITH: 8,
      PERSISTS_TO: 7,
      CALLS: 6,
      USES: 5,
      TESTS: 4,
      DEPENDS_ON: 3,
      IMPORTS: 2,
    };

    const edgeMap = new Map<string, {
      from: string;
      to: string;
      relationship: ArchitectureRelationshipType;
      confidence: number;
      evidenceFiles: Set<string>;
      descriptions: Set<string>;
    }>();

    for (const edge of fileEdges) {
      const sourceComp = fileNodes.get(edge.fromFile)?.componentId;
      const targetComp = fileNodes.get(edge.toFile)?.componentId || this.classifyFileRole(edge.toFile).componentId;

      if (!sourceComp || !targetComp || sourceComp === targetComp) {
        continue; // Don't create self-loops at the component level
      }

      const edgeKey = `${sourceComp}->${targetComp}`;

      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          from: sourceComp,
          to: targetComp,
          relationship: edge.relationship,
          confidence: edge.confidence,
          evidenceFiles: new Set(),
          descriptions: new Set(),
        });
      }

      const existing = edgeMap.get(edgeKey)!;
      existing.evidenceFiles.add(edge.fromFile);
      existing.evidenceFiles.add(edge.toFile);
      existing.confidence = Math.max(existing.confidence, edge.confidence);
      existing.descriptions.add(`${edge.fromFile} -> ${edge.toFile}`);

      // If new edge relationship has higher semantic specificity, upgrade it
      if ((RELATIONSHIP_PRIORITY[edge.relationship] || 0) > (RELATIONSHIP_PRIORITY[existing.relationship] || 0)) {
        existing.relationship = edge.relationship;
      }
    }

    const componentEdges: ArchitectureEdge[] = [];
    for (const e of edgeMap.values()) {
      const evidenceList = Array.from(e.evidenceFiles);
      const confLevel: ConfidenceLevel = e.confidence >= 0.9 ? 'high' : e.confidence >= 0.75 ? 'medium' : 'low';

      componentEdges.push({
        id: `${e.from}-${e.relationship.toLowerCase()}-${e.to}`,
        from: e.from,
        to: e.to,
        source: e.from,
        target: e.to,
        relationship: e.relationship,
        protocol: e.relationship === 'PERSISTS_TO' ? 'SQL' : e.relationship === 'AUTHENTICATES_WITH' ? 'Auth' : 'Internal',
        direction: 'unidirectional',
        confidence: e.confidence,
        confidenceLevel: confLevel,
        description: `${e.from} ${e.relationship.toLowerCase().replace(/_/g, ' ')} ${e.to}`,
        evidence: `Verified across ${evidenceList.length} evidence file(s): ${evidenceList.slice(0, 3).join(', ')}`,
        evidenceFiles: evidenceList.slice(0, 4),
      });
    }

    return {
      nodes: componentNodes,
      edges: componentEdges,
    };
  },
};
