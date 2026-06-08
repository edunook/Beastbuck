import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { FolderHeart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const collections = [
  { id: '1', title: 'AI Research Playbook', items: 24, type: 'public', tags: ['AI', 'Research'] },
  { id: '2', title: 'Onboarding Resources', items: 15, type: 'organization', tags: ['HR', 'Guide'] },
  { id: '3', title: 'Robotics Prototypes', items: 8, type: 'private', tags: ['Hardware', 'R&D'] },
];

export default function SmartCollections() {
  return (
    <PageContainer>
      <PageHeader
        title="Smart Collections"
        description="Curated knowledge groups customized for your workflow."
        action={
          <button className="bg-accent text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Create Collection
          </button>
        }
      />
      
      {/* AI Recommendations callout */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-8 flex items-start gap-4">
         <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400" />
         </div>
         <div>
            <h3 className="text-purple-400 font-bold mb-1">AI Curated Collections</h3>
            <p className="text-sm text-white/90">Based on your recent involvement in Project Phoenix, we've curated a collection of Advanced Engineering Architecture documents.</p>
            <button className="mt-3 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-bold">View Curated Collection</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(col => (
          <Link key={col.id} to={`/knowledge/collections/${col.id}`} className="block group">
            <Card className="h-full border-border bg-surface/50 hover:border-accent transition-all group-hover:-translate-y-1">
              <CardContent className="p-6">
                 <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
                    <FolderHeart className="w-6 h-6" />
                 </div>
                 <h3 className="font-bold text-white mb-2 text-xl group-hover:text-accent transition-colors">{col.title}</h3>
                 <div className="flex items-center justify-between text-xs text-text-muted mt-6">
                    <span className="bg-white/5 px-2 py-1 rounded">{col.items} items</span>
                    <span className="capitalize">{col.type}</span>
                 </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
