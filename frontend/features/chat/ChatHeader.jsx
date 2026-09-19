import { useState } from 'react';
import {
  Users, Hash, Megaphone, Search, Pin,
  Image as ImageIcon, Gamepad2, X, SlidersHorizontal, MoreHorizontal
} from 'lucide-react';
import { MemberAvatar } from './MessageItem';

export function ChatHeader({
  currentRoom,
  onShowGames,
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
  const [showMoreActions, setShowMoreActions] = useState(false);
  const isAnnouncement = currentRoom?.type === 'announcement' || currentRoom?.id === 'announcements';
  const roomName = currentRoom?.name || currentRoom?.id || 'general';
  const roomDescription = currentRoom?.description || 'Community discussion and collaboration.';

  return (
    <header className="relative z-30 flex flex-col border-b border-sky-200 bg-[#e8f7ff]/95 shadow-lg shadow-sky-900/10 backdrop-blur-2xl shrink-0">
      
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 gap-2 min-h-[56px]">
        
        {/* Left: Chat Branding */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            isAnnouncement
              ? 'bg-amber-300/15 border-amber-200/30 text-amber-200 shadow-lg shadow-amber-950/20'
              : 'bg-cyan-200/15 border-cyan-100/30 text-cyan-100 shadow-lg shadow-cyan-950/20'
          }`}>
            {isAnnouncement ? <Megaphone className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#164661] truncate">
                {roomName}
              </h1>
              <span className="hidden min-[380px]:inline-flex items-center gap-1 rounded-full bg-emerald-300/15 border border-emerald-200/30 px-2 py-0.5 text-[9px] font-bold text-emerald-100 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-[#4b7d94] truncate max-w-[145px] min-[380px]:max-w-[190px] sm:max-w-xs md:max-w-md">
              {roomDescription}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {onShowGames && (
            <button
              type="button"
              onClick={onShowGames}
              className="hidden min-[420px]:flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white/70 px-2 sm:px-3 text-[#164661] transition hover:bg-sky-100 active:scale-95 text-xs font-bold"
              aria-label="Open games"
              title="Open games"
            >
              <Gamepad2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Games</span>
            </button>
          )}
          
          {/* Search Toggle */}
          <button 
            type="button"
            onClick={onToggleSearch}
            className={`h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border transition active:scale-95 ${
              showSearch
                ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                : 'border-sky-200 bg-white/70 text-[#39728d] hover:bg-sky-100 hover:text-[#164661]'
            }`}
            aria-label="Search Messages"
            title="Search messages"
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Pinned Messages (Visible on mobile & desktop) */}
          {onShowPinned && (
            <button 
              type="button"
              onClick={onShowPinned}
              className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border border-sky-200 bg-white/70 text-[#39728d] hover:bg-amber-50 hover:text-amber-700 transition active:scale-95"
              aria-label="Pinned Messages"
              title="Pinned Messages"
            >
              <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {pinnedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black shadow-md">
                  {pinnedCount}
                </span>
              )}
            </button>
          )}

          {/* Media & Files Hub (Desktop visible, mobile inside more or direct) */}
          {onShowMedia && (
            <button 
              type="button"
              onClick={onShowMedia}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white/70 text-[#39728d] hover:bg-sky-100 hover:text-cyan-700 transition active:scale-95"
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
              className="flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 rounded-xl border border-sky-200 bg-white/70 text-[#39728d] hover:bg-sky-100 hover:text-[#164661] transition text-xs active:scale-95"
              aria-label="Channel Members"
              title="Community Members"
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {memberCount > 0 && (
                <span className="hidden sm:inline text-[11px] font-semibold">{memberCount}</span>
              )}
            </button>
          )}

          {/* Mobile More Actions Popover */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setShowMoreActions(v => !v)}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-sky-200 bg-white/70 text-[#39728d] hover:bg-sky-100 hover:text-[#164661] transition active:scale-95"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMoreActions && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-sky-200 bg-white/98 shadow-2xl shadow-sky-900/15 p-1.5 z-50 animate-fade-in backdrop-blur-2xl"
                onClick={() => setShowMoreActions(false)}
              >
                {onShowMedia && (
                  <button
                    type="button"
                    onClick={onShowMedia}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#164661] hover:bg-sky-50 transition"
                  >
                    <ImageIcon className="h-4 w-4 text-cyan-400" />
                    <span>Media & Files</span>
                  </button>
                )}
                {onShowGames && (
                  <button
                    type="button"
                    onClick={onShowGames}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#164661] hover:bg-sky-50 transition"
                  >
                    <Gamepad2 className="h-4 w-4 text-cyan-300" />
                    <span>Games</span>
                  </button>
                )}
                {onShowSettings && (
                  <button
                    type="button"
                    onClick={onShowSettings}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#164661] hover:bg-sky-50 transition"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
                    <span>Chat Settings</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Chat Settings (Desktop) */}
          {onShowSettings && (
            <button 
              type="button"
              onClick={onShowSettings}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white/70 text-[#39728d] hover:bg-sky-100 hover:text-cyan-700 transition active:scale-95"
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
        <div className="px-3 sm:px-5 pb-2.5 pt-1 border-t border-cyan-100/10 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7299aa]" />
            <input
              type="text"
              placeholder={`Search messages in #${roomName}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-sky-200 bg-white pl-9 pr-8 py-2 text-sm text-[#164661] outline-none placeholder:text-[#7299aa] focus:border-cyan-400 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7299aa] hover:text-[#164661]"
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#164661]/35 backdrop-blur-md p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-sky-200 bg-white/98 shadow-2xl shadow-sky-900/15 p-4 sm:p-5 flex flex-col backdrop-blur-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1 rounded-full bg-cyan-50/20 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            <h3 className="text-sm font-bold text-[#164661]">Community Members ({members.length})</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-sky-100 text-[#7299aa] hover:text-[#164661] transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs sm:text-sm text-[#164661] outline-none mb-3 placeholder:text-[#7299aa] focus:border-cyan-400 transition"
        />

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-[#7299aa] py-8">No members found</p>
          ) : (
            filtered.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-100 hover:border-sky-300 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MemberAvatar 
                    photoURL={member.photoURL || member.avatar} 
                    name={member.displayName || member.username || 'Member'} 
                    size="md" 
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#164661] truncate">{member.displayName || member.username}</p>
                    <p className="text-[10px] text-[#7299aa] truncate">@{member.username || member.id}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100/15 text-cyan-100 border border-cyan-100/25 shrink-0">
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
