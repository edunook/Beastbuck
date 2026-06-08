import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Plus, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { CollaborationService } from '../../services/firebase/collaboration';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function WarRoomsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [warRooms, setWarRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const rooms = await CollaborationService.getWarRooms(user.uid);
      setWarRooms(rooms);
    } catch (err) {
      console.error('War rooms load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  const createWarRoom = async () => {
    const name = window.prompt('Enter War Room name');
    if (!name?.trim() || !user?.uid) return;
    const id = await CollaborationService.createWarRoom({
      title: name.trim(),
      createdBy: user.uid,
    });
    await load();
    navigate(`/war-rooms/${id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="War Rooms"
        description="High-intensity collaboration spaces with chat, voice, video, tasks, and AI."
        action={
          <Button onClick={createWarRoom}>
            <Plus className="mr-2 h-4 w-4" /> New War Room
          </Button>
        }
      />

      <SectionWrapper>
        {loading ? (
          <LoadingState text="Loading war rooms..." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {warRooms.map(room => (
              <Card
                key={room.id}
                className="cursor-pointer rounded-xl border-accent/20 transition hover:border-accent/40"
                onClick={() => navigate(`/war-rooms/${room.id}`)}
              >
                <CardContent className="p-5">
                  <Target className="mb-3 h-6 w-6 text-accent" />
                  <h3 className="font-bold text-white">{room.title}</h3>
                  <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                    <Users className="h-3 w-3" />
                    {(room.members || []).length} members
                  </p>
                </CardContent>
              </Card>
            ))}
            {warRooms.length === 0 && (
              <p className="col-span-full text-center text-text-muted">No war rooms yet. Create one to start collaborating.</p>
            )}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
