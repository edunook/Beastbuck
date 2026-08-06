import { Bell, Check, Trash2, Archive } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function NotificationCenter() {
  const notifications = {
    today: [
      { id: 1, type: 'message', title: 'New message from Sarah', message: 'Hey! How is the project going?', time: '2 minutes ago', unread: true },
      { id: 2, type: 'mention', title: 'You were mentioned', message: 'Alex mentioned you in a comment', time: '15 minutes ago', unread: true },
      { id: 3, type: 'project', title: 'Project updated', message: 'AI Research Platform progress updated', time: '1 hour ago', unread: false },
    ],
    yesterday: [
      { id: 4, type: 'achievement', title: 'Achievement unlocked', message: 'You earned the "Fast Learner" badge', time: 'Yesterday', unread: false },
      { id: 5, type: 'research', title: 'Research approved', message: 'Your research paper was approved', time: 'Yesterday', unread: false },
    ],
    thisWeek: [
      { id: 6, type: 'event', title: 'Event reminder', message: 'AI Workshop starts in 2 days', time: '2 days ago', unread: false },
      { id: 7, type: 'marketplace', title: 'Product sold', message: 'Your product was purchased', time: '3 days ago', unread: false },
    ],
    earlier: [
      { id: 8, type: 'system', title: 'System update', message: 'Platform updated to v2.0.0', time: '1 week ago', unread: false },
    ],
  };

  const getIcon = (type) => {
    const icons = {
      message: '💬',
      mention: '@',
      project: '📁',
      achievement: '🏆',
      research: '📄',
      event: '📅',
      marketplace: '🛒',
      system: '⚙️',
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type) => {
    const colors = {
      message: 'bg-blue-500/20 border-blue-500/30',
      mention: 'bg-purple-500/20 border-purple-500/30',
      project: 'bg-cyan-500/20 border-cyan-500/30',
      achievement: 'bg-amber-500/20 border-amber-500/30',
      research: 'bg-emerald-500/20 border-emerald-500/30',
      event: 'bg-pink-500/20 border-pink-500/30',
      marketplace: 'bg-red-500/20 border-red-500/30',
      system: 'bg-gray-500/20 border-gray-500/30',
    };
    return colors[type] || colors.system;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Center" 
        description="Notification display grouped by Today, Yesterday, This Week, Earlier with Unread notifications highlighted."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Notifications</h3>
              <span className="px-2 py-1 rounded-full bg-accent text-white text-xs font-bold">
                {notifications.today.filter(n => n.unread).length} unread
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="secondary" size="sm" className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {Object.entries(notifications).map(([period, items]) => (
            <div key={period} className="mb-6">
              <h4 className="font-bold text-white mb-3 capitalize">{period.replace('thisWeek', 'This Week')}</h4>
              <div className="space-y-3">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      notification.unread 
                        ? 'bg-accent/10 border-accent/30' 
                        : 'bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                        <span className="text-2xl">{getIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="font-bold text-white">{notification.title}</h5>
                          {notification.unread && (
                            <span className="w-2 h-2 rounded-full bg-accent mt-2" />
                          )}
                        </div>
                        <p className="text-text-muted text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted text-xs">{notification.time}</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
