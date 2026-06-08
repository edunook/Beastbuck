import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KnowledgeService } from '../../services/firebase/knowledge';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BookOpen, TrendingUp, Award, Zap, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function KnowledgeHub() {
  const [trending, setTrending] = useState([]);
  const [newDiscoveries, setNewDiscoveries] = useState([]);
  const [aiRecommended, setAiRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [trendRes, newRes, recRes] = await Promise.all([
          KnowledgeService.getTrendingArticles(4),
          KnowledgeService.getArticles({ limitCount: 4 }), // Just recent ones for now
          KnowledgeService.getRecommendedArticles(null, 4)
        ]);
        setTrending(trendRes);
        setNewDiscoveries(newRes);
        setAiRecommended(recRes);
      } catch (err) {
        console.error('Failed to load knowledge items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const Section = ({ title, icon: Icon, items, colorClass }) => (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-text-muted bg-surface/30 p-6 rounded-xl border border-border text-center">
          No articles available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <Link key={item.id} to={`/knowledge/article/${item.id}`} className="block group">
              <Card className="h-full border-border bg-surface/50 hover:border-accent transition-all group-hover:-translate-y-1">
                <CardContent className="p-5 flex flex-col h-full">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-accent/10 text-accent self-start mb-3">
                    {item.category || 'Article'}
                  </span>
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-3 mb-4 flex-1">
                    {item.contentSnippet || (item.content ? item.content.substring(0,100)+'...' : 'No description')}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/50 pt-3 mt-auto">
                    <span>{item.views || 0} views</span>
                    <span>{item.references || 0} refs</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Network"
        description="Discover, explore, and expand the collective intelligence of the organization."
        action={
          <Link to="/knowledge/article/new" className="bg-accent text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Create Article
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <Section title="Trending Today" icon={TrendingUp} items={trending} colorClass="text-orange-400" />
          <Section title="AI Recommended for You" icon={BrainCircuit} items={aiRecommended} colorClass="text-purple-400" />
          <Section title="New Discoveries" icon={Zap} items={newDiscoveries} colorClass="text-accent" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-8">
             <Link to="/knowledge/maps" className="p-6 rounded-2xl bg-gradient-to-br from-surface to-surface/50 border border-border hover:border-accent transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
                   <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Explore Knowledge Map</h3>
                <p className="text-sm text-text-muted">Visually navigate relationships between research, projects, and experts.</p>
             </Link>
             <Link to="/experts" className="p-6 rounded-2xl bg-gradient-to-br from-surface to-surface/50 border border-border hover:border-purple-500 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                   <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Find an Expert</h3>
                <p className="text-sm text-text-muted">Connect with specialists across the organization for guidance and mentorship.</p>
             </Link>
          </div>
        </>
      )}
    </PageContainer>
  );
}
