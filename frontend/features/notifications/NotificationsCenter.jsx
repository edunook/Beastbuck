import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  CheckCheck, 
  Trash2, 
  Settings, 
  UserPlus, 
  Film, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { NotificationsService } from '@services/firestore/notifications';

function formatTime(createdAt) {
  if (!createdAt) return 'Just now';
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getTimeGroup(createdAt) {
  if (!createdAt) return 'Today';
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return 'Today';

  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  return 'Earlier';
}

function getNotificationBadge(type) {
  switch (type) {
    case 'member_join':
      return { icon: UserPlus, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'New Member' };
    case 'funflix':
      return { icon: Film, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'FunFlix' };
    case 'creativity':
      return { icon: Sparkles, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Creativity' };
    case 'ai_tool':
      return { icon: Bot, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', label: 'AI Release' };
    case 'task_completed':
      return { icon: CheckCircle2, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Task Done' };
    case 'workspace_add':
      return { icon: FileText, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Workspace' };
    case 'member_update':
      return { icon: ShieldCheck, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Role Change' };
    case 'mention':
      return { icon: MessageSquare, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'Mention' };
    default:
      return { icon: Bell, color: 'bg-accent/20 text-accent border-accent/30', label: 'Update' };
  }
}

export default function NotificationsCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NotificationsService.subscribeToNotifications(user?.uid, {
      onNotifications: (items) => {
        setNotifications(items);
        setLoading(false);
        // Automatically mark all current unread notifications as read when opening the page
        if (items.some(n => !n.read)) {
          NotificationsService.markAllAsRead(user?.uid, items);
        }
      },
      onError: (err) => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleMarkAllRead = () => {
    NotificationsService.markAllAsRead(user?.uid, notifications);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    NotificationsService.deleteNotification(user?.uid, id);
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search filter
      const matchesSearch = 
        !searchQuery ||
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.actorName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !n.read;
      if (activeTab === 'public') return n.category === 'public' || n.isPublic;
      if (activeTab === 'team') return n.category === 'team' || n.type?.includes('member') || n.type?.includes('task') || n.type?.includes('workspace');
      if (activeTab === 'personal') return n.type === 'mention' || n.recipientUid === user?.uid;

      return true;
    });
  }, [notifications, activeTab, searchQuery, user?.uid]);

  // Group notifications chronologically
  const groupedNotifications = useMemo(() => {
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };

    filteredNotifications.forEach(n => {
      const groupKey = getTimeGroup(n.createdAt);
      if (groups[groupKey]) {
        groups[groupKey].push(n);
      } else {
        groups.Earlier.push(n);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      publicCount: notifications.filter(n => n.category === 'public' || n.isPublic).length,
      teamCount: notifications.filter(n => n.category === 'team' || n.type?.includes('member') || n.type?.includes('task')).length,
    };
  }, [notifications]);

  return (
    <PageContainer className="pb-12 pt-2 sm:pt-4">
      {/* Streamlined Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">Notifications</h1>
            <p className="text-xs text-text-muted mt-1">Real-time alerts & member activity</p>
          </div>
        </div>

        {/* Compact Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} className="h-8 px-3 text-xs">
            <CheckCheck className="w-3.5 h-3.5 mr-1 text-accent" />
            Mark Read
          </Button>
          <Link to="/settings/notifications">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-text-muted hover:text-white">
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Ultra-Compact Search & Quick Stats Bar */}
      <div className="bg-surface/60 backdrop-blur-md rounded-2xl border border-white/10 p-3 mb-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications or members..."
              className="w-full pl-9 pr-3 py-1.5 bg-background/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Inline Compact Stats Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-bold text-text-muted shrink-0 pb-0.5 sm:pb-0">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 whitespace-nowrap">
              <Bell className="w-3 h-3 text-accent" /> {stats.total} Total
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-400" /> {stats.publicCount} Public
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 whitespace-nowrap">
              <Users className="w-3 h-3 text-emerald-400" /> {stats.teamCount} Members
            </span>
            {stats.unread > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 whitespace-nowrap">
                <Zap className="w-3 h-3" /> {stats.unread} Unread
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 custom-scrollbar scrollbar-none border-t border-white/5">
          {[
            { id: 'all', label: 'All Activity', icon: Bell },
            { id: 'public', label: 'Public Events', icon: Sparkles },
            { id: 'team', label: 'Member Actions', icon: Users },
            { id: 'personal', label: 'Direct Alerts', icon: MessageSquare },
            { id: 'unread', label: 'Unread', icon: Zap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-background shadow-md shadow-accent/20'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List Content */}
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <Card className="p-6 text-center bg-surface/30 border-white/10">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading live notifications stream...</p>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center bg-surface/30 border-white/10 rounded-2xl">
            <Bell className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">No notifications found</h3>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              {searchQuery ? 'No results matched your search query.' : 'You are all caught up! New member actions and public updates will appear here.'}
            </p>
          </Card>
        ) : (
          Object.entries(groupedNotifications).map(([groupName, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={groupName} className="space-y-2">
                <div className="flex items-center gap-2 px-1 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{groupName}</h4>
                  <span className="h-[1px] flex-1 bg-white/10" />
                </div>

                <div className="space-y-2">
                  {items.map(notif => {
                    const badge = getNotificationBadge(notif.type);
                    const BadgeIcon = badge.icon;

                    return (
                      <Card
                        key={notif.id}
                        className={`group relative overflow-hidden transition-all duration-200 border border-white/10 hover:border-accent/40 ${
                          notif.read ? 'bg-surface/40 hover:bg-surface/70 opacity-90' : 'bg-accent/10 border-accent/30 hover:bg-accent/15'
                        }`}
                      >
                        <CardContent className="p-3 sm:p-3.5">
                          <div className="flex items-start gap-3">
                            {/* Actor Avatar or Category Badge Icon */}
                            <div className="relative shrink-0">
                              {notif.actorAvatar ? (
                                <img
                                  src={notif.actorAvatar}
                                  alt={notif.actorName || 'Actor'}
                                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/15"
                                />
                              ) : (
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${badge.color}`}>
                                  <BadgeIcon className="w-4 h-4" />
                                </div>
                              )}
                              {notif.actorAvatar && (
                                <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border border-background shadow ${badge.color}`}>
                                  <BadgeIcon className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>

                            {/* Main Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase tracking-wider ${badge.color}`}>
                                  {badge.label}
                                </span>
                                <span className="text-[11px] text-text-muted font-medium ml-auto">
                                  {formatTime(notif.createdAt)}
                                </span>
                              </div>

                              <h5 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-accent transition-colors">
                                {notif.title}
                              </h5>
                              <p className="text-xs text-text-muted mt-0.5 leading-relaxed line-clamp-2">
                                {notif.message}
                              </p>

                              {/* Footer Action Links */}
                              {notif.link && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Link
                                    to={notif.link}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
                                  >
                                    <span>View Details</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              )}
                            </div>

                            {/* Unread indicator & Delete Action */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-accent shadow-md shadow-accent/50 mr-1" />
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDelete(notif.id, e)}
                                title="Dismiss notification"
                                className="p-1 text-text-muted/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
