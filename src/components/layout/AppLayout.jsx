import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import CommandPalette from '../ui/CommandPalette';

const AppLayout = ({ theme, onToggleTheme }) => {
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AppHeader
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenSidebar={() => setSidebarMobileOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* ⌘K Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </div>
  );
};

export default AppLayout;
