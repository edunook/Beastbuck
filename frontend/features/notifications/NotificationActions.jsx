import { Eye, EyeOff, Trash2, Archive, VolumeX, Check } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function NotificationActions() {
  const actions = [
    { id: 'open', name: 'Open', icon: Eye, color: 'blue', description: 'Open the notification to view details' },
    { id: 'markRead', name: 'Mark as Read', icon: Check, color: 'green', description: 'Mark notification as read' },
    { id: 'markUnread', name: 'Mark as Unread', icon: EyeOff, color: 'amber', description: 'Mark notification as unread' },
    { id: 'delete', name: 'Delete', icon: Trash2, color: 'red', description: 'Permanently delete notification' },
    { id: 'archive', name: 'Archive', icon: Archive, color: 'purple', description: 'Archive notification for later' },
    { id: 'mute', name: 'Mute Similar', icon: VolumeX, color: 'gray', description: 'Mute similar notifications' },
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Actions" 
        description="Notification actions including Open, Mark as Read, Mark as Unread, Delete, Archive, and Mute Similar."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.id} className="p-4 rounded-xl bg-white/5 border border-border hover:border-accent/50 transition-all">
                  <div className={`p-3 rounded-xl ${getColorClass(action.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{action.name}</h4>
                  <p className="text-text-muted text-sm">{action.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Bulk Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="secondary">
              <EyeOff className="h-4 w-4 mr-2" />
              Mark All Unread
            </Button>
            <Button variant="secondary">
              <Archive className="h-4 w-4 mr-2" />
              Archive All
            </Button>
            <Button variant="secondary" className="text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Quick Actions</h3>
          <p className="text-text-muted mb-4">
            Swipe left on any notification to quickly delete or archive it. Swipe right to mark as read or unread.
          </p>
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
              <p className="text-red-400 font-bold">Swipe Left</p>
              <p className="text-text-muted text-sm">Delete / Archive</p>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <p className="text-green-400 font-bold">Swipe Right</p>
              <p className="text-text-muted text-sm">Mark Read / Unread</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
