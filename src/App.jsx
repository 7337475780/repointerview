import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Nav from './components/layout/Nav';
import CommandPalette from './components/ui/CommandPalette';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import MockInterview from './pages/MockInterview';
import ArchitectureView from './pages/ArchitectureView';
import { useCommandPalette } from './hooks/useCommandPalette';
import { useTheme } from './hooks/useTheme';

// Wrapper that reads location for AnimatePresence key
const AppRoutes = ({ theme, onToggleTheme, onOpenPalette }) => {
  const location = useLocation();
  const isInterview = location.pathname === '/interview';

  return (
    <>
      {/* Hide Nav on mock interview for immersive experience */}
      {!isInterview && (
        <Nav
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenPalette={onOpenPalette}
        />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/interview" element={<MockInterview />} />
          <Route path="/architecture" element={<ArchitectureView />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { open, openPalette, closePalette } = useCommandPalette();

  return (
    <BrowserRouter>
      <AppRoutes
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPalette={openPalette}
      />
      <CommandPalette
        open={open}
        onClose={closePalette}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
    </BrowserRouter>
  );
};

export default App;
