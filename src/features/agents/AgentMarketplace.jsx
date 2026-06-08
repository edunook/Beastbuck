import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Star, Download } from 'lucide-react';

const CATEGORIES = ['All', 'Research', 'Education', 'Productivity', 'Marketplace', 'Venture', 'Governance', 'Community'];

const FEATURED = [
  { id: 'f1', name: 'New Member Onboarding', category: 'Community', steps: 5, installs: 1234, rating: 4.9, desc: 'Automatically welcome, guide, and engage new members.' },
  { id: 'f2', name: 'AI Research Pipeline', category: 'Research', steps: 7, installs: 890, rating: 4.8, desc: 'End-to-end research workflow from discovery to publication.' },
  { id: 'f3', name: 'Venture Growth Tracker', category: 'Venture', steps: 4, installs: 756, rating: 4.7, desc: 'Monitor milestones, alert on blockers, generate reports.' },
];

const TEMPLATES = [
  { id: 't1', name: 'Weekly Research Digest', category: 'Research', steps: 3, installs: 189, rating: 4.9 },
  { id: 't2', name: 'Course Completion Follow-Up', category: 'Education', steps: 3, installs: 312, rating: 4.6 },
  { id: 't3', name: 'Marketplace Listing Audit', category: 'Marketplace', steps: 6, installs: 98, rating: 4.5 },
  { id: 't4', name: 'Governance Proposal Summary', category: 'Governance', steps: 2, installs: 145, rating: 4.9 },
  { id: 't5', name: 'Team Standup Automator', category: 'Productivity', steps: 4, installs: 267, rating: 4.7 },
  { id: 't6', name: 'Mentor Matching Engine', category: 'Community', steps: 5, installs: 134, rating: 4.4 },
  { id: 't7', name: 'Innovation Sprint Kickoff', category: 'Productivity', steps: 6, installs: 89, rating: 4.6 },
  { id: 't8', name: 'Venture Investor Report', category: 'Venture', steps: 5, installs: 178, rating: 4.8 },
];

const CAT_COLORS = { Research: 'bg-blue-500/20 text-blue-400', Education: 'bg-purple-500/20 text-purple-400', Productivity: 'bg-emerald-500/20 text-emerald-400', Marketplace: 'bg-orange-500/20 text-orange-400', Venture: 'bg-pink-500/20 text-pink-400', Governance: 'bg-yellow-500/20 text-yellow-400', Community: 'bg-cyan-500/20 text-cyan-400' };

export default function AgentMarketplace() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  return (
    <PageContainer>
      <PageHeader title="Agent Marketplace" description="Browse, install, and share agent templates and workflows." />

      {/* Featured */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {FEATURED.map(f => (
          <div key={f.id} className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6 backdrop-blur-sm">
            <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CAT_COLORS[f.category]}`}>{f.category}</span>
            <h3 className="mb-1 font-heading text-lg font-bold text-white">{f.name}</h3>
            <p className="mb-4 text-xs text-text-muted">{f.desc}</p>
            <div className="mb-4 flex items-center gap-3 text-xs text-text-muted">
              <span>{f.steps} steps</span>
              <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {f.installs}</span>
              <span className="flex items-center gap-1 text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" /> {f.rating}</span>
            </div>
            <button className="w-full rounded-lg bg-accent py-2 text-sm font-bold text-black transition-colors hover:bg-accent/80">Install</button>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${filter === c ? 'bg-accent text-black' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'}`}>{c}</button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map(t => (
          <div key={t.id} className="rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-accent/30 hover:bg-white/5">
            <span className={`mb-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${CAT_COLORS[t.category]}`}>{t.category}</span>
            <h4 className="mb-3 font-heading font-bold text-white">{t.name}</h4>
            <div className="mb-4 flex items-center gap-3 text-xs text-text-muted">
              <span>{t.steps} steps</span>
              <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {t.installs}</span>
              <span className="flex items-center gap-1 text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" /> {t.rating}</span>
            </div>
            <button className="w-full rounded-lg bg-white/10 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent hover:text-black">Install</button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
