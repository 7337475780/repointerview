// ============================================================
// RepoInterview AI — Multi-Signal Technology Analyzer
// Detects technologies with concrete evidence trails and normalized confidence.
// ============================================================

import type {
  ConfidenceLevel,
  DetectedTechnology,
  FindingEvidence,
  RepositoryIngestionResult,
  TechnologyCategory,
} from '../../types/domain.ts';

export const technologyAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): DetectedTechnology[] {
    const techMap = new Map<string, DetectedTechnology>();

    const addTech = (
      name: string,
      category: TechnologyCategory,
      confidence: number,
      whyDetected: string,
      evidence: FindingEvidence,
      version?: string
    ) => {
      const level: ConfidenceLevel =
        confidence >= 0.85 ? 'high' : confidence >= 0.65 ? 'medium' : 'low';

      if (!techMap.has(name)) {
        techMap.set(name, {
          name,
          category,
          version,
          confidence,
          confidenceLevel: level,
          whyDetected,
          evidence: [evidence],
        });
      } else {
        const existing = techMap.get(name)!;
        // Boost confidence with multiple supporting signals
        existing.confidence = Math.min(1.0, existing.confidence + 0.1);
        existing.confidenceLevel =
          existing.confidence >= 0.85 ? 'high' : existing.confidence >= 0.65 ? 'medium' : 'low';
        existing.evidence.push(evidence);
      }
    };

    // 1. Analyze package.json
    const pkgJson = ingestion.sourceFiles.find(
      f => f.path === 'package.json' || f.path.endsWith('/package.json')
    );

    if (pkgJson) {
      try {
        const data = JSON.parse(pkgJson.content);
        const allDeps = { ...(data.dependencies || {}), ...(data.devDependencies || {}) };

        // Framework checks
        if (allDeps.next) {
          addTech('Next.js', 'framework', 0.98, 'Declared as core framework in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: `next@${allDeps.next}`,
          }, String(allDeps.next));
        }
        if (allDeps.react) {
          addTech('React', 'frontend', 0.98, 'Declared as frontend UI library in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: `react@${allDeps.react}`,
          }, String(allDeps.react));
        }
        if (allDeps.express) {
          addTech('Express', 'backend', 0.98, 'Declared as web server framework in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: `express@${allDeps.express}`,
          }, String(allDeps.express));
        }
        if (allDeps.fastify) {
          addTech('Fastify', 'backend', 0.98, 'Declared as HTTP server in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: `fastify@${allDeps.fastify}`,
          }, String(allDeps.fastify));
        }
        if (allDeps.tailwindcss || allDeps['@tailwindcss/postcss']) {
          addTech('Tailwind CSS', 'styling', 0.95, 'Declared as styling utility in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'tailwindcss dependency',
          });
        }
        if (allDeps.prisma || allDeps['@prisma/client']) {
          addTech('Prisma', 'orm', 0.98, 'Declared as ORM schema client in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'prisma dependency',
          });
        }
        if (allDeps['drizzle-orm']) {
          addTech('Drizzle ORM', 'orm', 0.98, 'Declared as database ORM in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'drizzle-orm dependency',
          });
        }
        if (allDeps.pg) {
          addTech('PostgreSQL', 'database', 0.90, 'PostgreSQL pg client installed in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'pg driver dependency',
          });
        }
        if (allDeps.mysql2 || allDeps.mysql) {
          addTech('MySQL', 'database', 0.90, 'MySQL client driver installed in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'mysql client driver',
          });
        }
        if (allDeps.mongodb || allDeps.mongoose) {
          addTech('MongoDB', 'database', 0.90, 'MongoDB / Mongoose client installed in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'mongodb / mongoose dependency',
          });
        }
        if (allDeps.redis || allDeps.ioredis) {
          addTech('Redis', 'cache', 0.90, 'Redis client driver installed in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'redis driver dependency',
          });
        }
        if (allDeps['next-auth'] || allDeps['@auth/core']) {
          addTech('NextAuth.js', 'auth', 0.95, 'NextAuth authentication package installed', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'next-auth dependency',
          });
        }
        if (allDeps['@clerk/nextjs'] || allDeps['@clerk/clerk-react']) {
          addTech('Clerk', 'auth', 0.95, 'Clerk user management & auth package installed', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'clerk dependency',
          });
        }
        if (allDeps.typescript) {
          addTech('TypeScript', 'language', 0.99, 'TypeScript compiler configured in package.json', {
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'typescript dependency',
          });
        }
      } catch {}
    }

    // 2. Analyze Configuration Files & Tree Structure
    for (const node of ingestion.tree) {
      if (node.path === 'tsconfig.json') {
        addTech('TypeScript', 'language', 0.95, 'TypeScript configuration tsconfig.json present', {
          filePath: 'tsconfig.json',
          evidenceType: 'config_file',
          description: 'tsconfig.json file',
        });
      }
      if (node.path === 'vite.config.ts' || node.path === 'vite.config.js') {
        addTech('Vite', 'build_tool', 0.95, 'Vite configuration file present in root', {
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'vite.config file',
        });
      }
      if (node.path === 'Dockerfile') {
        addTech('Docker', 'deployment', 0.95, 'Dockerfile container definition present', {
          filePath: 'Dockerfile',
          evidenceType: 'config_file',
          description: 'Dockerfile container configuration',
        });
      }
      if (node.path.startsWith('docker-compose')) {
        addTech('Docker Compose', 'deployment', 0.95, 'Docker compose orchestration manifest present', {
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'docker-compose file',
        });
      }
      if (node.path.includes('.github/workflows/')) {
        addTech('GitHub Actions', 'deployment', 0.90, 'CI/CD pipeline workflow configured', {
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'GitHub Actions workflow file',
        });
      }
      if (node.path === 'prisma/schema.prisma') {
        addTech('Prisma', 'orm', 0.99, 'Prisma database schema defined', {
          filePath: 'prisma/schema.prisma',
          evidenceType: 'schema_definition',
          description: 'prisma/schema.prisma definition file',
        });
      }
      if (node.path === 'requirements.txt' || node.path === 'pyproject.toml') {
        addTech('Python', 'language', 0.95, 'Python dependency manifest present', {
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Python project descriptor',
        });
      }
      if (node.path === 'pom.xml' || node.path === 'build.gradle') {
        addTech('Java', 'language', 0.95, 'Java Maven/Gradle build descriptor present', {
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Java build file',
        });
      }
      if (node.path === 'go.mod') {
        addTech('Go', 'language', 0.99, 'Go module manifest present', {
          filePath: 'go.mod',
          evidenceType: 'config_file',
          description: 'go.mod manifest',
        });
      }
      if (node.path === 'Cargo.toml') {
        addTech('Rust', 'language', 0.99, 'Rust Cargo manifest present', {
          filePath: 'Cargo.toml',
          evidenceType: 'config_file',
          description: 'Cargo.toml manifest',
        });
      }
    }

    // 3. Inspect Source Code for ORM / DB Provider Declarations
    const prismaFile = ingestion.sourceFiles.find(f => f.path.endsWith('.prisma'));
    if (prismaFile) {
      if (prismaFile.content.includes('provider = "postgresql"') || prismaFile.content.includes('provider = "postgres"')) {
        addTech('PostgreSQL', 'database', 0.98, 'Prisma schema explicitly declares PostgreSQL provider', {
          filePath: prismaFile.path,
          evidenceType: 'schema_definition',
          description: 'provider = "postgresql"',
        });
      } else if (prismaFile.content.includes('provider = "mysql"')) {
        addTech('MySQL', 'database', 0.98, 'Prisma schema explicitly declares MySQL provider', {
          filePath: prismaFile.path,
          evidenceType: 'schema_definition',
          description: 'provider = "mysql"',
        });
      } else if (prismaFile.content.includes('provider = "sqlite"')) {
        addTech('SQLite', 'database', 0.98, 'Prisma schema explicitly declares SQLite provider', {
          filePath: prismaFile.path,
          evidenceType: 'schema_definition',
          description: 'provider = "sqlite"',
        });
      } else if (prismaFile.content.includes('provider = "mongodb"')) {
        addTech('MongoDB', 'database', 0.98, 'Prisma schema explicitly declares MongoDB provider', {
          filePath: prismaFile.path,
          evidenceType: 'schema_definition',
          description: 'provider = "mongodb"',
        });
      }
    }

    return Array.from(techMap.values()).sort((a, b) => b.confidence - a.confidence);
  },
};
