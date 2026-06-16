import { useEffect, useState } from 'react';
import { Award, Medal, Trophy, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { DashboardCard } from '../../../components/ui/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { GamificationService, getLevelProgress } from '../../../services/firebase/gamification';

export function XPOverview() {
  const { roleData } = useAuth();
  const progress = getLevelProgress(roleData?.xp || 0);

  return (
    <DashboardCard
      title="Total Experience"
      icon={Trophy}
      value={`${progress.currentXP} XP`}
      subtitle={`Level ${roleData?.level || progress.level}`}
      trend={`${progress.remainingXP} XP to next`}
      trendUp={true}
    />
  );
}

export function LevelWidget() {
  const { roleData } = useAuth();
  const progress = getLevelProgress(roleData?.xp || 0);
  const level = Math.max(roleData?.level || 1, progress.level);

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-3xl font-black text-white">Level {level}</p>
            <p className="mt-1 text-sm font-medium text-text-muted">{progress.progressXP}/{progress.nextLevelXP} XP</p>
          </div>
          <span className="rounded-xl bg-gradient-to-r from-accent/10 to-purple-500/10 px-4 py-2 text-sm font-bold text-accent border border-accent/30 shadow-lg shadow-accent/20">
            {Math.round(progress.percent)}%
          </span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-white/10 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent via-purple-500 to-cyan-500 shadow-lg shadow-accent/30 transition-all duration-1000 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentAchievementsWidget() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAchievements() {
      if (!user?.uid) return;
      try {
        const nextAchievements = await GamificationService.getRecentAchievements(user.uid, 3);
        if (!cancelled) setAchievements(nextAchievements);
      } catch (err) {
        console.error('Recent achievements failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAchievements();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-status-warning/5 to-orange-500/5 backdrop-blur-sm transition-all duration-500 hover:border-status-warning/50 hover:shadow-lg hover:shadow-status-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-status-warning/10 flex items-center justify-center border border-status-warning/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-status-warning/20">
            <Award className="h-4 w-4 text-status-warning" />
          </div>
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <>
            <div className="h-14 animate-pulse rounded-xl bg-white/5 border border-white/10" />
            <div className="h-14 animate-pulse rounded-xl bg-white/5 border border-white/10" />
          </>
        )}

        {!loading && achievements.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
            <Medal className="mx-auto mb-2 h-8 w-8 text-text-muted" />
            <p className="text-sm font-medium text-text-muted">No achievements unlocked yet.</p>
          </div>
        )}

        {!loading && achievements.map((achievement, index) => (
          <div 
            key={achievement.id} 
            className="group/item flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-status-warning/50 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-status-warning/10 hover:-translate-y-1"
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-status-warning/10 flex items-center justify-center border border-status-warning/20 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-status-warning/20">
              <Medal className="h-5 w-5 text-status-warning" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white group-hover/item:text-status-warning transition-colors">{achievement.title}</p>
              <p className="text-xs font-medium text-text-muted">{achievement.rewardXP || 0} XP reward</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RankWidget() {
  const { user } = useAuth();
  const [rank, setRank] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRank() {
      if (!user?.uid) return;
      try {
        const nextRank = await GamificationService.getRank(user.uid, 'xp');
        if (!cancelled) setRank(nextRank);
      } catch (err) {
        console.error('Rank lookup failed:', err);
      }
    }

    loadRank();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return (
    <DashboardCard
      title="XP Rank"
      icon={Medal}
      value={rank ? `#${rank}` : '-'}
      subtitle="Among BeastBuck members"
      trend={rank ? 'Leaderboard ready' : 'Keep earning XP'}
      trendUp={Boolean(rank && rank <= 10)}
      depth={1}
    />
  );
}
