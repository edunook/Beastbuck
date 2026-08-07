import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { ShieldCheck, ShieldAlert, Lock, Key } from 'lucide-react';

export default function SecurityCenter() {
  return (
    <PageContainer>
      <PageHeader title="Enterprise Security Center" description="Monitor threat vectors, audit logs, and system vulnerabilities." />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Security Score', value: '98/100', icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Active Threats', value: '0', icon: ShieldAlert, color: 'text-yellow-400' },
          { label: 'Failed Logins (24h)', value: '12', icon: Lock, color: 'text-red-400' },
          { label: 'API Keys Exposed', value: '0', icon: Key, color: 'text-blue-400' }
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-heading font-bold text-white">Firestore Rules Audit</h3>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex justify-between border-b border-border/50 pb-2"><span>Public Read Access</span><span className="text-emerald-400">Restricted</span></div>
            <div className="flex justify-between border-b border-border/50 pb-2"><span>User Profile Writes</span><span className="text-emerald-400">Authenticated Only</span></div>
            <div className="flex justify-between border-b border-border/50 pb-2"><span>Admin Collections</span><span className="text-emerald-400">Custom Claim Verified</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-heading font-bold text-white">Recent Security Events</h3>
          <div className="space-y-3">
            {[
              { event: 'Admin role granted to User_A', time: '10 min ago', status: 'Audited' },
              { event: 'Multiple failed logins (IP: 192.168.x.x)', time: '1 hr ago', status: 'Blocked' },
              { event: 'API Key Rotated: Production', time: '5 hrs ago', status: 'Success' }
            ].map((e, i) => (
              <div key={i} className="flex justify-between text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-white">{e.event}</span>
                <span className="text-text-muted">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
