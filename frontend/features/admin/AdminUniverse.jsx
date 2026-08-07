import { useEffect, useState } from 'react';
import { Atom, BarChart3, GitBranch, Search, Sparkles } from 'lucide-react';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { UniverseService } from '@services/firestore/universe';
import { useAuth } from '../auth/AuthContext';
import { AdminActionButton, AdminEmptyState, AdminMetric, AdminPanel, LoadingRows } from './adminUtils';

export default function AdminUniverse() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [graphStats, setGraphStats] = useState(null);
  const [searchAnalytics, setSearchAnalytics] = useState([]);
  const [recAnalytics, setRecAnalytics] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [graph, search, rec, snaps] = await Promise.all([
        UniverseService.getKnowledgeGraphStats(),
        UniverseService.getSearchAnalytics(),
        UniverseService.getRecommendationAnalytics(),
        UniverseService.getUniverseAnalytics(7),
      ]);
      setGraphStats(graph);
      setSearchAnalytics(search);
      setRecAnalytics(rec);
      setAnalytics(snaps);
    } catch (err) {
      console.error('Admin universe failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generateSnapshot = async () => {
    setBusy('snapshot');
    try {
      await UniverseService.generateUniverseAnalytics(user.uid);
      await load();
    } finally {
      setBusy('');
    }
  };

  const latest = analytics[analytics.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Universe OS"
        description="Knowledge graph, search analytics, recommendations, and ecosystem health."
        action={
          <AdminActionButton onClick={generateSnapshot} disabled={!!busy}>
            {busy === 'snapshot' ? 'Generating...' : 'Generate Analytics Snapshot'}
          </AdminActionButton>
        }
      />

      {loading ? (
        <LoadingRows count={4} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminMetric label="Graph Nodes" value={graphStats?.nodeCount ?? 0} icon={GitBranch} />
            <AdminMetric label="Graph Edges" value={graphStats?.edgeCount ?? 0} icon={Atom} />
            <AdminMetric label="Cached Recs" value={recAnalytics?.cachedRecommendations ?? 0} icon={Sparkles} />
            <AdminMetric
              label="Knowledge Growth"
              value={latest?.knowledgeGrowth ?? '—'}
              icon={BarChart3}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel title="Top Search Terms" icon={Search}>
              {searchAnalytics.length === 0 ? (
                <AdminEmptyState message="No search analytics yet. Members use /search to populate." />
              ) : (
                <ul className="space-y-2">
                  {searchAnalytics.map(({ term, count }) => (
                    <li key={term} className="flex justify-between text-sm">
                      <span className="text-white">{term}</span>
                      <span className="font-bold text-accent">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>

            <AdminPanel title="Ecosystem Health" icon={BarChart3}>
              {latest ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-text-muted">Learning growth</span>
                    <span className="font-bold text-white">{latest.learningGrowth}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">Innovation growth</span>
                    <span className="font-bold text-white">{latest.innovationGrowth}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">Community growth</span>
                    <span className="font-bold text-white">{latest.communityGrowth}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">Venture growth</span>
                    <span className="font-bold text-white">{latest.ventureGrowth}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">Cross-system activity</span>
                    <span className="font-bold text-accent">{latest.crossSystemActivity}</span>
                  </li>
                </ul>
              ) : (
                <AdminEmptyState message="Generate a snapshot to track ecosystem health." />
              )}
            </AdminPanel>
          </div>

          <AdminPanel title="Knowledge Graph Sample" icon={GitBranch}>
            {graphStats?.nodes?.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {graphStats.nodes.map(n => (
                  <div key={n.id} className="rounded-lg border border-border bg-white/[0.02] p-3 text-sm">
                    <span className="text-xs font-bold uppercase text-accent">{n.type}</span>
                    <p className="font-bold text-white">{n.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState message="No knowledge nodes yet. Links form as members connect systems." />
            )}
          </AdminPanel>
        </>
      )}
    </div>
  );
}
