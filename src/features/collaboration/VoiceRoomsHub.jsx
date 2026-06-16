import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mic, MicOff, Plus, Radio, Users, Volume2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { CollaborationService, VOICE_ROOM_TYPES } from '../../services/realtime/collaboration';
import { PresenceService } from '../../services/realtime/presence';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import PresenceBadge from '../../components/realtime/PresenceBadge';

export default function VoiceRoomsHub() {
  const { user, roleData } = useAuth();
  const isApprovedMember = roleData?.membershipStatus === 'approved';
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinedId, setJoinedId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const unsub = CollaborationService.subscribeToVoiceRooms({
      onRooms: (list) => {
        setRooms(list);
        setLoading(false);
      },
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!joinedId) {
      setActiveRoom(null);
      return;
    }
    const unsub = CollaborationService.subscribeToVoiceRoom(joinedId, {
      onRoom: setActiveRoom,
    });
    PresenceService.setPresenceState(user.uid, 'inCall', { activity: 'Voice room' });
    return () => {
      unsub();
      if (user?.uid) PresenceService.setPresenceState(user.uid, 'online');
    };
  }, [joinedId, user?.uid]);

  const join = async (roomId) => {
    await CollaborationService.joinVoiceRoom(roomId, user.uid, roleData || {});
    setJoinedId(roomId);
  };

  const leave = async () => {
    if (joinedId) await CollaborationService.leaveVoiceRoom(joinedId, user.uid);
    setJoinedId(null);
    setMuted(false);
  };

  const toggleMute = async () => {
    const next = !muted;
    setMuted(next);
    if (joinedId) await CollaborationService.setVoiceMute(joinedId, user.uid, next);
  };

  const createRoom = async () => {
    if (!newTitle.trim()) return;
    const id = await CollaborationService.createVoiceRoom({
      title: newTitle.trim(),
      type: 'global',
      createdBy: user.uid,
    });
    setNewTitle('');
    await join(id);
  };

  const filtered = rooms.filter(r =>
    !filter || r.type === filter || r.title?.toLowerCase().includes(filter.toLowerCase())
  );

  const meInRoom = activeRoom?.participants?.find(p => p.uid === user?.uid);

  return (
    <PageContainer>
      <PageHeader
        title="Voice Rooms"
        description="Global, department, lab, and project voice channels with mute, push-to-talk, and live presence."
        action={<Headphones className="h-8 w-8 text-accent" />}
      />

      {joinedId && activeRoom && (
        <SectionWrapper>
          <Card className="rounded-xl border-accent/30 bg-accent/5">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-accent">Connected</p>
                  <h2 className="text-xl font-bold text-white">{activeRoom.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={toggleMute}>
                    {muted || meInRoom?.muted ? <MicOff className="mr-1 h-4 w-4" /> : <Mic className="mr-1 h-4 w-4" />}
                    {muted ? 'Unmute' : 'Mute'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPushToTalk(!pushToTalk)}
                  >
                    PTT {pushToTalk ? 'On' : 'Off'}
                  </Button>
                  <Button size="sm" onClick={leave}>Leave</Button>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Noise suppression enabled · Speaking indicators update in realtime
              </p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {(activeRoom.participants || []).map(p => (
                  <div key={p.uid} className="flex items-center gap-2 rounded-lg border border-border bg-black/30 px-3 py-2">
                    <PresenceBadge state={p.speaking ? 'inCall' : 'online'} size="sm" />
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    {p.muted && <MicOff className="h-3 w-3 text-text-muted" />}
                    {p.speaking && <Volume2 className="h-3 w-3 text-accent" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SectionWrapper>
      )}

      <SectionWrapper>
        {isApprovedMember && (
          <Card className="rounded-xl">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New room name..." className="flex-1" />
              <Button onClick={createRoom}><Plus className="mr-2 h-4 w-4" /> Create Room</Button>
            </CardContent>
          </Card>
        )}
      </SectionWrapper>

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter('')} className={`rounded-lg px-3 py-1 text-xs font-bold ${!filter ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'}`}>All</button>
        {VOICE_ROOM_TYPES.map(t => (
          <button key={t} type="button" onClick={() => setFilter(t)} className={`rounded-lg px-3 py-1 text-xs font-bold capitalize ${filter === t ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'}`}>{t}</button>
        ))}
      </div>

      <SectionWrapper>
        {loading ? (
          <LoadingState text="Loading voice rooms..." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map(room => (
              <Card key={room.id} className="rounded-xl">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-accent">{room.type}</p>
                    <h3 className="font-bold text-white">{room.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                      <Users className="h-3 w-3" />
                      {(room.participants || []).length} online
                    </p>
                  </div>
                  {joinedId === room.id ? (
                    <Button size="sm" variant="secondary" onClick={leave}>Leave</Button>
                  ) : (
                    <Button size="sm" onClick={() => join(room.id)}>
                      <Radio className="mr-1 h-4 w-4" /> Join
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-text-muted">No voice rooms yet. Create one above.</p>
            )}
          </div>
        )}
      </SectionWrapper>

      <Link to="/meet" className="text-sm font-bold text-accent hover:underline">Go to Video Meetings →</Link>
    </PageContainer>
  );
}
