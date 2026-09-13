// ============================================================
// RepoInterview AI — Architecture & API Structure Extractor
// Identifies:
// 1. Overall Project Architecture Pattern
// 2. Important Modules & Roles
// 3. API Structure & Endpoints (REST, GraphQL, tRPC, RPC)
// ============================================================

export const architectureExtractor = {
  /**
   * Determine project architecture pattern from folder structure and tech stack
   * @param {Array<object>} files
   * @param {object} techProfile
   * @returns {object} { pattern: string, confidence: number, description: string, traits: string[] }
   */
  extractArchitecturePattern(files = [], techProfile = {}) {
    const paths = files.map(f => (typeof f === 'string' ? f : f.path || '').toLowerCase());
    const traits = [];

    const hasClientFolder = paths.some(p => p.startsWith('client/') || p.startsWith('frontend/') || p.startsWith('web/') || p.startsWith('apps/web'));
    const hasServerFolder = paths.some(p => p.startsWith('server/') || p.startsWith('backend/') || p.startsWith('api/') || p.startsWith('apps/api'));
    const hasPackagesFolder = paths.some(p => p.startsWith('packages/') || p.startsWith('apps/'));
    const hasAppRouter = paths.some(p => p.startsWith('app/') || p.startsWith('src/app/'));
    const hasPagesRouter = paths.some(p => p.startsWith('pages/') || p.startsWith('src/pages/'));
    const hasControllers = paths.some(p => p.includes('controllers/') || p.includes('handlers/'));
    const hasServices = paths.some(p => p.includes('services/'));
    const hasModels = paths.some(p => p.includes('models/') || p.includes('entities/') || p.includes('schema/'));
    const hasRoutes = paths.some(p => p.includes('routes/') || p.includes('routers/'));

    // Monorepo
    if (hasPackagesFolder || paths.some(p => p === 'turbo.json' || p === 'pnpm-workspace.yaml' || p === 'lerna.json')) {
      traits.push('Monorepo workspace organization');
      return {
        pattern: 'Monorepo Workspace Architecture',
        confidence: 0.95,
        description: 'Multi-package repository with shared packages, libraries, and distinct application workspaces.',
        traits,
      };
    }

    // Client-Server Separation
    if (hasClientFolder && hasServerFolder) {
      traits.push('Distinct client/frontend and server/backend codebases');
      return {
        pattern: 'Client-Server Separation',
        confidence: 0.95,
        description: 'Decoupled frontend client and backend API server living in dedicated directories.',
        traits,
      };
    }

    // Fullstack Next.js App / Pages Router
    if (techProfile.frameworks?.primaryFrontend === 'Next.js' || hasAppRouter) {
      traits.push(hasAppRouter ? 'Next.js App Router structure' : 'Next.js Pages Router structure');
      if (paths.some(p => p.includes('/api/'))) {
        traits.push('Colocated Serverless API Route Handlers');
      }
      return {
        pattern: 'Fullstack Next.js Application Architecture',
        confidence: 0.92,
        description: 'Unified React server and client components with integrated API routes and server actions.',
        traits,
      };
    }

    // Layered MVC / 3-Tier Architecture
    if ((hasControllers || hasRoutes) && (hasServices || hasModels)) {
      traits.push('Layered separation: Routes -> Controllers -> Services -> Data Models');
      return {
        pattern: 'Layered MVC / 3-Tier Backend Architecture',
        confidence: 0.9,
        description: 'Structured separation of concerns separating HTTP routing, business logic services, and persistence models.',
        traits,
      };
    }

    // Single Page Application (SPA)
    if (techProfile.frameworks?.primaryFrontend && !techProfile.frameworks?.primaryBackend) {
      traits.push('Client-side rendered Single Page Application');
      return {
        pattern: 'Single Page Application (SPA)',
        confidence: 0.85,
        description: 'Client-side rendered web application interfacing with external APIs or cloud backends.',
        traits,
      };
    }

    // Modular Backend Service
    if (techProfile.frameworks?.primaryBackend) {
      traits.push('Backend HTTP / Microservice');
      return {
        pattern: 'Modular REST / Microservice Backend',
        confidence: 0.85,
        description: 'Standalone backend application exposing HTTP endpoints and data services.',
        traits,
      };
    }

    return {
      pattern: 'Modular Application Architecture',
      confidence: 0.75,
      description: 'Standard modular application code structure.',
      traits: ['Component/Module based structure'],
    };
  },

  /**
   * Identify Important Modules & Key Files across the codebase
   * @param {Array<object>} files
   * @returns {Array<object>} List of important modules
   */
  extractImportantModules(files = []) {
    const modules = [];
    const seenPaths = new Set();

    const addModule = (filePath, name, role, description, priority = 50) => {
      if (!filePath || seenPaths.has(filePath)) return;
      seenPaths.add(filePath);
      modules.push({
        path: filePath,
        name,
        role,
        description,
        priority,
      });
    };

    for (const file of files) {
      const p = (file.path || '').toLowerCase();

      // 1. Entry Points
      if (/^(src\/)?(server|index|main|app)\.(ts|js|mjs|py|go)$/i.test(p)) {
        addModule(file.path, 'Main Entry Point', 'Entry Point', 'Initializes application runtime, configuration, and server listeners.', 100);
      }
      if (p === 'app/layout.tsx' || p === 'app/layout.jsx' || p === 'src/app/layout.tsx' || p === 'src/main.jsx' || p === 'src/main.tsx') {
        addModule(file.path, 'Root UI Shell', 'UI Entry Point', 'Defines the global application layout, context providers, and theme tree.', 95);
      }

      // 2. Authentication Module
      if (p.includes('auth') && (p.includes('router') || p.includes('controller') || p.includes('service') || p.includes('config') || p.endsWith('.ts') || p.endsWith('.js'))) {
        addModule(file.path, 'Authentication Module', 'Security & Auth', 'Manages credentials, JWT token generation, OAuth callbacks, and security middleware.', 90);
      }

      // 3. Database Schema / Connection
      if (p.endsWith('schema.prisma') || p.includes('db.') || p.includes('database.') || p.includes('connection.') || p.includes('models/')) {
        addModule(file.path, 'Database Layer', 'Data & Persistence', 'Defines data models, ORM entities, migrations, and database connection pooling.', 85);
      }

      // 4. API Router / Dispatcher
      if (p.includes('routes/') || p.includes('router/') || p.includes('api/') || p.includes('handlers/')) {
        addModule(file.path, 'API Route Controller', 'Routing & Transport', 'Dispatches incoming HTTP requests to corresponding controller actions.', 80);
      }

      // 5. Business Logic Services
      if (p.includes('services/') || p.includes('usecases/')) {
        addModule(file.path, 'Core Business Service', 'Business Domain Logic', 'Contains core business rules, transactional workflows, and external integrations.', 75);
      }

      // 6. UI Components & Design System
      if (p.includes('components/layout') || p.includes('components/ui') || p.includes('components/common')) {
        addModule(file.path, 'UI Component Module', 'Presentation Layer', 'Reusable UI components and design system building blocks.', 60);
      }
    }

    return modules.sort((a, b) => b.priority - a.priority);
  },

  /**
   * Extract API structure and endpoints from source code files
   * @param {Array<object>} files
   * @returns {object} { type: string, endpointsCount: number, endpoints: Array<{ method: string, path: string, file: string }> }
   */
  extractApiStructure(files = []) {
    const endpoints = [];
    const seen = new Set();

    const addEndpoint = (method, path, file, handler = '') => {
      const key = `${method}:${path}`;
      if (seen.has(key)) return;
      seen.add(key);
      endpoints.push({
        method: method.toUpperCase(),
        path: path.startsWith('/') ? path : `/${path}`,
        file,
        handler: handler || 'anonymousHandler',
      });
    };

    for (const file of files) {
      if (!file.content) continue;
      const content = file.content;
      const filePath = file.path;

      // 1. Express / Fastify / Koa Route patterns: app.get('/users', ...), router.post('/login', ...)
      const restRegex = /(?:app|router)\s*\.\s*(get|post|put|delete|patch|options|head)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
      let match;
      while ((match = restRegex.exec(content)) !== null) {
        addEndpoint(match[1], match[2], filePath);
      }

      // 2. Next.js App Router route.ts / route.js functions (export async function GET(req)...)
      if (filePath.includes('/api/') || filePath.includes('app/') || filePath.includes('src/app/')) {
        const nextAppRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD)\s*\(/g;
        let nextMatch;
        while ((nextMatch = nextAppRegex.exec(content)) !== null) {
          // Derive path from file path: app/api/users/route.ts -> /api/users
          let derivedPath = filePath
            .replace(/^src\//, '')
            .replace(/^app\//, '/')
            .replace(/\/route\.(ts|js)$/, '');
          if (!derivedPath.startsWith('/')) derivedPath = `/${derivedPath}`;
          addEndpoint(nextMatch[1], derivedPath, filePath);
        }
      }

      // 3. Flask / FastAPI Python route decorators: @app.get("/users"), @router.post("/auth")
      const pyRouteRegex = /@(?:app|router|blueprint)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi;
      let pyMatch;
      while ((pyMatch = pyRouteRegex.exec(content)) !== null) {
        addEndpoint(pyMatch[1], pyMatch[2], filePath);
      }

      // 4. tRPC Procedure patterns: procedure.query(...), procedure.mutation(...)
      const trpcRegex = /([a-zA-Z0-9_]+)\s*:\s*(?:publicProcedure|protectedProcedure)\s*\.\s*(query|mutation)/g;
      let trpcMatch;
      while ((trpcMatch = trpcRegex.exec(content)) !== null) {
        addEndpoint('tRPC ' + trpcMatch[2].toUpperCase(), `trpc.${trpcMatch[1]}`, filePath);
      }
    }

    let apiType = 'REST API';
    if (endpoints.some(e => e.method.startsWith('tRPC'))) {
      apiType = 'tRPC TypeSafe API';
    } else if (files.some(f => (f.path || '').includes('graphql') || (f.path || '').endsWith('.gql'))) {
      apiType = 'GraphQL API';
    } else if (endpoints.length === 0) {
      apiType = 'Internal / Client-only';
    }

    return {
      type: apiType,
      endpointsCount: endpoints.length,
      sampleEndpoints: endpoints.slice(0, 10),
      allEndpoints: endpoints,
    };
  },
};
