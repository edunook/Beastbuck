import { useState, useEffect } from 'react';
import { Palette, Star, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';
import { GamificationService } from '../../../services/firebase/gamification';

export function CreativeSpotlightWidget() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadSpotlight = async () => {
      try {
        const data = await GamificationService.getUserProjects(user.uid);
        const spotlight = (data || []).filter(p => p.featured || p.progress >= 80).slice(0, 3);
        setItems(spotlight);
      } catch (err) {
        console.log('Creative spotlight load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSpotlight();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-rose-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Creative Spotlight</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
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
          <Palette className="h-4 w-4 text-pink-400 animate-pulse" />
          Creative Spotlight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <DynamicEmptyState type="projects" title="No spotlight yet" subtitle="Complete projects to get featured here!" />
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-pink-500/50 transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/20 shrink-0">
                    <Star className="h-5 w-5 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.progress || 0}% complete</p>
                  </div>
                  <Trophy className="h-4 w-4 text-yellow-400 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
