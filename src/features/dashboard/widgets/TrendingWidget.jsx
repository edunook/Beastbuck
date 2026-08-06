import { useState, useEffect } from 'react';
import { TrendingUp, Users, FlaskConical, Zap, Play, ShoppingBag, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';

export function TrendingWidget() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadTrending = async () => {
      try {
        const { GamificationService } = await import('../../../services/firebase/gamification');
        const trendingData = await GamificationService.getTrendingAcrossPlatform();
        setTrending(trendingData || []);
      } catch (err) {
        console.log('Trending load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrending();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-red-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <TrendingUp className="h-4 w-4 text-pink-400" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const icons = {
    ai: Zap,
    experiment: FlaskConical,
    funflix: Play,
    marketplace: ShoppingBag,
    user: Users,
    achievement: Award,
  };

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-red-500/5 backdrop-blur-sm transition-all duration-500 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500/20">
            <TrendingUp className="h-4 w-4 text-pink-400" />
          </div>
          Trending Across BeastBuck
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trending.length === 0 && (
          <DynamicEmptyState 
            type="generic"
            title="Nothing trending yet" 
            subtitle="Be the first to create something amazing!" 
          />
        )}
        
        <div className="space-y-3">
          {trending.map((item, index) => {
            const Icon = icons[item.type] || TrendingUp;
            return (
              <div
                key={item.id || index}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-pink-500/50 hover:bg-white/[0.05] transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="relative h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                  <Icon className="h-5 w-5 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <p className="text-xs text-text-muted truncate">{item.subtitle}</p>
                </div>
                {item.trend && (
                  <div className={`text-xs font-bold ${
                    item.trendUp ? 'text-status-success' : 'text-status-danger'
                  }`}>
                    {item.trend}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}