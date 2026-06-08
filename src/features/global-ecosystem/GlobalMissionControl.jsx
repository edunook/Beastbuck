import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Map } from 'lucide-react';

export default function GlobalMissionControl() {
  return (
    <PageContainer>
      <PageHeader title="Global Mission Control" description="Centralized oversight of global ecosystem operations." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/40 p-12 text-center backdrop-blur-sm">
        <Map className="mb-4 h-16 w-16 text-blue-400" />
        <h3 className="text-2xl font-bold text-white">Global Command Center</h3>
        <p className="mt-2 text-text-muted">Monitoring real-time activity across 142 communities and 890 local chapters.</p>
        <button className="mt-6 rounded-lg bg-accent px-6 py-2 font-bold text-black hover:bg-accent/80">Launch Command Interface</button>
      </div>
    </PageContainer>
  );
}
