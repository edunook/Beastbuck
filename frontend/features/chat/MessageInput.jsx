import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SendHorizonal, X, Smile, Paperclip, Mic, Image as ImageIcon, 
  FileText, Film, Radio, Trash2, Loader2, MessageSquareReply, Gamepad2
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
  onShowGames,
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioStreamRef = useRef(null);

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

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleEmojiClick = useCallback((emoji) => {
    setText(current => current + emoji);
    textareaRef.current?.focus();
  }, []);

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

  // Start Voice Recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Microphone access is needed to record voice notes. Please grant microphone permissions in your browser.');
    }
  };

  // Stop & Send Voice Recording
  const stopVoiceRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    clearInterval(recordingTimerRef.current);
    const recorder = mediaRecorderRef.current;
    
    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const audioDataUrl = reader.result;
        const voiceAttachment = {
          id: Date.now(),
          name: `Voice Note (${formatSeconds(recordingDuration)})`,
          size: audioBlob.size,
          type: 'audio/webm',
          url: audioDataUrl,
          isVoiceNote: true,
        };

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }

        setIsRecording(false);
        setRecordingDuration(0);

        setSending(true);
        try {
          await onSend('', [], [voiceAttachment]);
        } finally {
          setSending(false);
        }
      };

      reader.readAsDataURL(audioBlob);
    };

    recorder.stop();
  };

  // Cancel Voice Recording
  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isRecording) {
      stopVoiceRecording();
      return;
    }
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

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <form onSubmit={submit} className="shrink-0 w-full border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-3 sm:px-4 py-2.5 sm:py-3 z-20">
      
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
        <div className="mb-2 flex flex-wrap gap-2 animate-fade-in">
          {attachments.map(att => (
            <div key={att.id} className="relative group flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-1.5 pr-3 shadow-md backdrop-blur-md">
              {att.type?.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <FileText className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 max-w-[120px] sm:max-w-[180px]">
                <p className="text-xs font-semibold text-white truncate">{att.name}</p>
                <p className="text-[10px] text-white/50">{(att.size / 1024).toFixed(0)} KB</p>
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
        <div className="mb-2 max-h-40 overflow-y-auto rounded-xl border border-white/15 bg-slate-900 shadow-2xl p-1.5 custom-scrollbar animate-fade-in">
          {mentionOptions.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => insertMention(member)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-white hover:bg-white/10 transition"
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

      {/* Live Voice Recording UI Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-red-950/50 border border-red-500/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white animate-pulse">
              <Radio className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-400">Recording Voice Note</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">{formatSeconds(recordingDuration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition text-xs font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={stopVoiceRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-red-600/30 hover:scale-105 transition"
            >
              <SendHorizonal className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standard Message Input Container */
        <div className="relative flex items-end gap-1.5 sm:gap-2">
          
          {/* Action Buttons: Emoji & Attachment */}
          <div className="flex items-center gap-0.5 pb-1">
            {/* Emoji Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(s => !s)}
                className={`p-2 rounded-xl border transition ${
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
                  className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-white/15 bg-slate-950 shadow-2xl p-3 z-50 animate-fade-in"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Quick Emojis</div>
                  <div className="grid grid-cols-8 gap-1">
                    {QUICK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base hover:bg-white/15 hover:scale-125 transition active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File & Photo Attachment Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition border border-transparent"
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
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
            />

            {/* Games Quick Launcher */}
            {onShowGames && (
              <button
                type="button"
                onClick={onShowGames}
                className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 transition border border-transparent"
                aria-label="Start multiplayer game"
                title="Play Multiplayer Games"
              >
                <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>

          {/* Text Area */}
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
              className="w-full min-h-[42px] max-h-32 resize-none rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:border-indigo-500/70 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>

          {/* Send or Voice Note Button */}
          <div className="pb-1">
            {text.trim() || attachments.length > 0 ? (
              <Button
                type="submit"
                disabled={disabled || !!readOnlyReason || sending || isCompressing}
                className="h-[42px] px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-95 border border-indigo-400/30"
                aria-label="Send message"
              >
                {sending || isCompressing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <SendHorizonal className="h-4 w-4 text-white" />
                )}
              </Button>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="h-[42px] w-[42px] flex items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition active:scale-95"
                aria-label="Record voice note"
                title="Hold or Click to Record Voice Note"
              >
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>
      )}

    </form>
  );
}
