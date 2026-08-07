import { useState, useRef, useEffect, memo } from 'react';
import { 
  MoreVertical, MessageSquareReply, Pin, Trash2, Bookmark, BookmarkCheck, 
  Edit3, Check, X, Forward, Paperclip, Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORTED_REACTIONS } from '@services/firestore/chat';
import { RichCardRenderer } from './RichCardRenderer';

const AVATAR_EMOJIS = ['👩‍🔬', '👨‍💼', '👩‍💻', '👨‍🚀', '👩‍🏫', '🧪', '💡', '🎨', '🚀', '🔥', '⭐', '🌟', '💎', '🎯', '🏆', '🎪'];

function getAvatarEmoji(name = 'Member') {
  let hash = 0;
  for (let i = 0; i < (name || 'M').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

function formatTime(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return 'Just now';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDateSeparator(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return null;
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getReactionUsers(message, reactionKey) {
  return Array.isArray(message.reactions?.[reactionKey]) ? message.reactions[reactionKey] : [];
}

function renderTextWithMentions(text, mentions) {
  if (!text) return null;
  const parts = text.split(/(@[a-z0-9_]+)/gi);
  return parts.map((part, index) => {
    if (!/^@[a-z0-9_]+$/i.test(part)) return <span key={`${part}-${index}`}>{part}</span>;
    const username = part.slice(1).toLowerCase();
    const mention = mentions?.find(m => m.username?.toLowerCase() === username);
    const target = mention?.uid ? `/profile/${mention.uid}` : `/profile?username=${encodeURIComponent(username)}`;
    return (
      <Link key={`${part}-${index}`} to={target} className="font-semibold text-cyan-400 hover:underline">
        {part}
      </Link>
    );
  });
}

export const MessageItem = memo(function MessageItem({
  message,
  isOwnMessage,
  currentUserId,
  canManageAnnouncements = false,
  onReply,
  onToggleReaction,
  onTogglePin,
  onEdit,
  onDelete,
  onBookmark,
  onForward,
  onShare,
  onShowProfile,
  onMediaOpen,
  onOpenThread,
  onReport,
  showAvatar = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (editRef.current && !editRef.current.contains(e.target)) {
        setIsEditing(false);
      }
    }
    if (showMenu || isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, isEditing]);

  if (message.deleted || message.archived) return null;

  const avatar = getAvatarEmoji(message.senderName || message.senderId);
  const timeStr = formatTime(message.createdAt);
  const canEdit = isOwnMessage && !message.deleted && !message.forwarded;
  const canDelete = isOwnMessage || canManageAnnouncements;

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== message.text) {
      onEdit?.(message, editText.trim());
    }
    setIsEditing(false);
  };

  const activeReactions = SUPPORTED_REACTIONS.map(r => ({
    ...r,
    users: getReactionUsers(message, r.key)
  })).filter(r => r.users.length > 0);

  const renderFilePreview = () => {
    if (!message.file && !message.attachments?.length) return null;
    const files = message.file ? [message.file] : message.attachments;
    return files.map((file, idx) => {
      const isImage = file.type?.startsWith('image/');
      const isVideo = file.type?.startsWith('video/');
      if (isImage && file.url) {
        return (
          <button key={idx} onClick={() => onMediaOpen?.(file.url)} className="mt-2 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition block max-w-xs">
            <img src={file.url} alt={file.name || 'Attachment'} className="max-h-56 w-full object-cover rounded-xl" loading="lazy" />
          </button>
        );
      }
      if (isVideo && file.url) {
        return (
          <button key={idx} onClick={() => onMediaOpen?.(file.url)} className="mt-2 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition block max-w-xs">
            <video src={file.url} className="max-h-56 w-full object-cover rounded-xl" />
          </button>
        );
      }
      return (
        <div key={idx} className="mt-2 rounded-xl border border-white/10 bg-black/30 p-2.5 flex items-center gap-2 max-w-xs">
          <Paperclip className="h-4 w-4 text-white/60 shrink-0" />
          <span className="text-xs text-white truncate flex-1">{file.name}</span>
          <span className="text-[10px] text-white/40">{(file.size / 1024).toFixed(0)}KB</span>
        </div>
      );
    });
  };

  return (
    <article className={`relative flex items-end gap-2 my-2 px-1 sm:px-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar (for other members) */}
      {!isOwnMessage && showAvatar && (
        <button
          type="button"
          onClick={() => onShowProfile?.(message.senderId, message.senderName)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-white/15 text-sm transition hover:scale-105"
          aria-label={`Open ${message.senderName || 'Member'}'s profile`}
        >
          {avatar}
        </button>
      )}

      {/* Message Bubble Container */}
      <div className={`relative max-w-[85%] sm:max-w-[75%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        
        {/* Main Bubble */}
        <div 
          className={`relative rounded-2xl px-3.5 py-2.5 text-sm shadow-lg transition-all ${
            isOwnMessage 
              ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white rounded-br-xs shadow-indigo-950/50' 
              : 'bg-slate-900 border border-white/10 text-slate-100 rounded-bl-xs backdrop-blur-xl shadow-black/50'
          }`}
        >
          {/* Header Row: Name, Time & ALWAYS VISIBLE 3-Dots Button */}
          <div className="flex items-center justify-between gap-3 mb-1 text-[11px] font-medium leading-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <span 
                onClick={() => onShowProfile?.(message.senderId, message.senderName)}
                className={`font-semibold truncate cursor-pointer hover:underline ${isOwnMessage ? 'text-violet-200' : 'text-indigo-400'}`}
              >
                {isOwnMessage ? 'You' : (message.senderName || 'Member')}
              </span>
              <span className={isOwnMessage ? 'text-violet-300/70 text-[10px]' : 'text-slate-400 text-[10px]'}>
                {timeStr}
              </span>
              {message.pinned && <Pin className="h-2.5 w-2.5 text-amber-400 shrink-0" title="Pinned" />}
              {message.bookmarked && <BookmarkCheck className="h-2.5 w-2.5 text-cyan-400 shrink-0" title="Bookmarked" />}
            </div>

            {/* ALWAYS VISIBLE 3-Dots Menu Button inside Bubble Header */}
            <div className="relative shrink-0 ml-1" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu(prev => !prev)}
                className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/15 transition active:scale-95"
                aria-label="Message actions"
                title="Actions menu"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {/* Clean Options Popover Overlay */}
              {showMenu && (
                <div className={`absolute top-full mt-1 ${isOwnMessage ? 'right-0' : 'left-0'} w-48 rounded-xl border border-white/15 bg-slate-950 shadow-2xl z-[100] p-1.5 backdrop-blur-2xl animate-fade-in-up`}>
                  
                  {/* Quick Emoji Reaction Row */}
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-white/10">
                    {SUPPORTED_REACTIONS.slice(0, 5).map(r => {
                      const isUserActive = getReactionUsers(message, r.key).includes(currentUserId);
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => {
                            onToggleReaction?.(message, r.key, isUserActive);
                            setShowMenu(false);
                          }}
                          className="text-base hover:scale-125 transition active:scale-95 p-1 rounded hover:bg-white/10"
                          title={r.label}
                        >
                          {r.emoji}
                        </button>
                      );
                    })}
                  </div>

                  {/* Menu Items */}
                  <button
                    type="button"
                    onClick={() => { onReply?.(message); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                  >
                    <MessageSquareReply className="h-3.5 w-3.5 text-blue-400" />
                    <span>Reply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onOpenThread?.(message); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                  >
                    <MessageSquareReply className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Thread</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onBookmark?.(message); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                    <span>{message.bookmarked ? 'Unbookmark' : 'Bookmark'}</span>
                  </button>

                  {canManageAnnouncements && (
                    <button
                      type="button"
                      onClick={() => { onTogglePin?.(message); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <Pin className="h-3.5 w-3.5 text-yellow-400" />
                      <span>{message.pinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                  )}

                  {onForward && (
                    <button
                      type="button"
                      onClick={() => { onForward?.(message); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <Forward className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Forward</span>
                    </button>
                  )}

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => { onDelete?.(message); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  )}

                  {!isOwnMessage && onReport && (
                    <button
                      type="button"
                      onClick={() => { onReport?.(message); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Flag className="h-3.5 w-3.5 text-red-400" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reply Quote Block */}
          {message.replyTo && (
            <div className={`mb-2 rounded-lg border-l-2 px-2.5 py-1 text-xs ${isOwnMessage ? 'border-violet-300 bg-white/10 text-violet-100' : 'border-indigo-400 bg-black/40 text-slate-300'}`}>
              <div className="font-semibold text-[10px] text-white/70">
                Reply to {message.replyTo.senderName || 'Member'}
              </div>
              <p className="truncate text-white/80">{message.replyTo.text}</p>
            </div>
          )}

          {/* Editing Mode */}
          {isEditing ? (
            <div ref={editRef} className="flex items-center gap-2 mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 rounded-lg border border-white/30 bg-black/40 px-2.5 py-1 text-xs text-white outline-none"
                rows={1}
                autoFocus
              />
              <button onClick={handleEditSubmit} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded bg-white/10 text-white/60 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Message Text Content */}
              {message.text && (
                <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                  {renderTextWithMentions(message.text, message.mentions)}
                  {message.edited && <span className="text-[9px] opacity-60 ml-1">(edited)</span>}
                </p>
              )}

              {/* Shared Card Content */}
              {message.sharedContent && (
                <RichCardRenderer
                  content={message.sharedContent}
                  onOpen={onShare ? () => onShare(message) : undefined}
                  onShare={onShare ? () => onShare(message) : undefined}
                  onBookmark={onBookmark ? () => onBookmark(message) : undefined}
                  isBookmarked={message.bookmarked}
                />
              )}

              {/* Media & Attachments */}
              {renderFilePreview()}
            </>
          )}

          {/* Active Reactions Summary Badges (Only shown if reactions exist) */}
          {activeReactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
              {activeReactions.map(r => {
                const isUserActive = r.users.includes(currentUserId);
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => onToggleReaction?.(message, r.key, isUserActive)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                      isUserActive 
                        ? 'bg-indigo-500/30 border-indigo-400/50 text-white' 
                        : 'bg-black/30 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.users.length}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </article>
  );
});

export function DateSeparator({ date }) {
  const formatted = formatDateSeparator(date);
  if (!formatted) return null;
  return (
    <div className="flex items-center gap-3 py-2 px-4 my-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">{formatted}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}
