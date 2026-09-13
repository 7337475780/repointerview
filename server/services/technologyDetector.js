// ============================================================
// RepoInterview AI — Technology Detection Engine
// Detects:
// 1. Programming Languages
// 2. Frameworks (Frontend, Backend, Fullstack)
// 3. Libraries (State, Styling, Utilities, Testing, Tools)
// 4. Database Technologies & ORMs
// 5. Authentication Methods
// ============================================================

export const EXTENSION_TO_LANGUAGE = {
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  py: 'Python',
  pyw: 'Python',
  go: 'Go',
  java: 'Java',
  kt: 'Kotlin',
  kts: 'Kotlin',
  scala: 'Scala',
  rs: 'Rust',
  rb: 'Ruby',
  php: 'PHP',
  c: 'C',
  h: 'C/C++ Header',
  cpp: 'C++',
  hpp: 'C++',
  cc: 'C++',
  cs: 'C#',
  swift: 'Swift',
  vue: 'Vue',
  svelte: 'Svelte',
  astro: 'Astro',
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  sql: 'SQL',
  prisma: 'Prisma Schema',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  proto: 'Protocol Buffers',
  sh: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',
};

// Comprehensive Dependency & Framework Knowledge Base
const FRAMEWORK_DEFINITIONS = [
  // Frontend
  { name: 'Next.js', category: 'Fullstack / Frontend', type: 'framework', pkg: ['next'], matchContent: [/from ['"]next/i, /require\(['"]next/i] },
  { name: 'React', category: 'Frontend', type: 'framework', pkg: ['react', 'react-dom'], matchContent: [/from ['"]react['"]/i, /require\(['"]react['"]\)/i] },
  { name: 'Vue.js', category: 'Frontend', type: 'framework', pkg: ['vue'], matchContent: [/from ['"]vue['"]/i] },
  { name: 'Nuxt.js', category: 'Fullstack / Frontend', type: 'framework', pkg: ['nuxt'], matchContent: [/from ['"]nuxt['"]/i] },
  { name: 'Svelte', category: 'Frontend', type: 'framework', pkg: ['svelte', '@sveltejs/kit'], matchContent: [/from ['"]svelte/i] },
  { name: 'Angular', category: 'Frontend', type: 'framework', pkg: ['@angular/core'], matchContent: [/@angular\//i] },
  { name: 'Remix', category: 'Fullstack / Frontend', type: 'framework', pkg: ['@remix-run/react', '@remix-run/node'], matchContent: [/@remix-run/i] },
  { name: 'Astro', category: 'Frontend', type: 'framework', pkg: ['astro'], matchContent: [/from ['"]astro/i] },
  { name: 'Gatsby', category: 'Frontend', type: 'framework', pkg: ['gatsby'], matchContent: [/from ['"]gatsby['"]/i] },

  // Backend Node.js
  { name: 'Express', category: 'Backend', type: 'framework', pkg: ['express'], matchContent: [/require\(['"]express['"]\)/i, /from ['"]express['"]/i, /express\(\)/i] },
  { name: 'Fastify', category: 'Backend', type: 'framework', pkg: ['fastify'], matchContent: [/require\(['"]fastify['"]\)/i, /from ['"]fastify['"]/i] },
  { name: 'NestJS', category: 'Backend', type: 'framework', pkg: ['@nestjs/core', '@nestjs/common'], matchContent: [/@nestjs\//i] },
  { name: 'Koa', category: 'Backend', type: 'framework', pkg: ['koa'], matchContent: [/require\(['"]koa['"]\)/i, /from ['"]koa['"]/i] },
  { name: 'Hono', category: 'Backend / Edge', type: 'framework', pkg: ['hono'], matchContent: [/from ['"]hono['"]/i] },
  { name: 'AdonisJS', category: 'Backend', type: 'framework', pkg: ['@adonisjs/core'], matchContent: [/@adonisjs/i] },

  // Backend Python
  { name: 'Django', category: 'Backend', type: 'framework', pyPkg: ['django'], matchContent: [/import django/i, /from django/i] },
  { name: 'FastAPI', category: 'Backend', type: 'framework', pyPkg: ['fastapi'], matchContent: [/import fastapi/i, /from fastapi/i, /FastAPI\(\)/i] },
  { name: 'Flask', category: 'Backend', type: 'framework', pyPkg: ['flask'], matchContent: [/import flask/i, /from flask/i, /Flask\(__name__\)/i] },

  // Backend Other
  { name: 'Gin', category: 'Backend', type: 'framework', matchContent: [/github\.com\/gin-gonic\/gin/i] },
  { name: 'Fiber', category: 'Backend', type: 'framework', matchContent: [/github\.com\/gofiber\/fiber/i] },
  { name: 'Spring Boot', category: 'Backend', type: 'framework', matchContent: [/org\.springframework\.boot/i, /@SpringBootApplication/i] },
  { name: 'Ruby on Rails', category: 'Backend', type: 'framework', matchContent: [/rails\/all/i, /ActionController::Base/i] },
];

const DATABASE_DEFINITIONS = [
  // SQL Databases & Drivers
  { name: 'PostgreSQL', category: 'Relational Database', pkg: ['pg', 'postgres', '@vercel/postgres'], pyPkg: ['psycopg2', 'asyncpg'], matchContent: [/postgresql:\/\//i, /provider\s*=\s*["']postgresql["']/i, /postgres/i] },
  { name: 'MySQL', category: 'Relational Database', pkg: ['mysql', 'mysql2'], pyPkg: ['mysqlclient', 'pymysql'], matchContent: [/mysql:\/\//i, /provider\s*=\s*["']mysql["']/i] },
  { name: 'SQLite', category: 'Embedded SQL Database', pkg: ['sqlite3', 'better-sqlite3'], pyPkg: ['sqlite3'], matchContent: [/sqlite:\/\//i, /provider\s*=\s*["']sqlite["']/i, /\.sqlite3?$/i] },
  
  // NoSQL Databases
  { name: 'MongoDB', category: 'Document NoSQL Database', pkg: ['mongodb', 'mongoose'], pyPkg: ['pymongo', 'motor'], matchContent: [/mongodb(\+srv)?:\/\//i, /provider\s*=\s*["']mongodb["']/i, /mongoose\.connect/i] },
  { name: 'Redis', category: 'In-Memory Key-Value Store', pkg: ['redis', 'ioredis', '@upstash/redis'], pyPkg: ['redis'], matchContent: [/redis:\/\//i, /new Redis/i] },
  { name: 'DynamoDB', category: 'NoSQL Database', pkg: ['@aws-sdk/client-dynamodb', 'dynamoose'], matchContent: [/DynamoDBClient/i] },
  { name: 'Supabase DB', category: 'BaaS / PostgreSQL', pkg: ['@supabase/supabase-js', '@supabase/ssr'], matchContent: [/createClient\(.+supabase/i] },
  { name: 'Firebase Firestore', category: 'BaaS / NoSQL', pkg: ['firebase', 'firebase-admin'], matchContent: [/getFirestore/i, /firebase\/firestore/i] },

  // ORMs & Query Builders
  { name: 'Prisma ORM', category: 'Database ORM', pkg: ['prisma', '@prisma/client'], matchContent: [/prisma\./i, /new PrismaClient/i, /datasource\s+db/i] },
  { name: 'Drizzle ORM', category: 'Database ORM', pkg: ['drizzle-orm'], matchContent: [/from ['"]drizzle-orm/i] },
  { name: 'TypeORM', category: 'Database ORM', pkg: ['typeorm'], matchContent: [/from ['"]typeorm['"]/i, /@Entity\(/i] },
  { name: 'Mongoose', category: 'MongoDB ODM', pkg: ['mongoose'], matchContent: [/mongoose\.model/i, /new mongoose\.Schema/i] },
  { name: 'Sequelize', category: 'Database ORM', pkg: ['sequelize'], matchContent: [/from ['"]sequelize['"]/i] },
  { name: 'SQLAlchemy', category: 'Database ORM', pyPkg: ['sqlalchemy'], matchContent: [/from sqlalchemy/i, /import sqlalchemy/i] },
];

const AUTH_DEFINITIONS = [
  { name: 'JWT (JSON Web Tokens)', method: 'JWT', pkg: ['jsonwebtoken', 'jose', 'jwt-decode'], pyPkg: ['pyjwt'], matchContent: [/jwt\.sign/i, /jwt\.verify/i, /Bearer /i, /jsonwebtoken/i] },
  { name: 'NextAuth.js (Auth.js)', method: 'OAuth / Session', pkg: ['next-auth', '@auth/core'], matchContent: [/NextAuth\(/i, /from ['"]next-auth/i, /authOptions/i] },
  { name: 'Passport.js', method: 'Middleware Strategy', pkg: ['passport', 'passport-jwt', 'passport-local', 'passport-google-oauth20'], matchContent: [/passport\.use/i, /passport\.authenticate/i] },
  { name: 'Clerk Auth', method: 'Managed Identity Service', pkg: ['@clerk/nextjs', '@clerk/clerk-react', '@clerk/clerk-sdk-node'], matchContent: [/@clerk\//i, /<ClerkProvider/i, /authMiddleware/i] },
  { name: 'Supabase Auth', method: 'BaaS OAuth / JWT', pkg: ['@supabase/auth-helpers-nextjs', '@supabase/supabase-js'], matchContent: [/supabase\.auth\./i] },
  { name: 'Firebase Authentication', method: 'BaaS Identity', pkg: ['firebase', 'firebase-admin'], matchContent: [/getAuth\(/i, /signInWithPopup/i] },
  { name: 'Express Session / Cookies', method: 'Server Session / Cookies', pkg: ['express-session', 'cookie-session', 'cookie-parser'], matchContent: [/session\(/i, /req\.session/i] },
  { name: 'OAuth 2.0', method: 'OAuth 2.0 Provider', pkg: ['oauth', 'simple-oauth2', 'google-auth-library'], matchContent: [/oauth2/i, /client_id/i, /client_secret/i] },
  { name: 'Lucia Auth', method: 'Session-based Auth', pkg: ['lucia', 'lucia-auth'], matchContent: [/lucia/i] },
];

const LIBRARY_DEFINITIONS = [
  // Styling & UI
  { name: 'Tailwind CSS', category: 'Styling', pkg: ['tailwindcss'], matchFiles: [/tailwind\.config/i] },
  { name: 'Shadcn UI', category: 'UI Components', matchContent: [/@\/components\/ui/i, /radix-ui/i] },
  { name: 'Radix UI', category: 'UI Primitives', pkg: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'] },
  { name: 'Styled Components', category: 'Styling', pkg: ['styled-components'] },
  { name: 'Framer Motion', category: 'Animation', pkg: ['framer-motion'] },
  { name: 'Lucide Icons', category: 'Icons', pkg: ['lucide-react', 'lucide-vue-next'] },

  // State Management
  { name: 'Zustand', category: 'State Management', pkg: ['zustand'] },
  { name: 'Redux Toolkit', category: 'State Management', pkg: ['@reduxjs/toolkit', 'react-redux'] },
  { name: 'TanStack Query (React Query)', category: 'Server State', pkg: ['@tanstack/react-query', 'react-query'] },
  { name: 'Recoil', category: 'State Management', pkg: ['recoil'] },
  { name: 'Jotai', category: 'State Management', pkg: ['jotai'] },

  // Validation & Data Fetching
  { name: 'Zod', category: 'Schema Validation', pkg: ['zod'] },
  { name: 'Yup', category: 'Schema Validation', pkg: ['yup'] },
  { name: 'Axios', category: 'HTTP Client', pkg: ['axios'] },
  { name: 'tRPC', category: 'End-to-End TypeSafe API', pkg: ['@trpc/server', '@trpc/client', '@trpc/react-query'] },
  { name: 'GraphQL', category: 'API Protocol', pkg: ['graphql', '@apollo/client', 'apollo-server-express'] },

  // Testing & Quality
  { name: 'Jest', category: 'Testing', pkg: ['jest', '@types/jest'] },
  { name: 'Vitest', category: 'Testing', pkg: ['vitest'] },
  { name: 'Playwright', category: 'E2E Testing', pkg: ['@playwright/test'] },
  { name: 'Cypress', category: 'E2E Testing', pkg: ['cypress'] },
  { name: 'ESLint', category: 'Code Quality', pkg: ['eslint'] },
  { name: 'Prettier', category: 'Code Formatter', pkg: ['prettier'] },
];

export const technologyDetector = {
  /**
   * Detect programming languages with breakdown of files and proportions
   * @param {Array<object>} files List of extracted or tree files
   * @returns {object} { primary: string, languages: Array<{ language: string, fileCount: number, percentage: number }> }
   */
  detectLanguages(files = []) {
    const counts = {};
    let totalCountable = 0;

    for (const file of files) {
      const path = typeof file === 'string' ? file : file.path || '';
      const dotIndex = path.lastIndexOf('.');
      if (dotIndex === -1) continue;

      const ext = path.substring(dotIndex + 1).toLowerCase();
      const lang = EXTENSION_TO_LANGUAGE[ext];
      if (lang) {
        counts[lang] = (counts[lang] || 0) + 1;
        totalCountable++;
      }
    }

    const sortedLangs = Object.entries(counts)
      .map(([language, fileCount]) => ({
        language,
        fileCount,
        percentage: totalCountable > 0 ? Math.round((fileCount / totalCountable) * 100) : 0,
      }))
      .sort((a, b) => b.fileCount - a.fileCount);

    const primary = sortedLangs.length > 0 ? sortedLangs[0].language : 'Unknown';

    return {
      primary,
      totalCountableFiles: totalCountable,
      breakdown: sortedLangs,
    };
  },

  /**
   * Extract declared dependencies from package.json and other manifests
   * @param {Array<object>} files Files containing path and content
   * @returns {object} { npmDeps: Set<string>, pythonDeps: Set<string>, allDepsList: string[] }
   */
  extractDependencies(files = []) {
    const npmDeps = new Set();
    const pythonDeps = new Set();

    for (const file of files) {
      if (!file || !file.content) continue;
      const lowerPath = (file.path || '').toLowerCase();

      // package.json
      if (lowerPath.endsWith('package.json')) {
        try {
          const pkg = JSON.parse(file.content);
          const combined = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {}),
            ...(pkg.peerDependencies || {}),
          };
          for (const dep of Object.keys(combined)) {
            npmDeps.add(dep.toLowerCase());
          }
        } catch {
          // ignore parse errors
        }
      }

      // requirements.txt / Pipfile
      if (lowerPath.endsWith('requirements.txt') || lowerPath.endsWith('pipfile')) {
        const lines = file.content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^([a-zA-Z0-9_\-\.]+)/);
          if (match) {
            pythonDeps.add(match[1].toLowerCase());
          }
        }
      }
    }

    return {
      npmDeps,
      pythonDeps,
      allDepsList: [...npmDeps, ...pythonDeps],
    };
  },

  /**
   * Detect Frameworks (Frontend, Backend, Fullstack)
   */
  detectFrameworks(files = [], dependencies) {
    const detected = [];
    const seenNames = new Set();

    for (const def of FRAMEWORK_DEFINITIONS) {
      let matched = false;
      let evidence = '';

      // Check npm deps
      if (def.pkg && def.pkg.some(p => dependencies.npmDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found dependency "${def.pkg.find(p => dependencies.npmDeps.has(p.toLowerCase()))}" in package manifest`;
      }

      // Check python deps
      if (!matched && def.pyPkg && def.pyPkg.some(p => dependencies.pythonDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found Python package "${def.pyPkg.find(p => dependencies.pythonDeps.has(p.toLowerCase()))}" in requirements`;
      }

      // Check code content patterns
      if (!matched && def.matchContent) {
        for (const file of files) {
          if (!file.content) continue;
          for (const regex of def.matchContent) {
            if (regex.test(file.content)) {
              matched = true;
              evidence = `Matched import / pattern in ${file.path}`;
              break;
            }
          }
          if (matched) break;
        }
      }

      if (matched && !seenNames.has(def.name)) {
        seenNames.add(def.name);
        detected.push({
          name: def.name,
          category: def.category,
          evidence,
        });
      }
    }

    // Classify into Primary Frontend & Primary Backend
    const frontend = detected.find(f => f.category.includes('Frontend') || f.name === 'Next.js' || f.name === 'React' || f.name === 'Vue.js' || f.name === 'Svelte');
    const backend = detected.find(f => f.category.includes('Backend') || f.name === 'Express' || f.name === 'Fastify' || f.name === 'NestJS' || f.name === 'FastAPI' || f.name === 'Django' || f.name === 'Flask');

    return {
      all: detected,
      primaryFrontend: frontend ? frontend.name : null,
      primaryBackend: backend ? backend.name : null,
    };
  },

  /**
   * Detect Database Technologies & ORMs
   */
  detectDatabases(files = [], dependencies) {
    const detected = [];
    const seenNames = new Set();

    for (const def of DATABASE_DEFINITIONS) {
      let matched = false;
      let evidence = '';

      if (def.pkg && def.pkg.some(p => dependencies.npmDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found package "${def.pkg.find(p => dependencies.npmDeps.has(p.toLowerCase()))}"`;
      }

      if (!matched && def.pyPkg && def.pyPkg.some(p => dependencies.pythonDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found Python database package "${def.pyPkg.find(p => dependencies.pythonDeps.has(p.toLowerCase()))}"`;
      }

      if (!matched && def.matchContent) {
        for (const file of files) {
          if (!file.content) continue;
          for (const regex of def.matchContent) {
            if (regex.test(file.content)) {
              matched = true;
              evidence = `Matched database pattern in ${file.path}`;
              break;
            }
          }
          if (matched) break;
        }
      }

      if (matched && !seenNames.has(def.name)) {
        seenNames.add(def.name);
        detected.push({
          name: def.name,
          category: def.category,
          evidence,
        });
      }
    }

    const primaryDb = detected.find(d => !d.category.includes('ORM') && !d.category.includes('ODM')) || detected[0] || null;
    const primaryOrm = detected.find(d => d.category.includes('ORM') || d.category.includes('ODM')) || null;

    return {
      all: detected,
      primaryDatabase: primaryDb ? primaryDb.name : null,
      primaryOrm: primaryOrm ? primaryOrm.name : null,
    };
  },

  /**
   * Detect Authentication Methods
   */
  detectAuthentication(files = [], dependencies) {
    const detected = [];
    const seenNames = new Set();

    for (const def of AUTH_DEFINITIONS) {
      let matched = false;
      let evidence = '';

      if (def.pkg && def.pkg.some(p => dependencies.npmDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found authentication package "${def.pkg.find(p => dependencies.npmDeps.has(p.toLowerCase()))}"`;
      }

      if (!matched && def.pyPkg && def.pyPkg.some(p => dependencies.pythonDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found Python auth package "${def.pyPkg.find(p => dependencies.pythonDeps.has(p.toLowerCase()))}"`;
      }

      if (!matched && def.matchContent) {
        for (const file of files) {
          if (!file.content) continue;
          for (const regex of def.matchContent) {
            if (regex.test(file.content)) {
              matched = true;
              evidence = `Matched authentication pattern in ${file.path}`;
              break;
            }
          }
          if (matched) break;
        }
      }

      if (matched && !seenNames.has(def.name)) {
        seenNames.add(def.name);
        detected.push({
          name: def.name,
          method: def.method,
          evidence,
        });
      }
    }

    const primaryAuth = detected.length > 0 ? detected[0] : null;

    return {
      all: detected,
      primaryMethod: primaryAuth ? primaryAuth.method : 'None / Custom',
      primaryName: primaryAuth ? primaryAuth.name : 'None Detected',
    };
  },

  /**
   * Detect Libraries & Tooling
   */
  detectLibraries(files = [], dependencies) {
    const detected = [];
    const seenNames = new Set();

    for (const def of LIBRARY_DEFINITIONS) {
      let matched = false;
      let evidence = '';

      if (def.pkg && def.pkg.some(p => dependencies.npmDeps.has(p.toLowerCase()))) {
        matched = true;
        evidence = `Found library package "${def.pkg.find(p => dependencies.npmDeps.has(p.toLowerCase()))}"`;
      }

      if (!matched && def.matchFiles) {
        for (const file of files) {
          const path = file.path || '';
          if (def.matchFiles.some(r => r.test(path))) {
            matched = true;
            evidence = `Matched configuration file ${path}`;
            break;
          }
        }
      }

      if (!matched && def.matchContent) {
        for (const file of files) {
          if (!file.content) continue;
          for (const regex of def.matchContent) {
            if (regex.test(file.content)) {
              matched = true;
              evidence = `Matched library pattern in ${file.path}`;
              break;
            }
          }
          if (matched) break;
        }
      }

      if (matched && !seenNames.has(def.name)) {
        seenNames.add(def.name);
        detected.push({
          name: def.name,
          category: def.category,
          evidence,
        });
      }
    }

    return detected;
  },

  /**
   * Run complete technology profiling across files
   */
  analyze(files = []) {
    const languages = this.detectLanguages(files);
    const dependencies = this.extractDependencies(files);
    const frameworks = this.detectFrameworks(files, dependencies);
    const databases = this.detectDatabases(files, dependencies);
    const authentication = this.detectAuthentication(files, dependencies);
    const libraries = this.detectLibraries(files, dependencies);

    return {
      languages,
      frameworks,
      databases,
      authentication,
      libraries,
      totalDependenciesCount: dependencies.allDepsList.length,
    };
  },
};
