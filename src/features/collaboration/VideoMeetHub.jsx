import { useEffect, useState } from 'react';
import { Video, Plus, Calendar } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { CollaborationService, MEETING_TYPES } from '../../services/realtime/collaboration';
import { PresenceService } from '../../services/realtime/presence';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import MeetingRoom from './MeetingRoom';

export default function VideoMeetHub() {
  const { user, roleData } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('team');

  useEffect(() => {
    const unsub = CollaborationService.subscribeToMeetings({
      onMeetings: (list) => {
        setMeetings(list);
        setLoading(false);
      },
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeId && user?.uid) {
      PresenceService.setPresenceState(user.uid, 'inMeeting', { activity: 'Video meeting' });
      return () => PresenceService.setPresenceState(user.uid, 'online');
    }
    return undefined;
  }, [activeId, user?.uid]);

  const startMeeting = async () => {
    if (!title.trim()) return;
    const id = await CollaborationService.createMeeting({
      title: title.trim(),
      type,
      hostId: user.uid,
      hostName: roleData?.displayName || roleData?.username,
      waitingRoom: true,
      recordingEnabled: false,
    });
    setTitle('');
    setActiveId(id);
  };

  const profile = roleData || {};

  return (
    <PageContainer>
      <PageHeader
        title="Video Meetings"
        description="Team meetings, research discussions, innovation reviews, screen share, and AI meeting assistant."
        action={<Video className="h-8 w-8 text-accent" />}
      />

      {activeId ? (
        <SectionWrapper>
          <MeetingRoom
            meetingId={activeId}
            user={user}
            profile={profile}
            onLeave={() => setActiveId(null)}
          />
        </SectionWrapper>
      ) : (
        <>
          <SectionWrapper>
            <Card className="rounded-xl">
              <CardContent className="grid gap-3 p-4 md:grid-cols-4">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title..." className="md:col-span-2" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white"
                >
                  {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <Button onClick={startMeeting}><Plus className="mr-2 h-4 w-4" /> Start Meeting</Button>
              </CardContent>
            </Card>
          </SectionWrapper>

          <SectionWrapper title="Live & Scheduled">
            {loading ? (
              <LoadingState text="Loading meetings..." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {meetings.map(m => (
                  <Card key={m.id} className="rounded-xl">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-xs font-bold text-accent">{m.status} · {m.type}</p>
                        <h3 className="font-bold text-white">{m.title}</h3>
                        <p className="text-xs text-text-muted">Host: {m.hostName}</p>
                      </div>
                      <Button size="sm" onClick={() => setActiveId(m.id)}>Join</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </SectionWrapper>
        </>
      )}

      <a href="/meetings" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline">
        <Calendar className="h-4 w-4" /> Meeting Center
      </a>
    </PageContainer>
  );
}
