import { useState, useMemo } from 'react';
import { 
  X, Search, Image as ImageIcon, Video, FileText, Music, Link2, Filter, SortAsc, 
  Grid, List, Download, Share2, Bookmark, ExternalLink, ChevronLeft, ChevronRight, 
  Sparkles, FolderOpen, Calendar, User, Eye, BookmarkCheck, Play, Mic, Box, 
  ShoppingBag, Film, BookOpen
} from 'lucide-react';

const MEDIA_TABS = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'voicenotes', label: 'Voice Notes', icon: Mic },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: Box },
  { id: 'aimodels', label: 'AI Models', icon: Sparkles },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'funflix', label: 'FunFlix', icon: Film },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'name', label: 'Name (A-Z)' },
  { id: 'size', label: 'File Size' },
];

export function MediaHub({ messages = [], onClose, onOpenMedia }) {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Extract all media items from chat messages
  const mediaItems = useMemo(() => {
    const items = [];
    messages.forEach(message => {
      if (message.attachments?.length) {
        message.attachments.forEach(att => {
          items.push({
            ...att,
            messageId: message.id,
            senderName: message.senderName || 'Member',
            timestamp: message.createdAt,
          });
        });
      }
      if (message.file) {
        items.push({
          ...message.file,
          messageId: message.id,
          senderName: message.senderName || 'Member',
          timestamp: message.createdAt,
        });
      }
      if (message.sharedContent) {
        items.push({
          id: `${message.id}-shared`,
          type: message.sharedContent.category || 'link',
          url: message.sharedContent.thumbnail || message.sharedContent.link,
          name: message.sharedContent.title || 'Shared Content',
          size: null,
          messageId: message.id,
          senderName: message.senderName || 'Member',
          timestamp: message.createdAt,
          shared: true,
        });
      }
    });

    // Provide default fallback demo items if empty
    if (items.length === 0) {
      return [
        { id: 'm1', type: 'image/png', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', name: 'Neural Design Concept.png', size: 1420000, senderName: 'Dr. Sarah Chen' },
        { id: 'm2', type: 'video/mp4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', name: 'Product Demo 2026.mp4', size: 8500000, senderName: 'Alex Johnson' },
        { id: 'm3', type: 'application/pdf', url: '#', name: 'BeastBuck Architecture Whitepaper.pdf', size: 3200000, senderName: 'Emma Williams' },
        { id: 'm4', type: 'audio/mp3', url: '#', name: 'Voice Note - Strategy Meeting.mp3', size: 890000, senderName: 'James Brown' },
        { id: 'm5', type: 'research', url: '#', name: 'AI Quantum Model Paper v4', size: 1200000, senderName: 'Dr. Sarah Chen' },
        { id: 'm6', type: 'aimodels', url: '#', name: 'BeastGPT Turbo Fine-tuned Weight', size: 45000000, senderName: 'AI Lab' },
      ];
    }
    return items;
  }, [messages]);

  const filteredMedia = useMemo(() => {
    let filtered = mediaItems;

    if (activeTab !== 'all') {
      filtered = filtered.filter(item => {
        const type = (item.type || '').toLowerCase();
        if (activeTab === 'images') return type.startsWith('image/');
        if (activeTab === 'videos') return type.startsWith('video/');
        if (activeTab === 'documents') return type.includes('pdf') || type.includes('doc') || type.includes('text');
        if (activeTab === 'voicenotes') return type.startsWith('audio/') || type.includes('voice');
        if (activeTab === 'audio') return type.startsWith('audio/');
        if (activeTab === 'links') return item.shared || type === 'link';
        if (activeTab === 'research') return type === 'research';
        if (activeTab === 'projects') return type === 'projects';
        if (activeTab === 'aimodels') return type === 'aimodels';
        if (activeTab === 'marketplace') return type === 'marketplace';
        if (activeTab === 'funflix') return type === 'funflix';
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name || '').toLowerCase().includes(q) ||
        (item.senderName || '').toLowerCase().includes(q)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return (b.timestamp?.toDate?.()?.getTime() || 0) - (a.timestamp?.toDate?.()?.getTime() || 0);
      if (sortBy === 'oldest') return (a.timestamp?.toDate?.()?.getTime() || 0) - (b.timestamp?.toDate?.()?.getTime() || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return 0;
    });
  }, [mediaItems, activeTab, sortBy, searchQuery]);

  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-6xl max-h-[90vh] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-4 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Shared Media Hub</h2>
              <p className="text-xs text-white/50">{filteredMedia.length} item{filteredMedia.length !== 1 ? 's' : ''} available in room</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex gap-1.5 px-6 py-3 border-b border-white/10 bg-white/[0.02] overflow-x-auto custom-scrollbar">
          {MEDIA_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  activeTab === tab.id
                    ? 'bg-accent/20 text-accent border-accent/40 shadow-lg shadow-accent/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-white/10 bg-white/[0.01]">
          <span className="text-xs font-bold text-white/50">Viewing {activeTab.toUpperCase()}</span>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-white/15 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none"
            >
              {SORT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
            <div className="flex border border-white/15 rounded-xl p-0.5 bg-white/5">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-accent/20 text-accent' : 'text-white/50'}`}>
                <Grid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-accent/20 text-accent' : 'text-white/50'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid/List Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-16 text-white/50">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-white/30" />
              <p className="font-bold">No media items found in this section</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="group relative aspect-square rounded-2xl border border-white/15 bg-white/5 overflow-hidden hover:border-accent/50 transition hover:scale-[1.02] cursor-pointer"
                  onClick={() => setPreviewMedia(item)}
                >
                  {item.type?.startsWith('image/') ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-white/10 to-white/5">
                      <FileText className="h-10 w-10 text-accent mb-2" />
                      <p className="text-xs font-bold text-white line-clamp-2">{item.name}</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:text-yellow-400"
                      >
                        {bookmarkedIds.has(item.id) ? <BookmarkCheck className="h-4 w-4 text-yellow-400" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-white/60">By {item.senderName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => setPreviewMedia(item)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-white/15 bg-white/5 hover:border-accent/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-white/50">Shared by {item.senderName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.size && <span className="text-[11px] text-white/40">{(item.size / 1024).toFixed(0)} KB</span>}
                    <button className="p-2 rounded-xl bg-white/5 text-white/70 hover:text-white" title="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-w-3xl w-full bg-slate-900 border border-white/20 rounded-3xl p-6 overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewMedia(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">{previewMedia.name}</h3>
            <p className="text-xs text-white/50 mb-4">Shared by {previewMedia.senderName}</p>
            {previewMedia.type?.startsWith('image/') ? (
              <img src={previewMedia.url} alt={previewMedia.name} className="max-h-96 w-full object-contain rounded-2xl border border-white/10" />
            ) : previewMedia.type?.startsWith('video/') ? (
              <video src={previewMedia.url} controls className="max-h-96 w-full rounded-2xl border border-white/10" />
            ) : (
              <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                <FileText className="h-16 w-16 text-accent mx-auto mb-3" />
                <p className="text-sm font-bold text-white">{previewMedia.name}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <a href={previewMedia.url} download target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-accent text-black font-bold text-xs flex items-center gap-1.5">
                <Download className="h-4 w-4" /> Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
