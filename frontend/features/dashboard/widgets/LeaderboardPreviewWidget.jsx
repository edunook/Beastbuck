import { useState, useEffect } from 'react';
import { Crown, Trophy, Medal, Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

const PODIUM_COLORS = [
  'from-yellow-400 to-orange-500',
  'from-gray-300 to-gray-400',
  'from-orange-600 to-orange-700',
];

export function LeaderboardPreviewWidget() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadLeaderboard = async () => {
      try {
        const data = await GamificationService.getLeaderboard({ type: 'xp', maxCount: 5 });
        setLeaders(data || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300 shadow-depth-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-yellow-400">
          <Trophy className="text-yellow-400 text-lg" />
          Leaderboard Arena
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <DynamicEmptyState type="generic" title="No leaders yet" subtitle="Earn XP to reach the top!" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-end justify-center gap-4 mb-4">
              {leaders.slice(0, 3).map((member, index) => (
                <div
                  key={`podium-${member.id || index}`}
                  className={`flex flex-col items-center gap-2 ${index === 0 ? 'mb-4' : index === 1 ? 'mb-2' : ''}`}
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                >
                  <div className={`relative h-12 w-12 rounded-full bg-gradient-to-br ${PODIUM_COLORS[index]} flex items-center justify-center shadow-lg ${index === 0 ? 'animate-bounce' : ''}`}>
                    {index === 0 && <Crown className="absolute -top-3 text-yellow-300 text-xl animate-pulse" />}
                    <span className="text-lg font-black text-white">{member.displayName?.[0] || member.username?.[0] || member.initials || '?'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white truncate max-w-[60px]">{member.displayName || member.username || member.name || '???'}</p>
                    <p className="text-[10px] text-text-muted font-bold">Lvl {member.level || calculateLevel(member.xp || 0)}</p>
                  </div>
                  {index === 0 && <Medal className="text-yellow-400 text-lg animate-pulse" />}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {leaders.map((member, index) => (
                <div
                  key={`list-${member.id || index}`}
                  className="flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-yellow-500/50 transition-all duration-300"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                >
                  <span className="text-sm font-black text-yellow-400 w-6">#{index + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Flame className="text-orange-400 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{member.displayName || member.username || member.name || '???'}</p>
                    <p className="text-[10px] text-text-muted">{member.xp || 0} XP</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-yellow-300 hover:bg-yellow-500/10 transition-all duration-300 flex items-center justify-center gap-2">
              <span>View Full Leaderboard</span>
              <ArrowRight className="text-xs" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}