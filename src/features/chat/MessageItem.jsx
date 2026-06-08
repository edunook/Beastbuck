import { Archive, MessageSquareReply, Pin, PinOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORTED_REACTIONS } from '../../services/firebase/chat';

function formatTime(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return 'Sending...';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getReactionUsers(message, reactionKey) {
  return Array.isArray(message.reactions?.[reactionKey]) ? message.reactions[reactionKey] : [];
}

function getMentionTarget(text, mentions = []) {
  const username = text.slice(1).toLowerCase();
  const mention = mentions.find(item => item.username?.toLowerCase() === username);
  return mention?.uid ? `/profile/${mention.uid}` : `/profile?username=${encodeURIComponent(username)}`;
}

function renderTextWithMentions(text, mentions) {
  const parts = text.split(/(@[a-z0-9_]+)/gi);

  return parts.map((part, index) => {
    if (!/^@[a-z0-9_]+$/i.test(part)) return part;

    return (
      <Link
        key={`${part}-${index}`}
        to={getMentionTarget(part, mentions)}
        className="font-bold text-accent hover:underline"
      >
        {part}
      </Link>
    );
  });
}

export function MessageItem({
  message,
  isOwnMessage,
  currentUserId,
  canManageAnnouncements = false,
  onReply,
  onToggleReaction,
  onTogglePin,
  onArchiveAnnouncement,
}) {
  if (message.deleted || message.archived) {
    return null;
  }

  return (
    <article className={`group flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[min(82%,42rem)] rounded-2xl border px-4 py-3 ${
          isOwnMessage
            ? 'border-accent/25 bg-accent/10'
            : 'border-border bg-white/[0.04]'
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="max-w-[14rem] truncate text-sm font-bold text-white">
            {message.senderName || 'Member'}
          </span>
          {message.pinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-status-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-status-warning">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {message.senderRole || 'Member'}
          </span>
          <time className="text-[10px] font-medium text-text-muted">
            {formatTime(message.createdAt)}
          </time>
        </div>

        {message.replyTo && (
          <div className="mb-2 rounded-xl border-l-2 border-accent bg-black/20 px-3 py-2">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              Reply to {message.replyTo.senderName || 'Member'}
            </div>
            <p className="line-clamp-2 break-words text-xs leading-5 text-text-muted">
              {message.replyTo.text}
            </p>
          </div>
        )}

        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-text-soft">
          {renderTextWithMentions(message.text, message.mentions)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {SUPPORTED_REACTIONS.map(reaction => {
            const users = getReactionUsers(message, reaction.key);
            const count = users.length;
            const active = users.includes(currentUserId);

            return (
              <button
                key={reaction.key}
                type="button"
                title={reaction.label}
                aria-label={`${reaction.label} reaction`}
                onClick={() => onToggleReaction?.(message, reaction.key, active)}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-bold transition ${
                  active
                    ? 'border-accent/50 bg-accent/15 text-white'
                    : count > 0
                      ? 'border-border bg-white/5 text-text-soft hover:border-accent/40'
                      : 'border-transparent bg-transparent text-text-muted opacity-70 hover:border-border hover:bg-white/5 hover:opacity-100'
                }`}
              >
                <span>{reaction.emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onReply?.(message)}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-bold text-text-muted opacity-80 transition hover:border-border hover:bg-white/5 hover:text-white hover:opacity-100"
          >
            <MessageSquareReply className="h-3.5 w-3.5" />
            Reply
          </button>

          {message.announcement && canManageAnnouncements && (
            <>
              <button
                type="button"
                onClick={() => onTogglePin?.(message)}
                className="inline-flex min-h-8 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-bold text-text-muted opacity-80 transition hover:border-border hover:bg-white/5 hover:text-white hover:opacity-100"
              >
                {message.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                {message.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                type="button"
                onClick={() => onArchiveAnnouncement?.(message)}
                className="inline-flex min-h-8 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-bold text-text-muted opacity-80 transition hover:border-status-danger/30 hover:bg-status-danger/10 hover:text-status-danger hover:opacity-100"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
