import { useState, useEffect } from 'react';
import { Target, Zap, CheckCircle2, Flame, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

export function DailyMissionWidget() {
  const { user, roleData } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadMissions = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const userMissions = await GamificationService.getUserDailyMissions(user.uid);
        setMissions(userMissions || []);
        setCompleted(roleData?.completedMissions || {});
      } catch (err) {
        console.log('Daily missions load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadMissions();
  }, [user?.uid, roleData?.completedMissions]);

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <Target className="h-4 w-4 text-accent" />
            Today's Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = missions.filter(m => completed[m.id]).length;
  const progressPercent = (completedCount / missions.length) * 100;

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
            <Target className="h-4 w-4 text-accent" />
          </div>
          Today's Mission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted">Progress</span>
            <span className="text-xs font-bold text-accent">{completedCount}/{missions.length} Completed</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {missions.map((mission, index) => {
            const Icon = mission.icon;
            const isCompleted = completed[mission.id];
            
            return (
              <div
                key={mission.id}
                className={`group/mission flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                  isCompleted 
                    ? 'border-status-success/30 bg-status-success/5' 
                    : 'border-white/10 bg-white/[0.02] hover:border-accent/50 hover:bg-white/[0.05]'
                }`}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-status-success/20' : 'bg-white/5 group-hover/mission:bg-accent/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-status-success" />
                    ) : (
                      <Icon className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isCompleted ? 'text-status-success' : 'text-white'}`}>
                      {mission.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted">{mission.xp} XP</span>
                      <span className="text-white/30">·</span>
                      <span className="text-xs text-text-muted">{mission.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                {!isCompleted && (
                  <button className="opacity-0 group-hover/mission:opacity-100 px-3 py-1.5 rounded-lg bg-accent/10 text-xs font-bold text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200">
                    Do it
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {missions.length === 0 && (
          <DynamicEmptyState 
            type="generic" 
            title="No missions today" 
            subtitle="Check back tomorrow for new adventures!" 
          />
        )}
      </CardContent>
    </Card>
  );
}
