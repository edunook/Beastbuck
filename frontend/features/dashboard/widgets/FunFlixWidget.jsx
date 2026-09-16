import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Heart, Film, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export function FunFlixWidget() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      try {
        const q = query(collection(db, 'funflix_videos'), orderBy('createdAt', 'desc'), limit(4));
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!cancelled) {
          setVideos(items || []);
        }
      } catch (err) {
        console.warn('FunFlix widget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVideos();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-purple-950/20 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Film className="h-4 w-4 text-pink-400 animate-pulse" />
              FunFlix Cinema
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden h-full border border-pink-500/20 bg-gradient-to-br from-slate-900/90 via-pink-950/15 to-purple-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700" />
      
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-300">
          <div className="p-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Film className="h-4 w-4" />
          </div>
          FunFlix Highlights
        </CardTitle>
        <Link
          to="/funflix"
          className="inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors group/link"
        >
          <span>Watch All</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {videos.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState 
              type="generic" 
              title="Cinema is getting ready" 
              subtitle="Be the first to publish a video on FunFlix!" 
            />
            <Link
              to="/funflix"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Visit FunFlix
            </Link>
          </div>
        ) : (
          videos.slice(0, 3).map((video, index) => (
            <Link
              key={video.id}
              to={`/funflix/watch/${video.id}`}
              className="group/item flex items-center gap-3.5 p-2.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-pink-500/40 hover:bg-pink-500/[0.08] transition-all duration-300 hover:-translate-y-0.5"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
            >
              <div className="relative h-12 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-pink-600/30 to-rose-900/40 flex items-center justify-center border border-pink-500/30 shrink-0 shadow-inner group-hover/item:scale-105 transition-transform duration-300">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <Play className="h-5 w-5 text-pink-300 fill-pink-400/40 ml-0.5" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover/item:bg-transparent transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover/item:text-pink-300 transition-colors">
                  {video.title || 'Untitled Premiere'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Eye className="h-3 w-3 text-pink-400/80" />
                    {video.views || 0}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Heart className="h-3 w-3 text-rose-400/80 fill-rose-500/20" />
                    {Array.isArray(video.likes) ? video.likes.length : (video.likesCount || 0)}
                  </span>
                  {video.category && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-pink-300 border border-white/5 font-semibold">
                      {video.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-7 w-7 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300 group-hover/item:translate-x-0.5">
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
