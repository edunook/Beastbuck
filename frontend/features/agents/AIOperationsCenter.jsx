import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Bot, AlertTriangle, Lightbulb, Shield } from 'lucide-react';

const ANOMALIES = [
  { time: '5 min ago', area: 'Research', severity: 'Medium', desc: 'Lab Epsilon research output dropped 40% this week.' },
  { time: '1h ago', area: 'Marketplace', severity: 'Low', desc: 'Unusual spike in product listing edits from 3 accounts.' },
  { time: '3h ago', area: 'Community', severity: 'High', desc: 'Chapter Tokyo engagement declined 3 consecutive weeks.' },
  { time: '6h ago', area: 'Ventures', severity: 'Critical', desc: 'NovaTech missed Q3 milestone with 2 open blockers.' },
];

const RECOMMENDATIONS = [
  { title: 'Automate Weekly Team Reports', confidence: 94, reason: 'Your team creates manual reports every Monday. An automated workflow could save 3 hours/week.' },
  { title: 'Deploy a Research Sentinel', confidence: 91, reason: 'Your lab publishes frequently. An agent can auto-collect related literature.' },
  { title: 'Cross-Team Sync for Project Alpha', confidence: 87, reason: '3 teams are working on overlapping research. A collaboration agent can coordinate.' },
  { title: 'Milestone Alert for NovaTech', confidence: 89, reason: 'NovaTech is 5 days from its Q3 milestone deadline with 2 open blockers.' },
];

const SEV = { Low: 'bg-blue-500/20 text-blue-400', Medium: 'bg-yellow-500/20 text-yellow-400', High: 'bg-orange-500/20 text-orange-400', Critical: 'bg-red-500/20 text-red-400' };

export default function AIOperationsCenter() {
  return (
    <PageContainer>
      <PageHeader title="AI Operations Center" description="Global command center for monitoring the entire BeastBuck ecosystem." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Ecosystem Health', value: '94.2%', icon: Shield, color: 'text-emerald-400' },
          { label: 'Active Agents', value: '6', icon: Bot, color: 'text-accent' },
          { label: 'Anomalies', value: '4', icon: AlertTriangle, color: 'text-orange-400' },
          { label: 'Recommendations', value: '4', icon: Lightbulb, color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-heading text-lg font-bold text-white">Detected Anomalies</h3>
      <div className="mb-8 space-y-3">
        {ANOMALIES.map((a, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-border bg-surface/40 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4">
            <AlertTriangle className={`h-4 w-4 shrink-0 ${SEV[a.severity]?.split(' ')[1]}`} />
            <span className="text-xs text-text-muted">{a.time}</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">{a.area}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEV[a.severity]}`}>{a.severity}</span>
            <span className="text-sm text-white">{a.desc}</span>
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-heading text-lg font-bold text-white">AI Recommendations</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {RECOMMENDATIONS.map((r, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-white">{r.title}</h4>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${r.confidence >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{r.confidence}%</span>
            </div>
            <p className="mb-4 text-xs text-text-muted">{r.reason}</p>
            <button className="rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-black transition-colors hover:bg-accent/80">Apply</button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
