import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Brain,
  FileText,
  Search,
  Users,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { cn } from '@shared/lib/utils';

const TABS = [
  { name: 'Dashboard', path: '/mission-control/dashboard', icon: BarChart3 },
  { name: 'Executive Alerts', path: '/mission-control/alerts', icon: AlertTriangle },
  { name: 'Project Health', path: '/mission-control/projects', icon: Activity },
  { name: 'Innovation Health', path: '/mission-control/innovation', icon: FlaskConical },
  { name: 'Member Analytics', path: '/mission-control/members', icon: Users },
  { name: 'Global Search', path: '/mission-control/search', icon: Search },
  { name: 'Reports', path: '/mission-control/reports', icon: FileText },
  { name: 'AI Insights', path: '/mission-control/ai', icon: Brain },
  { name: 'Universe Analytics', path: '/mission-control/universe', icon: Orbit },
];

const missionLayoutStyles = `
  .exec-mission-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-mission-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 8%, rgba(34, 211, 238, 0.15), transparent 28rem),
      radial-gradient(circle at 84% 10%, rgba(124, 58, 237, 0.16), transparent 26rem),
      radial-gradient(circle at 70% 92%, rgba(59, 130, 246, 0.12), transparent 34rem),
      linear-gradient(135deg, rgba(3, 7, 18, 0.94), rgba(7, 13, 34, 0.96) 48%, rgba(20, 14, 46, 0.95));
    z-index: -1;
  }

  .exec-mission-title {
    background: linear-gradient(90deg, #ffffff 0%, #bfdbfe 34%, #a5f3fc 62%, #ddd6fe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

export const FullScreenLoader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.3)]" />
  </div>
);

export default function MissionControlLayout() {
  const { roleData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = hasPermission(roleData?.role, 'canAccessCeoPanel');
  const activeTab = TABS.find(tab => location.pathname.startsWith(tab.path));

  useEffect(() => {
    if (location.pathname === '/mission-control') {
      navigate('/mission-control/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <PageContainer className="exec-mission-shell max-w-[1760px]">
      <style>{missionLayoutStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950/82 via-slate-900/62 to-indigo-950/42 p-1 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="rounded-[1.55rem] bg-black/20 p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/18 via-violet-300/14 to-blue-500/16 text-cyan-100 shadow-[0_20px_46px_rgba(34,211,238,0.12)]">
                <Brain className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border border-slate-950 bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Executive Intelligence Layer
                </div>
                <h1 className="exec-mission-title font-heading text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  Mission Control
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Intelligence, health scoring, alerts, reports, and cross-platform executive analytics for BeastBuck leadership.
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="grid gap-2 sm:grid-cols-3 lg:w-[34rem]">
                {[
                  { to: '/command-center', label: 'Command', icon: ShieldCheck, tone: 'from-violet-300/16 to-blue-400/10 text-violet-100 border-violet-200/20' },
                  { to: '/membership-center', label: 'Membership', icon: Users, tone: 'from-amber-300/16 to-orange-400/10 text-amber-100 border-amber-200/20' },
                  { to: '/executive-ai', label: 'Exec AI', icon: Brain, tone: 'from-cyan-300/16 to-blue-400/10 text-cyan-100 border-cyan-200/20' },
                ].map(action => {
                  const Icon = action.icon;
                  return (
                    <NavLink
                      key={action.to}
                      to={action.to}
                      className={cn('flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border bg-gradient-to-br px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:brightness-110', action.tone)}
                    >
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7" aria-label="Mission Control navigation">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) => cn(
                    'group flex min-h-[48px] min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-cyan-200/25',
                    isActive
                      ? 'border-cyan-200/35 bg-gradient-to-br from-cyan-300/16 via-violet-300/12 to-blue-400/10 text-white shadow-[0_18px_44px_rgba(34,211,238,0.12)]'
                      : 'border-white/10 bg-white/[0.045] text-slate-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075] hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-cyan-100" />
                  <span className="truncate">{tab.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {activeTab && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-400">
              Active intelligence surface: <span className="text-cyan-100">{activeTab.name}</span>
            </div>
          )}
        </div>
      </section>

      <div className="min-h-[50vh]">
        <Suspense fallback={<FullScreenLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </PageContainer>
  );
}
