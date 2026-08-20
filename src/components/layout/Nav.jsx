import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitBranch, Sun, Moon, Command } from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import './Nav.css';

const Nav = ({ theme, onToggleTheme, onOpenPalette }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`} role="banner">
      <div className="nav__inner container">
        {/* Logo */}
        <Link to="/" className="nav__logo" aria-label="RepoInterview AI home">
          <div className="nav__logo-icon" aria-hidden="true">
            <GitBranch size={16} />
          </div>
          <span className="nav__logo-name">RepoInterview</span>
          <span className="nav__logo-ai">AI</span>
        </Link>

        {/* Nav links */}
        <nav className="nav__links" aria-label="Main navigation">
          <Link to="/dashboard" className={`nav__link ${isActive('/dashboard') ? 'nav__link--active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/questions" className={`nav__link ${isActive('/questions') ? 'nav__link--active' : ''}`}>
            Questions
          </Link>
          <Link to="/architecture" className={`nav__link ${isActive('/architecture') ? 'nav__link--active' : ''}`}>
            Architecture
          </Link>
          <Link to="/interview" className={`nav__link ${isActive('/interview') ? 'nav__link--active' : ''}`}>
            Interview
          </Link>
        </nav>

        {/* Actions */}
        <div className="nav__actions">
          <Tooltip content="Command palette" shortcut="⌘K" placement="bottom">
            <button
              className="nav__icon-btn"
              onClick={onOpenPalette}
              aria-label="Open command palette"
              id="cmd-palette-trigger"
            >
              <Command size={15} />
            </button>
          </Tooltip>

          <Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'} placement="bottom">
            <button
              className="nav__icon-btn"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </Tooltip>

          <div className="nav__separator" aria-hidden="true" />

          <Button variant="primary" size="sm" onClick={() => {}}>
            Start interview
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Nav;
