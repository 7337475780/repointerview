// ============================================================
// RepoInterview AI — Multi-Signal Authentication Profile Analyzer
// Requires concrete dependencies or import usage before declaring an auth strategy.
// ============================================================

import type { AuthenticationProfile, FindingEvidence, RepositoryIngestionResult } from '../../types/domain.ts';

export const authAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): AuthenticationProfile {
    const strategies = new Set<string>();
    const providers = new Set<string>();
    const evidence: FindingEvidence[] = [];
    let confidence = 0;

    // 1. Inspect package.json
    const pkgJson = ingestion.sourceFiles.find(
      f => f.path === 'package.json' || f.path.endsWith('/package.json')
    );

    if (pkgJson) {
      try {
        const data = JSON.parse(pkgJson.content);
        const allDeps = { ...(data.dependencies || {}), ...(data.devDependencies || {}) };

        if (allDeps['next-auth'] || allDeps['@auth/core']) {
          strategies.add('OAuth / Session (NextAuth.js)');
          providers.add('NextAuth.js');
          confidence = Math.max(confidence, 0.95);
          evidence.push({
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'next-auth dependency declared',
          });
        }

        if (allDeps['@clerk/nextjs'] || allDeps['@clerk/clerk-react']) {
          strategies.add('Hosted Auth & User Management');
          providers.add('Clerk');
          confidence = Math.max(confidence, 0.95);
          evidence.push({
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'Clerk authentication SDK installed',
          });
        }

        if (allDeps.jsonwebtoken || allDeps.jose) {
          strategies.add('JWT (JSON Web Tokens)');
          confidence = Math.max(confidence, 0.90);
          evidence.push({
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'jsonwebtoken / jose package installed for token signing',
          });
        }

        if (allDeps.passport) {
          strategies.add('Passport.js Middleware Strategies');
          providers.add('Passport');
          confidence = Math.max(confidence, 0.90);
          evidence.push({
            filePath: pkgJson.path,
            evidenceType: 'dependency_declaration',
            description: 'passport middleware package declared',
          });
        }
      } catch {}
    }

    // 2. Inspect Source Files for API Auth Routes & Code Usage
    for (const file of ingestion.sourceFiles) {
      if (file.path.includes('api/auth/[...nextauth]') || file.path.includes('api/auth/[...auth]')) {
        strategies.add('NextAuth Route Handler');
        confidence = Math.max(confidence, 0.95);
        evidence.push({
          filePath: file.path,
          evidenceType: 'route_declaration',
          description: 'Dedicated NextAuth API route handler',
        });
      }

      if (file.content.includes('jwt.verify(') || file.content.includes('jwt.sign(')) {
        strategies.add('JWT (JSON Web Tokens)');
        confidence = Math.max(confidence, 0.92);
        evidence.push({
          filePath: file.path,
          evidenceType: 'code_usage',
          description: 'jwt.sign / jwt.verify execution in source code',
        });
      }

      if (file.content.includes('passport.authenticate(')) {
        strategies.add('Passport Authentication Guard');
        confidence = Math.max(confidence, 0.92);
        evidence.push({
          filePath: file.path,
          evidenceType: 'code_usage',
          description: 'passport.authenticate middleware handler',
        });
      }
    }

    const detected = evidence.length > 0;

    return {
      detected,
      strategies: Array.from(strategies),
      providers: Array.from(providers),
      confidence: detected ? confidence : 0,
      confidenceLevel: confidence >= 0.85 ? 'high' : confidence >= 0.65 ? 'medium' : 'low',
      whyDetected: detected
        ? `Authentication identified via ${evidence.length} concrete dependency & code usage signal(s).`
        : 'No authentication libraries or middleware detected.',
      evidence,
    };
  },
};
