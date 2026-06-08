import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { CheckCircle2 } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Google Workspace', status: 'Connected', sync: 'Active', icon: 'G' },
  { name: 'Notion', status: 'Connected', sync: 'Active', icon: 'N' },
  { name: 'Slack', status: 'Connected', sync: 'Active', icon: 'S' },
  { name: 'Microsoft 365', status: 'Not Connected', sync: 'Paused', icon: 'M' },
  { name: 'Trello', status: 'Not Connected', sync: 'Paused', icon: 'T' },
  { name: 'Jira', status: 'Connected', sync: 'Active', icon: 'J' },
];

export default function ProductivityIntegrations() {
  return (
    <PageContainer>
      <PageHeader title="Productivity Integrations" description="Connect your favorite tools to sync tasks, docs, and calendars." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((app, i) => (
          <div key={i} className="flex flex-col justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-accent/30 hover:bg-white/5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 font-bold text-white">{app.icon}</div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${app.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'}`}>
                {app.status === 'Connected' && <CheckCircle2 className="h-3 w-3" />} {app.status}
              </span>
            </div>
            <h3 className="mb-1 font-bold text-white">{app.name}</h3>
            <p className="mb-4 text-xs text-text-muted">Sync Status: {app.sync}</p>
            <button className={`w-full rounded-lg py-2 text-sm font-bold transition-colors ${app.status === 'Connected' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-accent text-black hover:bg-accent/80'}`}>
              {app.status === 'Connected' ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
