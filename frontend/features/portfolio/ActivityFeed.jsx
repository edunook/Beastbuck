import { Heart, MessageSquare, Upload, FolderKanban, FileText, ShoppingCart, Users, Calendar } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function ActivityFeed() {
  const activities = [
    { id: 1, type: 'Like', user: 'John Doe', target: 'Your project', time: '2 minutes ago', icon: Heart, color: 'pink' },
    { id: 2, type: 'Comment', user: 'Jane Smith', target: 'Your research', time: '15 minutes ago', icon: MessageSquare, color: 'cyan' },
    { id: 3, type: 'Upload', user: 'You', target: 'New showcase', time: '1 hour ago', icon: Upload, color: 'emerald' },
    { id: 4, type: 'Project Update', user: 'You', target: 'Project Alpha', time: '3 hours ago', icon: FolderKanban, color: 'purple' },
    { id: 5, type: 'Research Update', user: 'Dr. Chen', target: 'Collaboration', time: '5 hours ago', icon: FileText, color: 'amber' },
    { id: 6, type: 'Marketplace', user: 'Alex Johnson', target: 'Purchased template', time: '1 day ago', icon: ShoppingCart, color: 'red' },
    { id: 7, type: 'Community', user: 'Emma Williams', target: 'Joined your community', time: '2 days ago', icon: Users, color: 'blue' },
    { id: 8, type: 'Event', user: 'You', target: 'Registered for hackathon', time: '3 days ago', icon: Calendar, color: 'violet' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Activity Feed" 
        description="Live feed showing likes, comments, uploads, project updates, research updates, marketplace activity, community activity, and events."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className={`p-3 rounded-xl ${getColorClass(activity.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-bold">{activity.user}</span>
                      <span className="text-text-muted"> {activity.type.toLowerCase()} </span>
                      <span className="text-accent font-bold">{activity.target}</span>
                    </p>
                    <p className="text-text-muted text-sm">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
