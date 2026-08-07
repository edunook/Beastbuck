import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@frontend/components/ui/Card';
import { Bell, Pin, Megaphone } from 'lucide-react';
import { ChatService } from '@services/firestore/chat';

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
        console.log('Dashboard announcements not accessible:', err.message);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-accent/5 to-cyan-500/5 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
            <Bell className="h-4 w-4 text-accent animate-pulse" />
          </div>
          Recent Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-white/5 border border-white/10" />
              <div className="h-16 animate-pulse rounded-xl bg-white/5 border border-white/10" />
            </div>
          )}

          {!loading && announcements.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
              <Megaphone className="mx-auto mb-3 h-10 w-10 text-text-muted" />
              <h4 className="mb-2 text-sm font-bold text-white">No announcements yet</h4>
              <p className="text-xs text-text-muted">Leadership updates posted in #announcements will appear here.</p>
            </div>
          )}

          {!loading && announcements.map((announcement, index) => (
            <div 
              key={announcement.id} 
              className={`group/announcement relative overflow-hidden rounded-xl border-l-4 pl-4 pr-4 py-4 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 ${announcement.pinned ? 'border-status-warning bg-status-warning/5' : 'border-accent bg-white/[0.03]'}`}
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-all duration-500 group-hover/announcement:opacity-100 group-hover/announcement:translate-x-full" />
              <div className="relative">
                <div className="mb-2 flex items-start gap-2">
                  {announcement.pinned && (
                    <div className="relative h-6 w-6 shrink-0 rounded-lg bg-status-warning/10 flex items-center justify-center border border-status-warning/30">
                      <Pin className="h-3.5 w-3.5 text-status-warning" />
                    </div>
                  )}
                  <h4 className="line-clamp-2 text-sm font-bold text-white group-hover/announcement:text-accent transition-colors">
                    {announcement.text}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                    {announcement.senderName || 'Leadership'}
                  </span>
                  <span>·</span>
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
