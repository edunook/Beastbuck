import { useState, useMemo } from 'react';
import { Archive, Hash, Megaphone, Plus, X, Search, Pin, Users, ChevronRight, Circle } from 'lucide-react';
import Button from '@frontend/components/ui/Button';

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

export function ChannelSidebar({
  rooms,
  activeRoomId,
  canManageChannels,
  onSelectRoom,
  onCreateChannel,
  onArchiveChannel,
  unreadCounts = {},
  memberPresence = {},
}) {
  const [creating, setCreating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(room => 
        room.name?.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query)
      );
    }
    if (filter === 'pinned') {
      result = result.filter(r => r.pinned);
    } else if (filter === 'starred') {
      result = result.filter(r => r.starred);
    }
    return result;
  }, [rooms, searchQuery, filter]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onCreateChannel({ name, description, type });
      setName('');
      setDescription('');
      setType('public');
      setCreating(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getPresenceColor = (roomId) => {
    const members = memberPresence[roomId] || [];
    if (members.some(m => m.presence === 'online')) return PRESENCE_COLORS.online;
    if (members.some(m => m.presence === 'busy')) return PRESENCE_COLORS.busy;
    if (members.some(m => m.presence === 'away')) return PRESENCE_COLORS.away;
    return null;
  };

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl md:w-72 md:border-b-0 md:border-r md:border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 bg-gradient-to-r from-white/5 to-transparent">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">Channels</h2>
          <p className="text-xs text-white/50">{rooms.length} active rooms</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            type="button" 
            onClick={() => setShowSearch(s => !s)} 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-400 hover:scale-110 active:scale-95" 
            aria-label="Search channels"
          >
            {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
          {canManageChannels && (
            <button 
              type="button" 
              onClick={() => setCreating(c => !c)} 
              className="rounded-xl border border-accent/30 bg-gradient-to-r from-accent/20 to-accent/10 p-2 text-accent transition-all duration-200 hover:border-accent/60 hover:from-accent/30 hover:to-accent/20 hover:scale-110 hover:shadow-lg hover:shadow-accent/30 active:scale-95" 
              aria-label={creating ? 'Close channel form' : 'Create channel'}
            >
              {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="border-b border-white/10 px-3 py-3 animate-fade-in-up bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400/70" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 py-2.5 text-xs text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:shadow-lg focus:shadow-blue-400/10"
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 px-3 py-2.5 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        {['all', 'pinned', 'starred'].map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg px-2 py-2 text-[10px] sm:text-xs font-bold capitalize transition-all duration-200 hover:scale-105 active:scale-95 ${
              filter === f 
                ? 'bg-gradient-to-r from-accent/30 to-accent/20 text-accent border border-accent/40 shadow-lg shadow-accent/30' 
                : 'bg-white/5 text-white/60 border border-transparent hover:text-white hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Create Channel Form */}
      {creating && (
        <form onSubmit={submit} className="space-y-3 border-b border-white/10 p-3 md:p-4 animate-fade-in-up bg-gradient-to-r from-accent/5 to-transparent">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="channel-name"
            maxLength={40}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:shadow-lg focus:shadow-accent/10"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            maxLength={120}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:shadow-lg focus:shadow-accent/10"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:shadow-lg focus:shadow-accent/10"
          >
            <option value="public">Public</option>
            <option value="announcement">Announcement</option>
          </select>
          <Button 
            type="submit" 
            size="sm" 
            className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/30 transition-all duration-200 hover:scale-105 active:scale-95" 
            disabled={submitting || !name.trim()}
          >
            {submitting ? 'Creating...' : 'Create Channel'}
          </Button>
        </form>
      )}

      {/* Channel List */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 md:p-3 custom-scrollbar" aria-label="Chat channels">
        {filteredRooms.length === 0 ? (
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
              <Hash className="h-5 w-5 text-white/40" />
            </div>
            <p className="text-xs text-white/50">
              {searchQuery ? 'No channels match your search' : 'No channels yet'}
            </p>
          </div>
        ) : (
          filteredRooms.map(room => {
            const active = room.id === activeRoomId;
            const announcement = room.type === 'announcement';
            const unreadCount = unreadCounts[room.id] || 0;
            const presenceColor = getPresenceColor(room.id);

            return (
              <div key={room.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelectRoom(room.id)}
                  className={`relative flex w-full items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 py-2.5 sm:px-3 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    active
                      ? 'border border-accent/40 bg-gradient-to-r from-accent/20 to-accent/10 text-white shadow-lg shadow-accent/30'
                      : 'border border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-accent to-accent/60 animate-pulse" />
                  )}
                  
                  {/* Presence Indicator */}
                  {presenceColor && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: presenceColor, boxShadow: `0 0 8px ${presenceColor}` }} />
                  )}

                  <span className={`rounded-lg p-2 transition-all duration-200 ${
                    announcement 
                      ? 'bg-gradient-to-br from-status-warning/20 to-status-warning/10 text-status-warning' 
                      : active 
                        ? 'bg-gradient-to-br from-accent/30 to-accent/20 text-accent' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 text-white/70'
                  }`}>
                    {announcement ? <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs sm:text-sm font-bold">
                      {room.name}
                    </span>
                    {room.description && (
                      <span className="hidden sm:block truncate text-[10px] text-white/40 mt-0.5">
                        {room.description}
                      </span>
                    )}
                  </span>
                  
                  {/* Unread Badge */}
                  {unreadCount > 0 && !active && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  
                  {/* Chevron for hover */}
                  <ChevronRight className={`h-3.5 w-3.5 transition-all duration-200 ${
                    active ? 'text-accent opacity-100' : 'opacity-0 group-hover:opacity-100 text-white/40'
                  }`} />
                </button>
                
                {/* Archive Button */}
                {canManageChannels && !room.isDefault && (
                  <button
                    type="button"
                    onClick={() => onArchiveChannel(room.id)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/0 transition-all duration-200 hover:bg-status-danger/10 hover:text-status-danger group-hover:text-white/60"
                    aria-label={`Archive ${room.name}`}
                  >
                    <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 md:p-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 border border-white/10">
            <Users className="h-4 w-4 text-white/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">BeastBuck Team</p>
            <p className="text-[10px] text-white/50">Online community</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
