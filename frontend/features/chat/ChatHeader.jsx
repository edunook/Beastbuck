import { useState } from 'react';
import { 
  Users, Settings, Hash, Megaphone, Search, Pin, 
  Image as ImageIcon, Menu, X, Sparkles, SlidersHorizontal
} from 'lucide-react';

export function ChatHeader({ 
  currentRoom,
  memberName, 
  memberRole, 
  onToggleSidebar,
  onShowPinned, 
  pinnedCount = 0,
  onShowMedia, 
  onShowMembers, 
  memberCount = 0,
  onShowSettings,
  searchQuery = '',
  onSearchChange,
  showSearch = false,
  onToggleSearch
}) {
  const isAnnouncement = currentRoom?.type === 'announcement' || currentRoom?.id === 'announcements';
  const roomName = currentRoom?.name || currentRoom?.id || 'general';
  const roomDescription = currentRoom?.description || 'Community discussion and collaboration.';

  return (
    <header className="relative z-30 flex flex-col border-b border-white/10 bg-slate-950/90 backdrop-blur-2xl shrink-0">
      
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 gap-2">
        
        {/* Left: Mobile Toggle & Channel Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Sidebar Hamburger */}
          <button 
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle Channels"
            title="Channels"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Channel Icon & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border ${
              isAnnouncement 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
            }`}>
              {isAnnouncement ? <Megaphone className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                  {roomName}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-white/50 truncate hidden sm:block">
                {roomDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Search, Pinned, Media, Members, Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          
          {/* Search Toggle */}
          <button 
            type="button"
            onClick={onToggleSearch} 
            className={`p-2 rounded-xl border transition ${
              showSearch 
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`} 
            aria-label="Search Messages" 
            title="Search messages in this channel"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Pinned Messages */}
          {onShowPinned && (
            <button 
              type="button"
              onClick={onShowPinned} 
              className="relative p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-amber-300 transition" 
              aria-label="Pinned Messages" 
              title="Pinned Messages"
            >
              <Pin className="h-4 w-4" />
              {pinnedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black shadow-md">
                  {pinnedCount}
                </span>
              )}
            </button>
          )}

          {/* Media & Files Hub */}
          {onShowMedia && (
            <button 
              type="button"
              onClick={onShowMedia} 
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-cyan-300 transition" 
              aria-label="Shared Media" 
              title="Media & Files"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          )}

          {/* Members List Drawer */}
          {onShowMembers && (
            <button 
              type="button"
              onClick={onShowMembers} 
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition text-xs" 
              aria-label="Channel Members" 
              title="Community Members"
            >
              <Users className="h-4 w-4" />
              {memberCount > 0 && (
                <span className="hidden sm:inline font-semibold">{memberCount}</span>
              )}
            </button>
          )}

          {/* Chat Settings */}
          {onShowSettings && (
            <button 
              type="button"
              onClick={onShowSettings} 
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition" 
              aria-label="Chat Preferences"
              title="Chat Settings"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable In-Channel Message Search Bar */}
      {showSearch && (
        <div className="px-3 sm:px-5 pb-2.5 pt-1 border-t border-white/5 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              placeholder={`Search messages in #${roomName}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-indigo-500/30 bg-black/40 pl-9 pr-8 py-2 text-xs sm:text-sm text-white outline-none placeholder:text-white/40 focus:border-indigo-400 focus:bg-black/60 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
}

export function MemberListModal({ members = [], onClose }) {
  const [search, setSearch] = useState('');

  const filtered = members.filter(m => 
    (m.displayName || m.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Community Members ({members.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none mb-3 placeholder:text-white/40 focus:border-indigo-500"
        />

        <div className="max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-white/40 py-6">No members found</p>
          ) : (
            filtered.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
                    {(member.displayName || member.username || 'M')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{member.displayName || member.username}</p>
                    <p className="text-[10px] text-white/40 truncate">@{member.username || member.id}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {member.role || 'Member'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
