import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Filter, Mail, AtSign, Pin, Image as ImageIcon, FileText, Link, Mic, CheckSquare, Bot, Bell } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function SmartFilters() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Messages', icon: Filter, count: 1234 },
    { id: 'unread', label: 'Unread', icon: Mail, count: 23 },
    { id: 'mentions', label: 'Mentions', icon: AtSign, count: 5 },
    { id: 'pinned', label: 'Pinned', icon: Pin, count: 3 },
    { id: 'media', label: 'Media', icon: ImageIcon, count: 45 },
    { id: 'files', label: 'Files', icon: FileText, count: 12 },
    { id: 'links', label: 'Links', icon: Link, count: 34 },
    { id: 'voice', label: 'Voice Notes', icon: Mic, count: 8 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 7 },
    { id: 'ai', label: 'AI Messages', icon: Bot, count: 15 },
    { id: 'announcements', label: 'Announcements', icon: Bell, count: 2 },
  ];

  const messages = [
    { id: 1, type: 'unread', sender: 'Dr. Sarah Chen', content: 'Check out the new research paper', time: '2 min ago' },
    { id: 2, type: 'mentions', sender: 'Alex Johnson', content: '@you Can you review this code?', time: '15 min ago' },
    { id: 3, type: 'pinned', sender: 'Emma Williams', content: 'Important: Meeting at 3 PM', time: '1 hour ago' },
    { id: 4, type: 'media', sender: 'James Brown', content: 'Shared a screenshot', time: '2 hours ago' },
    { id: 5, type: 'files', sender: 'Lisa Anderson', content: 'Shared a document', time: '3 hours ago' },
    { id: 6, type: 'links', sender: 'David Kim', content: 'Shared a link', time: '4 hours ago' },
    { id: 7, type: 'voice', sender: 'Sophie Martin', content: 'Sent a voice note', time: '5 hours ago' },
    { id: 8, type: 'tasks', sender: 'John Smith', content: 'Created a task', time: '6 hours ago' },
    { id: 9, type: 'ai', sender: 'AI Assistant', content: 'Here are the results', time: '7 hours ago' },
    { id: 10, type: 'announcements', sender: 'System', content: 'New feature available', time: '1 day ago' },
  ];

  const filteredMessages = selectedFilter === 'all' 
    ? messages 
    : messages.filter(msg => msg.type === selectedFilter);

  const getIcon = (type) => {
    switch (type) {
      case 'unread': return Mail;
      case 'mentions': return AtSign;
      case 'pinned': return Pin;
      case 'media': return ImageIcon;
      case 'files': return FileText;
      case 'links': return Link;
      case 'voice': return Mic;
      case 'tasks': return CheckSquare;
      case 'ai': return Bot;
      case 'announcements': return Bell;
      default: return Filter;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'unread': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      case 'mentions': return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
      case 'pinned': return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      case 'media': return 'bg-pink-500/20 border-pink-500/30 text-pink-400';
      case 'files': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'links': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'voice': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'tasks': return 'bg-violet-500/20 border-violet-500/30 text-violet-400';
      case 'ai': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'announcements': return 'bg-teal-500/20 border-teal-500/30 text-teal-400';
      default: return 'bg-white/5 border-border text-text-muted';
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Smart Filters" 
        description="Filter messages by type for easy navigation and organization."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    selectedFilter === filter.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-white/5 text-text-muted hover:border-accent/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                  {filter.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedFilter === filter.id ? 'bg-accent text-black' : 'bg-white/10'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredMessages.map((message) => {
          const Icon = getIcon(message.type);
          return (
            <Card key={message.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getColorClass(message.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{message.sender}</h3>
                      <span className="text-text-muted text-sm">{message.time}</span>
                    </div>
                    <p className="text-text-soft text-sm">{message.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
