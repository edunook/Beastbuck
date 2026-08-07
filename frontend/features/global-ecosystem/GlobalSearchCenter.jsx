import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Search, Filter, Rocket, Users, BookOpen, Building } from 'lucide-react';

export default function GlobalSearchCenter() {
  return (
    <PageContainer>
      <PageHeader title="Ecosystem Search Engine" description="Search across all members, research, ventures, and communities globally." />

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search for anything (e.g., 'Quantum Computing Startups in London')" 
          className="w-full rounded-xl border border-border bg-surface/40 py-4 pl-14 pr-4 text-lg text-white placeholder-text-muted backdrop-blur-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-accent px-4 py-2 font-bold text-black transition-colors hover:bg-accent/80">
          Search
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-white hover:border-accent/50"><Filter className="h-4 w-4" /> All Sources</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-white hover:border-accent/50"><Users className="h-4 w-4 text-blue-400" /> Members</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-white hover:border-accent/50"><Rocket className="h-4 w-4 text-emerald-400" /> Ventures</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-white hover:border-accent/50"><BookOpen className="h-4 w-4 text-yellow-400" /> Research</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-white hover:border-accent/50"><Building className="h-4 w-4 text-purple-400" /> Communities</button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <Search className="h-10 w-10 text-text-muted" />
        </div>
        <h3 className="text-lg font-bold text-white">Semantic AI Search</h3>
        <p className="mt-2 max-w-md text-sm text-text-muted">Our AI understands context. Try searching for specific concepts, technologies, or people to discover relevant results across the entire ecosystem.</p>
      </div>
    </PageContainer>
  );
}
