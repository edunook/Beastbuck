import { useState, useEffect, useRef, useCallback } from 'react';
import { SendHorizonal, X, Smile, Paperclip, Mic, Image, FileText, Film, Music, Archive, Forward, Bookmark, Search, Phone, Video, Wand2, Loader2, GripVertical, MessageSquareReply } from 'lucide-react';
import Button from '@frontend/components/ui/Button';

const QUICK_EMOJIS = [
  '😀', '😂', '🥳', '🔥', '⭐', '💡', '🚀', '🎨',
  '🎵', '🏆', '👏', '💪', '🤔', '👍', '❤️', '🎉',
  '✨', '💯', '🤝', '👀', '🧪', '💻', '📚', '🌟',
];

const SMART_REPLIES = [
  "Sounds great! 👍",
  "Let me look into that.",
  "Thanks for sharing!",
  "I'll get back to you soon.",
  "Awesome work! 🎉",
  "Let's discuss this further.",
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

async function compressFile(file) {
  if (!file.type.startsWith('image/')) return file;
  const maxDim = 1280;
  const quality = 0.82;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await createImageBitmap(file), 0, 0, width, height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

export function MessageInput({
  disabled,
  readOnlyReason,
  placeholder = 'Message chat...',
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  members = [],
  onFileSelect,
  onVoiceRecord,
  smartReplies = SMART_REPLIES,
  showSmartReplies = true,
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showSmartRepliesPanel, setShowSmartRepliesPanel] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const mentionQuery = getMentionQuery(text);
  const mentionOptions = mentionQuery === null
    ? []
    : members
        .filter(member => getUsername(member).toLowerCase().includes(mentionQuery))
        .slice(0, 6);

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (!e.target.closest('.file-menu')) {
        setShowFileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const processed = await Promise.all(files.map(compressFile));
    const newAttachments = processed.map((file, i) => ({
      id: Date.now() + Math.random() + i,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    setShowFileMenu(false);
    onFileSelect?.(processed);
  }, [onFileSelect, setAttachments, setShowFileMenu]);

  const removeAttachment = useCallback((id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleSmartReply = useCallback((reply) => {
    setText(reply);
    setShowSmartRepliesPanel(false);
    textareaRef.current?.focus();
  }, [setShowSmartRepliesPanel, setText]);

  const submit = async (event) => {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText && attachments.length === 0) return;
    if (disabled || readOnlyReason || sending) return;

    setSending(true);
    setShowEmojiPicker(false);
    setShowFileMenu(false);
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
  };

  const handleVoiceRecord = () => {
    onVoiceRecord?.();
  };

  return (
    <form onSubmit={submit} className="shrink-0 w-full border-t border-white/10 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl shadow-2xl z-10">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-accent/40 bg-gradient-to-r from-accent/20 via-accent/15 to-accent/5 px-3 py-2.5 animate-fade-in-up shadow-xl shadow-accent/30 backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
              <MessageSquareReply className="h-3 w-3" />
              Replying to {replyTo.senderName || 'Member'}
            </div>
            <p className="line-clamp-2 break-words text-xs leading-5 text-white/90">{replyTo.text}</p>
          </div>
          <button type="button" onClick={onCancelReply} className="rounded-lg p-1 text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95" aria-label="Cancel reply">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mx-4 mt-3 flex flex-wrap gap-2 animate-fade-in-up">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2 rounded-xl border border-white/15 bg-gradient-to-br from-white/15 via-white/10 to-white/5 px-3 py-2 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 backdrop-blur-xl">
              {att.type.startsWith('image/') ? <Image className="h-4 w-4 text-accent" /> : 
               att.type.startsWith('video/') ? <Film className="h-4 w-4 text-pink-400" /> :
               att.type.startsWith('audio/') ? <Music className="h-4 w-4 text-purple-400" /> :
               <FileText className="h-4 w-4 text-blue-400" />}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[180px]">{att.name}</p>
                <p className="text-[9px] text-white/50">{(att.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={() => removeAttachment(att.id)} className="text-white/50 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95" aria-label="Remove attachment">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mentions Dropdown */}
      {mentionOptions.length > 0 && (
        <div className="mx-4 mb-2.5 max-h-48 overflow-y-auto rounded-xl border border-white/15 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl p-2 shadow-2xl custom-scrollbar animate-fade-in-up">
          {mentionOptions.map(member => (
            <button key={member.id} type="button" onClick={() => insertMention(member)} className="flex w-full items-center justify-between gap-2 sm:gap-3 rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5 text-left transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-white/10">
              <span className="min-w-0">
                <span className="block truncate text-xs sm:text-sm font-bold text-white">@{getUsername(member).toLowerCase()}</span>
                <span className="block truncate text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50">{member.role}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-accent font-bold">Mention</span>
            </button>
          ))}
        </div>
      )}

      {/* Smart Replies */}
      {showSmartRepliesPanel && smartReplies.length > 0 && (
        <div className="mx-4 mb-2.5 flex flex-wrap gap-2 animate-fade-in-up">
          {smartReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSmartReply(reply)}
              className="rounded-full border border-white/15 bg-gradient-to-r from-white/15 via-white/10 to-white/5 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white/80 transition-all duration-200 hover:border-accent/50 hover:from-accent/25 hover:to-accent/15 hover:text-white hover:scale-105 hover:shadow-xl hover:shadow-accent/30 active:scale-95 backdrop-blur-xl"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative flex items-end gap-1 sm:gap-2 p-1.5 sm:p-2.5 md:p-3">
        <div className="flex items-center gap-0.5">
          {/* Emoji Picker */}
          <div className="relative">
            <button type="button" onClick={() => setShowEmojiPicker(s => !s)} className="rounded-xl p-1.5 sm:p-2 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 border border-transparent" aria-label="Open emoji picker">
              <Smile className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 w-[300px] max-w-[90vw] rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl p-3 z-50 animate-fade-in-up shadow-2xl">
                <div className="grid grid-cols-8 gap-1.5">
                  {QUICK_EMOJIS.map(emoji => (
                    <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all duration-200 hover:scale-125 hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 active:scale-95 border border-transparent hover:border-white/10">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* File Menu */}
          <div className="relative file-menu">
            <button type="button" onClick={() => setShowFileMenu(s => !s)} className="rounded-xl p-1.5 sm:p-2 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 border border-transparent" aria-label="Attach file">
              <Paperclip className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
            {showFileMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-52 rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                <button type="button" onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-white/10">
                  <FileText className="h-3.5 w-3.5 text-white/60" />
                  <span>Document / File</span>
                </button>
                <button type="button" onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-white/10">
                  <Image className="h-3.5 w-3.5 text-white/60" />
                  <span>Image / Video</span>
                </button>
                <button type="button" onClick={handleVoiceRecord} className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-white/10">
                  <Mic className="h-3.5 w-3.5 text-white/60" />
                  <span>Voice Message</span>
                </button>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.csv,.json,.md,.txt,.js,.py,.java,.cpp,.c,.h" />
          
          {/* Smart Replies Toggle */}
          <button type="button" onClick={() => setShowSmartRepliesPanel(s => !s)} className={`rounded-xl p-1.5 sm:p-2 transition-all duration-200 hover:scale-110 active:scale-95 border ${showSmartRepliesPanel ? 'bg-gradient-to-br from-accent/25 to-accent/15 text-accent shadow-xl shadow-accent/30 border-accent/40' : 'text-white/60 hover:bg-white/10 hover:text-white border-transparent'}`} aria-label="Smart replies">
            <Wand2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        </div>

        {/* Text Input */}
        <label className="sr-only" htmlFor="global-chat-message">Message</label>
         <textarea
           id="global-chat-message"
           value={text}
           onChange={(event) => setText(event.target.value)}
           onKeyDown={(event) => {
             if (event.key === 'Enter' && !event.shiftKey) {
               event.preventDefault();
               event.currentTarget.form?.requestSubmit();
             }
           }}
           placeholder={readOnlyReason || placeholder}
           rows={1}
           maxLength={4000}
           disabled={disabled || !!readOnlyReason || sending}
           className="min-h-[38px] sm:min-h-[44px] max-h-28 flex-1 resize-none rounded-xl border border-white/15 bg-gradient-to-br from-white/15 via-white/10 to-white/5 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-xl hover:border-white/20"
         />
        
        {/* Send / Voice Button */}
        {(text.trim() || attachments.length > 0) ? (
          <Button 
            type="submit" 
            size="md" 
            disabled={disabled || !!readOnlyReason || sending} 
            className="h-8 sm:h-10 shrink-0 px-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all duration-200 disabled:opacity-50 border border-indigo-400/40"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <SendHorizonal className="h-4 w-4 text-white" />}
          </Button>
        ) : (
          <button 
            type="button" 
            onClick={handleVoiceRecord} 
            className="h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center shrink-0 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition active:scale-95" 
            aria-label="Record voice note"
            title="Voice note"
          >
            <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>
      
      {/* Footer (hidden on small screens unless attachments exist) */}
      {attachments.length > 0 && (
        <div className="mx-3 mb-1.5 flex items-center justify-between text-[9px] sm:text-[10px] text-white/40">
          <span className="font-medium">{text.length}/4000</span>
          <span className="font-medium">{attachments.length} file{attachments.length !== 1 ? 's' : ''} attached</span>
        </div>
      )}
    </form>
  );
}
