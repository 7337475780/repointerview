import { createContext, useContext, useState, useEffect } from 'react';
import { repositoryService } from '../services/repositoryService';
import { cacheService } from '../services/cacheService';

const ProjectContext = createContext(null);

// In-memory ingestion cache per project ID (contains full source files during session)
const inMemoryIngestions = new Map();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('repointerview_projects_meta');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    try {
      return localStorage.getItem('repointerview_active_id') || null;
    } catch {
      return null;
    }
  });

  // Save lightweight project metadata AND deterministic intelligence to localStorage
  // (NO raw source code storage in localStorage to respect browser quotas)
  useEffect(() => {
    try {
      const metadataOnly = projects.map(p => ({
        id: p.id,
        repository: p.repository,
        createdAt: p.createdAt,
        lastAnalyzedAt: p.lastAnalyzedAt || p.createdAt,
        status: p.status,
        analysisScore: p.analysisScore,
        techStack: p.techStack,
        stats: p.stats,
        architecture: p.architecture || p.intelligence?.architectureMap,
        intelligence: p.intelligence,
        questions: p.questions || [],
        questionsCount: p.questionsCount || 0,
      }));
      localStorage.setItem('repointerview_projects_meta', JSON.stringify(metadataOnly));
      if (activeProjectId) {
        localStorage.setItem('repointerview_active_id', activeProjectId);
      }
    } catch (err) {
      console.warn('Failed to save project metadata to localStorage:', err);
    }
  }, [projects, activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Add project with full ingestion payload & deterministic intelligence
  const addProjectFromIngestion = (ingestionResult) => {
    const newProject = repositoryService.createProjectFromIngestion(ingestionResult);

    // Retain full source files in memory for this session
    inMemoryIngestions.set(newProject.id, ingestionResult);

    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== newProject.id);
      return [newProject, ...filtered];
    });
    setActiveProjectId(newProject.id);
    return newProject;
  };

  const removeProject = (id) => {
    inMemoryIngestions.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  // Get in-memory ingestion result if available for a given project ID or active project
  const getActiveIngestion = (projectId) => {
    const targetProject = projectId ? projects.find(p => p.id === projectId) : activeProject;
    if (!targetProject || !targetProject.repository) return null;

    if (inMemoryIngestions.has(targetProject.id)) {
      return inMemoryIngestions.get(targetProject.id);
    }

    if (targetProject.ingestion) {
      return targetProject.ingestion;
    }

    const { owner, name, commitSha } = targetProject.repository;
    if (commitSha) {
      return cacheService.get(owner, name, commitSha) || null;
    }
    return null;
  };

  const updateProjectQuestions = (projectId, questions) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            questions,
            questionsCount: questions.length,
          };
        }
        return p;
      })
    );
  };

  const getProject = (id) => {
    return projects.find(p => p.id === id) || null;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        addProjectFromIngestion,
        updateProjectQuestions,
        removeProject,
        getActiveIngestion,
        getProject,
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
