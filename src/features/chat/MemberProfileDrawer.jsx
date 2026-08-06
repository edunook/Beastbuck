import { useState } from 'react';
import { 
  X, User, Award, Briefcase, GraduationCap, MessageSquare, ExternalLink, 
  Code, FileText, Sparkles, Trophy, Star, Zap, Shield, Clock, TrendingUp,
  UserPlus, UserCheck, AtSign, Share2, Grid, FolderOpen, Video, Image as ImageIcon,
  Flame, Gem, CheckCircle, Heart
} from 'lucide-react';
import Button from '../../components/ui/Button';

const AVATAR_EMOJIS = ['👩‍🔬', '👨‍💼', '👩‍💻', '👨‍🚀', '👩‍🏫', '🧪', '💡', '🎨', '🚀', '🔥', '⭐', '🌟'];

function getAvatarEmoji(name = 'Member') {
  let hash = 0;
  for (let i = 0; i < (name || 'M').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

export function MemberProfileDrawer({ member, currentUserId, onClose, onMessage, onMention }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const memberName = member.displayName || member.username || member.name || 'Member';
  const role = member.role || 'Senior Member';
  const department = member.department || 'Innovation & Engineering';
  const team = member.team || 'Core Product Team';
  const status = member.status || 'online';
  const activity = member.activity || 'Building next-gen features in React & AI';
  const bio = member.bio || 'Passionate developer and innovator building high-impact digital experiences for the BeastBuck ecosystem.';
  const xp = member.xp || 14250;
  const level = member.level || 36;
  const avatarEmoji = getAvatarEmoji(memberName);

  const skills = member.skills || ['React.js', 'Node.js', 'AI Engineering', 'UI/UX Design', 'TypeScript', 'Firebase'];
  const achievements = member.achievements || ['Top Contributor 2026', 'Code Wizard', 'Innovator of the Month', 'Community Mentor'];
  const badges = member.badges || ['🚀 Pioneer', '💡 Visionary', '🏆 Champion', '🔥 30-Day Streak'];

  const stats = [
    { label: 'Projects', count: member.projectsCount || 18, color: 'text-accent', icon: Zap },
    { label: 'Research', count: member.researchCount || 12, color: 'text-purple-400', icon: FileText },
    { label: 'AI Models', count: member.aiModelsCount || 7, color: 'text-cyan-400', icon: Sparkles },
    { label: 'Marketplace', count: member.productsCount || 5, color: 'text-emerald-400', icon: Gem },
  ];

  const showcaseItems = [
    { title: 'Neural AI Assistant v2', type: 'AI Creation', rating: '4.9 ★', views: '2.4k' },
    { title: 'BeastBuck UI Component Library', type: 'Project', rating: '5.0 ★', views: '5.1k' },
    { title: 'Quantum Ledger Smart Contract', type: 'Research', rating: '4.8 ★', views: '1.8k' },
  ];

  const mutualGroups = [
    'General Engineering', 'AI Innovators Hub', 'Product Launch 2026', 'BeastBuck Founders'
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md h-full bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 border-l border-white/15 shadow-2xl shadow-black/80 backdrop-blur-2xl flex flex-col overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header */}
        <div className="relative h-36 bg-gradient-to-r from-accent/30 via-purple-600/30 to-pink-600/30 overflow-hidden shrink-0 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 border border-white/15 text-white/80 hover:text-white hover:bg-black/60 transition"
            aria-label="Close profile drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 -mt-14 relative shrink-0 border-b border-white/10 pb-5">
          <div className="flex items-end justify-between mb-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-accent/30 via-purple-500/20 to-slate-800 border-2 border-accent/50 flex items-center justify-center text-4xl shadow-xl shadow-accent/20">
                {avatarEmoji}
              </div>
              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-lg shadow-emerald-500/50 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  isFollowing
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
                }`}
              >
                {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/10 border border-white/15 text-white/80 hover:text-white hover:bg-white/20 transition"
                title="Share Profile"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{memberName}</h2>
            <CheckCircle className="h-4 w-4 text-accent" />
          </div>
          <p className="text-xs text-accent font-semibold">{role} · {department}</p>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/60 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span className="truncate">{activity}</span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              size="sm"
              onClick={() => { onMessage?.(member); onClose?.(); }}
              className="bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 border border-accent/40 shadow-lg shadow-accent/20 text-xs"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Message
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { onMention?.(memberName); onClose?.(); }}
              className="bg-white/10 hover:bg-white/20 border-white/15 text-xs text-white"
            >
              <AtSign className="h-3.5 w-3.5 mr-1.5" />
              Mention
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-white/[0.02] px-4">
          {['overview', 'showcase', 'shared'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold capitalize transition border-b-2 ${
                activeTab === tab 
                  ? 'border-accent text-accent bg-accent/5' 
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'overview' && (
            <>
              {/* Level & XP */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 via-purple-500/10 to-transparent border border-accent/30">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-accent" />
                    <span className="text-sm font-bold text-white">Level {level}</span>
                  </div>
                  <span className="text-xs font-bold text-accent">{xp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-purple-500" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`text-base font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-[10px] text-white/50">{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">{bio}</p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-white/90">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Badges & Honors</h3>
                <div className="flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span key={b} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30 text-accent text-xs font-bold">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'showcase' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Featured Creations</h3>
              {showcaseItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 transition">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <span className="text-xs text-yellow-400 font-bold">{item.rating}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50">
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">{item.type}</span>
                    <span>{item.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shared' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Mutual Groups</h3>
                <div className="space-y-1.5">
                  {mutualGroups.map((g) => (
                    <div key={g} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-medium flex items-center justify-between">
                      <span># {g}</span>
                      <span className="text-[10px] text-accent">Member</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
