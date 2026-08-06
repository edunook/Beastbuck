import { useState, useEffect } from 'react';
import { Gift, Coins, Star, Zap, Gem, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { GamificationService } from '../../../services/firebase/gamification';

const REWARD_TYPES = [
  { id: 'xp', icon: Zap, label: 'Bonus XP', color: 'text-yellow-400' },
  { id: 'coins', icon: Coins, label: 'Coins', color: 'text-yellow-300' },
  { id: 'badge', icon: Star, label: 'Mystery Badge', color: 'text-purple-400' },
  { id: 'quiz', icon: HelpCircle, label: 'Fun Quiz', color: 'text-cyan-400' },
  { id: 'challenge', icon: Gem, label: 'Mini Challenge', color: 'text-pink-400' },
  { id: 'achievement', icon: Star, label: 'Hidden Achievement', color: 'text-orange-400' },
];

export function SurpriseBoxWidget() {
  const { user } = useAuth();
  const [canOpen, setCanOpen] = useState(false);
  const [reward, setReward] = useState(null);
  const [opening, setOpening] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const checkSurprise = async () => {
      try {
        const canClaim = await GamificationService.canClaimDailyReward(user.uid);
        setCanOpen(canClaim);
      } catch (err) {
        console.log('Surprise check failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSurprise();
  }, [user?.uid]);

  const handleOpen = async () => {
    if (!user?.uid || opening) return;
    setOpening(true);

    try {
      const randomReward = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
      setReward(randomReward);
      await GamificationService.claimDailyReward(user.uid);
      setCanOpen(false);
    } catch (err) {
      console.log('Surprise claim failed:', err.message);
    } finally {
      setOpening(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Surprise Box</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  const RewardIcon = reward?.icon;
  
  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Gift className="text-yellow-400 animate-bounce" />
          Surprise Box
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reward ? (
          <div className="text-center p-4 animate-fade-in-up">
            <div className="text-4xl mb-2 animate-bounce">🎁</div>
            <h4 className="font-bold text-white mb-1">You got:</h4>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10`}>
              <RewardIcon className={`text-2xl ${reward.color}`} />
              <span className="font-black text-white">{reward.label}</span>
            </div>
          </div>
        ) : canOpen ? (
          <div className="text-center p-4">
            <div className={`text-5xl mb-3 ${opening ? 'animate-spin' : 'animate-bounce'}`}>🎁</div>
            <h4 className="font-bold text-white mb-3">Daily Surprise!</h4>
            <button
              onClick={handleOpen}
              disabled={opening}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-background font-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
            >
              {opening ? 'Opening...' : 'Open Now'}
            </button>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="text-4xl mb-2 grayscale opacity-50">🎁</div>
            <h4 className="font-bold text-text-muted mb-1">Come back tomorrow!</h4>
            <p className="text-xs text-text-muted">A new surprise awaits you.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}