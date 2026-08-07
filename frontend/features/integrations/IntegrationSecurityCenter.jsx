import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { ShieldAlert, Key, Lock, Activity } from 'lucide-react';

const ALERTS = [
  { time: '10 min ago', msg: 'Rate limit exceeded for API Key "Local Testing".', severity: 'Medium' },
  { time: '1h ago', msg: 'New OAuth connection established with Google Workspace.', severity: 'Low' },
  { time: '2h ago', msg: 'Failed authentication attempt from IP 192.168.1.45.', severity: 'High' },
];

export default function IntegrationSecurityCenter() {
  return (
    <PageContainer>
      <PageHeader title="Integration Security Center" description="Monitor API security, OAuth connections, and secret management." />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Active OAuth Apps', value: '12', icon: Lock, color: 'text-emerald-400' },
          { label: 'Active API Keys', value: '3', icon: Key, color: 'text-blue-400' },
          { label: 'Rate Limits Hit (24h)', value: '45', icon: Activity, color: 'text-yellow-400' },
          { label: 'Security Alerts', value: '1', icon: ShieldAlert, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
        <h3 className="mb-4 font-heading font-bold text-white">Security Alerts & Audit Log</h3>
        <div className="space-y-3">
          {ALERTS.map((a, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <ShieldAlert className={`h-5 w-5 shrink-0 ${a.severity === 'High' ? 'text-red-400' : a.severity === 'Medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
              <div className="flex-1">
                <p className="text-sm text-white">{a.msg}</p>
                <p className="text-xs text-text-muted">{a.time}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.severity === 'High' ? 'bg-red-500/20 text-red-400' : a.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {a.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
