import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SendHorizonal, X, Smile, Paperclip, FileText, Loader2, MessageSquareReply
} from 'lucide-react';
import Button from '@frontend/components/ui/Button';

const QUICK_EMOJIS = [
  '😀', '😂', '🥳', '🔥', '⭐', '💡', '🚀', '🎨',
  '💻', '🏆', '👏', '💪', '🤔', '👍', '❤️', '🎉',
  '✨', '💯', '🤝', '👀', '🧪', '⚡', '📚', '🌟',
  '🙌', '😎', '💎', '🎯', '🔥', '🙏', '🍕', '☕'
];

function getUsername(member) {
  return member.username || member.displayName || '';
}

function getMentionQuery(text) {
  const match = text.match(/(^|\s)@([a-z0-9_]*)$/i);
  return match ? match[2].toLowerCase() : null;
}

function getMentionsFromText(text, members) {
  const usernames = new Set(
    [...text.matchAll(/@([a-z0-9_]+)/gi)].map(match => match[1].toLowerCase())
  );
  return members
    .filter(member => usernames.has(getUsername(member).toLowerCase()))
    .map(member => ({
      uid: member.id,
      username: getUsername(member).toLowerCase(),
    }));
}

// Client-side image compression to Base64 data URL for instant realtime distribution
async function fileToDataUrl(file) {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  } else {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}

export function MessageInput({
  disabled = false,
  readOnlyReason = '',
  placeholder = 'Message community...',
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  members = [],
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const mentionQuery = getMentionQuery(text);
  const mentionOptions = mentionQuery === null
    ? []
    : members
        .filter(member => getUsername(member).toLowerCase().includes(mentionQuery))
        .slice(0, 6);

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Typing indicator trigger
  useEffect(() => {
    if (!onTyping) return;
    if (text.length > 0 || attachments.length > 0) {
      onTyping(true);
    }
    const debounceTimer = setTimeout(() => onTyping(false), 2000);
    return () => clearTimeout(debounceTimer);
  }, [text, attachments.length, onTyping]);

  const handleEmojiClick = useCallback((emoji) => {
    setText(current => current + emoji);
    textareaRef.current?.focus();
  }, [setText]);

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    try {
      const processed = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: dataUrl,
          };
        })
      );
      setAttachments(prev => [...prev, ...processed]);
    } catch (err) {
      console.error('File processing error:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText && attachments.length === 0) return;
    if (disabled || readOnlyReason || sending || isCompressing) return;

    setSending(true);
    setShowEmojiPicker(false);
    try {
      await onSend(cleanText, getMentionsFromText(cleanText, members), attachments);
      setText('');
      setAttachments([]);
    } finally {
      setSending(false);
    }
  };

  const insertMention = (member) => {
    const username = getUsername(member).toLowerCase();
    setText(current => current.replace(/(^|\s)@([a-z0-9_]*)$/i, `@${username} `));
    textareaRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="shrink-0 w-full border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-3 sm:px-5 py-2.5 sm:py-3 z-20 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
      
      {/* Reply Preview Banner */}
      {replyTo && (
        <div className="mb-2 flex items-center justify-between gap-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 animate-fade-in">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <MessageSquareReply className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs text-indigo-300 font-semibold truncate">
              Replying to <span className="text-white">{replyTo.senderName || 'Member'}</span>:
            </span>
            <span className="text-xs text-white/60 truncate">{replyTo.text}</span>
          </div>
          <button 
            type="button" 
            onClick={onCancelReply} 
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
            aria-label="Cancel reply"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachments Preview Grid */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 animate-fade-in max-h-28 overflow-y-auto custom-scrollbar">
          {attachments.map(att => (
            <div key={att.id} className="relative group flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-1.5 pr-2.5 shadow-md backdrop-blur-md">
              {att.type?.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <FileText className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 max-w-[100px] sm:max-w-[160px]">
                <p className="text-xs font-semibold text-white truncate">{att.name}</p>
                <p className="text-[9px] text-white/50">{(att.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-1 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-red-600 transition"
                aria-label="Remove attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mentions Auto-Suggest Dropdown */}
      {mentionOptions.length > 0 && (
        <div className="mb-2 max-h-40 overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/98 shadow-2xl p-1.5 custom-scrollbar animate-fade-in backdrop-blur-2xl">
          {mentionOptions.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => insertMention(member)}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs text-white hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                  {(member.displayName || member.username || 'M')[0]?.toUpperCase()}
                </div>
                <span className="font-semibold truncate">@{getUsername(member).toLowerCase()}</span>
              </div>
              <span className="text-[10px] text-white/40 uppercase">{member.role || 'Member'}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-1.5 sm:gap-2">
          
          <div className="flex items-center gap-0.5 pb-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(s => !s)}
                className={`h-9 w-9 flex items-center justify-center rounded-xl border transition ${
                  showEmojiPicker
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Insert emoji"
                title="Emojis"
              >
                <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-20px)] rounded-2xl border border-white/15 bg-slate-950/98 shadow-2xl p-3 z-50 animate-fade-in backdrop-blur-2xl"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Quick Emojis</div>
                  <div className="grid grid-cols-8 gap-1">
                    {QUICK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-sm sm:text-base hover:bg-white/15 hover:scale-125 transition active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition border border-transparent"
              aria-label="Attach photo or file"
              title="Attach Image or File"
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
            />
          </div>

          <div className="flex-1 relative">
            <textarea
              id="global-chat-message"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit(e);
                }
              }}
              placeholder={readOnlyReason || placeholder}
              rows={1}
              maxLength={4000}
              disabled={disabled || !!readOnlyReason || sending || isCompressing}
              className="w-full min-h-[42px] max-h-32 resize-none rounded-xl border border-white/15 bg-white/[0.07] px-3 sm:px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10 focus:ring-2 focus:ring-cyan-400/15 disabled:opacity-50"
            />
          </div>

          <div className="pb-1">
            <Button
              type="submit"
              disabled={disabled || !!readOnlyReason || sending || isCompressing || (!text.trim() && attachments.length === 0)}
              className="h-[42px] w-[42px] sm:w-auto sm:px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none text-slate-950 shadow-lg shadow-cyan-950/30 transition active:scale-95 border border-cyan-200/30"
              aria-label="Send message"
            >
              {sending || isCompressing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

    </form>
  );
}
