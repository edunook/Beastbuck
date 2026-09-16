import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, UserPlus, Heart, Calendar, Mail, Trophy, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

const NOTIFICATION_TYPES = {
  mention: { icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
  friend_request: { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  team_invite: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  comment: { icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
  like: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/30' },
  membership: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  event: { icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  message: { icon: Mail, color: 'text-blue-300', bg: 'bg-blue-500/15 border-blue-500/30' },
};

export function NotificationsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const data = await GamificationService.getNotifications(user.uid, 4);
        if (!cancelled) {
          setNotifications(data || []);
        }
      } catch (err) {
        console.warn('NotificationsWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNotifications();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="group relative overflow-hidden h-full border border-blue-500/20 bg-gradient-to-br from-slate-900/90 via-blue-950/15 to-cyan-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-300">
          <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Bell className="h-4 w-4" />
          </div>
          Notifications
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-accent text-[9px] font-black text-slate-950 animate-pulse">
              {unreadCount}
            </span>
          )}
        </CardTitle>
        <Link
          to="/notifications"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors group/link"
        >
          <span>All Alerts</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState type="generic" title="All caught up!" subtitle="You have no unread notifications." />
          </div>
        ) : (
          notifications.map((notif, index) => {
            const config = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.message;
            const Icon = config.icon;

            return (
              <div
                key={notif.id || index}
                onClick={() => navigate('/notifications')}
                className={`group/item cursor-pointer flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  notif.read ? 'border-white/5 bg-white/[0.01]' : 'border-blue-500/30 bg-blue-500/[0.08]'
                }`}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 70}ms both` }}
              >
                <div className={`h-8 w-8 rounded-xl ${config.bg} border flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover/item:text-blue-300 transition-colors">
                    {notif.title || 'System Notification'}
                  </p>
                  <p className="text-[10px] text-text-muted truncate">
                    {notif.body || notif.message || 'View details in notification center'}
                  </p>
                </div>
                {!notif.read && (
                  <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] shrink-0" />
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}