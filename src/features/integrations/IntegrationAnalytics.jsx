import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BarChart3, Activity, Clock, Zap } from 'lucide-react';

const STATS = [
  { label: 'Total API Calls (7d)', value: '12.4M', icon: BarChart3, color: 'text-blue-400' },
  { label: 'Webhook Deliveries', value: '450K', icon: Zap, color: 'text-purple-400' },
  { label: 'Avg Latency', value: '62ms', icon: Clock, color: 'text-emerald-400' },
  { label: 'Error Rate', value: '0.01%', icon: Activity, color: 'text-red-400' },
];

const DAILY = [
  { day: 'Mon', value: 1.2 }, { day: 'Tue', value: 1.5 }, { day: 'Wed', value: 1.8 },
  { day: 'Thu', value: 2.1 }, { day: 'Fri', value: 1.9 }, { day: 'Sat', value: 2.4 }, { day: 'Sun', value: 1.5 },
];
const maxVal = Math.max(...DAILY.map(d => d.value));

export default function IntegrationAnalytics() {
  return (
    <PageContainer>
      <PageHeader title="Integration Analytics" description="Monitor API usage, webhook delivery performance, and developer activity." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-5 w-5 ${s.color}`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-heading font-bold text-white">API Request Volume (Millions)</h3>
        <div className="flex items-end gap-3" style={{ height: 200 }}>
          {DAILY.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-bold text-accent">{d.value}M</span>
              <div className="w-full rounded-t-md bg-accent/80 transition-all" style={{ height: `${(d.value / maxVal) * 160}px` }} />
              <span className="text-[10px] text-text-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
