import { useEffect, useState } from 'react';
import { Calendar, FileText, PlayCircle, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { CollaborationService } from '../../services/realtime/collaboration';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

function formatDate(ts) {
  const d = ts?.toDate?.();
  if (!d) return 'TBD';
  return d.toLocaleString();
}

export default function MeetingsCenter() {
  useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = CollaborationService.subscribeToMeetings({
      onMeetings: (list) => {
        setUpcoming(list.filter(m => m.status === 'scheduled' || m.status === 'live'));
        setPast(list.filter(m => m.status === 'ended' || m.status === 'completed'));
        setLoading(false);
      },
    });
    return () => unsub();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Meeting Center"
        description="Upcoming meetings, past sessions, recordings, notes, and attendance."
        action={
          <Link to="/meet" className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black">
            Start Meeting
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Upcoming', value: upcoming.length, icon: Calendar },
          { label: 'Past', value: past.length, icon: FileText },
          { label: 'Quick join', value: 'Live', icon: PlayCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-xl">
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <LoadingState text="Loading meetings..." />
      ) : (
        <>
          <SectionWrapper title="Upcoming">
            <div className="space-y-2">
              {upcoming.map(m => (
                <Card key={m.id} className="rounded-xl">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <h3 className="font-bold text-white">{m.title}</h3>
                      <p className="text-sm text-text-muted">{formatDate(m.scheduledAt || m.createdAt)}</p>
                    </div>
                    <Link to="/meet" className="text-sm font-bold text-accent">Join →</Link>
                  </CardContent>
                </Card>
              ))}
              {upcoming.length === 0 && <p className="text-text-muted">No upcoming meetings.</p>}
            </div>
          </SectionWrapper>

          <SectionWrapper title="Past meetings">
            <div className="space-y-2">
              {past.slice(0, 10).map(m => (
                <Card key={m.id} className="rounded-xl opacity-80">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Users className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="font-bold text-white">{m.title}</p>
                      <p className="text-xs text-text-muted">{(m.participants || []).length} attended</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionWrapper>
        </>
      )}
    </PageContainer>
  );
}
