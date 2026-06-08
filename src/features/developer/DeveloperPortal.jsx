import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Key, Webhook, BookOpen, Box, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../features/auth/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

const QUICK_LINKS = [
  { title: 'API Keys', desc: 'Manage your API credentials', icon: Key, path: '/developer/keys' },
  { title: 'Webhooks', desc: 'Configure event subscriptions', icon: Webhook, path: '/developer/webhooks' },
  { title: 'SDKs', desc: 'Download official client libraries', icon: Box, path: '/developer/sdks' },
  { title: 'Documentation', desc: 'Read the API reference', icon: BookOpen, path: '/developer/docs' },
];

export default function DeveloperPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch developer API metrics
        const metricsQuery = query(
          collection(db, 'developer_metrics'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const metricsSnap = await getDocs(metricsQuery);
        
        if (!metricsSnap.empty) {
          setMetrics(metricsSnap.docs[0].data());
        }
      } catch (error) {
        console.error('Failed to fetch developer metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  const stats = [
    { label: 'API Requests (24h)', value: metrics?.apiRequests?.toLocaleString() || '0', color: 'text-emerald-400' },
    { label: 'Active Webhooks', value: metrics?.activeWebhooks || '0', color: 'text-purple-400' },
    { label: 'Error Rate', value: metrics?.errorRate || '0%', color: 'text-accent' },
    { label: 'Avg Latency', value: metrics?.avgLatency || '0ms', color: 'text-blue-400' },
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Developer Portal" description="Build, integrate, and scale with the BeastBuck API ecosystem." />

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((m, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
            <p className="mt-1 text-xs text-text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((q, i) => (
          <Link key={i} to={q.path} className="group rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-accent hover:bg-accent/5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white transition-colors group-hover:bg-accent group-hover:text-black">
              <q.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-bold text-white group-hover:text-accent">{q.title}</h3>
            <p className="text-xs text-text-muted">{q.desc}</p>
          </Link>
        ))}
      </div>

      {/* API Terminal */}
      <div className="overflow-hidden rounded-xl border border-border bg-[#0d1117] shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="ml-2 text-xs font-mono text-text-muted">beastbuck-cli</span>
        </div>
        <div className="p-4 font-mono text-sm">
          {metrics?.apiKey ? (
            <>
              <p className="text-emerald-400">$ curl -X GET https://api.beastbuck.com/v1/users/me \</p>
              <p className="text-emerald-400">    -H "Authorization: Bearer YOUR_API_KEY"</p>
              <br />
              <p className="text-text-muted">{"{"}</p>
              <p className="text-white">  "id": <span className="text-blue-400">"{user.uid}"</span>,</p>
              <p className="text-white">  "username": <span className="text-blue-400">"{user.displayName || 'developer'}"</span>,</p>
              <p className="text-white">  "role": <span className="text-blue-400">"developer"</span></p>
              <p className="text-text-muted">{"}"}</p>
            </>
          ) : (
            <EmptyState
              icon={Key}
              title="No API Key"
              description="Generate an API key to start using the BeastBuck API."
              variant="default"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
