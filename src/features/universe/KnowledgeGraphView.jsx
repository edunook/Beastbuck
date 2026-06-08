import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Sparkles } from 'lucide-react';
import { UniverseService } from '../../services/firebase/universe';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Card, CardContent } from '../../components/ui/Card';

const RELATION_LABELS = {
  created: 'created',
  launched: 'launched',
  related_to: 'relates to',
  earned: 'earned',
  teaches: 'teaches',
};

export default function KnowledgeGraphView() {
  const [stats, setStats] = useState(null);
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [g, s] = await Promise.all([
          UniverseService.getKnowledgeGraph(),
          UniverseService.getKnowledgeGraphStats(),
        ]);
        setGraph(g);
        setStats(s);
      } catch (err) {
        console.error('Knowledge graph failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="BeastBuck Knowledge Graph"
        description="Connections between people, projects, research, skills, courses, ventures, and communities."
        action={<GitBranch className="h-8 w-8 text-accent" />}
      />

      <SectionWrapper>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black text-white">{stats?.nodeCount || 0}</p>
              <p className="text-xs text-text-muted">Nodes</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black text-white">{stats?.edgeCount || 0}</p>
              <p className="text-xs text-text-muted">Edges</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-white">{graph?.name || 'BeastBuck Graph'}</p>
              <p className="text-xs text-text-muted">Active graph</p>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      <SectionWrapper title="Example chain">
        <Card className="rounded-xl border-accent/20">
          <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm">
            {['Research Project', '→', 'Invention', '→', 'Venture', '→', 'Course', '→', 'Certificate'].map(
              (part, i) =>
                part === '→' ? (
                  <span key={i} className="text-accent">→</span>
                ) : (
                  <span key={i} className="rounded-lg bg-white/5 px-3 py-1.5 font-bold text-white">
                    {part}
                  </span>
                )
            )}
          </CardContent>
        </Card>
      </SectionWrapper>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionWrapper title="Nodes">
          <div className="space-y-2">
            {(stats?.nodes || []).map(node => (
              <Card key={node.id} className="rounded-xl">
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-accent">{node.type}</p>
                    <p className="font-bold text-white">{node.title}</p>
                  </div>
                  {node.refId && (
                    <Link to="/universe" className="text-xs text-accent hover:underline">
                      View
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!stats?.nodes || stats.nodes.length === 0) && (
              <p className="text-sm text-text-muted">
                Nodes are created as you link research, inventions, ventures, and courses across BeastBuck.
              </p>
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Relationships">
          <div className="space-y-2">
            {(stats?.edges || []).map(edge => (
              <Card key={edge.id} className="rounded-xl">
                <CardContent className="p-3 text-sm">
                  <span className="font-mono text-accent">{edge.sourceId}</span>
                  <span className="mx-2 text-text-muted">
                    {RELATION_LABELS[edge.relation] || edge.relation}
                  </span>
                  <span className="font-mono text-white">{edge.targetId}</span>
                </CardContent>
              </Card>
            ))}
            {(!stats?.edges || stats.edges.length === 0) && (
              <p className="text-sm text-text-muted">Cross-system links appear here as the ecosystem grows.</p>
            )}
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent hover:bg-accent/20"
        >
          <Sparkles className="h-4 w-4" />
          Explore via Unified Search
        </Link>
      </SectionWrapper>
    </PageContainer>
  );
}
