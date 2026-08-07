import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import { Bell, UserPlus, CheckCircle, Video, MessageSquare } from 'lucide-react';
import Button from '@frontend/components/ui/Button';

const notifications = [
  { id: '1', type: 'mention', icon: MessageSquare, title: 'Alex mentioned you in Q3 Launch Plan', time: '5m ago', color: 'text-accent', unread: true },
  { id: '2', type: 'invite', icon: Video, title: 'Jordan invited you to Design Sync', time: '12m ago', color: 'text-purple-400', unread: true },
  { id: '3', type: 'task', icon: CheckCircle, title: 'Task Assigned: Update UI components', time: '1h ago', color: 'text-green-400', unread: false },
  { id: '4', type: 'follow', icon: UserPlus, title: 'Sarah started following you', time: '2h ago', color: 'text-blue-400', unread: false },
];

export default function NotificationsCenter() {
  return (
    <PageContainer>
      <PageHeader
        title="Notifications Center"
        description="Your unified inbox for mentions, invites, tasks, and system alerts."
        action={
          <div className="flex gap-2">
             <Button variant="secondary" size="sm">Mark All Read</Button>
             <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
               <Bell className="w-5 h-5 text-accent" />
             </div>
          </div>
        }
      />
      
      <div className="max-w-3xl mx-auto space-y-4">
        {notifications.map(notif => (
          <Card key={notif.id} className={`border-border transition-colors ${notif.unread ? 'bg-accent/10 border-accent/30' : 'bg-surface/30'}`}>
             <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 ${notif.color}`}>
                      <notif.icon className="w-5 h-5" />
                   </div>
                   <div>
                      <p className={`text-white ${notif.unread ? 'font-bold' : ''}`}>
                         {notif.title}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{notif.time}</p>
                   </div>
                </div>
                {notif.unread && (
                   <span className="w-2 h-2 rounded-full bg-accent"></span>
                )}
             </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
