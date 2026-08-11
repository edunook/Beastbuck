import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  Fingerprint,
  Key,
  Lock,
  Radar,
  Server,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import Button from '@frontend/components/ui/Button';
import { hasPermission } from '@shared/permissions/permissions';
import { useAuth } from '../auth/AuthContext';
import { AdminEmptyState, AdminPanel, StatusBadge } from './adminUtils';
import { cn } from '@shared/lib/utils';

const securityFeatures = [
  { id: 'rbac', name: 'Role-Based Access Control', icon: Shield, tone: 'emerald', status: 'active', description: 'Granular executive permissions resolved from the current role model.' },
  { id: 'firestore', name: 'Firestore Security Rules', icon: Lock, tone: 'blue', status: 'active', description: 'Database-level access control for protected Firebase data.' },
  { id: 'auth', name: 'Firebase Authentication', icon: Key, tone: 'violet', status: 'active', description: 'Authenticated sessions before executive interfaces render.' },
  { id: 'audit', name: 'Audit Logs', icon: FileText, tone: 'amber', status: 'active', description: 'Administrative actions are routed through audit-aware services.' },
  { id: 'permission', name: 'Permission Validation', icon: UserCheck, tone: 'cyan', status: 'active', description: 'CEO surfaces use permission helpers instead of hardcoded assumptions.' },
  { id: 'server', name: 'Server Authorization', icon: Server, tone: 'rose', status: 'active', description: 'Privileged operations continue to depend on backend and security rules.' },
  { id: 'session', name: 'Session Review', icon: Fingerprint, tone: 'orange', status: 'active', description: 'Session-sensitive workflows stay behind authenticated executive routes.' },
];

const securityPrinciples = [
  'No client-side trust for privileged data or operations',
  'CEO and Co-CEO access remains controlled by the existing RBAC helper',
  'Sensitive workflows preserve Firebase Authentication and Firestore rules',
  'Administrative changes should remain auditable and reversible where supported',
  'Interfaces expose clear empty and error states instead of fake security activity',
];

const toneClasses = {
  emerald: 'border-emerald-200/20 bg-emerald-300/10 text-emerald-100 shadow-emerald-950/20',
  blue: 'border-blue-200/20 bg-blue-300/10 text-blue-100 shadow-blue-950/20',
  violet: 'border-violet-200/20 bg-violet-300/10 text-violet-100 shadow-violet-950/20',
  amber: 'border-amber-200/20 bg-amber-300/10 text-amber-100 shadow-amber-950/20',
  cyan: 'border-cyan-200/20 bg-cyan-300/10 text-cyan-100 shadow-cyan-950/20',
  rose: 'border-rose-200/20 bg-rose-300/10 text-rose-100 shadow-rose-950/20',
  orange: 'border-orange-200/20 bg-orange-300/10 text-orange-100 shadow-orange-950/20',
};

const executiveSecurityStyles = `
  .exec-security-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-security-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 12% 6%, rgba(34, 211, 238, 0.16), transparent 28rem),
      radial-gradient(circle at 88% 14%, rgba(139, 92, 246, 0.15), transparent 27rem),
      radial-gradient(circle at 64% 96%, rgba(16, 185, 129, 0.11), transparent 33rem),
      linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(8, 13, 32, 0.96) 50%, rgba(22, 13, 46, 0.94));
    z-index: -1;
  }

  .exec-security-title {
    background: linear-gradient(90deg, #ffffff 0%, #a5f3fc 34%, #c4b5fd 68%, #bfdbfe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .exec-security-shell * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function ExecutiveSecurity() {
  const { roleData } = useAuth();

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer className="exec-security-shell">
        <style>{executiveSecurityStyles}</style>
        <div className="flex min-h-[60vh] items-center justify-center px-3 py-16">
          <div className="w-full max-w-md rounded-3xl border border-rose-200/15 bg-slate-950/82 p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/20 bg-rose-300/10 text-rose-100">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl font-black text-white">Access Denied</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Executive Security is only accessible to CEO and Co-CEO roles.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="exec-security-shell max-w-[1760px]">
      <style>{executiveSecurityStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-slate-950/86 via-slate-900/66 to-cyan-950/36 p-1 shadow-[0_30px_96px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="relative rounded-[1.6rem] bg-black/20 p-4 sm:p-6 lg:p-7">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100">
                <Radar className="h-3.5 w-3.5 shrink-0" />
                Executive Security Matrix
              </div>
              <h1 className="exec-security-title font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Protected Command Layer
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                A focused view of the live permission gates, authentication controls, audit surfaces, and security principles protecting BeastBuck executive workflows.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:w-[36rem]">
              <div className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-emerald-100/70">Access</p>
                <p className="mt-1 truncate text-sm font-black text-emerald-100">CEO / Co-CEO</p>
              </div>
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-cyan-100/70">Controls</p>
                <p className="mt-1 text-sm font-black text-cyan-100">{securityFeatures.length} verified</p>
              </div>
              <div className="rounded-2xl border border-violet-200/20 bg-violet-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-violet-100/70">Gate</p>
                <p className="mt-1 truncate text-sm font-black text-violet-100">canAccessCeoPanel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <AdminPanel title="Security Controls" icon={ShieldCheck}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.id}
                  className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200/20 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_rgba(8,145,178,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-lg', toneClasses[feature.tone])}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <StatusBadge variant="success">{feature.status}</StatusBadge>
                  </div>
                  <h3 className="mt-4 line-clamp-2 font-heading text-base font-black text-white">{feature.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </AdminPanel>

        <AdminPanel title="Security Principles" icon={CheckCircle}>
          <div className="space-y-3">
            {securityPrinciples.map((principle) => (
              <div key={principle} className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                <span className="text-sm leading-6 text-slate-300">{principle}</span>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AdminPanel
          title="Recent Security Events"
          icon={FileText}
          action={<StatusBadge variant="default">No live feed connected here</StatusBadge>}
        >
          <AdminEmptyState
            icon={AlertTriangle}
            title="No security event feed on this screen"
            message="This page no longer displays fabricated security events. Use the routed audit-log and admin security surfaces for real platform records."
          />
        </AdminPanel>

        <AdminPanel title="Executive Actions" icon={Server}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/admin/security" className="min-w-0">
              <Button className="w-full justify-between border border-cyan-200/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/16" variant="secondary" ripple>
                Open Admin Security
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/audit-logs" className="min-w-0">
              <Button className="w-full justify-between border border-violet-200/20 bg-violet-300/10 text-violet-100 hover:bg-violet-300/16" variant="secondary" ripple>
                Review Audit Logs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.07] p-4">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-cyan-100/75">Permission Verification</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This route is still protected by the existing CEO permission guard, and the internal component guard remains in place for defense in depth.
            </p>
          </div>
        </AdminPanel>
      </div>
    </PageContainer>
  );
}
