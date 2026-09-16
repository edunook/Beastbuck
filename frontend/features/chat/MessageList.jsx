import { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle, memo } from 'react';
import { MessageCircle, Megaphone, ChevronDown, Inbox, Search } from 'lucide-react';
import { SkeletonChat } from '@frontend/components/ui/UIElements';
import { MessageItem, DateSeparator } from './MessageItem';

export const MessageList = memo(forwardRef(function MessageList({
  messages = [],
  loading = false,
  currentUserId,
  currentRoom,
  canManageAnnouncements = false,
  onReply,
  onToggleReaction,
  onTogglePin,
  onEdit,
  onDelete,
  onBookmark,
  onShare,
  onShowProfile,
  onMediaOpen,
  onReport,
  onOpenSharedContent,
  searchQuery = '',
  typingUsers = [],
}, ref) {
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Expose scrollRef methods
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
    scrollTo: (opts) => scrollRef.current?.scrollTo(opts),
  }));

  // Auto-scroll when new messages arrive if user is already at bottom
  useEffect(() => {
    if (!showScrollBottom && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, showScrollBottom]);

  const handleScroll = (e) => {
    const el = e.target;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 250);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // Filter messages by search query if active
  const displayedMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => 
      (m.text || '').toLowerCase().includes(q) ||
      (m.senderName || '').toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // Group messages with date separators
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;

    displayedMessages.forEach((message) => {
      const date = message.createdAt?.toDate ? message.createdAt.toDate() : (message.createdAt ? new Date(message.createdAt) : null);
      const dateKey = date ? date.toDateString() : 'unknown';
      
      if (dateKey !== lastDate && date) {
        groups.push({ type: 'separator', date, id: `sep-${dateKey}` });
        lastDate = dateKey;
      }
      groups.push({ type: 'message', message, id: message.id });
    });

    return groups;
  }, [displayedMessages]);

  const roomName = currentRoom?.name || currentRoom?.id || 'general';
  const isAnnouncement = currentRoom?.type === 'announcement' || currentRoom?.id === 'announcements';

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <SkeletonChat />
          <p className="text-xs text-white/40 animate-pulse">Loading channel messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
      
      {/* Scrollable Message Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-1 sm:px-3 py-4 space-y-1 custom-scrollbar"
      >
        {/* Channel Welcome Banner when few or no messages */}
        {displayedMessages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 shadow-xl shadow-indigo-500/10 text-indigo-400">
              {isAnnouncement ? <Megaphone className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
            </div>
            
            <h2 className="text-lg font-bold text-white mb-1">
              {searchQuery ? 'No matching messages' : `Welcome to #${roomName}!`}
            </h2>
            
            <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed">
              {searchQuery 
                ? `No messages matched "${searchQuery}". Try a different keyword.`
                : currentRoom?.description || `This is the start of the #${roomName} channel.`}
            </p>

            {!searchQuery && (
              <p className="text-[11px] text-indigo-400/80 mt-3 font-semibold">
                👋 Send a message below to start the conversation!
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Channel Top Header Marker */}
            <div className="px-4 pt-4 pb-6 text-left border-b border-white/5 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mb-2">
                {isAnnouncement ? <Megaphone className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Welcome to #{roomName}!</h2>
              <p className="text-xs text-white/50">{currentRoom?.description || 'Start of conversation.'}</p>
            </div>

            {/* Message Stream */}
            {groupedMessages.map((item) => {
              if (item.type === 'separator') {
                return <DateSeparator key={item.id} date={item.date} />;
              }

              const msg = item.message;
              const isOwn = msg.senderId === currentUserId;

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isOwnMessage={isOwn}
                  currentUserId={currentUserId}
                  canManageAnnouncements={canManageAnnouncements}
                  onReply={onReply}
                  onToggleReaction={onToggleReaction}
                  onTogglePin={onTogglePin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onBookmark={onBookmark}
                  onShare={onShare}
                  onShowProfile={onShowProfile}
                  onMediaOpen={onMediaOpen}
                  onReport={onReport}
                  onOpenSharedContent={onOpenSharedContent}
                />
              );
            })}
          </>
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-indigo-300 animate-fade-in">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="truncate">
              {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 transition active:scale-95 text-xs font-semibold animate-fade-in border border-indigo-400/40"
        >
          <span>Scroll to latest</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}

    </div>
  );
}));
