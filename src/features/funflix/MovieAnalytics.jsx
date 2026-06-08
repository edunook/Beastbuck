import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BarChart, TrendingUp, Users, Clock, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../features/auth/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

export default function MovieAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [topVideos, setTopVideos] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch channel metrics
        const metricsQuery = query(
          collection(db, 'funflix_analytics'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const metricsSnap = await getDocs(metricsQuery);
        
        if (!metricsSnap.empty) {
          setMetrics(metricsSnap.docs[0].data());
        }

        // Fetch top videos
        const videosQuery = query(
          collection(db, 'funflix_videos'),
          where('userId', '==', user.uid),
          orderBy('views', 'desc'),
          limit(10)
        );
        const videosSnap = await getDocs(videosQuery);
        
        setTopVideos(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  if (!metrics && topVideos.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="FunFlix Analytics" description="Detailed performance metrics for your channel." />
        <EmptyState
          icon={BarChart}
          title="No Analytics Data"
          description="Upload videos to start seeing your channel analytics."
        />
      </PageContainer>
    );
  }

  const stats = [
    { label: 'Total Views', value: metrics?.totalViews?.toLocaleString() || '0', trend: metrics?.viewsTrend || '+0%', icon: BarChart, color: 'text-blue-400' },
    { label: 'Watch Time (hrs)', value: metrics?.watchTime?.toLocaleString() || '0', trend: metrics?.watchTimeTrend || '+0%', icon: Clock, color: 'text-yellow-400' },
    { label: 'Unique Viewers', value: metrics?.uniqueViewers?.toLocaleString() || '0', trend: metrics?.viewersTrend || '+0%', icon: Users, color: 'text-emerald-400' },
    { label: 'Engagement Rate', value: metrics?.engagementRate || '0%', trend: metrics?.engagementTrend || '+0%', icon: TrendingUp, color: 'text-purple-400' }
  ];

  return (
    <PageContainer>
      <PageHeader title="FunFlix Analytics" description="Detailed performance metrics for your channel." />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 w-6 h-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted mb-2">{s.label}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{s.trend}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface/40 border border-border rounded-xl p-6 h-64 flex items-center justify-center backdrop-blur-sm text-text-muted mb-8">
        <EmptyState
          icon={BarChart}
          title="Audience Retention Chart"
          description="Chart visualization coming soon."
          variant="default"
        />
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Top Performing Videos</h2>
      <div className="bg-surface/40 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
        {topVideos.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 text-text-muted">
                <th className="py-3 px-4">Video</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Avg View Duration</th>
                <th className="py-3 px-4">Likes</th>
              </tr>
            </thead>
            <tbody>
              {topVideos.map(video => (
                <tr key={video.id} className="border-b border-border/20 text-white last:border-0">
                  <td className="py-3 px-4 font-bold">{video.title || 'Untitled Video'}</td>
                  <td className="py-3 px-4">{video.views?.toLocaleString() || '0'}</td>
                  <td className="py-3 px-4">{video.avgDuration || '0m 0s'}</td>
                  <td className="py-3 px-4 text-emerald-400">{video.likes?.toLocaleString() || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-text-muted">
            No videos uploaded yet.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
