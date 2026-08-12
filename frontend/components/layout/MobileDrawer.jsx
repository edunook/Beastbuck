import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useGlobalStore } from '@frontend/store/useGlobalStore';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { hasPermission, PERMISSIONS } from '@shared/permissions/permissions';
import { 
  X,
  LayoutDashboard, 
  MessageSquare, 
  Trophy, 
  Bot,
  User,
  Settings,
  Building2,
  ShieldCheck,
  Brain,
  BriefcaseBusiness,
  BookOpen,
  Sparkles,
  Film,
  Palette,
  Crown,
  Bell,
  Shield,
  Gamepad2,
  Calendar,
  FlaskConical,
  Orbit,
  Network,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@shared/lib/utils';



const DRAWER_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolios', path: '/portfolio', icon: User },
  { name: 'Creativity', path: '/creativity', icon: Palette },
  { name: 'Challenges', path: '/challenges', icon: Trophy },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'FunFlix Home', path: '/funflix', icon: Film },
  { name: 'My AIs', path: '/ai-studio', icon: Bot },
  { name: 'AI Marketplace', path: '/ais', icon: Bot },
  { name: 'AI Assistant', path: '/ai', icon: Bot },
  { name: 'Leaderboards', path: '/leaderboards', icon: Trophy },
  { name: 'Memobook', path: '/memobook', icon: BookOpen, memberOnly: true },
];

export default function MobileDrawer() {
  const { isMobileDrawerOpen, toggleMobileDrawer } = useGlobalStore();
  const { roleData, user } = useAuth();
  const role = roleData?.role;
  const normalizedRole = role?.toLowerCase().trim();
  const isAdmin = hasPermission(role, 'canAccessCeoPanel') || 
                  normalizedRole === 'main ceo' || 
                  normalizedRole === 'co-ceo' || 
                  normalizedRole === 'co ceo';

  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);

  const filteredNavItems = DRAWER_NAV_ITEMS.filter((item) => {
    // Handle member-only items with memberOnly property
    if (item.memberOnly) {
      return isApprovedMember;
    }
    return true;
  });

  // Close drawer on route change or escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) toggleMobileDrawer();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMobileDrawerOpen, toggleMobileDrawer]);

  return (
    <>
      {/* Drawer (opened via Menu button) */}
      {!isMobileDrawerOpen ? null : (
        <>
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-glass-sm md:hidden transition-opacity"
            onClick={toggleMobileDrawer}
            style={{ zIndex: 999998 }}
          />
          
          <div className="fixed inset-y-0 left-0 w-[280px] bg-background border-r border-border md:hidden flex flex-col shadow-depth-3 animate-in slide-in-from-left duration-slow" style={{ zIndex: 999999 }}>
            
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
              <img src="/logo.png" alt="BeastBuck" className="h-10 w-auto" />
              <button 
                onClick={toggleMobileDrawer}
                aria-label="Close navigation menu"
                className="p-3 -mr-3 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Nav */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={toggleMobileDrawer}
                    aria-label={item.name}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent/10 text-accent font-medium shadow-[inset_3px_0_0_0_var(--color-accent-0)] border-l-2 border-accent" 
                        : "text-text-muted hover:bg-surface hover:text-text hover:border-l-2 hover:border-border-100"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">{item.name}</span>
                  </NavLink>
                );
              })}

              {!isApprovedMember && user && (
                <NavLink
                  to="/membership/apply"
                  onClick={toggleMobileDrawer}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-accent/10 border border-accent/30 text-accent font-medium min-h-[44px]"
                >
                  <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="truncate text-badge">Apply for Membership</span>
                </NavLink>
              )}

              {/* Admin Command Center */}
              {isAdmin && (
                <>
                  <div className="my-2 mx-1 border-t border-border" />
                  <p className="px-4 pb-1 text-badge font-bold uppercase tracking-widest text-text-muted/50">Admin & Exec</p>
                  <NavLink
                    to="/mission-control"
                    onClick={toggleMobileDrawer}
                    aria-label="Mission Control"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <Brain className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Mission Control</span>
                  </NavLink>
                  <NavLink
                    to="/command-center"
                    onClick={toggleMobileDrawer}
                    aria-label="Executive Management"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <Crown className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Executive Mgmt</span>
                  </NavLink>
                  <NavLink
                    to="/platform-controls"
                    onClick={toggleMobileDrawer}
                    aria-label="Platform Controls"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Platform Controls</span>
                  </NavLink>
                  <NavLink
                    to="/critical-alerts"
                    onClick={toggleMobileDrawer}
                    aria-label="Critical Alerts"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <Bell className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Critical Alerts</span>
                  </NavLink>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={toggleMobileDrawer}
                    aria-label="Admin Dashboard"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset-3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <Building2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Admin Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/admin/membership-applications"
                    onClick={toggleMobileDrawer}
                    aria-label="Membership Applications"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <ClipboardList className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Membership Applications</span>
                  </NavLink>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-border grid grid-cols-2 gap-2 shrink-0">
              <NavLink 
                to="/profile" 
                onClick={toggleMobileDrawer}
                aria-label="Profile"
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-badge text-text-muted hover:bg-surface hover:text-text transition-colors min-h-[44px]"
              >
                <User className="w-4 h-4" aria-hidden="true" /> Profile
              </NavLink>
              <NavLink 
                to="/settings"
                onClick={toggleMobileDrawer}
                aria-label="Settings"
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-badge text-text-muted hover:bg-surface hover:text-text transition-colors min-h-[44px]"
              >
                <Settings className="w-4 h-4" aria-hidden="true" /> Settings
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
}
