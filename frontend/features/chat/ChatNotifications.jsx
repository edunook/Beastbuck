import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Bell, MessageSquare, AtSign, Heart, Pin, Share2, Phone, Video, Calendar, Star, AlertCircle, Volume2, VolumeX, Moon } from 'lucide-react';

const NOTIFICATION_TYPES = {
  new_message: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  mention: { icon: AtSign, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
  reaction: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  reply: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  pin: { icon: Pin, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  share: { icon: Share2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  voice_call: { icon: Phone, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  video_call: { icon: Video, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  event: { icon: Calendar, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  achievement: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  system: { icon: AlertCircle, color: 'text-white/70', bg: 'bg-white/5', border: 'border-white/10' },
};

// Web Audio API Gentle Sound Synthesizer
function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio context errors on restricted autoplay
  }
}

export function ChatNotification({ notification, onClose, onClick, soundEnabled = true }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (soundEnabled) playChimeSound();
    }, 10);
    return () => clearTimeout(timer);
  }, [soundEnabled]);

  useEffect(() => {
    if (!notification.autoClose) return;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, notification.duration || 5000);
    return () => clearTimeout(timer);
  }, [notification.autoClose, notification.duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  const Icon = typeConfig.icon;

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
        transition-all duration-300 ease-out cursor-pointer
        ${typeConfig.bg} ${typeConfig.border}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      onClick={() => onClick?.(notification)}
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      <div className={`shrink-0 h-10 w-10 rounded-xl ${typeConfig.bg} border ${typeConfig.border} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${typeConfig.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-white truncate">{notification.title}</span>
          {notification.badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-[10px] font-bold text-accent">
              {notification.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{notification.message}</p>
        {notification.time && (
          <p className="text-[10px] text-white/40 mt-1">{notification.time}</p>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5 text-white/50" />
      </button>

      {notification.autoClose && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-accent/50 rounded-b-2xl"
            style={{ 
              animation: `shrink ${notification.duration || 5000}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ChatNotificationCenter({ notifications = [], onClose, onNotificationClick, soundEnabled = true }) {
  const [dismissed, setDismissed] = useState(new Set());

  const handleDismiss = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ChatNotification
            notification={notification}
            onClose={() => handleDismiss(notification.id)}
            onClick={onNotificationClick}
            soundEnabled={soundEnabled}
          />
        </div>
      ))}
    </div>
  );
}

export function useChatNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const addNotification = useCallback((notification) => {
    if (!enabled || focusMode) return;
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = {
      id,
      timestamp: Date.now(),
      autoClose: true,
      duration: 5000,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    return id;
  }, [enabled, focusMode]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);
  const toggleFocusMode = useCallback(() => setFocusMode(prev => !prev), []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    enabled,
    soundEnabled,
    focusMode,
    toggleSound,
    toggleFocusMode,
  };
}
