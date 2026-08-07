import { useMemo } from 'react';
import { 
  ExternalLink, Calendar, Users, FileText, Bot, ShoppingCart, 
  Play, BookOpen, Star, ArrowRight, Download, Share2, 
  Bookmark, MoreVertical, Clock, Tag, TrendingUp
} from 'lucide-react';

const TYPE_CONFIG = {
  project: {
    icon: '🚀',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    label: 'Project',
  },
  event: {
    icon: '📅',
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    label: 'Event',
  },
  research: {
    icon: '🔬',
    gradient: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/30',
    accent: 'text-green-400',
    label: 'Research',
  },
  ai: {
    icon: '🤖',
    gradient: 'from-accent/20 to-purple-500/10',
    border: 'border-accent/30',
    accent: 'text-accent',
    label: 'AI Model',
  },
  marketplace: {
    icon: '🛒',
    gradient: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/30',
    accent: 'text-orange-400',
    label: 'Marketplace',
  },
  funflix: {
    icon: '🎬',
    gradient: 'from-red-500/20 to-pink-500/10',
    border: 'border-red-500/30',
    accent: 'text-red-400',
    label: 'FunFlix',
  },
  knowledge: {
    icon: '📚',
    gradient: 'from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/30',
    accent: 'text-yellow-400',
    label: 'Knowledge',
  },
  showcase: {
    icon: '✨',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/30',
    accent: 'text-cyan-400',
    label: 'Showcase',
  },
  game: {
    icon: '🎮',
    gradient: 'from-violet-600/30 via-indigo-600/20 to-slate-900',
    border: 'border-violet-400/50',
    accent: 'text-violet-300',
    label: 'Live Multiplayer Game',
  },
  default: {
    icon: '📎',
    gradient: 'from-white/10 to-white/5',
    border: 'border-white/10',
    accent: 'text-white/70',
    label: 'Shared',
  },
};

export function RichCardRenderer({ content, onOpen, onShare, onBookmark, isBookmarked }) {
  const config = TYPE_CONFIG[content.type] || TYPE_CONFIG.default;
  const metadata = useMemo(() => {
    const items = [];
    if (content.author) items.push({ icon: Users, text: content.author });
    if (content.date) items.push({ icon: Clock, text: content.date });
    if (content.category) items.push({ icon: Tag, text: content.category });
    if (content.views) items.push({ icon: TrendingUp, text: `${content.views} views` });
    if (content.rating) items.push({ icon: Star, text: `${content.rating} rating` });
    if (content.price) items.push({ icon: Tag, text: content.price });
    return items.slice(0, 3);
  }, [content]);

  const actionButtons = [];
  if (onOpen) actionButtons.push({ icon: ExternalLink, label: 'Open', onClick: () => onOpen?.(content), primary: true });
  if (onShare) actionButtons.push({ icon: Share2, label: 'Share', onClick: () => onShare?.(content) });
  if (onBookmark) actionButtons.push({ icon: Bookmark, label: isBookmarked ? 'Saved' : 'Save', onClick: () => onBookmark?.(content), active: isBookmarked });

  return (
    <div className={`mt-2 rounded-2xl border ${config.border} bg-gradient-to-br ${config.gradient} overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-sm">
            {content.icon || config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${config.accent}`}>
                {config.label}
              </span>
              {content.badge && (
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-[10px] font-bold text-accent border border-accent/20">
                  {content.badge}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white truncate group-hover:text-accent transition-colors">
              {content.title || 'Untitled'}
            </h4>
          </div>
        </div>

        {/* Description */}
        {content.description && (
          <p className="text-xs text-white/60 leading-relaxed line-clamp-2 mb-3">
            {content.description}
          </p>
        )}

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {metadata.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                <item.icon className="h-3 w-3 text-white/50" />
                <span className="text-[10px] text-white/60">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Thumbnail */}
        {content.thumbnail && (
          <div className="relative rounded-xl overflow-hidden border border-white/10 mb-3">
            <img 
              src={content.thumbnail} 
              alt={content.title || 'Preview'} 
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            {content.type === 'funflix' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress bar for projects/tasks */}
        {content.progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-white/70">Progress</span>
              <span className="text-[10px] font-bold text-accent">{content.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, content.progress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {content.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {content.tags.slice(0, 4).map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-white/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {actionButtons.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center gap-2">
          {actionButtons.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                action.primary
                  ? 'bg-gradient-to-r from-accent to-accent/80 text-black shadow-lg shadow-accent/30 hover:from-accent/90 hover:to-accent/70'
                  : `border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ${action.active ? 'border-accent/40 bg-accent/10 text-accent' : ''}`
              }`}
            >
              <action.icon className="h-3.5 w-3.5" />
              <span>{action.label}</span>
            </button>
          ))}
          <button 
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
            aria-label="More options"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
