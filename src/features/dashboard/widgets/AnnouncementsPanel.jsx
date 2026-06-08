import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Bell, Pin } from 'lucide-react';
import { ChatService } from '../../../services/firebase/chat';

function formatDate(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return 'Just now';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToAnnouncements({
      onAnnouncements: (nextAnnouncements) => {
        setAnnouncements(nextAnnouncements);
        setLoading(false);
      },
      onError: (err) => {
        console.error('Dashboard announcements failed:', err);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="h-full depth={1}" hoverable={true}>
      <CardHeader>
        <CardTitle className="text-caption font-medium text-text-muted flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          Recent Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              <div className="h-12 animate-pulse rounded-xl bg-white/5 border border-white/10" />
              <div className="h-12 animate-pulse rounded-xl bg-white/5 border border-white/10" />
            </div>
          )}

          {!loading && announcements.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 className="mb-1 text-caption font-medium text-white">No announcements yet</h4>
              <p className="text-badge text-text-muted">Leadership updates posted in #announcements will appear here.</p>
            </div>
          )}

          {!loading && announcements.map(announcement => (
            <div key={announcement.id} className={`border-l-2 pl-3 transition-all duration-200 hover:bg-white/[0.03] rounded-r-lg pr-2 py-2 ${announcement.pinned ? 'border-status-warning' : 'border-accent'}`}>
              <div className="mb-1 flex items-center gap-2">
                {announcement.pinned && <Pin className="h-3.5 w-3.5 text-status-warning" />}
                <h4 className="line-clamp-1 text-caption font-medium text-white">
                  {announcement.text}
                </h4>
              </div>
              <p className="text-badge text-text-muted">
                {announcement.senderName || 'Leadership'} · {formatDate(announcement.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
