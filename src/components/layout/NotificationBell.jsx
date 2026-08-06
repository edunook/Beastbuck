import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { NotificationsService } from '../../services/firebase/notifications';

function formatNotificationTime(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return '';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = NotificationsService.subscribeToNotifications(user.uid, {
      onNotifications: (nextNotifications) => {
        setNotifications(nextNotifications);
        setError(null);
      },
      onError: (err) => {
        console.error('Notifications listener failed:', err);
        setError('Notifications unavailable.');
      },
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const markAsRead = async (notification) => {
    if (!user?.uid || notification.read) return;

    try {
      await NotificationsService.markAsRead(user.uid, notification.id);
    } catch (err) {
      console.error('Mark notification read failed:', err);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className="relative rounded-full p-3 text-text-muted transition-colors hover:bg-white/5 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-[48px] sm:min-w-[48px]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-status-success shadow-lg shadow-status-success/50 ring-2 ring-surface">
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[1000] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-depth-3 sm:top-14">
          <div className="border-b border-white/10 px-3 sm:px-4 py-2 sm:py-3">
            <div className="text-caption font-bold text-white text-sm sm:text-base">Notifications</div>
            <div className="text-badge text-text-muted text-xs sm:text-sm">{unreadCount} unread</div>
          </div>

          {error ? (
            <div className="px-3 sm:px-4 py-4 sm:py-6 text-caption text-status-danger text-sm">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-caption text-text-muted text-sm">
              No notifications yet.
            </div>
          ) : (
            <div className="max-h-80 sm:max-h-96 overflow-y-auto p-2 sm:p-2 custom-scrollbar">
              {notifications.map(notification => (
                <Link
                  key={notification.id}
                  to={notification.link || '/dashboard'}
                  onClick={() => {
                    markAsRead(notification);
                    setOpen(false);
                  }}
                  className={`block rounded-xl px-3 py-2 sm:px-3 sm:py-3 transition-all duration-200 hover:bg-white/5 hover:border-white/10 border border-transparent ${
                    notification.read ? 'opacity-70' : 'bg-accent/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-caption font-bold text-white text-sm sm:text-base">{notification.title}</div>
                      <p className="mt-1 line-clamp-2 text-badge leading-5 text-text-muted text-xs sm:text-sm">{notification.message}</p>
                    </div>
                    {!notification.read && <span className="mt-1 h-2 w-2 sm:h-2 sm:w-2 shrink-0 rounded-full bg-status-success shadow-lg shadow-status-success/50" />}
                  </div>
                  <div className="mt-2 text-badge uppercase tracking-widest text-text-muted text-[10px] sm:text-xs">
                    {formatNotificationTime(notification.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
