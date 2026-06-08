import { Outlet } from 'react-router-dom';
import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileDrawer from './MobileDrawer';
import GlobalPresencePanel from './GlobalPresencePanel';
import { useGlobalStore } from '../../store/useGlobalStore';
import { cn } from '../../lib/utils';

export default function AppShell({ secondaryNav = null }) {
  const { isSidebarCollapsed, isPresencePanelOpen, togglePresencePanel } = useGlobalStore();

  return (
    <div className="min-h-[100dvh] bg-background text-text flex font-sans">
      {/* Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-black focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      <Sidebar />
      <MobileDrawer />
      <GlobalPresencePanel isOpen={isPresencePanelOpen} onClose={togglePresencePanel} />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-[100dvh] transition-all duration-300 ease-in-out w-full",
          // Push content over on desktop to make room for fixed sidebar
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <Topbar />
        
        <div className="flex-1 flex w-full relative">
          {/* Optional Secondary Nav (e.g. local sidebar for AI assistant or Skills) */}
          {secondaryNav && (
            <aside className="hidden lg:block w-64 border-r border-border/50 bg-surface/30 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto" aria-label="Secondary navigation">
              {secondaryNav}
            </aside>
          )}

          {/* Core Page Outlet */}
          <main id="main-content" className="flex-1 w-full min-w-0 overflow-x-hidden pb-20 md:pb-0" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Global AI Assistant Trigger */}
      <AIFab />
    </div>
  );
}

import { Bot } from 'lucide-react';
import { useAI } from '../../features/ai/AIProvider';

const AIFab = React.memo(function AIFab() {
  const { isOpen, openAssistant } = useAI();
  
  if (isOpen) return null;
  
  return (
    <button
      type="button"
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[80] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      onClick={() => openAssistant('general')}
      aria-label="Open AI Assistant"
      title="Open AI Assistant"
    >
      <Bot className="h-6 w-6" aria-hidden="true" />
    </button>
  );
});
