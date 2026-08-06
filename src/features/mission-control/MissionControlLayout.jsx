import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Brain,
  Building2,
  FileText,
  Search,
  Users,
  ShieldCheck,
  AlertTriangle,
  BriefcaseBusiness,
  PackageOpen,
  FlaskConical,
  Workflow,
  Orbit,
  Network
} from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';

const TABS = [
  { name: 'Dashboard', path: '/mission-control/dashboard', icon: BarChart3 },
  { name: 'Executive Alerts', path: '/mission-control/alerts', icon: AlertTriangle },
  { name: 'Project Health', path: '/mission-control/projects', icon: Activity },
  { name: 'Org Health', path: '/mission-control/org', icon: Building2 },
  { name: 'Innovation Health', path: '/mission-control/innovation', icon: FlaskConical },
  { name: 'Venture Health', path: '/mission-control/ventures', icon: BriefcaseBusiness },
  { name: 'Marketplace Health', path: '/mission-control/marketplace', icon: PackageOpen },
  { name: 'Automation Health', path: '/mission-control/automation', icon: Workflow },
  { name: 'Collaboration Health', path: '/mission-control/collaboration', icon: Network },
  { name: 'Member Analytics', path: '/mission-control/members', icon: Users },
  { name: 'Global Search', path: '/mission-control/search', icon: Search },
  { name: 'Reports', path: '/mission-control/reports', icon: FileText },
  { name: 'AI Insights', path: '/mission-control/ai', icon: Brain },
  { name: 'Universe Analytics', path: '/mission-control/universe', icon: Orbit },
];

export const FullScreenLoader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
  </div>
);

export default function MissionControlLayout() {
  const { roleData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = hasPermission(roleData?.role, 'canAccessCeoPanel');

  useEffect(() => {
    // If we land on /mission-control exactly, redirect to dashboard
    if (location.pathname === '/mission-control') {
      navigate('/mission-control/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <PageContainer>
      <PageHeader
        title="Mission Control"
        description="Intelligence, health scoring, and executive analytics."
        hero={true}
        action={
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <NavLink
                  to="/command-center"
                  className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-400 transition-all hover:bg-purple-500/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Command Center
                </NavLink>
                <NavLink
                  to="/membership-center"
                  className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-400 transition-all hover:bg-amber-500/20"
                >
                  <Users className="h-4 w-4" />
                  Membership Center
                </NavLink>
                <NavLink
                  to="/executive-ai"
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-400 transition-all hover:bg-cyan-500/20"
                >
                  <Brain className="h-4 w-4" />
                  Executive AI
                </NavLink>
              </>
            )}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <Brain className="h-6 w-6" />
            </div>
          </div>
        }
      />

      {/* Module Navigation */}
      <div className="mb-6 overflow-x-auto custom-scrollbar">
        <div className="flex min-w-max gap-2 border-b border-border/40 pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-accent/10 text-accent shadow-[inset_0_-2px_0_0_#00f0ff]'
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Sub-routes Rendered Here */}
      <div className="min-h-[50vh]">
        <Suspense fallback={<FullScreenLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </PageContainer>
  );
}
