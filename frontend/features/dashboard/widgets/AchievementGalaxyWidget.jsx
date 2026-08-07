import { useState, useEffect } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

const STAR_COLORS = ['text-yellow-400', 'text-amber-300', 'text-orange-400', 'text-pink-400', 'text-purple-400'];

export function AchievementGalaxyWidget() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadAchievements = async () => {
      try {
        const data = await GamificationService.getRecentAchievements(user.uid, 6);
        setAchievements(data || []);
      } catch (err) {
        console.log('Achievement galaxy load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Achievement Galaxy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
          Achievement Galaxy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <DynamicEmptyState type="achievements" title="No achievements yet" subtitle="Complete challenges to unlock stars!" />
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon || Star;
              const colorClass = STAR_COLORS[index % STAR_COLORS.length];
              return (
                <div
                  key={achievement.id}
                  className={`relative p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:scale-110 transition-all duration-300 ${colorClass}`}
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                  title={achievement.title || achievement.name}
                >
                  <Icon className="h-6 w-6 animate-pulse" style={{ animationDelay: `${index * 150}ms` }} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
