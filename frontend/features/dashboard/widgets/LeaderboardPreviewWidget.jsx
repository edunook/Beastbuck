import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Trophy, Medal, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService, calculateLevel } from '@services/firestore/gamification';

const PODIUM_STYLES = [
  {
    bg: 'from-amber-400/30 via-yellow-500/20 to-orange-500/10',
    border: 'border-yellow-400/50',
    text: 'text-yellow-300',
    badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    glow: 'shadow-yellow-500/30',
    height: 'h-24',
    avatarRing: 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]',
  },
  {
    bg: 'from-slate-300/30 via-gray-400/20 to-slate-600/10',
    border: 'border-slate-300/50',
    text: 'text-slate-200',
    badge: 'bg-slate-300/20 text-slate-200 border-slate-300/30',
    glow: 'shadow-slate-300/30',
    height: 'h-20',
    avatarRing: 'ring-2 ring-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.4)]',
  },
  {
    bg: 'from-amber-700/30 via-orange-800/20 to-amber-900/10',
    border: 'border-amber-600/50',
    text: 'text-amber-400',
    badge: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
    glow: 'shadow-amber-600/30',
    height: 'h-18',
    avatarRing: 'ring-2 ring-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.4)]',
  },
];

export function LeaderboardPreviewWidget() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      try {
        const data = await GamificationService.getLeaderboard({ type: 'xp', maxCount: 5 });
        if (!cancelled) {
          setLeaders(data || []);
        }
      } catch (err) {
        console.warn('LeaderboardPreviewWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-purple-950/20 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400 animate-pulse" />
              Leaderboard Arena
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Top 3 for podium display in order: [Rank 2 (Silver), Rank 1 (Gold), Rank 3 (Bronze)]
  const top3 = leaders.slice(0, 3);
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ member: top3[1], rank: 2, styleIdx: 1 });
  if (top3[0]) podiumOrder.push({ member: top3[0], rank: 1, styleIdx: 0 });
  if (top3[2]) podiumOrder.push({ member: top3[2], rank: 3, styleIdx: 2 });

  return (
    <Card className="group relative overflow-hidden h-full border border-yellow-500/20 bg-gradient-to-br from-slate-900/90 via-amber-950/15 to-purple-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-yellow-500/40 hover:shadow-2xl hover:shadow-yellow-500/10">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-300">
          <div className="p-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            <Trophy className="h-4 w-4" />
          </div>
          Leaderboard Arena
        </CardTitle>
        <Link
          to="/leaderboards"
          className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors group/link"
        >
          <span>Global Ranks</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {leaders.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState type="generic" title="No rankings yet" subtitle="Complete daily tasks and earn XP to climb to #1!" />
          </div>
        ) : (
          <>
            {/* Podium Visuals */}
            <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
              {podiumOrder.map(({ member, rank, styleIdx }) => {
                const style = PODIUM_STYLES[styleIdx];
                const displayName = member.displayName || member.username || member.name || 'Member';
                const initial = displayName.charAt(0).toUpperCase();
                const level = member.level || calculateLevel(member.xp || 0);

                return (
                  <Link
                    key={`podium-${member.id || rank}`}
                    to={member.username ? `/portfolio/${member.username}` : `/leaderboards`}
                    className={`group/podium flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className="relative mb-2">
                      {rank === 1 && (
                        <Crown className="h-5 w-5 text-yellow-300 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-bounce" />
                      )}
                      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} flex items-center justify-center font-black text-sm text-white ${style.avatarRing} transition-transform duration-300 group-hover/podium:scale-110`}>
                        {initial}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black border ${style.badge}`}>
                        #{rank}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white truncate max-w-[80px] group-hover/podium:text-yellow-300 transition-colors">
                      {displayName}
                    </p>
                    <span className="text-[10px] text-text-muted font-semibold">
                      Lvl {level} · {(member.xp || 0).toLocaleString()} XP
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Rest of Leaderboard list (ranks 4-5) */}
            <div className="space-y-1.5 pt-1">
              {leaders.slice(3, 5).map((member, idx) => {
                const rankNum = idx + 4;
                const displayName = member.displayName || member.username || member.name || 'Member';
                const level = member.level || calculateLevel(member.xp || 0);

                return (
                  <Link
                    key={`list-${member.id || rankNum}`}
                    to={member.username ? `/portfolio/${member.username}` : `/leaderboards`}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-yellow-500/30 hover:bg-yellow-500/[0.05] transition-all duration-200"
                  >
                    <span className="w-5 text-center text-xs font-black text-text-muted">
                      #{rankNum}
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-yellow-400">{(member.xp || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-text-muted ml-1">XP</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Interactive button to full leaderboards */}
            <Link
              to="/leaderboards"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-500/15 border border-yellow-500/30 text-xs font-bold text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View Full Leaderboards & Rankings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
