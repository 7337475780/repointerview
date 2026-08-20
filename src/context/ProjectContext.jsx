import { createContext, useContext, useState, useEffect } from 'react';
import { REPO, QUESTIONS, ARCHITECTURE_NODES, ARCHITECTURE_EDGES } from '../data/fixtures';

const ProjectContext = createContext(null);

const DEMO_PROJECT = {
  id: 'notionify',
  repository: {
    id: 'repo-1',
    name: REPO.name,
    owner: REPO.owner,
    fullName: REPO.fullName,
    url: REPO.url,
    defaultBranch: 'main',
    stars: REPO.stars,
    description: REPO.description,
    primaryLanguage: 'TypeScript',
  },
  createdAt: '2024-01-10T10:00:00Z',
  lastAnalyzedAt: REPO.lastAnalyzed,
  status: 'ready',
  analysisScore: REPO.analysisScore,
  techStack: REPO.techStack,
  stats: REPO.stats,
  architecture: {
    nodes: ARCHITECTURE_NODES,
    edges: ARCHITECTURE_EDGES,
    lastGeneratedAt: '2024-01-15T12:00:00Z',
  },
  questionsCount: QUESTIONS.length,
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([DEMO_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState('notionify');

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  const addProject = (repoUrl) => {
    // Clean repo URL to extract owner and name
    const cleanUrl = repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const [owner = 'developer', name = 'repository'] = cleanUrl.split('/');
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newProject = {
      id,
      repository: {
        id: `repo-${Date.now()}`,
        name,
        owner,
        fullName: `${owner}/${name}`,
        url: `https://github.com/${owner}/${name}`,
        defaultBranch: 'main',
        description: 'Repository connected for interview intelligence',
        primaryLanguage: 'TypeScript',
      },
      createdAt: new Date().toISOString(),
      lastAnalyzedAt: 'Just now',
      status: 'idle',
      analysisScore: 0,
      techStack: [],
      stats: {
        totalFiles: 0,
        linesOfCode: 0,
        testCoverage: 0,
        apiRoutes: 0,
        components: 0,
        dbTables: 0,
      },
      architecture: {
        nodes: [],
        edges: [],
        lastGeneratedAt: new Date().toISOString(),
      },
      questionsCount: 0,
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(id);
    return newProject;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        addProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
