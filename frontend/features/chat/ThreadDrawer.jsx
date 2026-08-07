import { useState, useEffect, useRef } from 'react';
import { X, MessageSquareReply, ChevronRight, ChevronLeft, Users, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';

function getAvatarEmoji(name = 'Member') {
  const emojis = ['👩‍🔬', '👨‍💼', '👩‍💻', '👨‍🚀', '👩‍🏫', '🧪', '💡', '🎨', '🚀', '🔥', '⭐', '🌟', '💎'];
  let hash = 0;
  for (let i = 0; i < (name || 'M').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return emojis[Math.abs(hash) % emojis.length];
}

export function ThreadDrawer({ message, onClose, onReply, currentUserId }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!message?.id) return;
    setLoading(true);
    const timer = setTimeout(() => {
      setReplies([
        {
          id: `${message.id}-reply-1`,
          senderId: 'user-1',
          senderName: 'Alex Chen',
          text: 'Thanks for the update! This is really helpful.',
          createdAt: new Date(Date.now() - 3600000),
          reactions: { thumbsUp: ['user-2', 'user-3'] },
        },
        {
          id: `${message.id}-reply-2`,
          senderId: 'user-2',
          senderName: 'Sarah Kim',
          text: 'I agree. Can we schedule a quick call to discuss further?',
          createdAt: new Date(Date.now() - 1800000),
          reactions: {},
        },
      ]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [message?.id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    const newReply = {
      id: `${message.id}-reply-${Date.now()}`,
      senderId: currentUserId || 'me',
      senderName: 'You',
      text: replyText.trim(),
      createdAt: new Date(),
      reactions: {},
    };
    setReplies(prev => [...prev, newReply]);
    setReplyText('');
    setSending(false);
    onReply?.(message, replyText.trim());
  };

  const replyCount = message?.replyCount || replies.length;
  const displayReplies = showAllReplies ? replies : replies.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={drawerRef}
        className="relative h-full w-full max-w-md border-l border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-2xl backdrop-blur-xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Thread"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Close thread"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-bold text-white">Thread</h3>
              <span className="text-xs text-white/50">{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95" aria-label="Close thread">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center text-lg border border-white/10">
                  {getAvatarEmoji(message.senderName)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{message.senderName}</p>
                  <p className="text-[10px] text-white/50">
                    {message.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">{message.text}</p>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                  <p className="text-xs text-white/50 animate-pulse">Loading replies...</p>
                </div>
              ) : (
                <>
                  {displayReplies.map(reply => (
                    <div
                      key={reply.id}
                      className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-white/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center text-xs border border-white/10">
                          {getAvatarEmoji(reply.senderName)}
                        </div>
                        <span className="text-xs font-bold text-white truncate">{reply.senderName}</span>
                        <span className="text-[10px] text-white/40">
                          {reply.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed ml-8">{reply.text}</p>
                    </div>
                  ))}
                  {!showAllReplies && replies.length > 3 && (
                    <button
                      onClick={() => setShowAllReplies(true)}
                      className="w-full py-2 text-xs font-bold text-accent hover:text-white transition-colors"
                    >
                      View all {replies.length} replies
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 p-3 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-xl">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Reply to thread..."
                  rows={1}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-all duration-200 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="rounded-xl bg-gradient-to-r from-accent to-accent/80 p-2.5 text-black transition-all duration-200 hover:from-accent/90 hover:to-accent/70 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30"
                aria-label="Send reply"
              >
                <MessageSquareReply className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
