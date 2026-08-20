import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProjectProvider } from './context/ProjectContext';
import { useTheme } from './hooks/useTheme';
import { useCommandPalette } from './hooks/useCommandPalette';

import Nav from './components/layout/Nav';
import AppLayout from './components/layout/AppLayout';
import CommandPalette from './components/ui/CommandPalette';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import Settings from './pages/Settings';

import ProjectOverview from './pages/project/ProjectOverview';
import ProjectArchitecture from './pages/project/ProjectArchitecture';
import ProjectQuestions from './pages/project/ProjectQuestions';
import QuestionDetail from './pages/project/QuestionDetail';
import ProjectEvidence from './pages/project/ProjectEvidence';
import ProjectMock from './pages/project/ProjectMock';
import ProjectAnalytics from './pages/project/ProjectAnalytics';

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { open, openPalette, closePalette } = useCommandPalette();

  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page with Marketing Nav */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-bg-base flex flex-col">
                <Nav
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  onOpenPalette={openPalette}
                />
                <Landing />
                <CommandPalette
                  open={open}
                  onClose={closePalette}
                  onToggleTheme={toggleTheme}
                  theme={theme}
                />
              </div>
            }
          />

          {/* Standalone Distraction-free Mock Interview */}
          <Route
            path="/interview"
            element={
              <ProjectMock />
            }
          />

          {/* Product Workspaces within Authenticated Shell */}
          <Route
            element={
              <AppLayout
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id" element={<ProjectOverview />} />
            <Route path="/projects/:id/architecture" element={<ProjectArchitecture />} />
            <Route path="/projects/:id/questions" element={<ProjectQuestions />} />
            <Route path="/projects/:id/questions/:questionId" element={<QuestionDetail />} />
            <Route path="/projects/:id/evidence" element={<ProjectEvidence />} />
            <Route path="/projects/:id/mock" element={<ProjectMock />} />
            <Route path="/projects/:id/analytics" element={<ProjectAnalytics />} />
            <Route path="/questions" element={<ProjectQuestions />} />
            <Route path="/questions/:questionId" element={<QuestionDetail />} />
            <Route path="/architecture" element={<ProjectArchitecture />} />
            <Route path="/analytics" element={<ProjectAnalytics />} />
            <Route
              path="/settings"
              element={<Settings theme={theme} onToggleTheme={toggleTheme} />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
};

export default App;
