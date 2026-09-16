import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@frontend/components/ui/Card';
import { Bell, Pin, Megaphone, ArrowRight } from 'lucide-react';
import { ChatService } from '@services/firestore/chat';

function formatDate(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return 'Recently';

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
        setAnnouncements(nextAnnouncements || []);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="group relative overflow-hidden h-full border border-accent/20 bg-gradient-to-br from-slate-900/90 via-purple-950/15 to-cyan-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent">
          <div className="p-1.5 rounded-xl bg-accent/10 border border-accent/30 text-accent">
            <Bell className="h-4 w-4" />
          </div>
          Announcements
        </CardTitle>
        <Link
          to="/chat"
          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-cyan-300 transition-colors group/link"
        >
          <span>Community Chat</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {loading && (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            <div className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
            <Megaphone className="mx-auto mb-2 h-7 w-7 text-accent/60 animate-pulse" />
            <h4 className="text-xs font-bold text-white mb-1">No announcements yet</h4>
            <p className="text-[11px] text-text-muted">Leadership broadcasts will appear in real-time here.</p>
          </div>
        )}

        {!loading && announcements.slice(0, 3).map((announcement, index) => (
          <Link
            key={announcement.id || index}
            to="/chat"
            className={`group/announcement block relative overflow-hidden rounded-2xl border p-3 transition-all duration-300 hover:border-accent/40 hover:bg-accent/[0.06] hover:-translate-y-0.5 ${
              announcement.pinned ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'
            }`}
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
          >
            <div className="relative">
              <div className="mb-1 flex items-start gap-2">
                {announcement.pinned && (
                  <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <h4 className="line-clamp-2 text-xs font-bold text-white group-hover/announcement:text-accent transition-colors">
                  {announcement.text || announcement.message}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium text-text-muted mt-1">
                <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-slate-300">
                  {announcement.senderName || 'Leadership'}
                </span>
                <span>·</span>
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
