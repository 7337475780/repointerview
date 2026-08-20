import { createContext, useContext, useState, useEffect } from 'react';
import { repositoryService } from '../services/repositoryService';
import { cacheService } from '../services/cacheService';

const ProjectContext = createContext(null);

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

  // Save lightweight project metadata ONLY to localStorage (NO raw source code storage in localStorage)
  useEffect(() => {
    try {
      const metadataOnly = projects.map(p => ({
        id: p.id,
        repository: p.repository,
        createdAt: p.createdAt,
        status: p.status,
        analysisScore: p.analysisScore,
        techStack: p.techStack,
        stats: p.stats,
        questionsCount: p.questionsCount,
      }));
      localStorage.setItem('repointerview_projects_meta', JSON.stringify(metadataOnly));
      if (activeProjectId) {
        localStorage.setItem('repointerview_active_id', activeProjectId);
      }
    } catch {}
  }, [projects, activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Add project with full ingestion payload
  const addProjectFromIngestion = (ingestionResult) => {
    const newProject = repositoryService.createProjectFromIngestion(ingestionResult);

    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== newProject.id);
      return [newProject, ...filtered];
    });
    setActiveProjectId(newProject.id);
    return newProject;
  };

  const removeProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  // Get active project's in-memory ingestion result if available
  const getActiveIngestion = () => {
    if (!activeProject || !activeProject.repository) return null;
    const { owner, name, commitSha } = activeProject.repository;
    if (commitSha) {
      return cacheService.get(owner, name, commitSha) || activeProject.ingestion || null;
    }
    return activeProject.ingestion || null;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        addProjectFromIngestion,
        removeProject,
        getActiveIngestion,
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
