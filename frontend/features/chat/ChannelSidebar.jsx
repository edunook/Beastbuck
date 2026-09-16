import { useState, useMemo } from 'react';
import { 
  Hash, Megaphone, Plus, X, Search, Pin, Users, ChevronRight, 
  Sparkles, Trophy, Calendar, Lightbulb, HelpCircle, FolderGit2,
  FolderOpen, MessageCircle, Flame, Shield, Compass
} from 'lucide-react';
import Button from '@frontend/components/ui/Button';

const CATEGORY_MAP = {
  announcements: 'Announcements',
  events: 'Community Hub',
  challenges: 'Community Hub',
  introductions: 'Community Hub',
  general: 'General',
  questions: 'Discussions',
  help: 'Discussions',
  resources: 'Resources',
  ideas: 'Innovation & Lab',
  feedback: 'Innovation & Lab',
  projects: 'Innovation & Lab',
  research: 'Innovation & Lab',
  'media-sharing': 'Creative & Media',
  'career-advice': 'Discussions',
  random: 'General',
};

const CHANNEL_ICONS = {
  general: MessageCircle,
  announcements: Megaphone,
  questions: HelpCircle,
  help: Shield,
  resources: FolderOpen,
  ideas: Lightbulb,
  feedback: Sparkles,
  projects: FolderGit2,
  research: Compass,
  random: Flame,
  challenges: Trophy,
  events: Calendar,
  introductions: Users,
  'media-sharing': Sparkles,
  'career-advice': Compass,
};

export function ChannelSidebar({
  rooms = [],
  activeRoomId = 'general',
  canManageChannels = false,
  onSelectRoom,
  onCreateChannel,
  onArchiveChannel,
  unreadCounts = {},
  memberPresence = {},
  onCloseMobile,
}) {
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');
  const [submitting, setSubmitting] = useState(false);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(room => 
      (room.name || '').toLowerCase().includes(q) ||
      (room.description || '').toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  // Group rooms by category
  const groupedRooms = useMemo(() => {
    const groups = {
      'Announcements': [],
      'General': [],
      'Innovation & Lab': [],
      'Discussions': [],
      'Community Hub': [],
      'Resources': [],
      'Other': [],
    };

    filteredRooms.forEach(room => {
      const cat = room.category || CATEGORY_MAP[room.id] || (room.type === 'announcement' ? 'Announcements' : 'General');
      if (groups[cat]) {
        groups[cat].push(room);
      } else {
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(room);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredRooms]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onCreateChannel?.({ name, description, type });
      setName('');
      setDescription('');
      setType('public');
      setCreating(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col bg-slate-950/80 md:bg-slate-900/60 border-r border-white/10 backdrop-blur-2xl select-none">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Compass className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white truncate">Channels</h2>
            <p className="text-[10px] text-white/40">{rooms.length} channels available</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canManageChannels && (
            <button 
              type="button" 
              onClick={() => setCreating(c => !c)} 
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition active:scale-95" 
              aria-label={creating ? 'Close create channel form' : 'Create new channel'}
              title="Create Channel"
            >
              {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-7 py-1.5 text-xs text-white outline-none transition placeholder:text-white/40 focus:border-indigo-500/60 focus:bg-white/10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Create Channel Modal / Inline Form */}
      {creating && (
        <form onSubmit={submit} className="m-3 p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 space-y-2.5 animate-fade-in shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">New Channel</span>
            <button type="button" onClick={() => setCreating(false)} className="text-white/40 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="channel-name (e.g. dev-updates)"
            maxLength={40}
            required
            className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-400 placeholder:text-white/30"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Channel topic or description"
            maxLength={120}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-400 placeholder:text-white/30"
          />
          <div className="flex gap-2">
            <Button 
              type="submit" 
              size="sm" 
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1" 
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating...' : 'Create'}
            </Button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-2.5 py-1 rounded-lg border border-white/15 text-xs text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Channel Categories & List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-4 custom-scrollbar">
        {groupedRooms.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-white/40">No channels found</p>
          </div>
        ) : (
          groupedRooms.map(([category, items]) => (
            <div key={category} className="space-y-0.5">
              {/* Category Label */}
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[9px] text-white/25 font-mono">{items.length}</span>
              </div>

              {/* Items in Category */}
              {items.map(room => {
                const active = room.id === activeRoomId;
                const isAnnouncement = room.type === 'announcement' || room.id === 'announcements';
                const unreadCount = unreadCounts[room.id] || 0;
                const IconComponent = CHANNEL_ICONS[room.id] || (isAnnouncement ? Megaphone : Hash);

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      onSelectRoom(room.id);
                      onCloseMobile?.();
                    }}
                    className={`group relative flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all duration-150 ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10 font-semibold'
                        : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-400" />
                    )}

                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition ${
                      active
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : isAnnouncement
                          ? 'text-amber-400 group-hover:text-amber-300'
                          : 'text-white/40 group-hover:text-white/70'
                    }`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </span>

                    <span className="flex-1 min-w-0 truncate text-xs">
                      {room.name || room.id}
                    </span>

                    {/* Unread badge */}
                    {unreadCount > 0 && !active && (
                      <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-black/20">
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate">Connected to BeastBuck Network</span>
        </div>
      </div>

    </aside>
  );
}
