import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { PresenceService } from '@services/realtime/presence';
import { usePresenceStore } from '@frontend/store/usePresenceStore';

function getRouteActivityName(pathname) {
  if (!pathname) return 'Exploring BeastBuck';
  const path = pathname.toLowerCase();

  if (path === '/notifications') return 'Viewing Notifications Hub';
  if (path === '/dashboard') return 'Viewing Main Dashboard';
  if (path.startsWith('/funflix')) return 'Watching FunFlix';
  if (path.startsWith('/ai') || path.startsWith('/executive-ai')) return 'Coding in Executive AI OS';
  if (path.startsWith('/creative') || path.startsWith('/creativity')) return 'Creating in Creative Suite';
  if (path.startsWith('/memobook')) return 'Reading Memobook';
  if (path.startsWith('/leaderboards')) return 'Checking Leaderboards';
  if (path.startsWith('/chat')) return 'Active in Team Chat';
  if (path.startsWith('/tasks')) return 'Managing Tasks';
  if (path.startsWith('/workspace')) return 'Working in Workspace';
  if (path.startsWith('/experiments')) return 'Conducting Experiments';
  if (path.startsWith('/products')) return 'Browsing Marketplace Products';
  if (path.startsWith('/challenges')) return 'In Challenges Hub';
  if (path.startsWith('/profile')) return 'Viewing Member Profile';
  if (path.startsWith('/settings')) return 'Configuring Settings';
  if (path.startsWith('/membership-applications') || path.startsWith('/membership-center') || path.startsWith('/membership')) return 'Reviewing Membership Applications';
  if (path.startsWith('/command-center')) return 'Operating Command Center';
  if (path.startsWith('/hall-of-fame')) return 'Viewing Hall of Fame';
  if (path.startsWith('/universe')) return 'Exploring Universe Hub';

  return `Browsing ${path.replace('/', '')}`;
}

export function usePagePresenceTracker() {
  const { user } = useAuth();
  const location = useLocation();

  // 1. Subscribe globally to ALL platform presence (real-time stream)
  useEffect(() => {
    const unsub = PresenceService.subscribeToAllPresence((map) => {
      usePresenceStore.getState().setOnlineMembers(map);
    });
    return () => unsub();
  }, []);

  // 2. Track user's current page route & tab visibility
  useEffect(() => {
    if (!user?.uid) return;

    const activityTitle = getRouteActivityName(location.pathname);

    // Update presence for current route
    PresenceService.updatePresenceContext(user.uid, {
      state: 'online',
      activity: activityTitle,
      activeWorkspace: location.pathname,
      force: true,
    });

    // Periodic heartbeat to keep presence timestamp fresh (every 45s)
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        PresenceService.updatePresenceContext(user.uid, {
          state: 'online',
          activity: activityTitle,
          activeWorkspace: location.pathname,
          force: true,
        });
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        PresenceService.updatePresenceContext(user.uid, {
          state: 'away',
          activity: 'Away (Tab background)',
          force: true,
        });
      } else {
        PresenceService.updatePresenceContext(user.uid, {
          state: 'online',
          activity: activityTitle,
          force: true,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.uid, location.pathname]);
}
