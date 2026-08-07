import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function NotificationSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  const mockNotifications = [
    { id: 1, title: 'New message from Sarah', message: 'Hey! How is the project going?', type: 'message' },
    { id: 2, title: 'You were mentioned', message: 'Alex mentioned you in a comment', type: 'mention' },
    { id: 3, title: 'Project updated', message: 'AI Research Platform progress updated', type: 'project' },
    { id: 4, title: 'Achievement unlocked', message: 'You earned the "Fast Learner" badge', type: 'achievement' },
    { id: 5, title: 'Research approved', message: 'Your research paper was approved', type: 'research' },
  ];

  const filteredNotifications = searchQuery
    ? mockNotifications.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockNotifications;

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Search" 
        description="Instant notification search to quickly find specific notifications."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Search Notifications</h3>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-surface border border-border rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div key={notification.id} className="p-4 rounded-xl bg-white/5 border border-border hover:border-accent/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-accent/20 text-accent">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{notification.title}</h4>
                      <p className="text-text-muted text-sm">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-text-muted">No notifications found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Search Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Instant search results</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Search by title and content</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Case-insensitive matching</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Real-time filtering</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
