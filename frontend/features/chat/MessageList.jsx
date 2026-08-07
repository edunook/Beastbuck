import { useMemo, useEffect, useRef, forwardRef, useImperativeHandle, memo } from 'react';
import { MessageCircle, Megaphone, ChevronDown, RefreshCw, AlertCircle, Inbox } from 'lucide-react';
import { SkeletonChat } from '@frontend/components/ui/UIElements';
import { MessageItem, DateSeparator } from './MessageItem';
import Button from '@frontend/components/ui/Button';

export const MessageList = memo(forwardRef(function MessageList({
  messages,
  loading,
  currentUserId,
  roomName = 'chat',
  isAnnouncementRoom = false,
  canManageAnnouncements = false,
  onReply,
  onToggleReaction,
  onTogglePin,
  onArchiveAnnouncement,
  onEdit,
  onDelete,
  onBookmark,
  onForward,
  onShare,
  onShowProfile,
  onMediaOpen,
  onOpenThread,
  onAIAction,
  compact = false,
  fontSize = 'medium',
  reducedMotion = false,
  isRefreshing = false,
  onPullToRefresh,
  showScrollBottom = false,
  onScrollToBottom,
  onScroll,
  error,
  onRetry,
}, ref) {
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length]);

  useImperativeHandle(ref, () => ({
    scrollTo: (opts) => scrollRef.current?.scrollTo(opts),
  }));

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    messages.forEach((message) => {
      const date = message.createdAt?.toDate?.();
      const dateKey = date ? date.toDateString() : 'unknown';
      if (dateKey !== lastDate) {
        groups.push({ type: 'separator', date });
        lastDate = dateKey;
      }
      groups.push({ type: 'message', message });
    });
    return groups;
  }, [messages]);

  const handleTouchStart = (e) => {
    if (!onPullToRefresh) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    pullStartY.current = e.touches[0].clientY;
    isPulling.current = true;
  };

  const handleTouchMove = (e) => {
    if (!onPullToRefresh || !isPulling.current) return;
    const deltaY = e.touches[0].clientY - pullStartY.current;
    if (deltaY > 80 && scrollRef.current?.scrollTop === 0) {
      // visual pull hint could be added here
    }
  };

  const handleTouchEnd = () => {
    if (!onPullToRefresh || !isPulling.current) return;
    isPulling.current = false;
    const el = scrollRef.current;
    if (el && el.scrollTop === 0) {
      onPullToRefresh?.();
    }
  };

  const renderMediaPreview = (message) => {
    if (!message.attachments?.length) return null;
    return message.attachments.map((att, idx) => {
      if (att.type?.startsWith('image/') && att.url) {
        return (
          <button key={idx} onClick={() => onMediaOpen?.(att.url)} className="mt-2 rounded-xl overflow-hidden border border-border hover:border-accent/40 transition">
            <img src={att.url} alt={att.name} className="max-h-64 w-full object-cover" loading="lazy" />
          </button>
        );
      }
      if (att.type?.startsWith('video/') && att.url) {
        return (
          <button key={idx} onClick={() => onMediaOpen?.(att.url)} className="mt-2 rounded-xl overflow-hidden border border-border hover:border-accent/40 transition">
            <video src={att.url} className="max-h-64 w-full object-cover" />
          </button>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <SkeletonChat />
          <p className="text-xs text-text-muted animate-pulse">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !error) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-sm animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            {isAnnouncementRoom ? (
              <Megaphone className="h-7 w-7 sm:h-8 sm:w-8 text-accent animate-pulse" />
            ) : (
              <Inbox className="h-7 w-7 sm:h-8 sm:w-8 text-accent animate-pulse" />
            )}
          </div>
          <h2 className="mb-2 text-base sm:text-lg font-bold text-white">
            {isAnnouncementRoom ? 'No announcements yet' : 'No messages yet'}
          </h2>
          <p className="text-xs sm:text-sm leading-6 text-white/60">
            {isAnnouncementRoom
              ? 'Leadership announcements for BeastBuck will appear here.'
              : `Send the first message in #${roomName}.`}
          </p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-sm animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-status-danger/30 bg-status-danger/10">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-status-danger" />
          </div>
          <h2 className="mb-2 text-base sm:text-lg font-bold text-white">Could not load messages</h2>
          <p className="text-xs sm:text-sm leading-6 text-white/60 mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="bg-accent hover:bg-accent/90">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 custom-scrollbar"
      ref={scrollRef}
      onScroll={onScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
        {groupedMessages.map((item, index) => {
          if (item.type === 'separator') {
            return <DateSeparator key={`sep-${item.date?.toDateString() || index}`} date={item.date} />;
          }
          const message = item.message;
          const isOwnMessage = message.senderId === currentUserId;
          const prevMessage = messages[index - 1];
          const showAvatar = !isOwnMessage && (!prevMessage || prevMessage.senderId !== message.senderId);
          const isCompact = !isOwnMessage && prevMessage && prevMessage.senderId === message.senderId;
          return (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={isOwnMessage}
              currentUserId={currentUserId}
              canManageAnnouncements={canManageAnnouncements}
              onReply={onReply}
              onToggleReaction={onToggleReaction}
              onTogglePin={onTogglePin}
              onArchiveAnnouncement={onArchiveAnnouncement}
              onEdit={onEdit}
              onDelete={onDelete}
              onBookmark={onBookmark}
              onForward={onForward}
              onShare={onShare}
              onShowProfile={onShowProfile}
              onMediaOpen={onMediaOpen}
              onOpenThread={onOpenThread}
              onAIAction={onAIAction}
              showAvatar={showAvatar}
              compact={isCompact}
              reducedMotion={reducedMotion}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
      {isRefreshing && (
        <div className="flex justify-center py-2 animate-fade-in">
          <div className="relative">
            <RefreshCw className="h-5 w-5 animate-spin text-accent" />
            <div className="absolute inset-0 h-5 w-5 rounded-full bg-accent/20 animate-ping" />
          </div>
        </div>
      )}
      {showScrollBottom && onScrollToBottom && (
        <button
          type="button"
          onClick={onScrollToBottom}
          className="absolute bottom-4 right-4 z-20 p-3 rounded-full bg-gradient-to-r from-accent to-accent/80 text-black shadow-lg shadow-accent/30 active:scale-95 transition-all duration-200 hover:scale-110 hover:from-accent/90 hover:to-accent/70 hover:shadow-xl hover:shadow-accent/40"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}));
