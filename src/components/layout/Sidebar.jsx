import { NavLink, Link } from 'react-router-dom';
import { useGlobalStore } from '../../store/useGlobalStore';
import { useAuth } from '../../features/auth/AuthContext';
import { hasPermission, PERMISSIONS } from '../../services/firebase/permissions';
import { 
  LayoutDashboard, 
  GraduationCap,
  CheckSquare, 
  BookOpen, 
  Lightbulb, 
  UsersRound,
  FolderKanban,
  BriefcaseBusiness,
  PackageOpen,
  Film,
  Sparkles,
  Workflow,
  Building2,
  Scale,
  Radar,
  Calendar,
  ShieldCheck,
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', path: '/portfolio', icon: User },
  {
    label: 'Projects',
    icon: CheckSquare,
    path: '/tasks',
    subItems: [
      { label: 'Tasks Hub', path: '/tasks' },
      { label: 'Workspace', path: '/workspace' },
      { label: 'Experiments', path: '/workspace/experiments' },
      { label: 'Products', path: '/workspace/products' },
    ],
  },
  {
    label: 'Research',
    icon: BookOpen,
    path: '/knowledge',
    subItems: [
      { label: 'Knowledge Hub', path: '/knowledge' },
      { label: 'Knowledge Maps', path: '/knowledge/maps' },
      { label: 'Experts', path: '/experts' },
      { label: 'Mentorship', path: '/mentorship' },
      { label: 'Q&A', path: '/knowledge/requests' },
    ],
  },
  {
    label: 'Innovation',
    icon: Lightbulb,
    path: '/innovation/explore',
    subItems: [
      { label: 'Innovation Showcase', path: '/innovation/explore' },
      { label: 'Ventures', path: '/ventures' },
      { label: 'Incubator', path: '/incubator' },
      { label: 'Startup Builder', path: '/venture-builder' },
    ],
  },
  {
    label: 'Community',
    icon: UsersRound,
    path: '/communities',
    subItems: [
      { label: 'Communities', path: '/communities' },
      { label: 'Chat', path: '/chat' },
      { label: 'Showcase', path: '/showcase' },
      { label: 'Discover', path: '/discover' },
    ],
  },
  {
    label: 'Workspace',
    icon: FolderKanban,
    path: '/workspace',
    subItems: [
      { label: 'Workspace Hub', path: '/workspace' },
      { label: 'Skills', path: '/workspace/skills' },
      { label: 'Creative Hub', path: '/creative' },
    ],
  },
  {
    label: 'Ventures',
    icon: BriefcaseBusiness,
    path: '/ventures',
    subItems: [
      { label: 'Venture Hub', path: '/ventures' },
      { label: 'Venture Directory', path: '/ventures/explore' },
      { label: 'Incubator', path: '/incubator' },
      { label: 'Startup Builder', path: '/venture-builder' },
    ],
  },
  {
    label: 'Marketplace',
    icon: PackageOpen,
    path: '/marketplace',
    subItems: [
      { label: 'Marketplace Home', path: '/marketplace' },
      { label: 'Products & Assets', path: '/marketplace' },
      { label: 'Services', path: '/services' },
      { label: 'Creators Hub', path: '/creators' },
    ],
  },
  {
    label: 'FunFlix',
    icon: Film,
    path: '/funflix',
    subItems: [
      { label: 'FunFlix Home', path: '/funflix' },
      { label: 'Creator Studio', path: '/funflix/studio' },
      { label: 'My Movies', path: '/funflix/my-movies' },
      { label: 'Challenges', path: '/funflix/challenges' },
    ],
  },
  {
    label: 'AI Studio',
    icon: Sparkles,
    path: '/ai-studio',
    subItems: [
      { label: 'AI Marketplace', path: '/ais' },
      { label: 'Create AI', path: '/ai-studio/create' },
      { label: 'My AIs', path: '/ai-studio' },
      { label: 'Collections', path: '/ai-collections' },
      { label: 'Training Center', path: '/ai-studio/training' },
    ],
  },
  {
    label: 'Automation',
    icon: Workflow,
    path: '/automation',
    subItems: [
      { label: 'Agent OS', path: '/automation' },
      { label: 'Agent Builder', path: '/automation/builder' },
      { label: 'Automation Center', path: '/automation/center' },
      { label: 'Agent Marketplace', path: '/automation/marketplace' },
      { label: 'Analytics', path: '/automation/analytics' },
    ],
  },
  {
    label: 'Organization',
    icon: Building2,
    path: '/organization',
    subItems: [
      { label: 'Organization Hub', path: '/organization' },
      { label: 'Collaboration', path: '/collaboration' },
      { label: 'Voice Rooms', path: '/voice' },
      { label: 'Meetings', path: '/meetings' },
      { label: 'War Rooms', path: '/war-rooms' },
    ],
  },
  {
    label: 'Governance',
    icon: Scale,
    path: '/governance',
    subItems: [
      { label: 'Governance Center', path: '/governance' },
      { label: 'Elections', path: '/governance/elections' },
      { label: 'Verification', path: '/governance/verification' },
      { label: 'Endorsements', path: '/governance/endorsements' },
    ],
  },
  {
    label: 'Intelligence',
    icon: Radar,
    path: '/intelligence',
    subItems: [
      { label: 'Intelligence Center', path: '/intelligence' },
      { label: 'Ecosystem Health', path: '/intelligence/health' },
      { label: 'Opportunity Scanner', path: '/intelligence/opportunities' },
      { label: 'Risk Center', path: '/intelligence/risks' },
    ],
  },
  {
    label: 'Events',
    icon: Calendar,
    path: '/events',
    subItems: [
      { label: 'Events', path: '/events' },
      { label: 'Portfolios', path: '/portfolios' },
      { label: 'Leaderboards', path: '/leaderboards' },
    ],
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

const MEMBER_ONLY_ITEMS = ['Organization', 'Governance', 'Intelligence'];

export default function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useGlobalStore();
  const { roleData, user } = useAuth();
  const role = roleData?.role;
  const isAdmin = hasPermission(role, 'canAccessCeoPanel');
  const isApprovedMember = PERMISSIONS.isApprovedMember(role);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (MEMBER_ONLY_ITEMS.includes(item.label)) {
      return isApprovedMember;
    }
    return true;
  });

  return (
    <aside 
      aria-label="Main navigation"
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-sticky",
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

        {/* Admin Command Center - only for CEO/Admin roles */}
        {isAdmin && (
          <>
            <div className={cn("my-2 border-t border-border", isSidebarCollapsed ? "mx-2" : "mx-1")} />
            {!isSidebarCollapsed && (
              <p className="px-3 pb-1 text-badge font-bold uppercase tracking-widest text-text-muted/50">Admin</p>
            )}
            <NavItem
              item={{ name: 'Mission Control', path: '/mission-control', icon: Scale }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Command Center', path: '/admin/dashboard', icon: ShieldCheck }}
              isSidebarCollapsed={isSidebarCollapsed}
              isAdmin
            />
            <NavItem
              item={{ name: 'Memberships', path: '/admin/memberships', icon: UsersRound }}
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
