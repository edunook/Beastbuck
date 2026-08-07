import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Hash, Users, Sparkles, Zap, TrendingUp, 
  Calendar, Award, Clock, Search, Plus, Bot, Image, 
  FileText, Video, ChevronRight, Star, Bell, Flame,
  ArrowRight, UserPlus, Rocket, Target, Lightbulb, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { ChatService } from '@services/firestore/chat';
import { UsersService } from '@services/firestore/users';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getAvatarEmoji = (name = 'Member') => {
  const emojis = ['👩‍🔬', '👨‍💼', '👩‍💻', '👨‍🚀', '👩‍🏫', '🧪', '💡', '🎨', '🚀', '🔥', '⭐', '🌟', '💎'];
  let hash = 0;
  for (let i = 0; i < (name || 'M').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return emojis[Math.abs(hash) % emojis.length];
};

export default function ChatHome({ onSelectRoom, onCreateConversation, rooms = [] }) {
  const { user, roleData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState([]);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [communityHighlights, setCommunityHighlights] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [error, setError] = useState(null);

  const memberName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';
  const greeting = getGreeting();

  useEffect(() => {
    if (!user?.uid) return;
    loadDashboardData();
  }, [user?.uid, rooms]);

  const loadDashboardData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    try {
      const sortedRooms = [...rooms].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        if (aName === 'general' || aName === 'community') return -1;
        if (bName === 'general' || bName === 'community') return 1;
        return aName.localeCompare(bName);
      });

      setRecentChats(sortedRooms.slice(0, 5));
      setPinnedChats(sortedRooms.filter(r => r.pinned).slice(0, 3));
      setUnreadChats(sortedRooms.filter(r => (r.unreadCount || 0) > 0).slice(0, 5));

      try {
        const members = await UsersService.getAssignableMembers();
        const online = members
          .filter(m => m.presence === 'online' || m.presence === 'coding' || m.presence === 'busy')
          .slice(0, 8)
          .map(m => ({
            id: m.id,
            name: m.displayName || m.username || 'Member',
            avatar: getAvatarEmoji(m.displayName || m.username),
            status: m.presence || 'online'
          }));
        setOnlineMembers(online);
      } catch (err) {
        console.error('Failed to load online members:', err);
      }

      const highlights = [];
      const pinnedMessages = rooms.filter(r => r.pinned).slice(0, 2);
      if (pinnedMessages.length > 0) {
        highlights.push({
          id: 'pinned',
          type: 'announcement',
          title: 'Pinned conversations available',
          author: 'BeastBuck Team',
          time: 'Active'
        });
      }
      highlights.push(
        { id: 2, type: 'trending', title: 'Research Collaboration Discussion', author: 'Multiple', time: '5 hours ago' },
        { id: 3, type: 'event', title: 'Weekly Community Meetup', author: 'Events Team', time: 'Tomorrow' }
      );
      setCommunityHighlights(highlights);

      setAiSuggestions([
        { id: 1, type: 'contact', title: 'Message Dr. Sarah Kim', reason: 'Shared research interests' },
        { id: 2, type: 'project', title: 'Join Climate Research Project', reason: 'Matches your skills' },
        { id: 3, type: 'discussion', title: 'AI Ethics Discussion', reason: 'Trending in your field' },
      ]);

      setRecentFiles([
        { id: 1, type: 'image', name: 'Research Diagram.png', size: '2.4 MB', time: '2 hours ago' },
        { id: 2, type: 'video', name: 'Demo Recording.mp4', size: '15.6 MB', time: '5 hours ago' },
        { id: 3, type: 'document', name: 'Project Proposal.pdf', size: '1.2 MB', time: '1 day ago' },
      ]);

      const streak = parseInt(localStorage.getItem('beastbuck-chat-streak') || '0', 10);
      setDailyStreak(streak);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Could not load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = useCallback((roomId) => {
    onSelectRoom?.(roomId);
  }, [onSelectRoom]);

  const handleCreateNew = useCallback(() => {
    onCreateConversation?.();
  }, [onCreateConversation]);

  const handleOpenCommunity = useCallback(() => {
    const communityRoom = rooms.find(r => r.id === 'community' || r.name?.toLowerCase() === 'community');
    if (communityRoom) {
      handleSelectChat(communityRoom.id);
    } else if (rooms.length > 0) {
      handleSelectChat(rooms[0].id);
    }
  }, [rooms, handleSelectChat]);

  const handleMessageAI = useCallback(() => {
    // Navigate to AI conversation or open AI chat
    navigate('/chat/ai');
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-r-blue-400/30 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-sm font-medium text-white/60 animate-pulse">Loading Chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-status-danger/30 bg-status-danger/10">
            <AlertCircle className="h-8 w-8 text-status-danger" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-sm text-white/60 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-accent hover:bg-accent/90">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl shadow-lg">
              {getAvatarEmoji(memberName)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {greeting}, {memberName}! 👋
              </h1>
              <p className="text-sm sm:text-base text-white/60">
                Ready to connect, collaborate, and create?
              </p>
            </div>
            {dailyStreak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">{dailyStreak} day streak</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              onClick={handleOpenCommunity}
              className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 hover:from-accent/30 hover:to-accent/20 hover:scale-105 transition-all duration-200"
            >
              <Hash className="h-6 w-6 text-accent" />
              <span className="text-xs font-medium text-white">Community</span>
            </Button>
            <Button
              onClick={handleCreateNew}
              className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/20 hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-6 w-6 text-blue-400" />
              <span className="text-xs font-medium text-white">New Chat</span>
            </Button>
            <Button
              onClick={handleMessageAI}
              className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/20 hover:scale-105 transition-all duration-200"
            >
              <Bot className="h-6 w-6 text-purple-400" />
              <span className="text-xs font-medium text-white">Message AI</span>
            </Button>
            <Button
              onClick={() => navigate('/members')}
              className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/20 hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="h-6 w-6 text-green-400" />
              <span className="text-xs font-medium text-white">Invite</span>
            </Button>
            <Button
              onClick={() => navigate('/search')}
              className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 hover:from-yellow-500/30 hover:to-amber-500/20 hover:scale-105 transition-all duration-200"
            >
              <Search className="h-6 w-6 text-yellow-400" />
              <span className="text-xs font-medium text-white">Search</span>
            </Button>
            <Button
              onClick={() => navigate('/projects')}
              className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 hover:from-rose-500/30 hover:to-pink-500/20 hover:scale-105 transition-all duration-200"
            >
              <Target className="h-6 w-6 text-rose-400" />
              <span className="text-xs font-medium text-white">Projects</span>
            </Button>
          </div>
        </div>

        {/* Continue Conversations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <MessageSquare className="h-5 w-5 text-accent" />
                Continue Conversations
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-lg">
                      {chat.avatar || getAvatarEmoji(chat.name)}
                      {chat.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-black/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white truncate">{chat.name}</p>
                        <span className="text-xs text-white/40">{chat.lastMessageTime || '2h'}</span>
                      </div>
                      <p className="text-xs text-white/50 truncate">{chat.lastMessage || 'No messages yet'}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-xs font-bold text-black">{chat.unread}</span>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/40 text-center py-4">No recent conversations</p>
              )}
            </CardContent>
          </Card>

          {/* Online Members */}
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <Users className="h-5 w-5 text-green-400" />
                Online Now
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {onlineMembers.map((member) => (
                  <button
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 group"
                  >
                    <div className="relative">
                      <span className="text-lg">{member.avatar}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-black/20 animate-pulse" />
                    </div>
                    <span className="text-xs font-medium text-white">{member.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Highlights */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Community Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {communityHighlights.map((highlight) => (
              <div
                key={highlight.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all duration-200"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  highlight.type === 'announcement' ? 'bg-orange-500/20 text-orange-400' :
                  highlight.type === 'trending' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {highlight.type === 'announcement' ? <Bell className="h-5 w-5" /> :
                   highlight.type === 'trending' ? <TrendingUp className="h-5 w-5" /> :
                   <Calendar className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{highlight.title}</p>
                  <p className="text-xs text-white/50">{highlight.author} · {highlight.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <Lightbulb className="h-5 w-5 text-purple-400" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aiSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-200 hover:scale-[1.01] group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  {suggestion.type === 'contact' ? <Users className="h-5 w-5 text-purple-400" /> :
                   suggestion.type === 'project' ? <Target className="h-5 w-5 text-purple-400" /> :
                   <MessageSquare className="h-5 w-5 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">{suggestion.title}</p>
                  <p className="text-xs text-white/50">{suggestion.reason}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-purple-400 transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <FileText className="h-5 w-5 text-cyan-400" />
              Recent Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentFiles.map((file) => (
                <button
                  key={file.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 group"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${
                    file.type === 'image' ? 'bg-purple-500/20' :
                    file.type === 'video' ? 'bg-blue-500/20' :
                    'bg-cyan-500/20'
                  }`}>
                    {file.type === 'image' ? <Image className="h-6 w-6 text-purple-400" /> :
                     file.type === 'video' ? <Video className="h-6 w-6 text-blue-400" /> :
                     <FileText className="h-6 w-6 text-cyan-400" />}
                  </div>
                  <div className="text-center w-full">
                    <p className="text-xs font-medium text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-white/40">{file.size}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
