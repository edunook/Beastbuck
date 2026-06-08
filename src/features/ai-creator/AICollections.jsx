import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Plus } from 'lucide-react';

const COLLECTIONS = [
  { name: 'Science Suite', desc: 'Physics, Chemistry, Biology — all in one place.', count: 4, emoji: '🔬' },
  { name: 'Coding Toolkit', desc: 'Code review, debugging, and architecture advice.', count: 3, emoji: '💻' },
  { name: 'Startup Bundle', desc: 'From ideation to investor pitch.', count: 5, emoji: '🚀' },
  { name: 'Fun & Games', desc: 'Meme lords, story writers, and joke generators.', count: 6, emoji: '🎮' },
];

export default function AICollections() {
  return (
    <PageContainer>
      <PageHeader title="AI Collections" description="Curated bundles of AI assistants for every purpose." />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group rounded-xl border-2 border-dashed border-border bg-surface/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent transition min-h-[200px]">
          <Plus className="w-10 h-10 text-text-muted group-hover:text-accent transition mb-3" />
          <h3 className="font-bold text-white group-hover:text-accent transition">Create Collection</h3>
          <p className="text-xs text-text-muted mt-1">Bundle AIs together for easy access.</p>
        </div>

        {COLLECTIONS.map((col, i) => (
          <div key={i} className="group rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm transition hover:border-accent/50 hover:shadow-[0_0_20px_rgba(208,255,0,0.05)]">
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{col.emoji}</span>
              <span className="bg-white/10 text-text-muted text-xs font-bold px-2 py-1 rounded-full">{col.count} AIs</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition mb-1">{col.name}</h3>
            <p className="text-xs text-text-muted mb-4">{col.desc}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg transition">Browse</button>
              <button className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold py-2 rounded-lg transition">Use All</button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
