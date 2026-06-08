import { useEffect, useRef } from 'react';
import { MessageCircle, Megaphone } from 'lucide-react';
import { LoadingState } from '../../components/ui/UIElements';
import { MessageItem } from './MessageItem';

export function MessageList({
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
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <LoadingState text={`Loading #${roomName}...`} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white/5">
            {isAnnouncementRoom ? (
              <Megaphone className="h-8 w-8 text-text-muted" />
            ) : (
              <MessageCircle className="h-8 w-8 text-text-muted" />
            )}
          </div>
          <h2 className="mb-2 text-lg font-bold text-white">
            {isAnnouncementRoom ? 'No announcements yet' : 'No messages yet'}
          </h2>
          <p className="text-sm leading-6 text-text-muted">
            {isAnnouncementRoom
              ? 'Leadership announcements for BeastBuck will appear here.'
              : `Send the first message in #${roomName}.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 custom-scrollbar md:px-5">
      <div className="space-y-3">
        {messages.map(message => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUserId}
            currentUserId={currentUserId}
            canManageAnnouncements={canManageAnnouncements}
            onReply={onReply}
            onToggleReaction={onToggleReaction}
            onTogglePin={onTogglePin}
            onArchiveAnnouncement={onArchiveAnnouncement}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
