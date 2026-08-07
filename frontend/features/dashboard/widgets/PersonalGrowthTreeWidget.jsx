import { useState, useEffect } from 'react';
import { TreePine, Leaf, Sprout, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { GamificationService } from '@services/firestore/gamification';

const STAGES = [
  { label: 'Seed', icon: Sprout, minLevel: 1 },
  { label: 'Sprout', icon: Leaf, minLevel: 5 },
  { label: 'Sapling', icon: TreePine, minLevel: 10 },
  { label: 'Tree', icon: TreePine, minLevel: 20 },
  { label: 'Forest', icon: Sun, minLevel: 50 },
];

export function PersonalGrowthTreeWidget() {
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadLevel = async () => {
      try {
        const stats = await GamificationService.getUserStats(user.uid);
        setLevel(stats?.level || 1);
      } catch (err) {
        console.log('Growth tree load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLevel();
  }, [user?.uid]);

  const currentStage = STAGES.slice().reverse().find(s => level >= s.minLevel) || STAGES[0];
  const nextStage = STAGES.find(s => s.minLevel > level);
  const CurrentIcon = currentStage.icon;

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Personal Growth Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm transition-all duration-500 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <TreePine className="h-4 w-4 text-green-400 animate-pulse" />
          Personal Growth Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border-2 border-green-500/30 shadow-lg shadow-green-500/20">
              <CurrentIcon className="h-10 w-10 text-green-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-black text-green-300">
              Lvl {level}
            </div>
          </div>
          <p className="text-sm font-bold text-white mb-1">Stage: {currentStage.label}</p>
          {nextStage ? (
            <p className="text-xs text-text-muted">Reach level {nextStage.minLevel} to grow to {nextStage.label}</p>
          ) : (
            <p className="text-xs text-text-muted">Maximum growth achieved!</p>
          )}
          <div className="mt-3 w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (level / (nextStage?.minLevel || level + 10)) * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
