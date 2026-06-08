import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Download, Star, ExternalLink } from 'lucide-react';

const EXTENSIONS = [
  { name: 'VS Code Extension', type: 'Editor', author: 'BeastBuck', downloads: '45K', rating: 4.9, icon: '🖥️' },
  { name: 'GitHub Action: Sync', type: 'CI/CD', author: 'Community', downloads: '12K', rating: 4.7, icon: '🐙' },
  { name: 'Chrome Clipper', type: 'Browser', author: 'BeastBuck', downloads: '89K', rating: 4.8, icon: '🌐' },
  { name: 'Figma to UI plugin', type: 'Design', author: 'DesignOps', downloads: '34K', rating: 4.9, icon: '🎨' },
];

export default function DeveloperMarketplace() {
  return (
    <PageContainer>
      <PageHeader title="Developer Marketplace" description="Discover extensions, plugins, and tools built by the community." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EXTENSIONS.map((ext, i) => (
          <div key={i} className="flex flex-col justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-accent/30 hover:bg-white/5">
            <div>
              <span className="mb-3 block text-4xl">{ext.icon}</span>
              <h3 className="font-bold text-white">{ext.name}</h3>
              <p className="text-xs text-text-muted">By {ext.author} · {ext.type}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {ext.downloads}</span>
                <span className="flex items-center gap-1 text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" /> {ext.rating}</span>
              </div>
              <button className="rounded bg-accent/10 p-1.5 text-accent hover:bg-accent/20"><ExternalLink className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
