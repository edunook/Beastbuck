import { NavLink, Link } from 'react-router-dom';
import { useGlobalStore } from '@frontend/store/useGlobalStore';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { hasPermission, PERMISSIONS } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { 
  LayoutDashboard, 
  UsersRound,
  FolderKanban,
  Film,
  Sparkles,
  Scale,
  ShieldCheck,
  Shield,
  Bell,
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Trophy,
  Crown,
  Palette,
} from 'lucide-react';
import { cn } from '@shared/lib/utils';

const NAV_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolios', path: '/portfolio', icon: User },
  { name: 'Creativity', path: '/creativity', icon: Palette },
  { name: 'Challenges', path: '/challenges', icon: Trophy },
  {
    label: 'Workspace',
    icon: FolderKanban,
    path: '/workspace',
    subItems: [
      { label: 'Skills', path: '/workspace/skills' },
      { label: 'Creative Hub', path: '/creative' },
      { label: 'Experiments', path: '/workspace/experiments' },
      { label: 'Products', path: '/workspace/products' },
    ],
  },
  {
    label: 'FunFlix',
    icon: Film,
    path: '/funflix',
  },
  {
    label: 'My AIs',
    icon: Sparkles,
    path: '/ai-studio',
  },
  {
    label: 'AI Marketplace',
    icon: Sparkles,
    path: '/ais',
  },
  {
    label: 'AI Assistant',
    icon: Sparkles,
    path: '/ai',
  },
];

const BOTTOM_NAV_ITEMS = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

function NavItem({ item, isSidebarCollapsed, isAdmin: itemIsAdmin = false }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end
      aria-label={item.name || item.label}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-base group relative min-h-[44px]",
        isActive 
          ? itemIsAdmin
              ? "bg-accent-alt/10 text-accent-alt font-medium shadow-[inset_2px_0_0_0_var(--color-accent-alt-0)] border-l-2 border-accent-alt"
              : "bg-accent/10 text-accent font-medium shadow-[inset_2px_0_0_0_var(--color-accent-0)] border-l-2 border-accent"
          : itemIsAdmin
              ? "text-accent-alt/70 hover:bg-accent-alt/5 hover:text-accent-alt hover:border-l-2 hover:border-accent-alt/30"
              : "text-text-muted hover:bg-surface hover:text-text hover:border-l-2 hover:border-border-100"
      )}
    >
      <Icon className={cn("shrink-0", isSidebarCollapsed ? "w-6 h-6 mx-auto" : "w-5 h-5")} aria-hidden="true" />
      
      {!isSidebarCollapsed && (
        <span className="truncate text-badge">{item.name || item.label}</span>
      )}

      {isSidebarCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-surface border border-border text-text text-badge rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-notification whitespace-nowrap shadow-depth-2" role="tooltip">
          {item.name || item.label}
        </div>
      )}
    </NavLink>
  );
}

const MEMBER_ONLY_ITEMS = ['Organization', 'Governance', 'Intelligence', 'Research', 'Community', 'Ventures', 'Achievements', 'AI Studio'];


export default function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useGlobalStore();
  const { roleData, user } = useAuth();
  const role = roleData?.role;
  
  // Debug logging to check role value
  
  // Case-insensitive role matching for robustness
  const normalizedRole = role?.toLowerCase().trim();
  const isAdmin = hasPermission(role, 'canAccessCeoPanel') || 
                  normalizedRole === 'main ceo' || 
                  normalizedRole === 'co-ceo' || 
                  normalizedRole === 'co ceo';
  
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Completely hide member-only items for non-members
    if (MEMBER_ONLY_ITEMS.includes(item.label)) {
      return isApprovedMember === true;
    }
    // Show restricted items for all authenticated users (functionality restricted on pages)
    return true;
  });

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-[1500]",
        "bg-background border-r border-border transition-all duration-slow",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center border-b border-border shrink-0",
        isSidebarCollapsed ? "justify-center px-0" : "px-6 justify-between"
      )}>
        {!isSidebarCollapsed && (
          <img src="/logo.png" alt="BeastBuck" className="h-10 w-auto" />
        )}
        {isSidebarCollapsed && (
          <img src="/logo.png" alt="BeastBuck" className="h-8 w-auto" />
        )}
      </div>

      {/* Main Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 custom-scrollbar">
        {filteredNavItems.map((item, index) => (
          <NavItem key={item.name || item.label || index} item={item} isSidebarCollapsed={isSidebarCollapsed} />
        ))}

        {/* Apply for Membership - only for non-members */}
        {!isApprovedMember && user && (
          <Link
            to="/membership/apply"
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative min-h-[44px]",
              "bg-gradient-subtle-1 border border-accent/30 text-accent font-medium"
            )}
          >
            <Star className={cn("shrink-0", isSidebarCollapsed ? "w-6 h-6 mx-auto" : "w-5 h-5")} aria-hidden="true" />
            {!isSidebarCollapsed && (
              <span className="truncate">Apply for Membership</span>
            )}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border text-text text-badge rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-notification whitespace-nowrap" role="tooltip">
                Apply for Membership
              </div>
            )}
          </Link>
        )}

        {/* Executive Command Center - only for CEO/Admin roles */}
        {isAdmin && (
          <>
            <div className={cn("my-2 border-t border-border", isSidebarCollapsed ? "mx-2" : "mx-1")} />
            {!isSidebarCollapsed && (
              <p className="px-3 pb-1 text-badge font-bold uppercase tracking-widest text-text-muted/50">Executive</p>
            )}
            <NavItem
              item={{ name: 'Mission Control', path: '/mission-control', icon: Scale }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Command Center', path: '/command-center', icon: ShieldCheck }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Membership Center', path: '/membership-center', icon: UsersRound }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Executive AI', path: '/executive-ai', icon: Sparkles }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Executive Notifications', path: '/executive-notifications', icon: Bell }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Executive Security', path: '/executive-security', icon: Shield }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Role Management', path: '/executive-role-management', icon: Crown }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
          </>
        )}
      </nav>

      {/* Bottom Navigation */}
      <nav aria-label="Account navigation" className="p-3 border-t border-border space-y-1 shrink-0">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavItem key={item.name} item={item} isSidebarCollapsed={isSidebarCollapsed} />
        ))}
        
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isSidebarCollapsed}
          className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-surface hover:text-text transition-all mt-2 min-h-[44px]"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="truncate">Collapse</span>
            </>
          )}
        </button>
      </nav>
    </aside>
  );
}
