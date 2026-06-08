import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lightbulb, Box, Beaker, Star, Clock, Rocket, Plus } from 'lucide-react';
import { InnovationService } from '../../services/firebase/innovation';
import { VenturesService } from '../../services/firebase/ventures';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { AIContextPanel } from '../ai/AIContextPanel';
import { useAuth } from '../auth/AuthContext';

const CATEGORIES = [
  { id: 'FEATURED', name: 'Featured', icon: Star },
  { id: 'RECENT', name: 'Recent', icon: Clock },
  { id: 'RESEARCH', name: 'Research', icon: Beaker },
  { id: 'DISCOVERIES', name: 'Discoveries', icon: Sparkles },
  { id: 'INVENTIONS', name: 'Inventions', icon: Lightbulb },
  { id: 'PROTOTYPES', name: 'Prototypes', icon: Box },
];

export default function InnovationShowcase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ discoveries: [], research: [], inventions: [], prototypes: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('FEATURED');
  const [convertingId, setConvertingId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const result = await InnovationService.getInnovationShowcase();
        setData(result);
      } catch (err) {
        console.error('Failed to load innovation showcase:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getFilteredItems = () => {
    const mapDiscoveries = (arr) => arr.map(d => ({ ...d, type: 'DISCOVERY', link: `/discoveries/${d.id}` }));
    const mapProjects = (arr) => arr.map(p => ({ ...p, type: p.projectType, link: `/projects/${p.id}` }));

    const allDiscoveries = mapDiscoveries(data.discoveries);
    const allResearch = mapProjects(data.research);
    const allInventions = mapProjects(data.inventions);
    const allPrototypes = mapProjects(data.prototypes);
    const all = [...allDiscoveries, ...allResearch, ...allInventions, ...allPrototypes];

    switch (activeCategory) {
      case 'FEATURED':
        return all.filter(item => item.status === 'FEATURED' || item.featured).length > 0
          ? all.filter(item => item.status === 'FEATURED' || item.featured)
          : all;
      case 'RECENT':
        return all.sort((a, b) => (b.createdAt?.toMillis() || b.timestamp?.toMillis() || 0) - (a.createdAt?.toMillis() || a.timestamp?.toMillis() || 0));
      case 'RESEARCH': return allResearch;
      case 'DISCOVERIES': return allDiscoveries;
      case 'INVENTIONS': return allInventions;
      case 'PROTOTYPES': return allPrototypes;
      default: return all;
    }
  };

  const filteredItems = getFilteredItems();

  const convertToVenture = async (item) => {
    if (!user?.uid) return;
    setConvertingId(item.id);
    try {
      const ventureId = await VenturesService.convertInnovationToVenture(item, user.uid);
      navigate(`/ventures/${ventureId}`);
    } catch (err) {
      console.error('Failed to convert innovation to venture:', err);
    } finally {
      setConvertingId('');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Innovation Registry"
        description="Explore groundbreaking research, inventions, discoveries, and prototypes across the BeastBuck Ecosystem."
        action={
          <Link to="/innovation/create" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-black font-bold px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> Create Innovation
          </Link>
        }
      />

      {/* AI Research Assistant */}
      <div className="mb-8">
        <AIContextPanel
          title="AI Research Assistant"
          actions={[
            {
              label: 'Generate Research Hypothesis',
              prompt: `Generate 3 original, testable research hypotheses that could become innovative projects in a technology and creativity organization. Format each as: Hypothesis, Rationale, Expected Outcome.`,
              mode: 'experiment',
            },
            {
              label: 'Summarize Innovation Landscape',
              prompt: `BeastBuck has ${data.research?.length || 0} research projects, ${data.inventions?.length || 0} inventions, ${data.discoveries?.length || 0} discoveries, and ${data.prototypes?.length || 0} prototypes. Write a concise executive summary of this innovation landscape. What does it suggest about organizational strengths?`,
              mode: 'project',
            },
            {
              label: 'Suggest New Innovation Ideas',
              prompt: `Generate 5 creative innovation ideas suitable for a young technology organization. Include areas like AI, robotics, sustainability, or creative technology. Format as: Title, Description, Why It Matters.`,
              mode: 'experiment',
            },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeCategory === category.id 
                ? 'bg-accent text-black' 
                : 'border border-border bg-surface/50 text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <category.icon className="h-4 w-4" />
            {category.name}
          </button>
        ))}
      </div>

      <SectionWrapper>
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingState text="Loading innovations..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold text-white">No items found</h3>
            <p className="text-text-muted">Check back later for new innovations.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-surface/30 p-6 transition-all hover:border-accent/50 hover:bg-surface/60"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      {item.type}
                    </span>
                    {item.status === 'FEATURED' && (
                      <Star className="h-4 w-4 text-status-warning fill-status-warning" />
                    )}
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-bold text-white group-hover:text-accent line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Per-item AI buttons */}
                <div className="mt-4 border-t border-border/30 pt-4">
                  <button
                    onClick={() => convertToVenture(item)}
                    disabled={convertingId === item.id || !['APPROVED', 'FEATURED', 'COMPLETED', 'ACTIVE'].includes(item.status)}
                    className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    {convertingId === item.id ? 'Creating Venture...' : 'Convert to Venture'}
                  </button>
                  <AIContextPanel
                    title="AI Tools"
                    actions={[
                      {
                        label: 'Improve Description',
                        prompt: `Rewrite and improve this innovation description to make it more compelling and professional:\n\nTitle: ${item.title}\nType: ${item.type}\nCurrent Description: ${item.description || 'No description provided.'}`,
                        mode: 'general',
                      },
                      {
                        label: 'Identify Next Steps',
                        prompt: `For this innovation: "${item.title}" (${item.type}). Description: ${item.description || 'N/A'}. Suggest 3-5 concrete next steps to advance it. Include potential challenges.`,
                        mode: 'project',
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
