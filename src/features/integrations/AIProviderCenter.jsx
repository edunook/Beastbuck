import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Settings2 } from 'lucide-react';

const PROVIDERS = [
  { name: 'Google Gemini', status: 'Primary', latency: '45ms', cost: '$0.00/1k', active: true, icon: '✨' },
  { name: 'OpenAI GPT-4', status: 'Fallback', latency: '120ms', cost: '$0.01/1k', active: true, icon: '🧠' },
  { name: 'Anthropic Claude 3', status: 'Research Task', latency: '95ms', cost: '$0.015/1k', active: true, icon: '👁️' },
  { name: 'Local Model (Llama 3)', status: 'Offline Mode', latency: '15ms', cost: 'Free', active: false, icon: '🦙' },
];

export default function AIProviderCenter() {
  return (
    <PageContainer>
      <PageHeader title="AI Provider Hub" description="Manage LLM providers, routing logic, and usage costs." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[{ label: 'Total API Calls (30d)', value: '4.2M' }, { label: 'Avg Latency', value: '78ms' }, { label: 'Est. Cost', value: '$45.20' }].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((p, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">{p.icon}</div>
              <div>
                <h3 className="font-bold text-white">{p.name}</h3>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'}`}>{p.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <p className="text-text-muted">Latency</p>
                <p className="font-bold text-white">{p.latency}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted">Cost</p>
                <p className="font-bold text-white">{p.cost}</p>
              </div>
              <button className="rounded-lg bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white"><Settings2 className="h-5 w-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
