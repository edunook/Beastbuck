import { useState, useEffect } from 'react';
import { Users, Trophy, Play, Zap, FlaskConical, Heart, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

export function FriendsActivityWidget() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadActivities = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const friendActivities = await GamificationService.getFriendsActivity(user.uid);
        setActivities(friendActivities || []);
      } catch (err) {
        console.log('Friends activity load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <Users className="h-4 w-4 text-blue-400" />
            Friends Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const icons = {
    achievement: Trophy,
    funflix: Play,
    ai: Zap,
    experiment: FlaskConical,
    like: Heart,
  };

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          Friends Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 && (
          <DynamicEmptyState 
            type="users"
            title="No activity yet" 
            subtitle="Connect with members to see their achievements!" 
          />
        )}
        
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = icons[activity.type] || Trophy;
            return (
              <div
                key={activity.id || index}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <span className="text-lg">{activity.emoji || '🎉'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {activity.item || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}