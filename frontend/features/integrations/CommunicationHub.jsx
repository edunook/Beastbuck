import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { MessageSquare, Mail, Bell } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Discord', desc: 'Sync community events and messages.', connected: true, icon: MessageSquare },
  { name: 'Slack', desc: 'Team communication and workflow alerts.', connected: true, icon: MessageSquare },
  { name: 'Gmail', desc: 'Email notifications and alerts.', connected: false, icon: Mail },
  { name: 'Outlook', desc: 'Enterprise email and calendar.', connected: false, icon: Mail },
  { name: 'Telegram', desc: 'Fast mobile alerts for community.', connected: false, icon: Bell },
];

export default function CommunicationHub() {
  return (
    <PageContainer>
      <PageHeader title="Communication Integrations" description="Connect messaging and email platforms for seamless notifications." />
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((app, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <app.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{app.name}</h3>
                <p className="text-xs text-text-muted">{app.desc}</p>
              </div>
            </div>
            <button className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${app.connected ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-accent text-black hover:bg-accent/80'}`}>
              {app.connected ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
