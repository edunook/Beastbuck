import { useState, useEffect } from 'react';
import { Gem, Zap, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { GamificationService } from '@services/firestore/gamification';

export function CreativeEnergyCrystalWidget() {
  const { user } = useAuth();
  const [energy, setEnergy] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadEnergy = async () => {
      try {
        const data = await GamificationService.getCreativeEnergy(user.uid);
        setEnergy(data?.energy || 0);
      } catch (err) {
        console.log('Creative energy load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEnergy();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Creative Energy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  const getEnergyColor = () => {
    if (energy >= 80) return 'from-cyan-400 to-blue-500';
    if (energy >= 50) return 'from-purple-400 to-pink-500';
    if (energy >= 25) return 'from-yellow-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <Gem className="h-4 w-4 text-cyan-400 animate-pulse" />
          Creative Energy Crystal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${getEnergyColor()} flex items-center justify-center shadow-lg border-2 border-white/20`}>
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mb-1">{energy}%</p>
          <p className="text-xs font-bold text-text-muted mb-3">Creative Energy</p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getEnergyColor()} transition-all duration-700`}
              style={{ width: `${energy}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-2">
            {energy >= 80 ? 'Fully charged! Create something amazing!' : energy >= 50 ? 'Great energy! Keep creating!' : energy >= 25 ? 'Building momentum!' : 'Time to explore and create!'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
