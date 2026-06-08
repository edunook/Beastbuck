import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Scale, FileText, BarChart3, Heart } from 'lucide-react';

const STATS = [
  { label: 'Proposals Summarized', value: '89', color: 'text-yellow-400' },
  { label: 'Reports', value: '34', color: 'text-blue-400' },
  { label: 'Sentiment Analyses', value: '67', color: 'text-purple-400' },
  { label: 'Time Saved', value: '23h', color: 'text-accent' },
];

const CAPABILITIES = [
  { icon: FileText, title: 'Proposal Summaries', desc: 'Auto-generate concise summaries of governance proposals.', status: 'Active', lastRun: '2h ago', results: '4 summaries' },
  { icon: BarChart3, title: 'Voting Reports', desc: 'Generate detailed voting analytics after each governance cycle.', status: 'Active', lastRun: '1 day ago', results: '2 reports' },
  { icon: Scale, title: 'Governance Analytics', desc: 'Track participation rates, voting patterns, and policy trends.', status: 'Active', lastRun: '6h ago', results: '12 metrics' },
  { icon: Heart, title: 'Community Sentiment', desc: 'Analyze community sentiment toward proposals and policies.', status: 'Paused', lastRun: '2 days ago', results: '3 analyses' },
];

export default function GovernanceAutomation() {
  return (
    <PageContainer>
      <PageHeader title="Governance Automation" description="AI-powered workflows for proposals, voting, and sentiment analysis." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (<div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-text-muted">{s.label}</p></div>))}
      </div>
      <div className="space-y-4">
        {CAPABILITIES.map((c, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400"><c.icon className="h-6 w-6" /></div>
            <div className="flex-1"><h3 className="font-heading font-bold text-white">{c.title}</h3><p className="text-xs text-text-muted">{c.desc}</p><p className="mt-1 text-xs text-text-muted">Last run: {c.lastRun} · Results: {c.results}</p></div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
