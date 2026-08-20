// ============================================================
// RepoInterview AI — Project Service
// Boundary for workspace project state, lifecycle queries, and storage
// ============================================================

import { Project, Repository } from '../types/domain';

export const projectService = {
  /**
   * Instantiate a new Project model with 'CONNECTED' lifecycle state
   */
  createProject(repository: Repository): Project {
    const id = repository.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return {
      id,
      repository,
      createdAt: new Date().toISOString(),
      status: 'CONNECTED',
      analysisScore: 0,
      techStack: [],
      questions: [],
      questionsCount: 0,
    };
  },

  /**
   * Filter and query projects by lifecycle state
   */
  isProjectReady(project: Project | null | undefined): boolean {
    return Boolean(project && project.status === 'READY');
  },
};
