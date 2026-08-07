import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, MessageSquare, Award, AlertCircle, UserPlus, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'message', title: 'New message from Sarah', description: 'Hey! I wanted to discuss the project timeline...', time: '2m ago', read: false },
  { id: 2, type: 'achievement', title: 'Achievement Unlocked!', description: 'You earned the "Community Builder" badge', time: '15m ago', read: false },
  { id: 3, type: 'alert', title: 'System Maintenance', description: 'Scheduled maintenance in 2 hours', time: '1h ago', read: false },
  { id: 4, type: 'mention', title: 'You were mentioned', description: 'Marcus mentioned you in a comment', time: '2h ago', read: true },
  { id: 5, type: 'invite', title: 'Team Invitation', description: 'You were invited to join "AI Research Team"', time: '3h ago', read: true },
  { id: 6, type: 'event', title: 'Upcoming Event', description: 'Community meetup tomorrow at 3 PM', time: '5h ago', read: true },
  { id: 7, type: 'message', title: 'New message from David', description: 'Thanks for the feedback on my PR', time: '1d ago', read: true },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'achievement': return Award;
      case 'alert': return AlertCircle;
      case 'mention': return MessageSquare;
      case 'invite': return UserPlus;
      case 'event': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message': return 'text-blue-400 bg-blue-500/10';
      case 'achievement': return 'text-yellow-400 bg-yellow-500/10';
      case 'alert': return 'text-red-400 bg-red-500/10';
      case 'mention': return 'text-purple-400 bg-purple-500/10';
      case 'invite': return 'text-emerald-400 bg-emerald-500/10';
      case 'event': return 'text-orange-400 bg-orange-500/10';
      default: return 'text-text-muted bg-white/5';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-text-muted hover:text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Floating Drawer */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-bold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-accent text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Bell className="h-12 w-12 text-text-muted mb-4" />
                    <p className="text-text-muted">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 hover:bg-white/[0.02] transition-colors cursor-pointer",
                            !notification.read && "bg-white/[0.03]"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg shrink-0", getNotificationColor(notification.type))}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className={cn("font-medium text-white text-sm", !notification.read && "font-bold")}>
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                  >
                                    <Check className="h-3 w-3 text-text-muted" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-text-muted mb-2 line-clamp-2">
                                {notification.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted">{notification.time}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-3 w-3 text-text-muted" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={clearAll}
                    className="w-full text-text-muted hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear all notifications
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Export a hook for using the notification center in other components
export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.read).length);
  }, []);

  return unreadCount;
}
