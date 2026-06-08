import { NavLink } from 'react-router-dom';
import { useGlobalStore } from '../../store/useGlobalStore';
import { useAuth } from '../../features/auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';
import { 
  X,
  LayoutDashboard, 
  Compass, 
  Activity,
  CheckSquare, 
  MessageSquare, 
  FlaskConical, 
  Package, 
  PackageOpen,
  Palette,
  Lightbulb, 
  Trophy, 
  Bell,
  BarChart3,
  Bot,
  User,
  Settings,
  ClipboardCheck,
  Megaphone,
  Building2,
  ShieldCheck,
  Brain,
  BriefcaseBusiness,
  Calendar,
  UserCircle2,
  GraduationCap,
  BookOpen,
  UsersRound,
  Sparkles,
  Workflow,
  Menu,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect } from 'react';

const BOTTOM_NAV_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'Ventures', path: '/ventures', icon: BriefcaseBusiness },
  { name: 'Menu', path: '#', icon: Menu, isDrawerTrigger: true },
];

const DRAWER_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Communities', path: '/communities', icon: UsersRound },
  { name: 'Discover', path: '/discover', icon: Compass },
  { name: 'Showcase', path: '/showcase', icon: Sparkles },
  { name: 'Experiments', path: '/workspace/experiments', icon: FlaskConical },
  { name: 'Products', path: '/workspace/products', icon: Package },
  { name: 'Marketplace', path: '/marketplace', icon: PackageOpen },
  { name: 'Creative Hub', path: '/creative', icon: Palette },
  { name: 'Skills', path: '/workspace/skills', icon: Lightbulb },
  { name: 'Organization', path: '/organization', icon: Building2 },
  { name: 'Innovation', path: '/innovation', icon: FlaskConical },
  { name: 'Knowledge Hub', path: '/knowledge', icon: BookOpen },
  { name: 'Automation', path: '/automation', icon: Workflow },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Portfolios', path: '/portfolios', icon: UserCircle2 },
  { name: 'Announcements', path: '/announcements', icon: Megaphone },
  { name: 'Leaderboards', path: '/leaderboards', icon: Trophy },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Assessment', path: '/assessment', icon: ClipboardCheck },
  { name: 'AI Assistant', path: '/ai', icon: Bot },
];

export default function MobileDrawer() {
  const { isMobileDrawerOpen, toggleMobileDrawer } = useGlobalStore();
  const { roleData } = useAuth();
  const role = roleData?.role;
  const isAdmin = hasPermission(role, 'canAccessCeoPanel');

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
      {/* Bottom Navigation Bar - Always visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface backdrop-blur-glass-md border-t border-border z-notification md:hidden">
        <div className="flex items-center justify-around h-16">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.isDrawerTrigger) {
              return (
                <button
                  key={item.name}
                  onClick={toggleMobileDrawer}
                  aria-label={item.name}
                  className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] text-text-muted hover:text-accent transition-colors"
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                  <span className="text-badge font-medium">{item.name}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={item.name}
                to={item.path}
                aria-label={item.name}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] transition-colors",
                  isActive ? "text-accent" : "text-text-muted hover:text-text"
                )}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
                <span className="text-badge font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Drawer (opened via Menu button) */}
      {!isMobileDrawerOpen ? null : (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-glass-sm z-modal-backdrop md:hidden transition-opacity"
            onClick={toggleMobileDrawer}
          />
          
          <div className="fixed inset-y-0 left-0 w-[280px] bg-surface border-r border-border z-modal md:hidden flex flex-col shadow-depth-3 animate-in slide-in-from-left duration-slow">
            
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
              {DRAWER_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
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
                    to="/admin/dashboard"
                    onClick={toggleMobileDrawer}
                    aria-label="Command Center"
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-base min-h-[44px]",
                      isActive 
                        ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_3px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt" 
                        : "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
                    )}
                  >
                    <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-badge">Command Center</span>
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
