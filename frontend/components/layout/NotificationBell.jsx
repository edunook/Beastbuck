import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { NotificationsService } from '@services/firestore/notifications';

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  
  const isActive = location.pathname === '/notifications';

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    const unsubscribe = NotificationsService.subscribeToNotifications(user?.uid, {
      onNotifications: (nextNotifications) => {
        setNotifications(nextNotifications);
      },
      onError: (err) => {
        console.error('Notifications listener failed:', err);
      },
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleClick = () => {
    // Automatically mark all current unread as read when clicking the notification button
    if (notifications.length > 0) {
      NotificationsService.markAllAsRead(user?.uid, notifications);
    }
    navigate('/notifications');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative rounded-full p-3 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-[48px] sm:min-w-[48px] ${
        isActive
          ? 'bg-accent/20 text-accent ring-2 ring-accent/40 shadow-lg shadow-accent/20'
          : 'text-text-muted hover:bg-white/10 hover:text-white'
      }`}
      aria-label="Notifications"
      title="Notifications Hub"
    >
      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-500/50 ring-2 ring-surface animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

