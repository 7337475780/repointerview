// ============================================================
// RepoInterview AI — Monorepo Profile Analyzer
// Detects Turborepo, Nx, Lerna, and npm/pnpm/yarn workspaces.
// ============================================================

import type { FindingEvidence, MonorepoProfile, RepositoryIngestionResult } from '../../types/domain.ts';

export const monorepoAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): MonorepoProfile {
    let isMonorepo = false;
    let tool: string | undefined;
    const packages: string[] = [];
    const evidence: FindingEvidence[] = [];

    for (const node of ingestion.tree) {
      if (node.path === 'turbo.json') {
        isMonorepo = true;
        tool = 'Turborepo';
        evidence.push({
          filePath: 'turbo.json',
          evidenceType: 'config_file',
          description: 'Turborepo pipeline configuration manifest',
        });
      }
      if (node.path === 'pnpm-workspace.yaml') {
        isMonorepo = true;
        tool = tool || 'pnpm workspaces';
        evidence.push({
          filePath: 'pnpm-workspace.yaml',
          evidenceType: 'config_file',
          description: 'pnpm multi-package workspace declaration',
        });
      }
      if (node.path === 'lerna.json') {
        isMonorepo = true;
        tool = tool || 'Lerna';
        evidence.push({
          filePath: 'lerna.json',
          evidenceType: 'config_file',
          description: 'Lerna monorepo management configuration',
        });
      }
      if (node.path === 'nx.json') {
        isMonorepo = true;
        tool = tool || 'Nx';
        evidence.push({
          filePath: 'nx.json',
          evidenceType: 'config_file',
          description: 'Nx workspace orchestration manifest',
        });
      }

      // Check package / app directory members
      if (
        (node.path.startsWith('packages/') || node.path.startsWith('apps/')) &&
        node.path.endsWith('/package.json')
      ) {
        isMonorepo = true;
        const pkgDir = node.path.replace('/package.json', '');
        if (!packages.includes(pkgDir)) {
          packages.push(pkgDir);
        }
      }
    }

    // Check root package.json workspaces
    const rootPkg = ingestion.sourceFiles.find(f => f.path === 'package.json');
    if (rootPkg) {
      try {
        const data = JSON.parse(rootPkg.content);
        if (data.workspaces) {
          isMonorepo = true;
          tool = tool || 'npm / yarn workspaces';
          evidence.push({
            filePath: 'package.json',
            evidenceType: 'manifest_script',
            description: 'workspaces configuration declared in root package.json',
          });
        }
      } catch {}
    }

    return {
      isMonorepo,
      tool,
      packages,
      evidence,
    };
  },
};
