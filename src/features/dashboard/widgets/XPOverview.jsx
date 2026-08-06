import { useEffect, useState } from 'react';
import { Award, Medal, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { DashboardCard } from '../../../components/ui/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { GamificationService, getLevelProgress } from '../../../services/firebase/gamification';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';

export function XPOverview() {
  const { roleData } = useAuth();
  const progress = getLevelProgress(roleData?.xp || 0);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(progress.percent || 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.percent]);

  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <Card className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-700 group-hover:from-accent/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 group-hover:opacity-100" />
      
      <CardContent className="relative flex flex-col items-center justify-center p-6 text-center">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
          <Trophy className="h-4 w-4 text-status-warning animate-pulse" />
          XP Progress
        </h3>

        <div className="relative h-32 w-32 flex items-center justify-center mb-4 select-none">
          <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00f2fe" floodOpacity="0.6"/>
              </filter>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="50%" stopColor="#9b5de5" />
                <stop offset="100%" stopColor="#f15bb5" />
              </linearGradient>
            </defs>
            
            <circle
              className="text-white/10"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            <circle
              stroke="url(#progressGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
              style={{
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'url(#glow)'
              }}
            />
          </svg>

          <div className="text-center z-10 transition-transform duration-300 group-hover:scale-110">
            <span className="font-heading text-3xl font-black text-white bg-gradient-to-r from-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Lvl {progress.level}
            </span>
            <div className="text-xs font-bold text-text-muted mt-1">
              {Math.round(animatedPercent)}%
            </div>
          </div>
        </div>

        <div className="w-full text-center">
          <p className="text-sm font-medium text-white">{progress.progressXP} / {progress.nextLevelXP} XP</p>
          <p className="mt-1 text-xs text-text-muted font-bold tracking-wide">
            {progress.remainingXP} XP to next level
          </p>
        </div>
      </CardContent>
    </Card>
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
          <DynamicEmptyState type="achievements" />
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
