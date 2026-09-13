// ============================================================
// RepoInterview AI — Deployment & Infrastructure Profile Analyzer
// Detects Docker containerization, cloud hosting configs, and CI/CD pipelines.
// ============================================================

import type { DeploymentProfile, FindingEvidence, RepositoryIngestionResult } from '../../types/domain.ts';

export const deploymentAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): DeploymentProfile {
    const platforms = new Set<string>();
    const evidence: FindingEvidence[] = [];
    let containerized = false;

    for (const node of ingestion.tree) {
      if (node.path === 'Dockerfile' || node.path.endsWith('/Dockerfile')) {
        containerized = true;
        platforms.add('Docker');
        evidence.push({
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Dockerfile container specification',
        });
      }

      if (node.path.startsWith('docker-compose')) {
        containerized = true;
        platforms.add('Docker Compose');
        evidence.push({
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Docker Compose orchestration file',
        });
      }

      if (node.path === 'vercel.json') {
        platforms.add('Vercel');
        evidence.push({
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Vercel deployment configuration',
        });
      }

      if (node.path === 'netlify.toml') {
        platforms.add('Netlify');
        evidence.push({
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Netlify build configuration',
        });
      }

      if (node.path.includes('.github/workflows/')) {
        platforms.add('GitHub Actions');
        evidence.push({
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'GitHub Actions CI/CD automation workflow',
        });
      }

      if (node.path.includes('k8s/') || node.path.endsWith('.k8s.yaml') || node.path.endsWith('helm/')) {
        platforms.add('Kubernetes');
        evidence.push({
          filePath: node.path,
          evidenceType: 'config_file',
          description: 'Kubernetes deployment manifest',
        });
      }
    }

    const confidence = evidence.length > 0 ? 0.95 : 0;

    return {
      containerized,
      platforms: Array.from(platforms),
      confidence,
      confidenceLevel: confidence >= 0.85 ? 'high' : 'low',
      whyDetected: evidence.length > 0
        ? `Infrastructure confirmed via ${evidence.length} configuration file(s).`
        : 'No specific infrastructure or deployment manifests detected.',
      evidence,
    };
  },
};
