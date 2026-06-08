import { useEffect, useState } from 'react';
import { Award, Medal, Trophy, Zap } from 'lucide-react';
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
    <Card className="h-full depth={1}" hoverable={true}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-caption font-medium text-text-muted">
          <Zap className="h-4 w-4 text-accent" />
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-metric font-bold text-white">Level {level}</p>
            <p className="mt-1 text-badge text-text-muted">{progress.progressXP}/{progress.nextLevelXP} XP</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-badge font-bold text-accent border border-accent/20">
            {Math.round(progress.percent)}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-premium-3 shadow-glow-1"
            style={{ width: `${progress.percent}%` }}
          />
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
    <Card className="h-full depth={1}" hoverable={true}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-caption font-medium text-text-muted">
          <Award className="h-4 w-4 text-accent" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <>
            <div className="h-11 animate-pulse rounded-xl bg-white/5 border border-white/10" />
            <div className="h-11 animate-pulse rounded-xl bg-white/5 border border-white/10" />
          </>
        )}

        {!loading && achievements.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-caption text-text-muted">
            No achievements unlocked yet.
          </div>
        )}

        {!loading && achievements.map(achievement => (
          <div key={achievement.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05]">
            <Medal className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
            <div className="min-w-0">
              <p className="truncate text-caption font-bold text-white">{achievement.title}</p>
              <p className="text-badge text-text-muted">{achievement.rewardXP || 0} XP reward</p>
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
