// ============================================================
// RepoInterview AI — Analysis Service Boundary
// Represents future Phase 2 ingestion & AST analysis pipeline
// ============================================================

import { AnalysisPipelineStep } from '../types/domain';

export const PIPELINE_STAGES: AnalysisPipelineStep[] = [
  { id: 'structure', label: 'Inspecting repository file tree & directory structure', status: 'pending' },
  { id: 'tech', label: 'Detecting frameworks, ORMs, and language toolchains', status: 'pending' },
  { id: 'architecture', label: 'Inferring system architecture and service topology', status: 'pending' },
  { id: 'questions', label: 'Generating question candidates and tradeoff justifications', status: 'pending' },
  { id: 'evidence', label: 'Linking questions to source files and schema definitions', status: 'pending' },
];

export const analysisService = {
  /**
   * Get the standard pipeline inspection stages
   */
  getPipelineStages(): AnalysisPipelineStep[] {
    return [...PIPELINE_STAGES];
  },
};
