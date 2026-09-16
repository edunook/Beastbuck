import { useState } from 'react';
import { 
  Users, Settings, MoreVertical, Gamepad2, X, Mic, MicOff, Image, Pin, MessageSquare, Phone, PhoneOff, PhoneIncoming, Sparkles
} from 'lucide-react';

export function ChatHeader({ 
  memberName, 
  memberRole, 
  canSend, 
  onShowPinned, 
  onShowMedia, 
  onShowGames, 
  onJoinVoice, 
  onLeaveVoice, 
  inVoiceRoom, 
  voiceParticipants, 
  onShowMembers, 
  onShowSettings 
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <header className="relative z-40 flex items-center justify-between border-b border-white/15 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 px-3 py-2.5 sm:px-5 sm:py-3 backdrop-blur-2xl shrink-0">
      {/* Subtle glowing bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />
      
      {/* Title & Live Status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 shadow-lg shadow-indigo-500/10">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-sm sm:text-base font-bold text-white tracking-tight">
              Community Chat
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-white/50 truncate">Realtime BeastBuck community messaging & multiplayer</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* User Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] backdrop-blur-sm mr-1">
          <span className="max-w-[120px] truncate font-bold text-white">{memberName}</span>
          <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 text-[9px]">{memberRole}</span>
        </div>

        {/* Chat Games (Multiplayer) */}
        {onShowGames && (
          <button 
            onClick={onShowGames} 
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/15 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-purple-300 transition-all duration-200 hover:bg-purple-500/25 hover:border-purple-500/50 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/10 text-xs font-bold" 
            aria-label="Play Games" 
            title="Play Multiplayer Games"
          >
            <Gamepad2 className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Games</span>
          </button>
        )}

        {/* Pinned Messages */}
        {onShowPinned && (
          <button 
            onClick={onShowPinned} 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-amber-300 active:scale-95" 
            aria-label="Pinned Messages" 
            title="Pinned Messages"
          >
            <Pin className="h-4 w-4" />
          </button>
        )}

        {/* Media Hub */}
        {onShowMedia && (
          <button 
            onClick={onShowMedia} 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-cyan-300 active:scale-95" 
            aria-label="Media & Files" 
            title="Media & Files"
          >
            <Image className="h-4 w-4" />
          </button>
        )}

        {/* Members List */}
        {onShowMembers && (
          <button 
            onClick={onShowMembers} 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95" 
            aria-label="Community Members" 
            title="Community Members"
          >
            <Users className="h-4 w-4" />
          </button>
        )}

        {/* Voice Room */}
        {!inVoiceRoom ? (
          <button 
            onClick={onJoinVoice} 
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1.5 text-indigo-400 transition-all duration-200 hover:bg-indigo-500/20 active:scale-95 text-xs font-semibold" 
            aria-label="Join voice lounge" 
            title="Voice Lounge"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Voice</span>
          </button>
        ) : (
          <button 
            onClick={onLeaveVoice} 
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/15 px-2.5 py-1.5 text-red-400 transition-all duration-200 hover:bg-red-500/25 active:scale-95 animate-pulse text-xs font-semibold" 
            aria-label="Leave voice lounge" 
            title="Leave Call"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span>Leave</span>
          </button>
        )}

        {/* Settings */}
        {onShowSettings && (
          <button 
            onClick={onShowSettings} 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95" 
            aria-label="Chat Settings"
            title="Chat Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}

export function VoiceCallOverlay({ roomName, participants, isMuted, onToggleMute, onLeave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20">
          <Phone className="h-12 w-12 text-indigo-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Voice Call</h2>
        <p className="text-sm text-white/60 mb-1">#{roomName}</p>
        <p className="text-xs text-white/40 mb-8">{Object.keys(participants).length} participant{Object.keys(participants).length !== 1 ? 's' : ''}</p>
        
        <div className="flex items-center justify-center gap-3 mb-8">
          {Object.entries(participants).map(([uid, p]) => (
            <div key={uid} className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xl border border-white/10 shadow-lg">
                {p.userName?.charAt(0) || '?'}
              </div>
              <span className="text-[10px] font-bold text-white/70 max-w-[60px] truncate">{p.userName}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={onToggleMute} 
            className={`p-5 rounded-full transition-all duration-200 active:scale-95 ${
              isMuted 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
            }`} 
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          <button 
            onClick={onLeave} 
            className="p-5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 transition-all duration-200 hover:bg-red-500/30 active:scale-95" 
            aria-label="Leave call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MemberListModal({ members, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            Members
          </h3>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white active:scale-95" 
            aria-label="Close members"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
          {members.map((member, index) => (
            <div 
              key={member.id} 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-11 w-11 shrink-0">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg border border-white/10">
                  {member.avatar || member.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black/60 bg-status-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{member.displayName || member.username}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
