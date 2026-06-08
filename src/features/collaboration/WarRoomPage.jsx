import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bot, CheckSquare, FileText, Headphones, MessageSquare, Swords, Video } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useAI } from '../ai/AIProvider';
import { CollaborationService } from '../../services/realtime/collaboration';
import { PresenceService } from '../../services/realtime/presence';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function WarRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { openAssistant } = useAI();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = CollaborationService.subscribeToWarRoom(id, { onRoom: setRoom });
    if (user?.uid) {
      PresenceService.setPresenceState(user.uid, 'collaborating', { activity: `War room: ${id}` });
    }
    return () => {
      unsub();
      if (user?.uid) PresenceService.setPresenceState(user.uid, 'online');
    };
  }, [id, user?.uid]);

  useEffect(() => {
    if (room) setLoading(false);
  }, [room]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState text="Loading war room..." />
      </PageContainer>
    );
  }

  if (!room) {
    return (
      <PageContainer>
        <p className="text-center text-text-muted">War room not found.</p>
        <Link to="/voice" className="mt-4 block text-center text-accent">Back to collaboration</Link>
      </PageContainer>
    );
  }

  const tools = [
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Voice', path: '/voice', icon: Headphones },
    { name: 'Video', path: '/meet', icon: Video },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Workspace', path: '/workspace', icon: FileText },
    { name: 'Brainstorm', path: `/brainstorm/${id}`, icon: Swords },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={room.title}
        description={room.description || 'Focused team war room — chat, voice, video, tasks, whiteboard, research, and AI.'}
        action={<Swords className="h-8 w-8 text-accent" />}
      />

      <SectionWrapper>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ name, path, icon: Icon }) => (
            <Link
              key={name}
              to={path}
              className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-4 transition hover:border-accent/30"
            >
              <Icon className="h-6 w-6 text-accent" />
              <span className="font-bold text-white">{name}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => openAssistant('project', { type: 'war-room', data: room })}
            className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-left"
          >
            <Bot className="h-6 w-6 text-accent" />
            <span className="font-bold text-white">AI Assistant</span>
          </button>
        </div>
      </SectionWrapper>

      <SectionWrapper title="War room intel">
        <Card className="rounded-xl">
          <CardContent className="space-y-2 p-4 text-sm text-text-soft">
            <p>Members: {(room.members || []).length}</p>
            <p>Project: {room.projectId || 'General'}</p>
            <p>Created by: {room.createdBy}</p>
          </CardContent>
        </Card>
      </SectionWrapper>
    </PageContainer>
  );
}
