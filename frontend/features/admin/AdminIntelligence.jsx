import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Activity, ShieldAlert, Sparkles, Settings } from 'lucide-react';

export default function AdminIntelligence() {
  return (
    <PageContainer>
      <PageHeader
        title="Intelligence Configuration"
        description="Manage predictive models, alert thresholds, and strategic rules for the AI Intelligence Network."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Threshold Settings', icon: Settings, desc: 'Configure Risk & Opportunity triggers.', status: 'Active' },
          { title: 'Predictive Models', icon: Activity, desc: 'Manage AI forecast parameters.', status: 'Optimized' },
          { title: 'Alerts Pipeline', icon: ShieldAlert, desc: 'Routing rules for critical warnings.', status: 'Active' },
          { title: 'Data Connectors', icon: Sparkles, desc: 'Manage links to external intelligence.', status: 'Healthy' }
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-surface/40 p-5 transition-hover hover:border-accent/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1 font-bold text-white">{item.title}</h3>
            <p className="mb-4 text-sm text-text-muted">{item.desc}</p>
            <div className="text-xs font-bold text-green-400">{item.status}</div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
