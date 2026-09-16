import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical, MessageSquareReply, Pin, Trash2, Bookmark, BookmarkCheck,
  Edit3, Check, X, Paperclip, Flag, Play, Pause, Volume2, Smile
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORTED_REACTIONS } from '@services/firestore/chat';
import { RichCardRenderer } from './RichCardRenderer';

export function MemberAvatar({ photoURL, name = 'Member', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n) => {
    if (!n) return 'M';
    const clean = n.replace(/^@/, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'M';
  };

  const sizeClasses = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-20 w-20 text-2xl font-black',
  };

  const baseSize = sizeClasses[size] || sizeClasses.md;

  if (photoURL && !imgError) {
    return (
      <div className={`relative shrink-0 rounded-full overflow-hidden bg-slate-800 border border-white/15 shadow-md flex items-center justify-center ${baseSize} ${className}`}>
        <img
          src={photoURL}
          alt={name}
          className="h-full w-full object-cover rounded-full"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  const initials = getInitials(name);
  return (
    <div className={`relative shrink-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 border border-white/15 text-white font-bold flex items-center justify-center shadow-md select-none ${baseSize} ${className}`}>
      {initials}
    </div>
  );
}

function formatTime(createdAt) {
  const date = createdAt?.toDate ? createdAt.toDate() : (createdAt ? new Date(createdAt) : null);
  if (!date || isNaN(date.getTime())) return 'Just now';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDateSeparator(createdAt) {
  const date = createdAt?.toDate ? createdAt.toDate() : (createdAt ? new Date(createdAt) : null);
  if (!date || isNaN(date.getTime())) return null;
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
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
      <Link key={`${part}-${index}`} to={target} className="font-semibold text-cyan-300 hover:underline">
        {part}
      </Link>
    );
  });
}

function AudioVoicePlayer({ src, name, isOwnMessage }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.warn('Audio play error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatSeconds = (s) => {
    if (!s || isNaN(s) || s === Infinity) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const waveformBars = [40, 75, 55, 90, 65, 80, 45, 100, 70, 50, 85, 60, 75, 55, 70, 40];

  return (
    <div className={`mt-2 flex items-center gap-2.5 rounded-2xl p-2.5 sm:p-3 border backdrop-blur-xl max-w-xs transition ${
      isOwnMessage 
        ? 'bg-white/15 border-white/20 text-white shadow-md' 
        : 'bg-black/40 border-white/10 text-white shadow-sm'
    }`}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata} 
        onEnded={handleEnded} 
        preload="metadata"
      />
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md transition hover:scale-105 active:scale-95"
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 h-4 mb-1">
          {waveformBars.map((h, i) => {
            const progress = duration > 0 ? (currentTime / duration) * waveformBars.length : 0;
            const isActive = i <= progress;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isActive ? 'bg-cyan-400' : 'bg-white/30'
                } ${isPlaying && isActive ? 'animate-pulse' : ''}`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/60">
          <span>{isPlaying ? formatSeconds(currentTime) : (formatSeconds(duration) || name || 'Voice Note')}</span>
          <span className="flex items-center gap-1">
            <Volume2 className="h-2.5 w-2.5 opacity-60" />
            Voice Note
          </span>
        </div>
      </div>
    </div>
  );
}

export const MessageItem = memo(function MessageItem({
  message,
  member,
  membersMap,
  isOwnMessage,
  currentUserId,
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
  showAvatar = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) && !menuButtonRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
      if (editRef.current && !editRef.current.contains(e.target)) {
        setIsEditing(false);
      }
    }
    if (showMenu || isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showMenu, isEditing]);

  const handleMenuToggle = (e) => {
    e?.stopPropagation();
    if (!showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const menuWidth = 196;
      let left = isOwnMessage ? rect.right - menuWidth : rect.left;
      left = Math.max(12, Math.min(window.innerWidth - menuWidth - 12, left));
      let top = rect.bottom + 6;
      if (top + 260 > window.innerHeight) {
        top = Math.max(60, rect.top - 260);
      }
      setMenuPosition({ top, left });
    }
    setShowMenu(prev => !prev);
  };

  if (message.deleted || message.archived) return null;

  const senderMember = member || membersMap?.get(message.senderId);
  const senderPhoto = message.senderPhoto || message.senderPhotoURL || message.photoURL || senderMember?.photoURL || senderMember?.avatar;
  const senderDisplayName = message.senderName || senderMember?.displayName || senderMember?.username || 'Member';
  const timeStr = formatTime(message.createdAt);
  const canEdit = isOwnMessage && !message.deleted;
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

  const renderAttachments = () => {
    const files = message.attachments || (message.file ? [message.file] : []);
    if (!files.length) return null;

    return files.map((file, idx) => {
      const isImage = file.type?.startsWith('image/');
      const isVoice = file.isVoiceNote || file.type?.startsWith('audio/');
      const isVideo = file.type?.startsWith('video/');

      if (isImage && file.url) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onMediaOpen?.(file.url)}
            className="mt-2 rounded-xl overflow-hidden border border-white/10 hover:border-indigo-400/50 transition block max-w-sm group shadow-md"
          >
            <img
              src={file.url}
              alt={file.name || 'Image'}
              className="max-h-64 w-full object-cover rounded-xl group-hover:scale-[1.01] transition duration-200"
              loading="lazy"
            />
          </button>
        );
      }

      if (isVideo && file.url) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onMediaOpen?.(file.url)}
            className="mt-2 rounded-xl overflow-hidden border border-white/10 hover:border-indigo-400/50 transition block max-w-sm shadow-md"
          >
            <video src={file.url} className="max-h-60 w-full object-cover rounded-xl" />
          </button>
        );
      }

      if (isVoice && file.url) {
        return (
          <AudioVoicePlayer
            key={idx}
            src={file.url}
            name={file.name}
            isOwnMessage={isOwnMessage}
          />
        );
      }

      return (
        <div key={idx} className="mt-2 rounded-xl border border-white/10 bg-black/40 p-2.5 flex items-center gap-2 max-w-xs shadow-sm">
          <Paperclip className="h-4 w-4 text-white/60 shrink-0" />
          <span className="text-xs text-white truncate flex-1">{file.name}</span>
          <span className="text-[10px] text-white/40">{(file.size / 1024).toFixed(0)}KB</span>
        </div>
      );
    });
  };

  return (
    <article className={`relative group/msg flex items-end gap-2 my-1.5 px-2 sm:px-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Real Avatar */}
      {!isOwnMessage && showAvatar && (
        <button
          type="button"
          onClick={() => onShowProfile?.(message.senderId, senderDisplayName)}
          className="shrink-0 transition hover:scale-105 active:scale-95"
          aria-label={`Open ${senderDisplayName}'s profile`}
          title={senderDisplayName}
        >
          <MemberAvatar 
            photoURL={senderPhoto} 
            name={senderDisplayName} 
            size="md" 
          />
        </button>
      )}

      {/* Message Bubble Container */}
      <div className={`relative max-w-[88%] sm:max-w-[75%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        
        {/* Main Message Bubble */}
        <div 
          className={`relative rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-md transition-all ${
            isOwnMessage 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs shadow-indigo-950/40' 
              : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-xs backdrop-blur-xl hover:border-white/15'
          }`}
        >
          {/* Header Row: Sender Name, Role Badge, Time & Menu Trigger */}
          <div className="flex items-center justify-between gap-3 mb-1 text-[11px] leading-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <span 
                onClick={() => onShowProfile?.(message.senderId, senderDisplayName)}
                className={`font-bold truncate cursor-pointer hover:underline ${
                  isOwnMessage ? 'text-indigo-200' : 'text-indigo-400'
                }`}
              >
                {isOwnMessage ? 'You' : senderDisplayName}
              </span>
              
              {message.senderRole && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  message.senderRole === 'Admin' || message.senderRole === 'Leader'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : isOwnMessage
                      ? 'bg-white/15 text-white/80'
                      : 'bg-white/10 text-white/50'
                }`}>
                  {message.senderRole}
                </span>
              )}

              <span className={isOwnMessage ? 'text-white/60 text-[10px]' : 'text-white/40 text-[10px]'}>
                {timeStr}
              </span>

              {message.pinned && <Pin className="h-3 w-3 text-amber-400 shrink-0" title="Pinned message" />}
              {message.bookmarked && <BookmarkCheck className="h-3 w-3 text-cyan-400 shrink-0" title="Bookmarked" />}
            </div>

            {/* 3-Dots Action Button */}
            <button
              type="button"
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/15 transition active:scale-95 ml-1"
              aria-label="Message options"
              title="Actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reply Quote Preview */}
          {message.replyTo && (
            <div className={`mb-2 rounded-lg border-l-2 px-2.5 py-1 text-xs ${
              isOwnMessage 
                ? 'border-indigo-300 bg-white/10 text-indigo-100' 
                : 'border-indigo-400 bg-black/40 text-slate-300'
            }`}>
              <div className="font-semibold text-[10px] text-white/70">
                Replying to {message.replyTo.senderName || 'Member'}
              </div>
              <p className="truncate text-white/80">{message.replyTo.text}</p>
            </div>
          )}

          {/* Message Text Content or Inline Editor */}
          {isEditing ? (
            <div ref={editRef} className="flex items-center gap-1.5 mt-1">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSubmit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="flex-1 rounded-lg border border-white/30 bg-black/50 px-2 py-1 text-xs text-white outline-none focus:border-indigo-400"
                autoFocus
              />
              <button 
                onClick={handleEditSubmit} 
                className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                title="Save edit"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-1 rounded bg-white/10 text-white/60 hover:text-white transition"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              {message.text && (
                <p className="whitespace-pre-wrap break-words leading-relaxed text-xs sm:text-sm">
                  {renderTextWithMentions(message.text, message.mentions)}
                  {message.edited && <span className="text-[9px] opacity-60 ml-1.5 italic">(edited)</span>}
                </p>
              )}

              {/* Shared Card Content */}
              {message.sharedContent && (
                <RichCardRenderer
                  content={message.sharedContent}
                  onOpen={onOpenSharedContent ? () => onOpenSharedContent(message.sharedContent) : undefined}
                  onShare={onShare ? () => onShare(message) : undefined}
                  onBookmark={onBookmark ? () => onBookmark(message) : undefined}
                  isBookmarked={message.bookmarked}
                />
              )}

              {/* Attachments / Photos / Voice Notes */}
              {renderAttachments()}
            </>
          )}

          {/* Active Reaction Badges */}
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

      {/* Floating Context Menu Portal */}
      {showMenu &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-48 rounded-2xl border border-white/15 bg-slate-950 shadow-2xl p-1.5 backdrop-blur-2xl animate-fade-in"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
          >
            {/* Quick Emoji Reaction Bar */}
            <div className="flex items-center justify-between px-1.5 py-1 mb-1 border-b border-white/10">
              {SUPPORTED_REACTIONS.map(r => {
                const isUserActive = getReactionUsers(message, r.key).includes(currentUserId);
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      onToggleReaction?.(message, r.key, isUserActive);
                      setShowMenu(false);
                    }}
                    className="text-base hover:scale-125 transition active:scale-95 p-1 rounded-lg hover:bg-white/10"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                );
              })}
            </div>

            {/* Menu Actions */}
            <button
              type="button"
              onClick={() => { onReply?.(message); setShowMenu(false); }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <MessageSquareReply className="h-3.5 w-3.5 text-indigo-400" />
              <span>Reply</span>
            </button>

            <button
              type="button"
              onClick={() => { onBookmark?.(message); setShowMenu(false); }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
              <span>{message.bookmarked ? 'Unbookmark' : 'Bookmark'}</span>
            </button>

            {canManageAnnouncements && (
              <button
                type="button"
                onClick={() => { onTogglePin?.(message); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Pin className="h-3.5 w-3.5 text-amber-400" />
                <span>{message.pinned ? 'Unpin' : 'Pin to Top'}</span>
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => { onDelete?.(message); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            )}

            {!isOwnMessage && onReport && (
              <button
                type="button"
                onClick={() => { onReport?.(message); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
              >
                <Flag className="h-3.5 w-3.5 text-amber-400" />
                <span>Report</span>
              </button>
            )}
          </div>,
          document.body
        )
      }

    </article>
  );
});

export function DateSeparator({ date }) {
  const formatted = formatDateSeparator(date);
  if (!formatted) return null;
  return (
    <div className="flex items-center gap-3 py-3 px-4 my-1 select-none">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-slate-900/90 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
        {formatted}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}
