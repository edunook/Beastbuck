import { Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileDrawer from './MobileDrawer';
import MobileBottomNav from './MobileBottomNav';
import GlobalPresencePanel from './GlobalPresencePanel';
import { useGlobalStore } from '@frontend/store/useGlobalStore';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { isAccountSuspended } from '@shared/permissions/permissions';
import { AlertTriangle, Clock } from 'lucide-react';
import { usePagePresenceTracker } from '@frontend/hooks/usePagePresenceTracker';
import { cn } from '@shared/lib/utils';

export default function AppShell({ secondaryNav = null }) {
  usePagePresenceTracker();
  const { isSidebarCollapsed, isPresencePanelOpen, togglePresencePanel } = useGlobalStore();
  const { roleData } = useAuth();
  const location = useLocation();

  const isSuspended = isAccountSuspended(roleData);

  // FunFlix pages have their own cinematic chrome — hide the default app shell chrome
  const isFunFlixRoute = location.pathname.startsWith('/funflix');

  return (
    <div className="min-h-[100dvh] bg-background text-text flex font-sans relative">
      {/* Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-black focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      {!isFunFlixRoute && <Sidebar />}
      {!isFunFlixRoute && <MobileDrawer />}
      {!isFunFlixRoute && <GlobalPresencePanel isOpen={isPresencePanelOpen} onClose={togglePresencePanel} />}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-[100dvh] transition-all duration-300 ease-in-out w-full relative z-0",
          // Push content over on desktop to make room for fixed sidebar (skip for FunFlix)
          !isFunFlixRoute && (isSidebarCollapsed ? "md:ml-20" : "md:ml-64")
        )}
      >
        <div className="flex-1 flex w-full relative">
          {/* Optional Secondary Nav (e.g. local sidebar for AI assistant or Skills) */}
          {secondaryNav && !isFunFlixRoute && (
            <aside className="hidden lg:block w-64 border-r border-border/50 bg-surface/30 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto" aria-label="Secondary navigation">
              {secondaryNav}
            </aside>
          )}

          {/* Core Page Outlet — remove Topbar/BottomNav padding for FunFlix */}
          <main
            id="main-content"
            className={cn(
              "flex-1 w-full min-w-0 overflow-x-hidden relative z-0",
              isFunFlixRoute ? "pt-0 pb-0" : "pb-20 md:pb-0 pt-16"
            )}
            tabIndex={-1}
          >
            {isSuspended && (
              <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs sm:text-sm text-amber-200 flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in duration-300">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    <strong>Membership Restricted: </strong>
                    Your member privileges are suspended
                    {roleData?.suspendedUntil
                      ? ` until ${new Date(
                          roleData.suspendedUntil?.toMillis
                            ? roleData.suspendedUntil.toMillis()
                            : roleData.suspendedUntil
                        ).toLocaleString()}`
                      : ''}.
                    {roleData?.suspendedReason ? ` Reason: ${roleData.suspendedReason}` : ''}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Suspended
                </span>
              </div>
            )}
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation — hidden on FunFlix */}
      {!isFunFlixRoute && <MobileBottomNav />}

      {/* Topbar - Fixed at highest z-index, rendered last to be on top — hidden on FunFlix */}
      {!isFunFlixRoute && <Topbar />}
    </div>
  );
}
