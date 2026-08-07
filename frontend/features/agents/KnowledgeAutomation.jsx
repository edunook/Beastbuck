import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Brain, Link2, Quote, Network, Users } from 'lucide-react';

const STATS = [
  { label: 'Articles Linked', value: '2,341', color: 'text-cyan-400' },
  { label: 'Topics Clustered', value: '156', color: 'text-blue-400' },
  { label: 'Graph Updates', value: '789', color: 'text-purple-400' },
  { label: 'Time Saved', value: '53h', color: 'text-accent' },
];

const CAPABILITIES = [
  { icon: Link2, title: 'Article Linking', desc: 'Automatically cross-reference related articles and research.', status: 'Active', lastRun: '1h ago', results: '34 linked' },
  { icon: Quote, title: 'Citation Detection', desc: 'Detect missing or incorrect citations across knowledge base.', status: 'Active', lastRun: '2h ago', results: '12 detected' },
  { icon: Network, title: 'Knowledge Graph Updates', desc: 'Update the knowledge graph with new relationships.', status: 'Active', lastRun: '3h ago', results: '56 nodes' },
  { icon: Brain, title: 'Topic Clustering', desc: 'Group related content into coherent topic clusters.', status: 'Active', lastRun: '6h ago', results: '8 clusters' },
  { icon: Users, title: 'Expert Recommendations', desc: 'Suggest domain experts for emerging knowledge topics.', status: 'Paused', lastRun: '1 day ago', results: '5 experts' },
];

export default function KnowledgeAutomation() {
  return (
    <PageContainer>
      <PageHeader title="Knowledge Automation" description="AI-powered workflows for linking, clustering, and graph management." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (<div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-text-muted">{s.label}</p></div>))}
      </div>
      <div className="space-y-4">
        {CAPABILITIES.map((c, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400"><c.icon className="h-6 w-6" /></div>
            <div className="flex-1"><h3 className="font-heading font-bold text-white">{c.title}</h3><p className="text-xs text-text-muted">{c.desc}</p><p className="mt-1 text-xs text-text-muted">Last run: {c.lastRun} · Results: {c.results}</p></div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
