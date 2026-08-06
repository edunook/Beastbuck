import { useState, useEffect } from 'react';
import { Bell, MessageSquare, UserPlus, Heart, Calendar, Mail, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';
import { GamificationService } from '../../../services/firebase/gamification';

const NOTIFICATION_TYPES = {
  mention: { icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10', label: 'Mention' },
  friend_request: { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Friend Request' },
  team_invite: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Team Invite' },
  comment: { icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Comment' },
  like: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Like' },
  membership: { icon: Trophy, color: 'text-status-warning', bg: 'bg-status-warning/10', label: 'Membership Update' },
  event: { icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Event Invitation' },
  message: { icon: Mail, color: 'text-blue-300', bg: 'bg-blue-500/10', label: 'Message' },
};

export function NotificationsWidget() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const data = await GamificationService.getNotifications(user.uid, 5);
        setNotifications(data || []);
      } catch (err) {
        console.log('Notifications failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Bell className="text-blue-400 animate-pulse" />
          Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-black text-background animate-pulse">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <DynamicEmptyState type="generic" title="All caught up!" subtitle="No new notifications right now." />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, index) => {
              const config = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.message;
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={`group p-3 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                    notif.read ? 'border-white/5 bg-white/[0.01]' : `border-white/20 ${config.bg}`
                  }`}
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-1">{notif.title}</p>
                      <p className="text-[10px] text-text-muted line-clamp-1">{notif.body}</p>
                    </div>
                    {!notif.read && <div className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0 mt-1" />}
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