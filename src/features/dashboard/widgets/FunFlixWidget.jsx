import { useState, useEffect } from 'react';
import { Play, Eye, Heart, Film } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

export function FunFlixWidget() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadVideos = async () => {
      try {
        const q = query(collection(db, 'funflix_videos'), orderBy('createdAt', 'desc'), limit(4));
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(items || []);
      } catch (err) {
        console.log('FunFlix load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-rose-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">FunFlix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-rose-500/5 backdrop-blur-sm transition-all duration-500 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <Film className="h-4 w-4 text-pink-400 animate-pulse" />
          FunFlix
        </CardTitle>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <DynamicEmptyState type="generic" title="No videos yet" subtitle="Check back soon for new FunFlix content!" />
        ) : (
          <div className="space-y-3">
            {videos.slice(0, 3).map((video, index) => (
              <div
                key={video.id}
                className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-pink-500/50 transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/20 shrink-0">
                  <Play className="h-5 w-5 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {video.likes?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
