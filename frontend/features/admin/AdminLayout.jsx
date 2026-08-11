import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BadgeCheck,
  BrainCircuit,
  ClipboardList,
  FileWarning,
  Gamepad2,
  LayoutDashboard,
  Network,
  Shield,
  ShieldCheck,
  Users,
  UserCog,
  ChevronRight,
  Calendar,
  FlaskConical,
  Orbit,
  Crown,
  Sparkles,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { cn } from '@shared/lib/utils';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, desc: 'Platform overview' },
  { label: 'Members', path: '/admin/members', icon: Users, desc: 'Manage users' },
  { label: 'Memberships', path: '/admin/memberships', icon: BadgeCheck, desc: 'Review access' },
  { label: 'Roles', path: '/admin/roles', icon: UserCog, desc: 'Permission roles' },
  { label: 'Content', path: '/admin/content', icon: FileWarning, desc: 'Moderate content' },
  { label: 'Gamification', path: '/admin/gamification', icon: Gamepad2, desc: 'XP & badges' },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList, desc: 'Activity trail' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, desc: 'Growth metrics' },
  { label: 'Security', path: '/admin/security', icon: Shield, desc: 'Platform locks' },
  { label: 'Events', path: '/admin/events', icon: Calendar, desc: 'Manage events' },
  { label: 'Innovation', path: '/admin/innovation', icon: FlaskConical, desc: 'Approve innovations' },
  { label: 'Universe', path: '/admin/universe', icon: Orbit, desc: 'Intelligence layer' },
  { label: 'Intelligence', path: '/admin/intelligence', icon: BrainCircuit, desc: 'Decision signals' },
  { label: 'Ecosystem', path: '/admin/ecosystem', icon: Network, desc: 'System map' },
  { label: 'Exec Roles', path: '/executive-role-management', icon: Crown, desc: 'CEO & Co-CEO roles' },
];

const adminLayoutStyles = `
  .exec-admin-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-admin-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 8% 8%, rgba(34, 211, 238, 0.15), transparent 28rem),
      radial-gradient(circle at 88% 10%, rgba(139, 92, 246, 0.16), transparent 26rem),
      radial-gradient(circle at 60% 95%, rgba(59, 130, 246, 0.12), transparent 32rem),
      linear-gradient(135deg, rgba(3, 7, 18, 0.94), rgba(7, 13, 34, 0.96) 48%, rgba(20, 14, 46, 0.95));
    z-index: -1;
  }

  .exec-admin-title {
    background: linear-gradient(90deg, #ffffff 0%, #bfdbfe 34%, #a5f3fc 62%, #ddd6fe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .exec-admin-shell * {
      scroll-behavior: auto !important;
    }
  }
`;

export default function AdminLayout() {
  const location = useLocation();
  const activeNav = adminNav.find(n => location.pathname.startsWith(n.path));

  return (
    <PageContainer className="exec-admin-shell max-w-[1760px]">
      <style>{adminLayoutStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950/82 via-slate-900/62 to-indigo-950/42 p-1 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="rounded-[1.55rem] bg-black/20 p-4 sm:p-6">
          <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/18 via-violet-300/14 to-blue-500/16 text-cyan-100 shadow-[0_20px_46px_rgba(34,211,238,0.12)]">
                <ShieldCheck className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border border-slate-950 bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  CEO / Co-CEO Command Layer
                </div>
                <h1 className="exec-admin-title font-heading text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  Executive Command Center
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
                  <span>BeastBuck Admin OS</span>
                  {activeNav && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="font-bold text-cyan-100">{activeNav.label}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[22rem]">
              <div className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-emerald-100/70">Status</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
                  Operational
                </div>
              </div>
              <div className="rounded-2xl border border-violet-200/20 bg-violet-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-violet-100/70">Active surface</p>
                <p className="mt-1 truncate text-sm font-black text-violet-100">{activeNav?.label || 'Dashboard'}</p>
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8" aria-label="Executive admin navigation">
            {adminNav.map(({ label, path, icon: Icon, desc }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => cn(
                  'group relative flex min-w-0 flex-col items-start gap-2 rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-200/25',
                  isActive
                    ? 'border-cyan-200/35 bg-gradient-to-br from-cyan-300/16 via-violet-300/12 to-blue-400/10 text-white shadow-[0_18px_44px_rgba(34,211,238,0.12)]'
                    : 'border-white/10 bg-white/[0.045] text-slate-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075] hover:text-white',
                )}
              >
                <div className="flex w-full min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-cyan-100" />
                  <span className="truncate text-xs font-black">{label}</span>
                </div>
                <span className="line-clamp-2 text-[0.68rem] leading-4 text-slate-500 group-hover:text-slate-400">{desc}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </section>

      <Outlet />
    </PageContainer>
  );
}
