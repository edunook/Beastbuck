import { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Users, Volume2, VolumeX, ChevronDown, ChevronUp, Radio, Signal, Sparkles } from 'lucide-react';

const PRESENCE_COLORS = {
  online: '#10b981',
  busy: '#f59e0b',
  away: '#eab308',
  offline: '#6b7280',
  'in-meeting': '#a855f7',
  coding: '#3b82f6',
  researching: '#06b6d4',
  recording: '#ef4444',
  dnd: '#dc2626',
};

export function VoiceRoomBar({ 
  participants = {}, 
  isMuted, 
  onToggleMute, 
  onLeave,
  currentUserId 
}) {
  const [expanded, setExpanded] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());

  const participantCount = Object.keys(participants).length;
  const entries = Object.entries(participants);

  useEffect(() => {
    if (!expanded || participantCount === 0) return;
    const intervals = entries.map(([uid]) => {
      return setInterval(() => {
        setSpeakingUsers(prev => {
          const next = new Set(prev);
          if (Math.random() > 0.7) next.add(uid);
          else next.delete(uid);
          return next;
        });
      }, 800 + Math.random() * 1200);
    });
    return () => intervals.forEach(clearInterval);
  }, [expanded, entries.length]);

  return (
    <div className="border-t border-white/15 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl animate-fade-in-up shadow-2xl shadow-black/50">
      {/* Main Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent/25 via-accent/15 to-purple-500/15 border border-accent/40 flex items-center justify-center shadow-xl shadow-accent/30 backdrop-blur-xl">
              <Radio className="h-6 w-6 text-accent" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-status-success border-2 border-slate-900 animate-pulse shadow-lg shadow-status-success/50" />
            <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-accent animate-ping opacity-50" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-white">Voice Room</p>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30">
                <Signal className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-bold text-accent">LIVE</span>
              </div>
            </div>
            <p className="text-[10px] text-white/60">
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
              {isMuted && ' · Muted'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-2xl border transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg ${
              isMuted 
                ? 'bg-gradient-to-br from-red-500/25 to-red-500/15 border-red-500/40 text-red-400 hover:from-red-500/30 hover:to-red-500/20 shadow-red-500/30' 
                : 'bg-gradient-to-br from-accent/25 to-accent/15 border-accent/40 text-accent hover:from-accent/30 hover:to-accent/20 shadow-accent/30'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Expand/Collapse */}
          {participantCount > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-3 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/20 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
              aria-label={expanded ? 'Collapse' : 'Expand participants'}
            >
              {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </button>
          )}

          {/* Leave */}
          <button
            onClick={onLeave}
            className="p-3 rounded-2xl bg-gradient-to-br from-red-500/25 to-red-500/15 border border-red-500/40 text-red-400 hover:from-red-500/30 hover:to-red-500/20 hover:scale-110 transition-all duration-200 active:scale-95 shadow-xl shadow-red-500/30"
            aria-label="Leave voice room"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Expanded Participants */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex flex-wrap gap-2.5">
            {entries.map(([uid, p]) => {
              const isSpeaking = speakingUsers.has(uid);
              const isCurrentUser = uid === currentUserId;
              const presenceColor = PRESENCE_COLORS[p.presence] || PRESENCE_COLORS.online;
              
              return (
                <div
                  key={uid}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    isSpeaking 
                      ? 'border-accent/50 bg-gradient-to-br from-accent/20 via-accent/15 to-purple-500/15 shadow-xl shadow-accent/30' 
                      : 'border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent/25 via-purple-500/20 to-accent/15 flex items-center justify-center text-sm font-bold text-white border border-white/15 shadow-lg">
                      {p.userName?.charAt(0) || '?'}
                    </div>
                    <div 
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 shadow-lg"
                      style={{ backgroundColor: presenceColor, boxShadow: `0 0 8px ${presenceColor}` }}
                    />
                    {isSpeaking && (
                      <>
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-ping opacity-50" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
                      </>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-[100px]">
                      {p.userName || 'User'}
                      {isCurrentUser && <span className="text-accent ml-1">(You)</span>}
                    </p>
                    <p className="text-[10px] text-white/50 capitalize">{p.presence || 'online'}</p>
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <div className="w-1 h-4 bg-gradient-to-t from-accent to-purple-500 rounded-full animate-pulse shadow-lg shadow-accent/50" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-5 bg-gradient-to-t from-accent to-purple-500 rounded-full animate-pulse shadow-lg shadow-accent/50" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-3 bg-gradient-to-t from-accent to-purple-500 rounded-full animate-pulse shadow-lg shadow-accent/50" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
