import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { ListVideo, Play } from 'lucide-react';

export default function MoviePlaylists() {
  return (
    <PageContainer>
      <PageHeader title="My Playlists" description="Curated collections and series navigation." />
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="group rounded-xl border border-border bg-surface/40 p-4 backdrop-blur-sm hover:border-accent/50 transition">
            <div className="aspect-video bg-surface rounded-lg mb-4 relative flex items-center justify-center overflow-hidden border border-border/50">
              <ListVideo className="w-10 h-10 text-white/20 absolute right-4 bottom-4" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Play className="w-12 h-12 text-accent" />
              </div>
            </div>
            <h3 className="font-bold text-white mb-1">Comedy Collection {i}</h3>
            <p className="text-xs text-text-muted mb-3">12 Videos · Updated 2 days ago</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded transition">Edit</button>
              <button className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold py-2 rounded transition">Play All</button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
