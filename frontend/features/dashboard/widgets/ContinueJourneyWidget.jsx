import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, Zap, Users, Play, ShoppingBag, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

const CONTINUE_ITEMS = [
  { id: 'research', label: 'Continue Research', path: '/research', icon: BookOpen },
  { id: 'project', label: 'Continue Project', path: '/projects', icon: FileText },
  { id: 'experiment', label: 'Continue Experiment', path: '/workspace/experiments', icon: FlaskConical },
  { id: 'ai', label: 'Continue AI Chat', path: '/ai', icon: Zap },
  { id: 'funflix', label: 'Continue FunFlix', path: '/funflix', icon: Play },
  { id: 'marketplace', label: 'Continue Marketplace', path: '/marketplace', icon: ShoppingBag },
];

export function ContinueJourneyWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentlyAccessed, setRecentlyAccessed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadRecentActivity = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const activity = await GamificationService.getRecentlyAccessed(user.uid);
        setRecentlyAccessed(activity || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    
    loadRecentActivity();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <ArrowRight className="h-4 w-4 text-purple-400" />
            Continue Journey
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

  const displayItems = recentlyAccessed.length > 0 ? recentlyAccessed : [];

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
            <ArrowRight className="h-4 w-4 text-purple-400" />
          </div>
          Continue Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 && (
          <DynamicEmptyState 
            type="generic"
            title="Ready to start something?" 
            subtitle="Pick up where you left off or begin a new adventure!" 
          />
        )}
        
        <div className="space-y-3">
          {displayItems.map((item, index) => {
            const Icon = item.icon || ArrowRight;
            return (
              <button
                key={item.id || index}
                onClick={() => navigate(item.path)}
                className="group/item w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 text-left"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="relative h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-purple-500/20">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white group-hover/item:text-purple-300 transition-colors truncate">
                    {item.label}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-text-muted truncate">{item.subtitle}</p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-purple-400" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}