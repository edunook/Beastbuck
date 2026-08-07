import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { GraduationCap } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Coursera', desc: 'Import courses and sync certifications.', connected: true },
  { name: 'edX', desc: 'Sync progress from university programs.', connected: false },
  { name: 'Khan Academy', desc: 'Import foundational learning modules.', connected: true },
  { name: 'Udemy', desc: 'Sync skill-based course progress.', connected: false },
];

export default function LearningIntegrations() {
  return (
    <PageContainer>
      <PageHeader title="Learning Integrations" description="Connect external educational platforms to your BeastBuck Academy profile." />
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((app, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <GraduationCap className="h-6 w-6" />
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
