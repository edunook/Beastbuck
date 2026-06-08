import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FileWarning,
  Gamepad2,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  Users,
  UserCog,
  ChevronRight,
  Calendar,
  FlaskConical,
  BriefcaseBusiness,
  GraduationCap,
  PackageOpen,
  Workflow,
  Orbit,
  Headphones,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { cn } from '../../lib/utils';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, desc: 'Platform overview' },
  { label: 'Members', path: '/admin/members', icon: Users, desc: 'Manage users' },
  { label: 'Roles', path: '/admin/roles', icon: UserCog, desc: 'Permission roles' },
  { label: 'Content', path: '/admin/content', icon: FileWarning, desc: 'Moderate content' },
  { label: 'Gamification', path: '/admin/gamification', icon: Gamepad2, desc: 'XP & badges' },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList, desc: 'Activity trail' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, desc: 'Growth metrics' },
  { label: 'Security', path: '/admin/security', icon: Shield, desc: 'Platform locks' },
  { label: 'Events', path: '/admin/events', icon: Calendar, desc: 'Manage events' },
  { label: 'Innovation', path: '/admin/innovation', icon: FlaskConical, desc: 'Approve innovations' },
  { label: 'Ventures', path: '/admin/ventures', icon: BriefcaseBusiness, desc: 'Incubator OS' },
  { label: 'Marketplace', path: '/admin/marketplace', icon: PackageOpen, desc: 'Resource exchange' },
  { label: 'Automation', path: '/admin/automation', icon: Workflow, desc: 'Smart ops' },
  { label: 'Universe', path: '/admin/universe', icon: Orbit, desc: 'Intelligence layer' },
  { label: 'Collaboration', path: '/admin/collaboration', icon: Headphones, desc: 'Voice & meetings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const activeNav = adminNav.find(n => location.pathname.startsWith(n.path));

  return (
    <PageContainer>
      {/* Command Center Header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface/90 via-surface/70 to-accent/5 p-1 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
        <div className="rounded-xl bg-black/30 p-4 md:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-alt/20 text-accent shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <ShieldCheck className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-status-success shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-black tracking-wide text-white md:text-2xl">
                  Command Center
                </h1>
                <p className="text-xs text-text-muted">
                  BeastBuck Admin OS
                  {activeNav && (
                    <>
                      <ChevronRight className="mx-1 inline h-3 w-3" />
                      <span className="text-accent">{activeNav.label}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-status-success/20 bg-status-success/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-status-success shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
              <span className="text-xs font-bold text-status-success">System Operational</span>
            </div>
          </div>

          {/* Navigation Grid */}
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12">
            {adminNav.map(({ label, path, icon: Icon, desc }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => cn(
                  'group relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-bold transition-all duration-200',
                  isActive
                    ? 'border-accent/40 bg-gradient-to-b from-accent/15 to-accent/5 text-accent shadow-[0_0_20px_rgba(0,240,255,0.1),inset_0_1px_0_rgba(0,240,255,0.2)]'
                    : 'border-border bg-white/[0.02] text-text-muted hover:border-white/10 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="leading-tight">{label}</span>
                <span className={cn(
                  'hidden text-[10px] font-normal leading-tight lg:block',
                  location.pathname.startsWith(path) ? 'text-accent/60' : 'text-text-muted/60',
                )}>
                  {desc}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <Outlet />
    </PageContainer>
  );
}
