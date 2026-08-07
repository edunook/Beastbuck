import { useState, useEffect } from 'react';
import { Flame, Gift, Zap, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { calculateStreakXP } from '@services/firestore/gamification';

const DAYS_TO_SHOW = 12;

export function DailyStreakWidget() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimedToday, setClaimedToday] = useState(false);
  const [streakHistory, setStreakHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const loadStreak = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const [stats, history] = await Promise.all([
          GamificationService.getUserStats(user.uid),
          GamificationService.getStreakHistory(user.uid),
        ]);

        setStreak(stats?.streak || 0);
        setStreakHistory(history || []);
        setClaimedToday(
          stats?.lastStreakClaim?.toDate?.().toDateString() === new Date().toDateString() ||
          (history || []).some(date => date === new Date().toDateString())
        );
      } catch (err) {
        console.log('Streak load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStreak();
  }, [user?.uid]);

  const handleClaim = async () => {
    if (!user?.uid || claiming || claimedToday) return;
    setClaiming(true);

    try {
      const { GamificationService } = await import('@services/firestore/gamification');
      await GamificationService.claimDailyReward(user.uid);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setClaimedToday(true);
      setStreakHistory(prev => {
        const today = new Date().toDateString();
        return [...prev, today].slice(-DAYS_TO_SHOW);
      });
    } catch (err) {
      console.log('Streak claim failed:', err.message);
    } finally {
      setClaiming(false);
    }
  };

  const getLastNDays = () => {
    const days = [];
    const today = new Date();
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toDateString(),
        dayNum: DAYS_TO_SHOW - i,
        isToday: i === 0,
        isClaimed: streakHistory.some(h => h === date.toDateString()),
      });
    }
    return days;
  };

  const currentDayXP = streak > 0 ? calculateStreakXP(streak) : calculateStreakXP(1);
  const fireHeights = ['h-6', 'h-8', 'h-10', 'h-12', 'h-14', 'h-16'];
  const days = getLastNDays();

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-orange-500/5 to-red-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <Flame className="h-4 w-4 text-status-warning" />
            Daily Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-orange-500/5 to-red-500/5 backdrop-blur-sm transition-all duration-500 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500/20">
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-4">
          <div className="flex items-end gap-1">
            {[...Array(7)].map((_, i) => {
              const dayStreak = i + 1;
              const isActive = dayStreak <= streak && streak > 0;

              return (
                <div
                  key={i}
                  className={`w-4 rounded-full transition-all duration-500 ${
                    isActive
                      ? `bg-gradient-to-t from-orange-500 to-yellow-400 shadow-lg shadow-orange-500/50 animate-pulse ${fireHeights[Math.min(streak - 1, 5)] || 'h-14'}`
                      : 'bg-white/10 h-6'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              );
            })}
          </div>
        </div>

        <p className="font-heading text-4xl font-black bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-1">
          {streak || 0} <span className="text-2xl">Days</span>
        </p>

        <p className="text-xs font-medium text-text-muted mb-1">
          {streak > 0 ? 'Keep the fire burning!' : 'Start your streak today'}
        </p>

        <p className="text-xs font-bold text-orange-300 mb-3">
          +{currentDayXP} XP {streak > 0 ? `(Day ${streak})` : '(Day 1)'}
        </p>

        {streak > 0 && !claimedToday && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 text-sm font-bold text-orange-300 hover:from-orange-500/30 hover:to-yellow-500/30 transition-all duration-300 disabled:opacity-50"
          >
            <Gift className="h-4 w-4" />
            <span>{claiming ? 'Claiming...' : 'Claim Reward'}</span>
          </button>
        )}

        {claimedToday && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <Zap className="h-3.5 w-3.5 text-orange-400" />
            <span>Daily reward claimed</span>
          </div>
        )}

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mt-4 flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-white transition-colors"
        >
          <History className="h-3.5 w-3.5" />
          <span>{showHistory ? 'Hide' : 'Show'} History</span>
          {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showHistory && (
          <div className="mt-3 w-full animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Last {DAYS_TO_SHOW} Days</span>
              <span className="text-[10px] font-bold text-accent">
                Day {streak > 0 ? streak : 1}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`
                    relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all duration-300
                    ${day.isToday
                      ? 'border-accent/60 bg-accent/10 scale-105'
                      : day.isClaimed
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-white/5 bg-white/[0.02]'
                    }
                  `}
                  title={day.date}
                >
                  <span className={`text-[10px] font-bold ${day.isClaimed ? 'text-orange-300' : 'text-text-muted'}`}>
                    {day.dayNum}
                  </span>
                  {day.isClaimed && (
                    <div className="w-1 h-1 rounded-full bg-orange-400 mt-0.5" />
                  )}
                  {day.isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-text-muted">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Claimed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>Today</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
