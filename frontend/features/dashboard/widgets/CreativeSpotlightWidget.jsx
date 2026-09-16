import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Star, Trophy, Heart, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export function CreativeSpotlightWidget() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSpotlight = async () => {
      try {
        // Fetch top creative works from Firestore
        const q = query(collection(db, 'creative_works'), orderBy('createdAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (!cancelled) {
          if (data.length > 0) {
            setItems(data);
          } else {
            // Fallback to user projects or empty
            const { GamificationService } = await import('@services/firestore/gamification');
            const projects = await GamificationService.getUserProjects(user?.uid);
            if (!cancelled) {
              setItems(projects?.slice(0, 3) || []);
            }
          }
        }
      } catch (err) {
        console.warn('CreativeSpotlightWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSpotlight();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-950/20 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-400 animate-pulse" />
              Creative Spotlight
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden h-full border border-pink-500/20 bg-gradient-to-br from-slate-900/90 via-pink-950/15 to-purple-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-300">
          <div className="p-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Palette className="h-4 w-4" />
          </div>
          Creative Spotlight
        </CardTitle>
        <Link
          to="/creative"
          className="inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors group/link"
        >
          <span>Creative Hub</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {items.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState 
              type="projects" 
              title="No spotlight artworks yet" 
              subtitle="Showcase your imagination to get featured in the spotlight!" 
            />
            <Link
              to="/creative"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Publish Creation
            </Link>
          </div>
        ) : (
          items.map((item, index) => (
            <Link
              key={item.id || index}
              to={`/creative/${item.id}`}
              className="group/item flex items-center gap-3.5 p-2.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-pink-500/40 hover:bg-pink-500/[0.08] transition-all duration-300 hover:-translate-y-0.5"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
            >
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center border border-pink-500/30 shrink-0 group-hover/item:scale-105 transition-transform duration-300">
                {item.mediaUrl || item.imageUrl ? (
                  <img src={item.mediaUrl || item.imageUrl} alt={item.title || item.name} className="w-full h-full object-cover" />
                ) : (
                  <Star className="h-5 w-5 text-pink-300 fill-pink-400/30" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover/item:text-pink-300 transition-colors">
                  {item.title || item.name || 'Creative Masterpiece'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1">
                  <span>{item.authorName || item.category || 'Creator'}</span>
                  {item.likes && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="h-3 w-3 fill-rose-500/20" />
                        {Array.isArray(item.likes) ? item.likes.length : item.likes}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="h-7 w-7 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300 group-hover/item:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
