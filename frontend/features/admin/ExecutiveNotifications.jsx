import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { Bell, AlertTriangle, Shield, FileText, Rocket, ShoppingBag, Activity, Crown, CheckCircle2, Radio } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import Button from '@frontend/components/ui/Button';
import { AdminEmptyState, AdminPanel, StatusBadge } from './adminUtils';
import { cn } from '@shared/lib/utils';

const executivePageStyles = `
  .exec-standalone {
    position: relative;
    isolation: isolate;
  }

  .exec-standalone::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 8%, rgba(34, 211, 238, 0.15), transparent 28rem),
      radial-gradient(circle at 86% 10%, rgba(139, 92, 246, 0.16), transparent 26rem),
      radial-gradient(circle at 70% 94%, rgba(59, 130, 246, 0.12), transparent 34rem),
      linear-gradient(135deg, rgba(3, 7, 18, 0.94), rgba(7, 13, 34, 0.96) 48%, rgba(20, 14, 46, 0.95));
    z-index: -1;
  }

  .exec-standalone-title {
    background: linear-gradient(90deg, #ffffff 0%, #bfdbfe 34%, #a5f3fc 62%, #ddd6fe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const notificationTypes = [
  { id: 'membership', name: 'Membership Requests', icon: Crown, color: 'text-amber-100 border-amber-200/20 from-amber-300/18 to-orange-400/10', description: 'New membership applications' },
  { id: 'security', name: 'Security Alerts', icon: Shield, color: 'text-rose-100 border-rose-200/20 from-rose-300/18 to-red-400/10', description: 'Security threats and breaches' },
  { id: 'reports', name: 'Reports', icon: FileText, color: 'text-blue-100 border-blue-200/20 from-blue-300/18 to-cyan-400/10', description: 'Weekly and monthly reports' },
  { id: 'errors', name: 'System Errors', icon: AlertTriangle, color: 'text-orange-100 border-orange-200/20 from-orange-300/18 to-amber-400/10', description: 'Critical system errors' },
  { id: 'research', name: 'Research Published', icon: FileText, color: 'text-emerald-100 border-emerald-200/20 from-emerald-300/18 to-teal-400/10', description: 'New research publications' },
  { id: 'ai', name: 'AI Published', icon: Activity, color: 'text-violet-100 border-violet-200/20 from-violet-300/18 to-fuchsia-400/10', description: 'New AI models created' },
  { id: 'movies', name: 'Movie Published', icon: Rocket, color: 'text-pink-100 border-pink-200/20 from-pink-300/18 to-rose-400/10', description: 'New FunFlix uploads' },
  { id: 'marketplace', name: 'Marketplace Listings', icon: ShoppingBag, color: 'text-cyan-100 border-cyan-200/20 from-cyan-300/18 to-blue-400/10', description: 'New marketplace products' },
  { id: 'platform', name: 'Platform Issues', icon: AlertTriangle, color: 'text-rose-100 border-rose-200/20 from-rose-300/18 to-orange-400/10', description: 'Platform-wide issues' },
  { id: 'emergency', name: 'Emergency Alerts', icon: Bell, color: 'text-red-100 border-red-200/20 from-red-300/18 to-rose-400/10', description: 'Critical emergency notifications' },
];

function AccessDenied() {
  return (
    <PageContainer className="exec-standalone">
      <style>{executivePageStyles}</style>
      <AdminEmptyState
        icon={Bell}
        title="Access Denied"
        message="Executive Notifications is only accessible to CEO and Co-CEOs."
      />
    </PageContainer>
  );
}

export default function ExecutiveNotifications() {
  const { roleData } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return <AccessDenied />;
  }

  return (
    <PageContainer className="exec-standalone max-w-[1760px]">
      <style>{executivePageStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950/82 via-slate-900/62 to-indigo-950/42 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Radio className="h-3.5 w-3.5" />
              Executive notification routing
            </div>
            <h1 className="exec-standalone-title font-heading text-3xl font-black tracking-tight sm:text-4xl">
              Executive Notifications
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              CEO and Co-CEO notification controls for membership requests, security, platform health, content events, and emergency signals.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-slate-400">Notification engine</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge variant={notificationsEnabled ? 'success' : 'warning'}>
                {notificationsEnabled ? 'Enabled' : 'Paused'}
              </StatusBadge>
            </div>
          </div>
        </div>
      </section>

      <AdminPanel
        title="Notification Types"
        icon={Bell}
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Enable</span>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              aria-pressed={notificationsEnabled}
              className={cn(
                'relative h-8 w-14 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-cyan-200/25',
                notificationsEnabled ? 'border-emerald-200/30 bg-emerald-300/20' : 'border-white/10 bg-white/[0.08]'
              )}
            >
              <span className={cn('absolute top-1 h-6 w-6 rounded-full bg-white transition-transform', notificationsEnabled ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>
        }
      >
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <article key={type.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
                <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br', type.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-heading text-sm font-black text-white">{type.name}</h4>
                <p className="mt-2 text-xs leading-5 text-slate-400">{type.description}</p>
              </article>
            );
          })}
        </div>
      </AdminPanel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Recent Alerts" icon={AlertTriangle}>
          <AdminEmptyState
            icon={AlertTriangle}
            title="No real-time executive alerts loaded"
            message="Connected executive alert records will appear here when the notification backend provides them."
          />
        </AdminPanel>

        <AdminPanel title="Notification Channels" icon={CheckCircle2}>
          <div className="space-y-3">
            {[
              ['In-App Notifications', notificationsEnabled ? 'Enabled' : 'Paused', notificationsEnabled ? 'success' : 'warning'],
              ['Email Alerts', 'Configured', 'success'],
              ['Push Notifications (Mobile)', 'Not connected', 'default'],
              ['SMS Alerts (Critical Only)', 'Not connected', 'default'],
            ].map(([label, value, variant]) => (
              <div key={label} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-bold text-white">{label}</span>
                <StatusBadge variant={variant}>{value}</StatusBadge>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <Button className="mt-6 w-full bg-gradient-to-r from-cyan-200 via-violet-200 to-blue-200 font-black text-slate-950 hover:brightness-110">
        Save Notification Settings
      </Button>
    </PageContainer>
  );
}
