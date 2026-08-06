import { useState, useEffect } from 'react';
import { Target, Award, Rocket, GraduationCap, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';
import { GamificationService } from '../../../services/firebase/gamification';

const COLOR_MAP = {
  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
};

export function PersonalGoalsWidget() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadGoals = async () => {
      try {
        const data = await GamificationService.getPersonalGoals(user.uid);
        setGoals(data || []);
      } catch (err) {
        console.log('Goals load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-emerald-500/5 to-green-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Personal Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-emerald-500/5 to-green-500/5 backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <Target className="h-4 w-4 text-emerald-400 animate-pulse" />
          Personal Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <DynamicEmptyState type="generic" title="No goals yet" subtitle="Set your first goal to start tracking your progress!" />
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal, index) => {
              const Icon = goal.icon || Target;
              const colorKey = goal.color || 'purple';
              const colorClass = COLOR_MAP[colorKey] || COLOR_MAP.purple;
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/50 transition-all duration-300"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{goal.title}</h4>
                      <p className="text-xs text-text-muted line-clamp-1">{goal.description}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-300 mt-1 block">{goal.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
