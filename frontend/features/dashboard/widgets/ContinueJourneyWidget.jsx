import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, Zap, Play, ShoppingBag, CheckSquare, Palette, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';

const QUICK_JOURNEYS = [
  { 
    id: 'creative', 
    label: 'Creative Showcase', 
    subtitle: 'Publish & explore member artworks', 
    path: '/creative', 
    icon: Palette,
    gradient: 'from-pink-500/20 to-purple-500/20',
    border: 'border-pink-500/30',
    color: 'text-pink-400',
  },
  { 
    id: 'funflix', 
    label: 'FunFlix Premiere', 
    subtitle: 'Stream latest videos & challenges', 
    path: '/funflix', 
    icon: Play,
    gradient: 'from-rose-500/20 to-red-500/20',
    border: 'border-rose-500/30',
    color: 'text-rose-400',
  },
  { 
    id: 'experiments', 
    label: 'Experiments Lab', 
    subtitle: 'Collaborative projects & testing', 
    path: '/experiments', 
    icon: FlaskConical,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
    color: 'text-cyan-400',
  },
  { 
    id: 'tasks', 
    label: 'Mission Tasks', 
    subtitle: 'Complete goals & claim rewards', 
    path: '/tasks', 
    icon: CheckSquare,
    gradient: 'from-emerald-500/20 to-green-500/20',
    border: 'border-emerald-500/30',
    color: 'text-emerald-400',
  },
];

export function ContinueJourneyWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentlyAccessed, setRecentlyAccessed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadRecentActivity = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const activity = await GamificationService.getRecentlyAccessed(user.uid);
        if (!cancelled) {
          setRecentlyAccessed(activity || []);
        }
      } catch (err) {
        console.warn('ContinueJourneyWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadRecentActivity();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const displayItems = recentlyAccessed.length >= 2 ? recentlyAccessed : QUICK_JOURNEYS;

  return (
    <Card className="group relative overflow-hidden h-full border border-purple-500/20 bg-gradient-to-br from-slate-900/90 via-purple-950/15 to-indigo-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-300">
          <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="h-4 w-4" />
          </div>
          Continue Journey
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {displayItems.map((item, index) => {
          const Icon = item.icon || ArrowRight;
          const bgGradient = item.gradient || 'from-purple-500/20 to-indigo-500/20';
          const borderColor = item.border || 'border-purple-500/30';
          const iconColor = item.color || 'text-purple-400';

          return (
            <button
              key={item.id || index}
              onClick={() => navigate(item.path)}
              className="group/item w-full flex items-center gap-3.5 p-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-purple-500/40 hover:bg-purple-500/[0.06] transition-all duration-300 hover:-translate-y-0.5 text-left"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 70}ms both` }}
            >
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${bgGradient} border ${borderColor} flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-105 transition-transform duration-300`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-white group-hover/item:text-purple-300 transition-colors truncate">
                  {item.label}
                </p>
                <p className="text-[11px] text-text-muted truncate mt-0.5">
                  {item.subtitle || 'Jump right back in'}
                </p>
              </div>

              <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-text-muted group-hover/item:text-purple-300 group-hover/item:bg-purple-500/20 transition-all duration-300 group-hover/item:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}