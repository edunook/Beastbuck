import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Target, Zap, CheckCircle2, Flame, Sparkles, Trophy, ArrowRight, Play, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

function getMissionRoute(mission) {
  if (mission.path || mission.route) return mission.path || mission.route;
  const label = (mission.label || mission.title || '').toLowerCase();
  const id = (mission.id || '').toLowerCase();
  
  if (label.includes('video') || label.includes('funflix') || id.includes('funflix') || id.includes('video')) {
    return '/funflix';
  }
  if (label.includes('creative') || label.includes('draw') || label.includes('design') || id.includes('creative')) {
    return '/creative';
  }
  if (label.includes('challenge') || label.includes('quiz') || id.includes('challenge') || id.includes('quiz')) {
    return '/challenges';
  }
  if (label.includes('experiment') || label.includes('lab') || id.includes('experiment')) {
    return '/experiments';
  }
  if (label.includes('research') || label.includes('note') || id.includes('research')) {
    return '/research';
  }
  if (label.includes('chat') || label.includes('community') || id.includes('chat')) {
    return '/chat';
  }
  return '/tasks';
}

export function DailyMissionWidget() {
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadMissions = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const userMissions = await GamificationService.getUserDailyMissions(user.uid);
        if (!cancelled) {
          setMissions(userMissions || []);
          setCompleted(roleData?.completedMissions || {});
        }
      } catch (err) {
        console.warn('DailyMissionWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadMissions();
    return () => { cancelled = true; };
  }, [user?.uid, roleData?.completedMissions]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-950/20 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400 animate-pulse" />
              Daily Missions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no specific daily missions in Firestore, provide standard daily ecosystem challenges
  const activeMissions = missions.length > 0 ? missions : [
    { id: 'daily_funflix', label: 'Watch 1 FunFlix premiere', xp: 25, difficulty: 'Easy', path: '/funflix' },
    { id: 'daily_creative', label: 'Explore or publish creative work', xp: 40, difficulty: 'Medium', path: '/creative' },
    { id: 'daily_challenge', label: 'Participate in active challenge', xp: 50, difficulty: 'Hard', path: '/challenges' },
  ];

  const completedCount = activeMissions.filter(m => completed[m.id]).length;
  const progressPercent = Math.round((completedCount / activeMissions.length) * 100);

  return (
    <Card className="group relative overflow-hidden h-full border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-cyan-950/15 to-purple-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Target className="h-4 w-4" />
          </div>
          Today's Missions
        </CardTitle>
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
        >
          <span>All Challenges</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3.5">
        {/* Progress bar */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-text-muted">Daily Completion</span>
            <span className="text-cyan-300 font-mono">{completedCount} / {activeMissions.length} Complete ({progressPercent}%)</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        {/* Missions list */}
        <div className="space-y-2">
          {activeMissions.map((mission, index) => {
            const isCompleted = Boolean(completed[mission.id]);
            const targetRoute = getMissionRoute(mission);
            
            return (
              <div
                key={mission.id || index}
                onClick={() => navigate(targetRoute)}
                className={`group/mission cursor-pointer flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  isCompleted 
                    ? 'border-status-success/30 bg-status-success/5' 
                    : 'border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-cyan-500/[0.06]'
                }`}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-status-success/20 text-status-success' : 'bg-cyan-500/10 text-cyan-400 group-hover/mission:scale-105 border border-cyan-500/20'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-status-success" />
                    ) : (
                      <Zap className="h-4 w-4 fill-cyan-400/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isCompleted ? 'text-status-success line-through' : 'text-white group-hover/mission:text-cyan-300 transition-colors'}`}>
                      {mission.label || mission.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                        +{mission.xp || 25} XP
                      </span>
                      {mission.difficulty && (
                        <span className="text-[10px] text-text-muted font-medium">
                          {mission.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isCompleted && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(targetRoute);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-[11px] font-black text-white shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
