import { Bell, Shield, MessageSquare, AtSign, Heart, UserPlus, FolderKanban, FileText, ShoppingCart, Bot, Film, Users, Calendar, Trophy, Briefcase, Award, AlertTriangle, Megaphone, Zap, CheckCircle, FileBarChart, AlertCircle, Check } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function NotificationTypes() {
  const notificationTypes = [
    { id: 'account', name: 'Account', icon: Shield, color: 'purple', description: 'Account-related notifications' },
    { id: 'security', name: 'Security', icon: Shield, color: 'red', description: 'Security alerts and updates' },
    { id: 'messages', name: 'Messages', icon: MessageSquare, color: 'blue', description: 'Direct messages' },
    { id: 'mentions', name: 'Mentions', icon: AtSign, color: 'cyan', description: 'When you are mentioned' },
    { id: 'replies', name: 'Replies', icon: MessageSquare, color: 'green', description: 'Replies to your content' },
    { id: 'reactions', name: 'Reactions', icon: Heart, color: 'pink', description: 'Reactions to your content' },
    { id: 'followers', name: 'Followers', icon: UserPlus, color: 'amber', description: 'New followers' },
    { id: 'projects', name: 'Projects', icon: FolderKanban, color: 'indigo', description: 'Project updates' },
    { id: 'research', name: 'Research', icon: FileText, color: 'emerald', description: 'Research notifications' },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingCart, color: 'orange', description: 'Marketplace activity' },
    { id: 'aiStudio', name: 'AI Studio', icon: Bot, color: 'violet', description: 'AI Studio updates' },
    { id: 'funflix', name: 'FunFlix', icon: Film, color: 'rose', description: 'FunFlix notifications' },
    { id: 'community', name: 'Community', icon: Users, color: 'teal', description: 'Community activity' },
    { id: 'events', name: 'Events', icon: Calendar, color: 'sky', description: 'Event reminders' },
    { id: 'challenges', name: 'Challenges', icon: Trophy, color: 'yellow', description: 'Challenge updates' },
    { id: 'tasks', name: 'Tasks', icon: Briefcase, color: 'slate', description: 'Task notifications' },
    { id: 'leadership', name: 'Leadership', icon: Award, color: 'gold', description: 'Leadership updates' },
    { id: 'membership', name: 'Membership', icon: Award, color: 'bronze', description: 'Membership changes' },
    { id: 'approvals', name: 'Approvals', icon: Check, color: 'lime', description: 'Approval notifications' },
    { id: 'system', name: 'System Updates', icon: AlertTriangle, color: 'gray', description: 'System updates' },
    { id: 'announcements', name: 'Announcements', icon: Megaphone, color: 'fuchsia', description: 'Platform announcements' },
    { id: 'automation', name: 'Automation', icon: Zap, color: 'electric', description: 'Automation alerts' },
    { id: 'achievements', name: 'Achievements', icon: Trophy, color: 'rainbow', description: 'Achievement unlocks' },
    { id: 'certificates', name: 'Certificates', icon: CheckCircle, color: 'platinum', description: 'Certificate awards' },
    { id: 'reports', name: 'Reports', icon: FileBarChart, color: 'chart', description: 'Report notifications' },
    { id: 'warnings', name: 'Warnings', icon: AlertCircle, color: 'danger', description: 'Warning notifications' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      slate: 'bg-slate-500/20 border-slate-500/30 text-slate-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Types" 
        description="Comprehensive notification types including Account, Security, Messages, Mentions, Replies, Reactions, Followers, Projects, Research, Marketplace, AI Studio, FunFlix, Community, Events, Challenges, Tasks, Leadership, Membership, Approvals, System Updates, Announcements, Automation, Achievements, Certificates, Reports, and Warnings."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">All Notification Types</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="p-4 rounded-xl bg-white/5 border border-border hover:border-accent/50 transition-all">
                  <div className={`p-3 rounded-xl ${getColorClass(type.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{type.name}</h4>
                  <p className="text-text-muted text-sm">{type.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
