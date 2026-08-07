import { useState } from 'react';
import { Hash, Megaphone, Phone, PhoneOff, PhoneIncoming, Users, Settings, MoreVertical, Bell, Gamepad2, X, Mic, MicOff } from 'lucide-react';

export function ChatHeader({ room, memberName, memberRole, canSend, onShowPinned, onShowGames, onJoinVoice, onLeaveVoice, inVoiceRoom, voiceParticipants, onShowMembers, onShowSettings }) {
  const [showActions, setShowActions] = useState(false);
  const announcement = room?.type === 'announcement';

  return (
    <header className="relative z-40 flex items-center justify-between border-b border-white/15 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 px-3 py-2 sm:px-5 sm:py-2.5 backdrop-blur-2xl shrink-0">
      {/* Subtle gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />
      
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className={`relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
          announcement
            ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
            : 'border-indigo-500/40 bg-indigo-500/15 text-indigo-400'
        }`}>
          {announcement ? <Megaphone className="h-4 w-4" /> : <Hash className="h-4 w-4 sm:h-5 sm:w-5" />}
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>

        <div className="min-w-0">
          <h1 className="font-heading text-sm sm:text-base font-bold text-white truncate">
            #{room?.name || 'general'}
            {announcement && (
              <span className="hidden sm:inline ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                • Announcement
              </span>
            )}
          </h1>
          <p className="text-[10px] sm:text-xs text-white/50 truncate max-w-[150px] sm:max-w-xs">{room?.description || 'Realtime BeastBuck team messages'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* User Badge — desktop only */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] backdrop-blur-sm mr-1">
          <span className="max-w-[140px] truncate font-bold text-white">{memberName}</span>
          <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20 text-[9px]">{memberRole}</span>
        </div>

        {/* Voice Call — hidden on small mobile */}
        {!inVoiceRoom ? (
          <button 
            onClick={onJoinVoice} 
            className="hidden sm:flex rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-1.5 sm:p-2 text-indigo-400 transition-all duration-200 hover:bg-indigo-500/20 active:scale-95" 
            aria-label="Join voice room" 
            title="Voice call"
          >
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        ) : (
          <button 
            onClick={onLeaveVoice} 
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 sm:p-2 text-red-400 transition-all duration-200 hover:bg-red-500/20 active:scale-95 animate-pulse" 
            aria-label="Leave voice room" 
            title="Leave call"
          >
            <PhoneOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}

        {/* Chat Games */}
        <button 
          onClick={onShowGames} 
          className="rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95" 
          aria-label="Chat Games" 
          title="Chat Games"
        >
          <Gamepad2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        {/* Voice Participants Count */}
        {inVoiceRoom && voiceParticipants > 0 && (
          <span className="hidden sm:flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
            <PhoneIncoming className="h-3 w-3" />
            {voiceParticipants}
          </span>
        )}

        {/* More Actions Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowActions(s => !s)} 
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95" 
            aria-label="More options"
          >
            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-white/15 bg-slate-950 shadow-2xl overflow-hidden z-[1000] animate-fade-in-up">
              <button 
                onClick={() => { onShowMembers?.(); setShowActions(false); }} 
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Members</span>
              </button>
              <button 
                onClick={() => { onShowSettings?.(); setShowActions(false); }} 
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <Settings className="h-3.5 w-3.5 text-indigo-400" />
                <span>Chat Settings</span>
              </button>
            </div>
          )}
        </div>
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
